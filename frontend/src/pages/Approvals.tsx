import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, ShieldX, Clock, AlertTriangle, MessageSquare, ShieldAlert, FileText, User } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://ai-security-gateway-9mr3.onrender.com') + '/api';

const Approvals = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  
  // Modal State
  const [selectedApproval, setSelectedApproval] = useState<any | null>(null);
  const [decisionType, setDecisionType] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [actioning, setActioning] = useState(false);

  const fetchApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/approvals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApprovals(res.data);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch approvals. Please check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleOpenDecisionModal = (approval: any, type: 'approve' | 'reject') => {
    setSelectedApproval(approval);
    setDecisionType(type);
    setComments('');
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval || !decisionType) return;

    setActioning(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/approvals/${selectedApproval._id}/${decisionType}`,
        { comments },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSelectedApproval(null);
      setDecisionType(null);
      fetchApprovals();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || `Failed to ${decisionType} action`);
    } finally {
      setActioning(false);
    }
  };

  const filteredApprovals = approvals.filter(app => {
    if (activeTab === 'PENDING') return app.status === 'PENDING';
    return app.status !== 'PENDING';
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Security Gateway Approvals</h2>
          <p className="text-slate-400 text-sm mt-1">Review and action paused high-risk agent operations.</p>
        </div>
        
        {/* Tabs */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-1 flex space-x-1">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all
              ${activeTab === 'PENDING' 
                ? 'bg-primary-600/20 text-primary-400 border border-primary-500/20' 
                : 'text-slate-400 hover:text-slate-200'}`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all
              ${activeTab === 'HISTORY' 
                ? 'bg-primary-600/20 text-primary-400 border border-primary-500/20' 
                : 'text-slate-400 hover:text-slate-200'}`}
          >
            History Log
          </button>
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
      ) : filteredApprovals.length === 0 ? (
        <div className="h-64 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-slate-900/20">
          <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-400">No Approvals Found</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm">
            {activeTab === 'PENDING' 
              ? 'All AI agent operations are verified and compliant. No actions are currently paused.'
              : 'Historical approval decisions will populate here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map(app => {
            const req = app.actionRequestId;
            if (!req) return null; // Safe guard if payload is missing

            return (
              <div 
                key={app._id}
                className="bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700/80 transition-all duration-300 relative overflow-hidden"
              >
                {/* Header line */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-primary-400">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base">
                        Request ID: <span className="font-mono text-xs text-primary-400">{req._id.substring(req._id.length - 8)}</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Requested by <span className="text-slate-300 font-medium">{req.agentId?.name || 'Unknown Agent'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
                      ${req.riskLevel === 'LOW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        req.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        req.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]'}
                    `}>
                      Risk Score: {req.riskScore} ({req.riskLevel})
                    </span>
                    
                    {app.status !== 'PENDING' && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
                        ${app.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          'bg-red-500/10 text-red-400 border-red-500/20'}
                      `}>
                        {app.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Action description */}
                  <div className="md:col-span-8 space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Target Action & Resource</p>
                      <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <span className="font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded text-primary-400 border border-slate-700">
                          {req.actionType}
                        </span>
                        {req.resource}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Agent Request Rationale</p>
                      <p className="text-sm text-slate-400 bg-slate-900/40 border border-slate-800/80 p-3 rounded-lg leading-relaxed font-sans italic">
                        "{req.description}"
                      </p>
                    </div>

                    {req.threats && req.threats.length > 0 && (
                      <div>
                        <p className="text-xs text-red-400 uppercase font-semibold tracking-wider mb-1">Gateway Warnings</p>
                        <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Threat flagged: {req.threats.join(', ')}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions decision logs */}
                  <div className="md:col-span-4 flex md:flex-col justify-end items-end gap-3 w-full h-full md:border-l md:border-slate-800/60 md:pl-6">
                    {app.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleOpenDecisionModal(app, 'approve')}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center space-x-2 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Action</span>
                        </button>
                        <button
                          onClick={() => handleOpenDecisionModal(app, 'reject')}
                          className="w-full bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-500/20 hover:border-red-500/40 font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 text-sm"
                        >
                          <ShieldX className="w-4 h-4" />
                          <span>Reject & Block</span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full space-y-3 text-xs">
                        <div className="flex items-start space-x-2 text-slate-500">
                          <User className="w-4 h-4 mt-0.5 text-slate-600" />
                          <div>
                            <p className="text-slate-400 font-medium">Reviewed By</p>
                            <p className="text-slate-500 mt-0.5">{app.reviewedBy?.username || 'System'}</p>
                          </div>
                        </div>
                        
                        {app.comments && (
                          <div className="flex items-start space-x-2 text-slate-500 border-t border-slate-800/60 pt-2">
                            <MessageSquare className="w-4 h-4 mt-0.5 text-slate-600" />
                            <div className="flex-1">
                              <p className="text-slate-400 font-medium">Review Comments</p>
                              <p className="text-slate-500 mt-1 italic leading-relaxed">"{app.comments}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Modal */}
      {selectedApproval && decisionType && (
        <div className="fixed inset-0 bg-[#000]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1425] border border-slate-800/80 rounded-2xl w-full max-w-md p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-blue-500" />

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              {decisionType === 'approve' ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span>Confirm Approval</span>
                </>
              ) : (
                <>
                  <ShieldX className="w-6 h-6 text-red-400" />
                  <span>Reject & Block Action</span>
                </>
              )}
            </h3>
            
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              {decisionType === 'approve' 
                ? 'Allowing this action will run the requested workload in the secure gateway sandbox.' 
                : 'Rejecting this request will permanently prevent the agent execution and return a block decision.'}
            </p>

            <form onSubmit={handleSubmitDecision} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Review Comments / Reason</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Enter a reason for this audit decision..."
                  className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500/50 outline-none resize-none placeholder:text-slate-600"
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => { setSelectedApproval(null); setDecisionType(null); }}
                  className="px-4 py-2 border border-slate-700 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actioning}
                  className={`font-semibold px-4 py-2 rounded-lg transition-colors text-white
                    ${decisionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}
                >
                  {actioning ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    decisionType === 'approve' ? 'Approve' : 'Reject & Block'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
