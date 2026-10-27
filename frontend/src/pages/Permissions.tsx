import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Key, Bot, Shield, CheckCircle2, ShieldX, Save, AlertTriangle } from 'lucide-react';

const API_BASE = 'https://ai-security-gateway-9mr3.onrender.com' + '/api';

const PERMISSION_TYPES = [
  'FILE_READ', 'FILE_WRITE', 'DATABASE_READ', 'DATABASE_WRITE', 
  'API_ACCESS', 'EMAIL_SEND', 'REPORT_GENERATE', 'SENSITIVE_DATA_ACCESS'
];

const Permissions = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [permissions, setPermissions] = useState<Record<string, 'ALLOW' | 'DENY'>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all agents
  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/agents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgents(res.data);
      if (res.data.length > 0) {
        setSelectedAgentId(res.data[0]._id);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load agents.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch permissions for selected agent
  const fetchPermissions = async (agentId: string) => {
    if (!agentId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/agents/${agentId}/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Map returned permissions array to helper record object
      const mappedPerms: Record<string, 'ALLOW' | 'DENY'> = {};
      PERMISSION_TYPES.forEach(type => {
        // Zero Trust Default: DENY
        mappedPerms[type] = 'DENY';
      });

      res.data.forEach((p: any) => {
        mappedPerms[p.permissionType] = p.status;
      });

      setPermissions(mappedPerms);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Failed to load permissions for this agent.');
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgentId) {
      fetchPermissions(selectedAgentId);
      setSuccess('');
    }
  }, [selectedAgentId]);

  const handleTogglePermission = (type: string) => {
    setPermissions(prev => ({
      ...prev,
      [type]: prev[type] === 'ALLOW' ? 'DENY' : 'ALLOW'
    }));
    setSuccess('');
  };

  const handleSaveChanges = async () => {
    if (!selectedAgentId) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const payload = Object.entries(permissions).map(([permissionType, status]) => ({
        permissionType,
        status
      }));

      await axios.put(`${API_BASE}/agents/${selectedAgentId}/permissions`, {
        permissions: payload
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Permissions updated successfully!');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const selectedAgent = agents.find(a => a._id === selectedAgentId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Access Control & Permissions</h2>
        <p className="text-slate-400 text-sm mt-1">Configure individual ALLOW/DENY authorization rules per AI Agent.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-lg flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Agent Selector List */}
          <div className="lg:col-span-4 bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 px-1">Select AI Agent</h3>
            <div className="space-y-2">
              {agents.map(agent => (
                <button
                  key={agent._id}
                  onClick={() => setSelectedAgentId(agent._id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center space-x-3
                    ${selectedAgentId === agent._id 
                      ? 'bg-primary-600/20 text-primary-400 border-primary-500/40 shadow-[0_0_15px_rgba(14,165,233,0.1)]' 
                      : 'bg-slate-900/20 border-slate-800/60 text-slate-300 hover:bg-slate-800/30'}`}
                >
                  <div className={`p-2 rounded-lg border ${selectedAgentId === agent._id ? 'bg-primary-600/30 border-primary-500/30' : 'bg-slate-800/80 border-slate-700/50'}`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{agent.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{agent.riskLevel} Risk Profile</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="lg:col-span-8 bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-800 pb-5 mb-6 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
                  <Key className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">
                    {selectedAgent ? `${selectedAgent.name} Policy Rules` : 'Policy Rules'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Enforce Zero Trust permissions on each action type.</p>
                </div>
              </div>
              
              <button
                onClick={handleSaveChanges}
                disabled={saving || !selectedAgentId}
                className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all flex items-center space-x-2 relative z-10"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="text-sm">Save Changes</span>
                  </>
                )}
              </button>
            </div>

            {/* List */}
            <div className="space-y-4 relative z-10">
              {PERMISSION_TYPES.map(type => {
                const isAllowed = permissions[type] === 'ALLOW';
                return (
                  <div 
                    key={type}
                    className="flex justify-between items-center p-4 bg-[#1e293b]/20 border border-slate-800/60 rounded-xl hover:border-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg border ${
                        isAllowed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-300">{type}</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {type === 'FILE_READ' ? 'Read text, configuration, and data files' :
                           type === 'FILE_WRITE' ? 'Modify or create file resources' :
                           type === 'DATABASE_READ' ? 'Execute read-only queries on DB tables' :
                           type === 'DATABASE_WRITE' ? 'Write, update, or drop records in tables' :
                           type === 'EMAIL_SEND' ? 'Draft and dispatch external email notifications' :
                           type === 'API_ACCESS' ? 'Connect and trigger external webhook/REST endpoints' :
                           type === 'REPORT_GENERATE' ? 'Compile aggregated data reports' :
                           'Access designated sensitive or PII database resources'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTogglePermission(type)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                          ${isAllowed 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                            : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20'}`}
                      >
                        {isAllowed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ALLOW</span>
                          </>
                        ) : (
                          <>
                            <ShieldX className="w-3.5 h-3.5" />
                            <span>DENY</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default Permissions;
