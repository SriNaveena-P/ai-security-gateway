import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, CheckCircle2, ShieldX, Clock, AlertTriangle, Search } from 'lucide-react';

const API_BASE = 'https://ai-security-gateway-9mr3.onrender.com' + '/api';

const Logs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    return (
      log.actionType.toLowerCase().includes(term) ||
      log.resource.toLowerCase().includes(term) ||
      (log.agentId?.name && log.agentId.name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Audit Log Ledger</h2>
          <p className="text-slate-400 text-sm mt-1">Immutable security ledger capturing all AI agent system evaluations.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          <input 
            type="text"
            placeholder="Search by agent, action, resource..."
            className="w-full bg-[#1e293b]/50 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Logs Table */}
          <div className="lg:col-span-8 bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#1e293b]/50 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Agent</th>
                    <th className="px-6 py-4">Action & Resource</th>
                    <th className="px-6 py-4">Risk</th>
                    <th className="px-6 py-4">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredLogs.map(log => (
                    <tr 
                      key={log._id} 
                      onClick={() => setSelectedLog(log)}
                      className={`hover:bg-slate-800/30 transition-colors cursor-pointer
                        ${selectedLog?._id === log._id ? 'bg-primary-600/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-300">{log.agentId?.name || 'Unknown Agent'}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-primary-400 border border-slate-700">
                          {log.actionType}
                        </span>
                        <div className="text-slate-400 text-xs mt-1 truncate max-w-xs">{log.resource}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border
                          ${log.riskLevel === 'LOW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                            log.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            log.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'}
                        `}>
                          {log.riskScore}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1.5 text-xs font-semibold
                          ${log.decision === 'ALLOW' ? 'text-emerald-400' :
                            log.decision === 'BLOCK' ? 'text-red-400' : 'text-amber-400'}`}
                        >
                          {log.decision === 'ALLOW' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {log.decision === 'BLOCK' && <ShieldX className="w-3.5 h-3.5" />}
                          {log.decision === 'APPROVAL_REQUIRED' && <Clock className="w-3.5 h-3.5" />}
                          <span>{log.decision}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Log Detail Panel */}
          <div className="lg:col-span-4 bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden min-h-[300px]">
            {selectedLog ? (
              <div className="space-y-5 relative z-10 animate-in fade-in duration-300">
                <div className="flex items-start space-x-3 border-b border-slate-800/60 pb-4">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-primary-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Execution Details</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Log ID: {selectedLog._id}</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <p className="text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Execution Status</p>
                    <p className="text-slate-300 font-mono">{selectedLog.executionStatus}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Triggered By</p>
                    <p className="text-slate-300">{selectedLog.userId?.username || 'System Admin'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Decision Rationale</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 mt-1">
                      {selectedLog.reasons.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {selectedLog.threatsDetected && selectedLog.threatsDetected.length > 0 && (
                    <div>
                      <p className="text-red-400 font-semibold uppercase tracking-wider mb-0.5">Threats Identified</p>
                      <ul className="list-disc list-inside space-y-1 text-red-400 mt-1">
                        {selectedLog.threatsDetected.map((t: string, idx: number) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[250px]">
                <FileText className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
                <p className="text-sm font-semibold text-slate-400">Select a Log Entry</p>
                <p className="text-xs text-slate-500 mt-1.5 max-w-[200px]">Click any row in the ledger table to view its full execution details.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Logs;
