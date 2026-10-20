import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, ShieldAlert, CheckCircle2, ShieldX, Clock, Eye, AlertOctagon } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://ai-security-gateway-9mr3.onrender.com') + '/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/alerts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load security alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledgeAlert = async (id: string) => {
    // We can simulate alert acknowledgment in UI for now
    setAlerts(prev =>
      prev.map(alert =>
        alert._id === id ? { ...alert, status: 'ACKNOWLEDGED' } : alert
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Security Alerts</h2>
        <p className="text-slate-400 text-sm mt-1">Real-time threat alerts flagged by the AI Gateway policy engine.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="h-64 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-slate-900/20">
          <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-400">Zero Alerts Detected</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm">No threat incidents or policy breaches have been flagged yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map(alert => {
            const isCritical = alert.severity === 'CRITICAL';
            return (
              <div 
                key={alert._id} 
                className={`bg-[#0f172a]/60 backdrop-blur-xl border rounded-2xl p-6 hover:border-slate-700/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between
                  ${isCritical ? 'border-red-500/30' : 'border-slate-800/60'}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-[40px] pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl border
                      ${isCritical ? 'bg-red-500/10 border-red-500/25 text-red-400' : 'bg-orange-500/10 border-orange-500/25 text-orange-400'}`}>
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <div className="flex space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
                        ${isCritical 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}
                      >
                        {alert.severity}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
                        ${alert.status === 'NEW' 
                          ? 'bg-primary-500/10 text-primary-400 border-primary-500/20 animate-pulse' 
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}
                      >
                        {alert.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">{alert.description}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Target Agent: <span className="text-slate-300 font-semibold">{alert.agentId?.name || 'Unknown Agent'}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Logged at: {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-800/60 pt-4 mt-6 relative z-10">
                  {alert.status === 'NEW' ? (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert._id)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg border border-slate-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Acknowledged</span>
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Alerts;
