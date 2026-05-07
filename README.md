# SkyGuard: Weather Forecast & Alert System 🌤️

[![Industry: Logistics](https://img.shields.io/badge/Industry-Logistics-blue.svg)]()
[![Industry: Agriculture](https://img.shields.io/badge/Industry-Agriculture-green.svg)]()
[![Stack: Fullstack TS](https://img.shields.io/badge/Stack-TypeScript%20%2F%20React%20%2F%20Node-indigo.svg)]()

**SkyGuard** is a professional-grade weather monitoring and risk management dashboard. Built for industries where weather dictates operations (Logistics, Agriculture, Event Planning), it provides real-time tracking, 7-day forecasts, and an automated rule-based alert engine.

---

## 🚀 One-Click Execution
```bash
# Install dependencies
npm install

# Start the full-stack server (FastAPI-style Express + Vite)
npm run dev
```

---

## 🏗️ Project Architecture

```text
[ User Interface ] <---> [ Express API ] <---> [ SQLite DB ]
      (React)             (Alert Engine)     (History/Locations)
         |                     |
         +------[ Local Storage ]-----+
                       |
               [ Open-Meteo API ]
```

### Key Components
1.  **Ingest Engine**: Fetches data from Global Weather models (Open-Meteo).
2.  **Rule Engine**: Evaluates thresholds for:
    *   **Heat**: Critical alerts if temp > 35°C.
    *   **Precipitation**: Predicted rain > 5mm in 12h.
    *   **Wind**: Gusts > 15m/s.
    *   **UV**: Extreme index (>= 8).
3.  **Persistence**: High-performance SQLite storage for alert history and city profiles.
4.  **Dashboard**: Interactive Recharts-driven visualizing 24h trends and multi-city monitoring.

---

## 📊 Industry Relevance
*   **Logistics**: Automatically reroute drivers if "High Wind" or "Storm" alerts are triggered.
*   **Agriculture**: Plan irrigation cycles based on the calculated "Next 12h Precipitation" metric.
*   **Public Safety**: Issue "UV Critical" warnings for outdoor event workers.

---

## 🛠️ Tech Stack
*   **Frontend**: React 18, Tailwind CSS (Mobile-ready), Recharts (Data Viz).
*   **Backend**: Node.js, Express (RESTful), Axios.
*   **Database**: SQLite (better-sqlite3) for low-latency persistence.
*   **Data Source**: Open-Meteo (Standard-grade meteorological data).

---

## 🧪 Simulation Mode (Safe Testing)
To test the alert system without waiting for real storms:
1.  Open `server.ts`.
2.  Modify the thresholds in the alert logic (e.g., set Heat Alert to `> 10°C`).
3.  Refresh the Dashboard.
4.  Observe the **Alert History** tab populating with "Artificial" risk logs.

---

## 🎓 Interview Q&A (Preparation)

### Q1: Explain the architecture of your project.
**Answer**: "I built a modular full-stack application. The backend (Express) acts as a controller that handles external API ingestion, processes data through a rule engine to identify risks, and persists those risks in a local SQLite database. The frontend is a SPA built in React that provides real-time data visualization through Recharts."

### Q2: Why did you choose Open-Meteo over other providers?
**Answer**: "Open-Meteo provides high-resolution meteorological models without requiring complex API keys, making it perfect for proof-of-concept projects while still offering the same data quality as industry leaders like Tomorrow.io or DarkSky."

### Q3: How does your alert system handle 'Dirty Data'?
**Answer**: "I implemented validation logic in the Rule Engine. If the external API returns null values or 5xx errors, the application fails gracefully using try-catch blocks and prevents 'False Alerts' by only firing if the data meets strict numeric thresholds."

---

## 📁 Folder Structure
```text
├── server.ts         # Full-stack entry & Alert Engine
├── src/
│   ├── App.tsx       # Dashboard UI & Logic
│   ├── index.css     # Global Styles (Tailwind)
│   └── main.tsx      # React Entry
├── weather.db        # SQLite Database (Auto-generated)
└── metadata.json     # App manifest
```

---

*This project was developed as a technical proof-of-work for industrial Weather API integration.* 
**SkyGuard Team**
