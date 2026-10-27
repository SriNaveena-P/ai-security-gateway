import React, { useState, useEffect } from 'react';
import { Shield, Play, AlertTriangle, CheckCircle2, ShieldX, Server, FileText, Database, Lock, Bot } from 'lucide-react';
import axios from 'axios';

const ACTIONS = [
  'FILE_READ', 'FILE_WRITE', 'DATABASE_READ', 'DATABASE_WRITE', 
  'API_ACCESS', 'EMAIL_SEND', 'REPORT_GENERATE', 'SENSITIVE_DATA_ACCESS'
];

const MOCK_RESOURCES = [
  '/sandbox/public/report.pdf',
  '/sandbox/private/employee_salary.xlsx',
  '/sandbox/confidential/customer_data.csv',
  '/sandbox/public/product_info.txt',
  'api/orders',
  'external_email@example.com'
];

const API_BASE = 'https://ai-security-gateway-9mr3.onrender.com' + '/api';

const Simulator = () => {
  const [formData, setFormData] = useState({
    agentId: '',
    actionType: '',
    resource: '',
    description: ''
  });

  const [agents, setAgents] = useState<any[]>([]);
  const [token, setToken] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Setup Demo Auth & Fetch Agents
  useEffect(() => {
    const initDemo = async () => {
      try {
        // Auto-login as the seeded admin for the demo
        const authRes = await axios.post(`${API_BASE}/auth/login`, {
          email: 'admin@zero-trust-ai.local',
          password: 'admin123'
        });
        
        const jwt = authRes.data.token;
        setToken(jwt);

        // Fetch actual agents from DB
        const agentsRes = await axios.get(`${API_BASE}/agents`, {
          headers: { Authorization: `Bearer ${jwt}` }
        });
        setAgents(agentsRes.data);
      } catch (err) {
        console.error('Failed to initialize demo:', err);
        setError('Failed to connect to backend. Please ensure the server is running and seeded.');
      }
    };
    initDemo();
  }, []);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Not authenticated. Please ensure the backend is running.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${API_BASE}/actions/execute`, 
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const actionData = res.data.actionRequest;
      const agentName = agents.find(a => a._id === formData.agentId)?.name || 'Unknown';

      setResult({
        agentName,
        action: actionData.actionType,
        resource: actionData.resource,
        permission: actionData.decision === 'ALLOW' ? 'ALLOWED' : actionData.decision === 'BLOCK' ? 'DENIED' : 'PENDING',
        riskScore: actionData.riskScore,
        riskLevel: actionData.riskLevel,
        threats: actionData.threats,
        decision: actionData.decision,
        reasons: actionData.reasons,
        executionResult: res.data.executionResult
      });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error evaluating action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Action Simulator</h2>
        <p className="text-slate-400 text-sm mt-1">Test the Security Gateway by simulating AI agent requests.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form */}
        <div className="lg:col-span-5 bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[60px] pointer-events-none" />
          
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
            <Server className="w-5 h-5 mr-2 text-primary-400" />
            Configure Request
          </h3>

          <form onSubmit={handleEvaluate} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Select Agent</label>
              <select 
                required
                className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                value={formData.agentId}
                onChange={e => setFormData({...formData, agentId: e.target.value})}
              >
                <option value="">-- Choose Agent --</option>
                {agents.map(agent => (
                  <option key={agent._id} value={agent._id}>{agent.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Select Action</label>
              <select 
                required
                className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                value={formData.actionType}
                onChange={e => setFormData({...formData, actionType: e.target.value})}
              >
                <option value="">-- Choose Action --</option>
                {ACTIONS.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Target Resource</label>
              <input 
                type="text"
                required
                list="resources"
                placeholder="e.g. /sandbox/private/employee_salary.xlsx"
                className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all placeholder:text-slate-600"
                value={formData.resource}
                onChange={e => setFormData({...formData, resource: e.target.value})}
              />
              <datalist id="resources">
                {MOCK_RESOURCES.map(res => <option key={res} value={res} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Action Description / Prompt</label>
              <textarea 
                required
                rows={3}
                placeholder="Describe what the agent wants to do..."
                className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all resize-none placeholder:text-slate-600"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              disabled={loading || !token}
              className="w-full mt-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white font-medium py-3 rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute via Security Gateway</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Block */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header */}
              <div className={`px-6 py-5 border-b border-slate-700 flex items-center justify-between
                ${result.decision === 'ALLOW' ? 'bg-emerald-500/10' : 
                  result.decision === 'BLOCK' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                <div className="flex items-center space-x-3">
                  {result.decision === 'ALLOW' ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> :
                   result.decision === 'BLOCK' ? <ShieldX className="w-6 h-6 text-red-400" /> :
                   <AlertTriangle className="w-6 h-6 text-amber-400" />}
                  <h3 className="text-xl font-bold text-white">Security Analysis Result</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border
                  ${result.decision === 'ALLOW' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                    result.decision === 'BLOCK' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                    'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                  {result.decision}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                
                {/* Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#1e293b]/50 border border-slate-700 rounded-xl p-3">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Risk Score</p>
                    <p className="text-2xl font-bold text-slate-200">{result.riskScore}/100</p>
                  </div>
                  <div className="bg-[#1e293b]/50 border border-slate-700 rounded-xl p-3">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Risk Level</p>
                    <p className={`text-lg font-bold ${
                      result.riskLevel === 'LOW' ? 'text-blue-400' :
                      result.riskLevel === 'MEDIUM' ? 'text-amber-400' :
                      result.riskLevel === 'HIGH' ? 'text-orange-400' : 'text-red-400'
                    }`}>{result.riskLevel}</p>
                  </div>
                  <div className="bg-[#1e293b]/50 border border-slate-700 rounded-xl p-3 sm:col-span-2">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Permission</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {result.permission === 'ALLOWED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : result.permission === 'PENDING' ? (
                        <span className="text-yellow-400 text-base">⏸️</span>
                      ) : (
                        <Lock className="w-4 h-4 text-red-400" />
                      )}
                      <p className={`text-sm font-semibold ${
                        result.permission === 'ALLOWED' ? 'text-emerald-400'
                        : result.permission === 'PENDING' ? 'text-yellow-400'
                        : 'text-red-400'
                      }`}>
                        {result.permission}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 border-b border-slate-800 pb-4">
                    <Bot className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-300">{result.agentName}</p>
                      <p className="text-xs text-slate-500">Agent executing the action</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 border-b border-slate-800 pb-4">
                    <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-300"><span className="font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded text-primary-400 mr-2 border border-slate-700">{result.action}</span> {result.resource}</p>
                      <p className="text-xs text-slate-500 mt-1">Action & Target Resource</p>
                    </div>
                  </div>

                  {result.threats && result.threats.length > 0 && (
                    <div className="flex items-start space-x-4 border-b border-slate-800 pb-4">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <ul className="text-sm font-medium text-red-400 list-disc list-inside">
                          {result.threats.map((t: string, i: number) => <li key={i}>{t}</li>)}
                        </ul>
                        <p className="text-xs text-slate-500 mt-1">Threats Detected</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-4">
                    <Shield className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <ul className="text-sm font-medium text-slate-300 list-disc list-inside space-y-1">
                        {result.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                      </ul>
                      <p className="text-xs text-slate-500 mt-1">Decision Reasons</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
                  <p className="text-sm font-mono text-slate-400 bg-slate-900/50 py-2 rounded-lg border border-slate-800">
                    Status: <span className="text-slate-300 font-bold">{result.executionResult}</span>
                  </p>
                </div>

              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-slate-900/20">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-400">No Action Simulated</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">Configure a request on the left and execute it via the Security Gateway to see the Zero Trust security analysis here.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Simulator;
