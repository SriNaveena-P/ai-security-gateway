import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Plus, Trash2, AlertTriangle, CheckCircle2, ShieldX, Clock, FileText } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://ai-security-gateway-9mr3.onrender.com') + '/api';

const ACTIONS = [
  '*', 'FILE_READ', 'FILE_WRITE', 'DATABASE_READ', 'DATABASE_WRITE', 
  'API_ACCESS', 'EMAIL_SEND', 'REPORT_GENERATE', 'SENSITIVE_DATA_ACCESS'
];

const Policies = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    actionType: '*',
    resourcePattern: '',
    effect: 'BLOCK',
    reason: ''
  });

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/policies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPolicies(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch policies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        description: formData.description,
        rules: {
          actionType: formData.actionType,
          resourcePattern: formData.resourcePattern,
          effect: formData.effect,
          reason: formData.reason
        }
      };

      await axios.post(`${API_BASE}/policies`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Custom Policy created successfully!');
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        actionType: '*',
        resourcePattern: '',
        effect: 'BLOCK',
        reason: ''
      });
      fetchPolicies();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create policy');
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this custom policy?')) return;
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/policies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Policy deleted successfully!');
      fetchPolicies();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete policy');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Global Security Policies</h2>
          <p className="text-slate-400 text-sm mt-1">Define system-wide rules to override permissions and block or audit specific agent behaviors.</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Custom Policy</span>
        </button>
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
      ) : policies.length === 0 ? (
        <div className="h-64 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-slate-900/20">
          <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-400">No Custom Policies</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm">Global security defaults are currently enforced. Add custom policies to restrict specific paths or resource types.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {policies.map(policy => {
            const rules = policy.rules || {};
            return (
              <div 
                key={policy._id}
                className="bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700/80 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-white">{policy.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
                      ${rules.effect === 'ALLOW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        rules.effect === 'BLOCK' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]' : 
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {rules.effect}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{policy.description}</p>
                  
                  {/* Rules breakdown badge row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Trigger Conditions:</span>
                    <span className="font-mono text-[10px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                      Action = {rules.actionType}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                      Resource contains "{rules.resourcePattern}"
                    </span>
                    {rules.reason && (
                      <span className="text-xs text-slate-500 italic pl-2">
                        Reason: "{rules.reason}"
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end items-center border-t border-slate-800/40 md:border-none pt-4 md:pt-0">
                  <button
                    onClick={() => handleDeletePolicy(policy._id)}
                    className="text-slate-500 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-all duration-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Policy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#000]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1425] border border-slate-800/80 rounded-2xl w-full max-w-md p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-blue-500" />
            
            <h3 className="text-xl font-bold text-white mb-4">Create Global Security Policy</h3>
            
            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Policy Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Block PII Transfer"
                  className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500/50 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Prevents exfiltration of confidential resources."
                  className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500/50 outline-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Action Type</label>
                  <select
                    className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500/50 outline-none text-xs"
                    value={formData.actionType}
                    onChange={e => setFormData({ ...formData, actionType: e.target.value })}
                  >
                    {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Resource Keyword</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. salary"
                    className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500/50 outline-none text-xs"
                    value={formData.resourcePattern}
                    onChange={e => setFormData({ ...formData, resourcePattern: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Policy Effect</label>
                  <select
                    className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500/50 outline-none text-xs"
                    value={formData.effect}
                    onChange={e => setFormData({ ...formData, effect: e.target.value })}
                  >
                    <option value="BLOCK">BLOCK</option>
                    <option value="ALLOW">ALLOW</option>
                    <option value="APPROVAL_REQUIRED">APPROVAL REQUIRED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Audit Log Reason</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Access blocked by security audit rules."
                    className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500/50 outline-none text-xs"
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-500 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;
