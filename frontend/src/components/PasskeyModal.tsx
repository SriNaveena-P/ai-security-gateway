import { useState, useEffect, useRef } from 'react';
import { Shield, Lock, AlertTriangle, Eye, EyeOff, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API = 'https://ai-security-gateway-9mr3.onrender.com/api';

interface PasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (token: string) => void;
  onFailed?: (errorMsg: string) => void;
  actionDescription?: string;
}

export default function PasskeyModal({ isOpen, onClose, onVerified, onFailed, actionDescription }: PasskeyModalProps) {
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPasskey('');
      setError('');
      setShowPasskey(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleVerify = async () => {
    if (!passkey.trim()) {
      setError('Please enter the admin passkey');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API}/employees/verify-passkey`,
        { passkey },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.verified) {
        onVerified(data.token);
        setPasskey('');
      }
    } catch (err: any) {
      const resp = err.response?.data;
      setShake(true);
      setTimeout(() => setShake(false), 600);

      if (resp?.locked) {
        setLocked(true);
        setError('🔒 Too many failed attempts! Account locked for 5 minutes.');
      } else {
        setError(resp?.message || '❌ Invalid passkey!');
        setRemainingAttempts(resp?.remainingAttempts ?? 4);
      }
      if (onFailed) {
        onFailed(resp?.message || 'Invalid passkey entered');
      }
      setPasskey('');
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-md mx-4 bg-[#0d1425] border border-slate-700/80 rounded-2xl shadow-2xl shadow-red-500/10 overflow-hidden ${shake ? 'animate-shake' : ''}`}>
        
        {/* Security Header */}
        <div className="bg-gradient-to-r from-red-600/20 via-amber-600/10 to-red-600/20 border-b border-red-500/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">🔐 Passkey Required</h3>
                <p className="text-xs text-red-300/80">NavGuard AI — Zero-Trust Verification</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Warning Banner */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Restricted Access Zone</p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                {actionDescription || 'This operation modifies sensitive employee data and requires admin passkey authentication.'}
              </p>
            </div>
          </div>

          {/* Passkey Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Admin Passkey
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPasskey ? 'text' : 'password'}
                value={passkey}
                onChange={e => setPasskey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !locked && handleVerify()}
                disabled={locked}
                placeholder="Enter admin passkey..."
                className={`w-full px-4 py-3 bg-slate-800/80 border rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 transition-all pr-12 ${
                  error
                    ? 'border-red-500/50 focus:ring-red-500/50'
                    : 'border-slate-700 focus:ring-sky-500/50'
                } ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm ${
              locked 
                ? 'bg-red-500/15 border border-red-500/30 text-red-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Remaining Attempts */}
          {!locked && error && remainingAttempts > 0 && (
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i < remainingAttempts ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                />
              ))}
              <span className="text-xs text-slate-500 ml-1">{remainingAttempts}/5</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleVerify}
              disabled={loading || locked || !passkey.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-sky-600/20"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Verify & Proceed
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/60 border-t border-slate-800 px-6 py-3 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Protected by NavGuard AI Zero-Trust Gateway
          </p>
          <span className="text-[10px] text-slate-600 font-mono">AES-256</span>
        </div>
      </div>

      {/* Shake animation CSS */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
