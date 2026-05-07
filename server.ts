import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('weather.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    is_favorite INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS alert_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id INTEGER,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(location_id) REFERENCES locations(id)
  );
`);

// Seed initial locations if empty
const locationsCount = db.prepare('SELECT count(*) as count FROM locations').get() as { count: number };
if (locationsCount.count === 0) {
  const insert = db.prepare('INSERT INTO locations (name, lat, lon) VALUES (?, ?, ?)');
  insert.run('London', 51.5074, -0.1278);
  insert.run('New York', 40.7128, -74.0060);
  insert.run('Mumbai', 19.0760, 72.8777);
  insert.run('Tokyo', 35.6762, 139.6503);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Get all tracked locations
  app.get('/api/locations', (req, res) => {
    const locations = db.prepare('SELECT * FROM locations').all();
    res.json(locations);
  });

  // Add a new location
  app.post('/api/locations', (req, res) => {
    const { name, lat, lon } = req.body;
    const info = db.prepare('INSERT INTO locations (name, lat, lon) VALUES (?, ?, ?)').run(name, lat, lon);
    res.json({ id: info.lastInsertRowid, name, lat, lon });
  });

  // Fetch weather data (Proxy to Open-Meteo)
  app.get('/api/weather', async (req, res) => {
    const { lat, lon, cityId } = req.query;
    try {
      const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
          hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,uv_index',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
          timezone: 'auto'
        }
      });

      const weatherData = response.data;
      
      // Basic Alert Logic (Mirroring the PDF "Alert Engine")
      const alerts = [];
      const current = weatherData.current;
      const daily = weatherData.daily;

      // 1. Extreme Heat Alert
      if (current.temperature_2m >= 35) {
        alerts.push({ type: 'HEAT', severity: 'critical', message: `Extreme heat warning: ${current.temperature_2m}°C detected.` });
      } else if (current.temperature_2m >= 30) {
        alerts.push({ type: 'HEAT', severity: 'warn', message: `High temperature: ${current.temperature_2m}°C. Stay hydrated.` });
      }

      // 2. Rain Alert (Next 12h)
      const next12hPrecip = weatherData.hourly.precipitation.slice(0, 12).reduce((a: number, b: number) => a + b, 0);
      if (next12hPrecip > 5) {
        alerts.push({ type: 'RAIN', severity: 'warn', message: `Significant rain expected: ${next12hPrecip.toFixed(1)}mm in the next 12 hours.` });
      }

      // 3. Wind Alert
      if (current.wind_speed_10m > 15) {
        alerts.push({ type: 'WIND', severity: 'critical', message: `High wind alert: ${current.wind_speed_10m} m/s detected.` });
      }

      // 4. UV Alert
      if (daily.uv_index_max[0] >= 8) {
        alerts.push({ type: 'UV', severity: 'warn', message: `Very high UV levels today. Wear protection.` });
      }

      // Log alerts to history if they are new (simplified)
      if (alerts.length > 0 && cityId) {
        const stmt = db.prepare('INSERT INTO alert_history (location_id, type, message, severity) VALUES (?, ?, ?, ?)');
        alerts.forEach(alert => {
          stmt.run(cityId, alert.type, alert.message, alert.severity);
        });
      }

      res.json({ ...weatherData, alerts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  });

  // Get alert history
  app.get('/api/alerts/history', (req, res) => {
    const history = db.prepare(`
      SELECT h.*, l.name as city_name 
      FROM alert_history h 
      JOIN locations l ON h.location_id = l.id 
      ORDER BY timestamp DESC LIMIT 50
    `).all();
    res.json(history);
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
