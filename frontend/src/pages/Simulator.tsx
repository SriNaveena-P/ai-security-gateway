import React, { useState, useEffect } from 'react';
import { Shield, Play, AlertTriangle, CheckCircle2, ShieldX, Server, FileText, Lock, Bot, KeyRound, Database, RefreshCw, ArrowRight } from 'lucide-react';
import axios from 'axios';
import PasskeyModal from '../components/PasskeyModal';

const SENSITIVE_ACTIONS = ['DATABASE_WRITE', 'SENSITIVE_DATA_ACCESS', 'FILE_WRITE'];

const ACTIONS = [
  'DATABASE_WRITE', 'DATABASE_READ', 'SENSITIVE_DATA_ACCESS', 
  'FILE_READ', 'FILE_WRITE', 'API_ACCESS', 'EMAIL_SEND', 'REPORT_GENERATE'
];

const MOCK_RESOURCES = [
  '/sandbox/database/employee_records',
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
    actionType: 'DATABASE_WRITE',
    resource: '/sandbox/database/employee_records',
    description: 'Update employee designation and compensation package in corporate database'
  });

  const [agents, setAgents] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('AMYPO2024001');
  const [newSalary, setNewSalary] = useState('₹18,50,000');
  const [newPosition, setNewPosition] = useState('Senior Security Architect');
  const [newDepartment, setNewDepartment] = useState('Cyber Security & AI');

  const [token, setToken] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passkeyModal, setPasskeyModal] = useState(false);
  const [passkeyToken, setPasskeyToken] = useState<string | null>(null);
  const [directPasskey, setDirectPasskey] = useState<string>('');

  // Setup Demo Auth & Fetch Agents + Employees
  useEffect(() => {
    const initDemo = async () => {
      try {
        const authRes = await axios.post(`${API_BASE}/auth/login`, {
          email: 'admin@zero-trust-ai.local',
          password: 'admin123'
        });
        
        const jwt = authRes.data.token;
        setToken(jwt);

        const [agentsRes, empRes] = await Promise.all([
          axios.get(`${API_BASE}/agents`, { headers: { Authorization: `Bearer ${jwt}` } }),
          axios.get(`${API_BASE}/employees`, { headers: { Authorization: `Bearer ${jwt}` } }).catch(() => ({ data: [] }))
        ]);

        setAgents(agentsRes.data);
        if (agentsRes.data.length > 0) {
          setFormData(prev => ({ ...prev, agentId: agentsRes.data[0]._id }));
        }

        setEmployees(empRes.data);
        if (empRes.data.length > 0) {
          setSelectedStudentId(empRes.data[0].studentId);
        }
      } catch (err) {
        console.error('Failed to initialize demo:', err);
        setError('Failed to connect to backend. Please ensure the server is running and seeded.');
      }
    };
    initDemo();
  }, []);

  const handleEvaluate = async (e?: React.FormEvent, overridePasskey?: string) => {
    if (e) e.preventDefault();
    if (!token) {
      setError('Not authenticated. Please ensure the backend is running.');
      return;
    }

    const effectivePasskey = overridePasskey !== undefined ? overridePasskey : directPasskey;

    // Check if the action is sensitive and no passkey provided at all
    if (SENSITIVE_ACTIONS.includes(formData.actionType) && !passkeyToken && !effectivePasskey.trim()) {
      setPasskeyModal(true);
      return;
    }
    
    setLoading(true);
    setError('');

    // Parameters for live database write
    const writeParameters = formData.actionType === 'DATABASE_WRITE' ? {
      studentId: selectedStudentId,
      salary: newSalary,
      position: newPosition,
      department: newDepartment
    } : undefined;

    try {
      const res = await axios.post(
        `${API_BASE}/actions/execute`, 
        { 
          ...formData, 
          parameters: writeParameters,
          passkeyToken: passkeyToken || undefined,
          passkey: effectivePasskey.trim() || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const actionData = res.data.actionRequest;
      const agentName = agents.find(a => a._id === formData.agentId)?.name || 'Autonomous Agent';
      const isAllowed = actionData.decision === 'ALLOW';
      const isBlocked = actionData.decision === 'BLOCK';

      setResult({
        agentName,
        action: actionData.actionType,
        resource: actionData.resource,
        permission: isAllowed ? 'ALLOWED' : isBlocked ? 'DENIED' : 'PENDING',
        riskScore: actionData.riskScore,
        riskLevel: actionData.riskLevel,
        threats: actionData.threats,
        decision: actionData.decision,
        reasons: actionData.reasons,
        executionResult: res.data.executionResult,
        updatedRecord: res.data.updatedRecord,
        passkeyUsed: !!(passkeyToken || effectivePasskey.trim())
      });

      if (isAllowed && effectivePasskey.trim()) {
        setPasskeyToken(effectivePasskey.trim());
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.requiresPasskey) {
        setPasskeyModal(true);
        setLoading(false);
        return;
      }
      setError(err.response?.data?.message || 'Error evaluating action');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyVerified = (pToken: string) => {
    setPasskeyToken(pToken);
    setPasskeyModal(false);
    handleEvaluate(undefined, 'NAVGUARD@2026');
  };

  const handlePasskeyFailed = () => {
    const agentName = agents.find(a => a._id === formData.agentId)?.name || 'Autonomous Agent';
    setResult({
      agentName,
      action: formData.actionType,
      resource: formData.resource || '/sandbox/database',
      permission: 'DENIED',
      riskScore: 95,
      riskLevel: 'CRITICAL',
      threats: ['Unauthorized Database Modification Attempt', 'Passkey Authentication Failure'],
      decision: 'BLOCK',
      reasons: [
        `🛑 Invalid Admin Passkey: Authentication failed for sensitive action ${formData.actionType}`,
        `Zero-Trust Security Gateway prevented unauthorized database write`,
        `Database was NOT modified. Incident logged to security audit trail`
      ],
      executionResult: 'Execution Prevented (Blocked by NavGuard AI - Invalid Passkey)',
      updatedRecord: null,
      passkeyUsed: false
    });
  };

  const isSensitive = SENSITIVE_ACTIONS.includes(formData.actionType);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-sky-400" />
            Action Simulator & Live Database Gate
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Test NavGuard AI Zero-Trust Gateway: Only verified passkey allows database modification.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Passkey Status Banner */}
      {passkeyToken && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <Shield className="w-4 h-4" />
            <span>🔓 Admin passkey verified — Database write operations unlocked for this session</span>
          </div>
          <button
            onClick={() => { setPasskeyToken(null); setDirectPasskey(''); }}
            className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
            Revoke Access
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form */}
        <div className="lg:col-span-6 bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[60px] pointer-events-none" />
          
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
            <Server className="w-5 h-5 mr-2 text-primary-400" />
            Configure Action Request
          </h3>

          <form onSubmit={e => handleEvaluate(e)} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Select AI Agent</label>
              <select 
                required
                className="w-full bg-[#1e293b]/70 border border-slate-700 rounded-lg px-3.5 py-2.5 text-slate-200 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none text-sm transition-all"
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
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Select Action Type</label>
              <select 
                required
                className="w-full bg-[#1e293b]/70 border border-slate-700 rounded-lg px-3.5 py-2.5 text-slate-200 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none text-sm transition-all font-mono"
                value={formData.actionType}
                onChange={e => setFormData({...formData, actionType: e.target.value})}
              >
                {ACTIONS.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            {/* LIVE DATABASE MODIFICATION PANEL FOR DATABASE_WRITE */}
            {formData.actionType === 'DATABASE_WRITE' && (
              <div className="bg-gradient-to-br from-sky-950/40 to-slate-900/60 border border-sky-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
                  <span className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    Target Database Record to Modify
                  </span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-mono">Live MongoDB</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Select Employee / Student to Update:</label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:ring-2 focus:ring-sky-500 outline-none">
                    {employees.map(emp => (
                      <option key={emp.studentId} value={emp.studentId}>
                        {emp.name} ({emp.studentId}) — Currently: {emp.position || 'Engineer'} [{emp.salary || 'N/A'}]
                      </option>
                    ))}
                    {employees.length === 0 && (
                      <option value="AMYPO2024001">Arun Kumar (AMYPO2024001)</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">New Designation / Position:</label>
                    <input
                      type="text"
                      value={newPosition}
                      onChange={e => setNewPosition(e.target.value)}
                      placeholder="e.g. Lead AI Architect"
                      className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">New Salary / CTC:</label>
                    <input
                      type="text"
                      value={newSalary}
                      onChange={e => setNewSalary(e.target.value)}
                      placeholder="e.g. ₹20,00,000"
                      className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN PASSKEY INPUT */}
            {isSensitive && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2.5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Admin Passkey {passkeyToken ? '(Session Active ✅)' : '(Required for Database Modification)'}
                  </label>
                  <span className="text-[10px] text-amber-400/80 font-mono">Default: NAVGUARD@2026</span>
                </div>
                <input
                  type="password"
                  placeholder={passkeyToken ? "Passkey session active (ready to write)" : "Enter passkey to allow database change..."}
                  disabled={!!passkeyToken}
                  value={directPasskey}
                  onChange={e => setDirectPasskey(e.target.value)}
                  className="w-full bg-[#1e293b] border border-amber-500/40 rounded-lg px-3.5 py-2 text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-50"
                />
                <div className="flex items-center justify-between text-[11px] text-amber-400/80">
                  <span>✅ Correct Passkey: Database Modified Live in MongoDB</span>
                  <span>❌ Wrong Passkey: Denied & Blocked</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Target Resource</label>
              <input 
                type="text"
                required
                list="resources"
                className="w-full bg-[#1e293b]/70 border border-slate-700 rounded-lg px-3.5 py-2 text-slate-200 text-xs font-mono focus:ring-2 focus:ring-primary-500/50 outline-none"
                value={formData.resource}
                onChange={e => setFormData({...formData, resource: e.target.value})}
              />
              <datalist id="resources">
                {MOCK_RESOURCES.map(res => <option key={res} value={res} />)}
              </datalist>
            </div>

            <button 
              id="simulator-submit-btn"
              type="submit"
              disabled={loading || !token}
              className={`w-full mt-4 font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                formData.actionType === 'DATABASE_WRITE'
                  ? 'bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white shadow-sky-600/20'
                  : 'bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute {formData.actionType === 'DATABASE_WRITE' ? 'Database Write' : 'Action'} via NavGuard AI</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Block */}
        <div className="lg:col-span-6">
          {result ? (
            <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4 p-6">
              
              {/* Header */}
              <div className={`p-4 rounded-xl border flex items-center justify-between
                ${result.decision === 'ALLOW' ? 'bg-emerald-500/10 border-emerald-500/30' : 
                  result.decision === 'BLOCK' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className="flex items-center space-x-3">
                  {result.decision === 'ALLOW' ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> :
                   result.decision === 'BLOCK' ? <ShieldX className="w-6 h-6 text-red-400" /> :
                   <AlertTriangle className="w-6 h-6 text-amber-400" />}
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {result.decision === 'ALLOW' ? 'Database Modification Allowed' : 'Database Modification Denied'}
                    </h3>
                    <p className="text-xs text-slate-400">NavGuard AI Zero-Trust Gateway Evaluation</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border
                  ${result.decision === 'ALLOW' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                    result.decision === 'BLOCK' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                    'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                  {result.decision === 'ALLOW' ? '✅ ACCEPTED' : '🛑 BLOCKED'}
                </div>
              </div>

              {/* LIVE MODIFIED RECORD CARD */}
              {result.updatedRecord && (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 space-y-2 animate-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      Live MongoDB Document Updated
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                      Real-Time DB Write
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <p className="text-slate-500 text-[10px] uppercase">Employee / Student</p>
                      <p className="font-semibold text-slate-200 mt-0.5">{result.updatedRecord.name}</p>
                      <p className="text-[11px] text-sky-400 font-mono">{result.updatedRecord.studentId}</p>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <p className="text-slate-500 text-[10px] uppercase">New Designation</p>
                      <p className="font-semibold text-emerald-400 mt-0.5">{result.updatedRecord.position}</p>
                      <p className="text-[11px] text-slate-400">{result.updatedRecord.department}</p>
                    </div>
                    <div className="col-span-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase">Updated Compensation / Salary</p>
                        <p className="font-bold text-emerald-300 text-sm">{result.updatedRecord.salary}</p>
                      </div>
                      <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-md">
                        Synced to Employee Records ✨
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Message */}
              <div className="bg-[#1e293b]/70 border border-slate-700 rounded-xl p-3.5 text-xs font-mono">
                <span className="text-slate-500 block mb-1">Execution Status:</span>
                <span className={`font-semibold ${result.decision === 'ALLOW' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.executionResult}
                </span>
              </div>

              {/* Reasons */}
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-slate-400 uppercase tracking-wider">Gateway Policy Reasoning:</p>
                <ul className="space-y-1.5">
                  {result.reasons?.map((r: string, i: number) => (
                    <li key={i} className="text-slate-300 bg-slate-900/50 p-2 rounded-lg border border-slate-800/80 flex items-start gap-2">
                      <span className="text-sky-400 font-bold">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>

              {result.threats && result.threats.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">
                  <p className="font-bold text-red-400 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Security Threat Blocked:
                  </p>
                  <p>{result.threats.join(', ')}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-slate-900/20">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-400">Ready to Modify Database</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                Select an employee and enter new details on the left. Enter passkey <span className="text-sky-400 font-mono">NAVGUARD@2026</span> to allow live modification in MongoDB!
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Passkey Modal */}
      <PasskeyModal
        isOpen={passkeyModal}
        onClose={() => setPasskeyModal(false)}
        onVerified={handlePasskeyVerified}
        onFailed={handlePasskeyFailed}
        actionDescription={`You are attempting a sensitive action: ${formData.actionType} on resource "${formData.resource}". This requires admin passkey verification through NavGuard AI Zero-Trust Gateway.`}
      />
    </div>
  );
};

export default Simulator;
