import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bot, Plus, ToggleLeft, ToggleRight, Trash2, Shield, AlertTriangle } from 'lucide-react';

const API_BASE = 'https://ai-security-gateway-9mr3.onrender.com' + '/api';

const Agents = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    riskLevel: 'LOW',
    status: 'ACTIVE'
  });

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/agents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgents(res.data);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch agents. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/agents`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setFormData({ name: '', description: '', riskLevel: 'LOW', status: 'ACTIVE' });
      fetchAgents();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create agent');
    }
  };

  const handleToggleStatus = async (agent: any) => {
    try {
      const token = localStorage.getItem('token');
      const nextStatus = agent.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await axios.put(`${API_BASE}/agents/${agent._id}`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAgents();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update agent status');
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/agents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAgents();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete agent');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AI Agents Management</h2>
          <p className="text-slate-400 text-sm mt-1">Register, configure, and monitor your AI agent workloads.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Register Agent</span>
        </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map(agent => (
            <div 
              key={agent._id} 
              className="bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-[40px] pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50">
                    <Bot className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="flex space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
                      ${agent.riskLevel === 'LOW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        agent.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        agent.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]'}
                    `}>
                      {agent.riskLevel}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
                      ${agent.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'}
                    `}>
                      {agent.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{agent.description}</p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-800/60 pt-4 mt-6 relative z-10">
                <button
                  onClick={() => handleToggleStatus(agent)}
                  className="flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {agent.status === 'ACTIVE' ? (
                    <>
                      <ToggleRight className="w-6 h-6 text-emerald-500" />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-slate-600" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteAgent(agent._id)}
                  className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Agent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#000]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1425] border border-slate-800/80 rounded-2xl w-full max-w-md p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-4">Register AI Agent</h3>
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Agent Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. FinanceBot"
                  className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500/50 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="What is this agent allowed to do?"
                  className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500/50 outline-none resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Risk Level</label>
                  <select
                    className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500/50 outline-none"
                    value={formData.riskLevel}
                    onChange={e => setFormData({ ...formData, riskLevel: e.target.value })}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Initial Status</label>
                  <select
                    className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500/50 outline-none"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
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
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
