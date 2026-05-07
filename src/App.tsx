import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Droplets, 
  Wind, 
  Sun, 
  AlertTriangle, 
  MapPin, 
  Search, 
  Calendar, 
  History, 
  Download, 
  ChevronRight,
  Thermometer,
  CloudRain,
  Navigation,
  RefreshCw,
  Bell,
  Archive,
  BarChart3,
  Layers,
  Settings,
  Database as DatabaseIcon,
  Zap,
  Globe,
  FileText
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';

interface Location {
  id: number;
  name: string;
  lat: number;
  lon: number;
}

interface Alert {
  type: string;
  severity: 'info' | 'warn' | 'critical';
  message: string;
}

interface WeatherData {
  current: any;
  hourly: any;
  daily: any;
  alerts: Alert[];
}

export default function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCity, setSelectedCity] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [alertHistory, setAlertHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forecast' | 'alerts'>('dashboard');

  useEffect(() => {
    fetchLocations();
    fetchAlertHistory();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      fetchWeather(selectedCity);
    }
  }, [selectedCity]);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(data);
      if (data.length > 0 && !selectedCity) {
        setSelectedCity(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch locations', err);
    }
  };

  const fetchWeather = async (location: Location) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?lat=${location.lat}&lon=${location.lon}&cityId=${location.id}`);
      const data = await res.json();
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to fetch weather', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertHistory = async () => {
    try {
      const res = await fetch('/api/alerts/history');
      const data = await res.json();
      setAlertHistory(data);
    } catch (err) {
      console.error('Failed to fetch alert history', err);
    }
  };

  const formatHourlyData = () => {
    if (!weatherData) return [];
    return weatherData.hourly.time.slice(0, 24).map((time: string, index: number) => ({
      time: format(parseISO(time), 'HH:mm'),
      temp: weatherData.hourly.temperature_2m[index],
      precip: weatherData.hourly.precipitation_probability[index]
    }));
  };

  const formatDailyData = () => {
    if (!weatherData) return [];
    return weatherData.daily.time.map((time: string, index: number) => ({
      date: format(parseISO(time), 'EEE'),
      max: weatherData.daily.temperature_2m_max[index],
      min: weatherData.daily.temperature_2m_min[index],
      precip: weatherData.daily.precipitation_sum[index]
    }));
  };

  const downloadReport = () => {
    if (!weatherData || !selectedCity) return;
    const csvContent = 
      "date,max_temp,min_temp,precipitation_sum\n" + 
      weatherData.daily.time.map((time: string, i: number) => 
        `${time},${weatherData.daily.temperature_2m_max[i]},${weatherData.daily.temperature_2m_min[i]},${weatherData.daily.precipitation_sum[i]}`
      ).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather_report_${selectedCity.name.toLowerCase()}_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const criticalAlertsCount = alertHistory.filter(a => a.severity === 'critical').length;

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* Header Navigation */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-8 h-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">S</div>
            <span className="font-bold text-lg tracking-tight">SKY_GUARD</span>
          </div>
          <nav className="geo-tabs-nav">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`geo-tab-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('forecast')}
              className={`geo-tab-link ${activeTab === 'forecast' ? 'active' : ''}`}
            >
              Forecasting
            </button>
            <button 
              onClick={() => setActiveTab('alerts')}
              className={`geo-tab-link ${activeTab === 'alerts' ? 'active' : ''}`}
            >
              Audit Log
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search locations..." 
              className="pl-10 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 text-xs font-bold">JD</div>
        </div>
      </header>

      <div className="flex grow overflow-hidden">
        {/* Sidebar / Explorer */}
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <button className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors">
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                global-view
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
          <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto text-sm">
            <div className="flex items-center gap-3 px-3 py-1.5 text-slate-400 font-medium uppercase text-[10px] tracking-wider mb-2">Tracked Clusters</div>
            {locations.map((loc) => (
              <div 
                key={loc.id}
                onClick={() => setSelectedCity(loc)}
                className={`geo-sidebar-item rounded group ${selectedCity?.id === loc.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <MapPin className={`w-4 h-4 ${selectedCity?.id === loc.id ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {loc.name.toLowerCase().replace(' ', '-')}.loc
              </div>
            ))}
            
            <div className="pt-6 px-3">
              <div className="flex items-center gap-3 py-1.5 text-slate-400 font-medium uppercase text-[10px] tracking-wider mb-2">Resources</div>
              <div className="geo-sidebar-item text-slate-600 hover:bg-slate-50 rounded">
                <FileText className="w-4 h-4 text-slate-400" />
                METADATA.json
              </div>
              <div className="geo-sidebar-item text-slate-600 hover:bg-slate-50 rounded">
                <Layers className="w-4 h-4 text-slate-400" />
                forecast-models
              </div>
              <div className="geo-sidebar-item text-slate-600 hover:bg-slate-50 rounded">
                <Settings className="w-4 h-4 text-slate-400" />
                system-config
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Core Engine</div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API Online (V2.4)
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="h-12 flex items-center justify-between px-8 border-b border-slate-100 bg-slate-50/50">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Archive className="w-3 h-3" />
              <span>skyguard</span>
              <span>/</span>
              <span className="font-medium text-slate-900">{selectedCity?.name.toLowerCase()}</span>
              <span>/</span>
              <span className="text-indigo-500">{activeTab}</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => selectedCity && fetchWeather(selectedCity)}
                className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 uppercase tracking-wide transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Sync
              </button>
              <div className="w-px h-3 bg-slate-200" />
              <button 
                onClick={downloadReport}
                className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 uppercase tracking-wide transition-colors"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center p-12"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Parsing Stream Data...</span>
                  </div>
                </motion.div>
              ) : weatherData ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-12 max-w-5xl mx-auto w-full"
                >
                  {activeTab === 'dashboard' && (
                    <article>
                      <header className="flex items-end justify-between border-b border-slate-200 pb-8 mb-10">
                        <div>
                          <h1 className="text-4xl font-bold text-slate-900 mb-2">{selectedCity?.name} Climate Hub</h1>
                          <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
                            Real-time atmospheric analysis and risk evaluation. Current vector heading {weatherData.current.wind_direction_10m}° at {weatherData.current.wind_speed_10m}km/h.
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-6xl font-bold text-indigo-600 tracking-tighter">{Math.round(weatherData.current.temperature_2m)}°</div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Core Temp</div>
                        </div>
                      </header>

                      {/* Active Grid Alerts */}
                      {weatherData.alerts.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 mb-10">
                          {weatherData.alerts.map((alert, i) => (
                            <div key={i} className={`p-5 border-l-4 rounded-r-lg flex items-center justify-between ${
                              alert.severity === 'critical' ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'
                            }`}>
                              <div className="flex items-center gap-4">
                                <AlertTriangle className={`w-5 h-5 ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                                <div>
                                  <h3 className={`font-bold text-sm uppercase tracking-wide ${alert.severity === 'critical' ? 'text-red-900' : 'text-amber-900'}`}>
                                    {alert.type} Incident Triggered
                                  </h3>
                                  <p className={`text-sm ${alert.severity === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>{alert.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Metrics Cluster */}
                      <section className="mb-10">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <BarChart3 className="w-3 h-3 text-indigo-500" />
                          Key Metrics
                        </h2>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="p-6 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors cursor-default">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                              <Thermometer className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Apparent</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">{Math.round(weatherData.current.apparent_temperature)}°C</div>
                          </div>
                          <div className="p-6 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors cursor-default">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                              <Droplets className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Humidity</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">{weatherData.current.relative_humidity_2m}%</div>
                          </div>
                          <div className="p-6 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors cursor-default">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                              <Zap className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">UV Index</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">{weatherData.daily.uv_index_max[0]}</div>
                          </div>
                        </div>
                      </section>

                      {/* Visualization */}
                      <section className="bg-slate-900 rounded-xl p-8 mb-10 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-white font-bold tracking-tight">Synchronous Pressure & Risk Timeline</h3>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-[8px]">Clean</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-[8px]">Trend</span></div>
                          </div>
                        </div>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={formatHourlyData()}>
                              <defs>
                                <linearGradient id="colorInd" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="time" hide />
                              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                              <Area type="stepBefore" dataKey="precip" stroke="#34d399" fill="#34d399" fillOpacity={0.05} strokeWidth={2} />
                              <Area type="monotone" dataKey="temp" stroke="#6366f1" fill="url(#colorInd)" strokeWidth={3} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </section>
                    </article>
                  )}

                  {activeTab === 'forecast' && (
                    <article>
                      <header className="border-b border-slate-200 pb-8 mb-10">
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Predictive Models</h1>
                        <p className="text-lg text-slate-500 leading-relaxed">Extended 7-day outlook using ensemble meteorological forecasts.</p>
                      </header>
                      <div className="grid grid-cols-1 gap-4">
                        {weatherData.daily.time.map((day: string, i: number) => (
                          <div key={day} className="group flex items-center justify-between p-6 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all cursor-default">
                            <div className="flex items-center gap-6">
                              <div className="w-16">
                                <div className="text-sm font-bold text-slate-800">{format(parseISO(day), 'EEE')}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">{format(parseISO(day), 'MMM d')}</div>
                              </div>
                              <div className="w-24 flex items-center gap-2">
                                <span className="text-xl font-bold text-slate-900">{Math.round(weatherData.daily.temperature_2m_max[i])}°</span>
                                <span className="text-xs font-medium text-slate-400">{Math.round(weatherData.daily.temperature_2m_min[i])}°</span>
                              </div>
                            </div>
                            <div className="flex-1 max-w-xs mx-8">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Precip Probability</span>
                                <span className="text-[9px] font-bold text-indigo-600">{weatherData.daily.precipitation_probability_max[i]}%</span>
                              </div>
                              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${weatherData.daily.precipitation_probability_max[i]}%` }} />
                              </div>
                            </div>
                            <div className="w-32 flex justify-end items-center gap-2 text-slate-400">
                              <Wind className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">{Math.round(weatherData.daily.wind_speed_10m_max[i])}km/h</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  )}

                  {activeTab === 'alerts' && (
                    <article>
                      <header className="border-b border-slate-200 pb-8 mb-10">
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Audit System Logs</h1>
                        <p className="text-lg text-slate-500 leading-relaxed">Immutable tracking of climate incidents and trigger responses.</p>
                      </header>
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                              <th className="px-6 py-4">Reference</th>
                              <th className="px-6 py-4">Incident</th>
                              <th className="px-6 py-4">Intensity</th>
                              <th className="px-6 py-4">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {alertHistory.map((h, i) => (
                              <tr key={i} className="hover:bg-indigo-50/20 transition-colors">
                                <td className="px-6 py-4 font-mono text-[10px] text-slate-500">#{h.id.toString().padStart(4, '0')}</td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-slate-800">{h.type}</span>
                                    <span className="text-[10px] text-slate-400">{h.city_name.toLowerCase()}.loc</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">
                                  <span className={h.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}>{h.severity}</span>
                                </td>
                                <td className="px-6 py-4 text-[10px] text-slate-400 font-mono tracking-tight">{format(parseISO(h.timestamp), 'yyyy-MM-dd HH:mm:ss')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </main>

        {/* Right Info Panel / Stats */}
        <aside className="w-64 border-l border-slate-200 bg-white p-6 shrink-0 flex flex-col gap-8 overflow-y-auto">
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Real-time Insights</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs font-medium">Critical Issues</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 tracking-tighter">Total Active</span>
                </div>
                <span className={`font-mono font-bold text-xl ${criticalAlertsCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>{criticalAlertsCount}</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs font-medium">Synced Regions</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 tracking-tighter">Operational</span>
                </div>
                <span className="font-mono font-bold text-xl text-slate-900">{locations.length}</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs font-medium">Daily API Calls</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 tracking-tighter">Egress Traffic</span>
                </div>
                <span className="font-mono font-bold text-xl text-slate-900">4.2k</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Core Integrity</h3>
            <div className="space-y-3">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-indigo-500" style={{ width: '85%' }}></div>
                <div className="h-full bg-emerald-500" style={{ width: '10%' }}></div>
                <div className="h-full bg-amber-500" style={{ width: '5%' }}></div>
              </div>
              <ul className="text-[10px] font-bold space-y-2 uppercase tracking-wide">
                <li className="flex items-center gap-2 text-slate-600"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Atmospheric (85%)</li>
                <li className="flex items-center gap-2 text-slate-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sensor Grid (10%)</li>
                <li className="flex items-center gap-2 text-slate-600"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> System Loss (5%)</li>
              </ul>
            </div>
          </section>

          <section className="mt-auto">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
              <h4 className="font-bold text-indigo-900 text-xs mb-1">PRO Hub Enabled</h4>
              <p className="text-[10px] text-indigo-700 leading-relaxed font-medium">All telemetry currently within standard deviation (±0.4%). Next report scheduled in 45m.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
