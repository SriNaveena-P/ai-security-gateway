import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { ShieldAlert, CheckCircle2, ShieldX, Clock, Activity, Users, AlertTriangle } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://ai-security-gateway-9mr3.onrender.com') + '/api';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-5 hover:border-slate-700/80 transition-all duration-300 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-[40px] group-hover:bg-${color}-500/10 transition-colors duration-500`} />
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-100 tracking-tight">{value}</h3>
      </div>
      <div className="p-3 rounded-xl bg-[#1e293b]/80 border border-slate-700/50 shadow-inner">
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<any>({
    totalAgents: 0,
    totalActions: 0,
    allowedActions: 0,
    blockedActions: 0,
    pendingApprovals: 0,
    activeThreats: 0
  });
  
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsRes = await axios.get(`${API_BASE}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data);

      // Fetch logs
      const logsRes = await axios.get(`${API_BASE}/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(logsRes.data);

      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch real-time dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll stats every 10 seconds for real-time monitoring feel
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Format timestamp for display
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    
    return d.toLocaleDateString();
  };

  // Pie Chart Mapping
  const pieData = [
    { name: 'Allowed', value: stats.allowedActions || 0, color: '#10b981' },
    { name: 'Blocked', value: stats.blockedActions || 0, color: '#ef4444' },
    { name: 'Pending', value: stats.pendingApprovals || 0, color: '#f59e0b' },
  ].filter(p => p.value > 0); // Only render slices > 0

  // Risk Distribution Mapping (based on real logs)
  const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  logs.forEach((log: any) => {
    if (riskCounts[log.riskLevel as keyof typeof riskCounts] !== undefined) {
      riskCounts[log.riskLevel as keyof typeof riskCounts]++;
    }
  });

  const riskData = [
    { name: 'Low', count: riskCounts.LOW },
    { name: 'Medium', count: riskCounts.MEDIUM },
    { name: 'High', count: riskCounts.HIGH },
    { name: 'Critical', count: riskCounts.CRITICAL },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Security Overview</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time monitoring of AI agent activities and threat detections.</p>
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
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard title="Total Agents" value={stats.totalAgents} icon={Users} color="blue" />
            <StatCard title="Total Actions" value={stats.totalActions} icon={Activity} color="indigo" />
            <StatCard title="Allowed" value={stats.allowedActions} icon={CheckCircle2} color="emerald" />
            <StatCard title="Blocked" value={stats.blockedActions} icon={ShieldX} color="red" />
            <StatCard title="Pending" value={stats.pendingApprovals} icon={Clock} color="amber" />
            <StatCard title="Active Threats" value={stats.activeThreats} icon={ShieldAlert} color="rose" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Action Decisions */}
            <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-6">Action Decisions</h3>
              <div className="h-72 flex flex-col justify-center">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={105}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.5rem' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-500 text-sm">No action records to display.</p>
                )}
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-6">Risk Level Distribution</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      cursor={{fill: '#1e293b', opacity: 0.4}}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {riskData.map((entry, index) => {
                        const colors = {
                          Low: '#3b82f6',
                          Medium: '#f59e0b',
                          High: '#f97316',
                          Critical: '#ef4444'
                        };
                        return <Cell key={`cell-${index}`} fill={colors[entry.name as keyof typeof colors]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Events Table */}
          <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800/60 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-200">Recent Security Events</h3>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest bg-slate-900/80 px-2.5 py-1 border border-slate-800 rounded-lg">Real-Time Log</span>
            </div>
            <div className="overflow-x-auto">
              {logs.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#1e293b]/50 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Agent</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Risk Level</th>
                      <th className="px-6 py-4">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {logs.slice(0, 4).map((log: any) => (
                      <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{formatTime(log.createdAt)}</td>
                        <td className="px-6 py-4 font-medium text-slate-300">{log.agentId?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-slate-300">
                          <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">
                            {log.actionType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${log.riskLevel === 'LOW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                              log.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              log.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                              'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]'}
                          `}>
                            {log.riskLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1.5
                            ${log.decision === 'ALLOW' ? 'text-emerald-400' :
                              log.decision === 'BLOCK' ? 'text-red-400' :
                              'text-amber-400'
                            }
                          `}>
                            {log.decision === 'ALLOW' && <CheckCircle2 className="w-4 h-4" />}
                            {log.decision === 'BLOCK' && <ShieldX className="w-4 h-4" />}
                            {log.decision === 'APPROVAL_REQUIRED' && <Clock className="w-4 h-4" />}
                            <span className="font-medium text-xs tracking-wide">{log.decision}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-slate-500 text-sm">No security logs recorded. Go to the simulator to generate actions!</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
