import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const apiUrl = 'https://ai-security-gateway-9mr3.onrender.com';
      const { data } = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
      localStorage.setItem('token', data.token);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.message) {
        setError(`Connection failed: ${err.message}`);
      } else {
        setError('Access Denied. Invalid credentials or unauthorized account.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#060b16] flex items-center justify-center relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-600/8 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/8 blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">

        {/* Warning Banner */}
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-red-400 text-xs font-bold uppercase tracking-wider">Restricted Access</p>
            <p className="text-red-300/70 text-xs mt-0.5">Unauthorized access is prohibited and monitored</p>
          </div>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 shadow-[0_0_40px_rgba(14,165,233,0.4)] mb-4">
            <Shield className="w-9 h-9 text-white" />
            <div className="absolute inset-0 rounded-2xl border border-white/20" />
            {/* Ping effect */}
            <div className="absolute inset-0 rounded-2xl animate-ping bg-sky-500/20" style={{ animationDuration: '3s' }} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ZeroTrust AI</h1>
          <p className="text-sky-500 text-xs uppercase tracking-widest font-semibold mt-1">Security Gateway</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">System Active & Monitoring</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0a1020]/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-7">
            <h2 className="text-lg font-bold text-slate-100">Authorized Personnel Only</h2>
            <p className="text-slate-500 text-xs mt-1">Enter your registered credentials to proceed</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-7" />

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Registered Email ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 text-sm transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Access Passkey
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your passkey"
                  required
                  autoComplete="off"
                  className="w-full pl-10 pr-10 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 text-sm transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.25)] hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm uppercase tracking-wider"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Identity...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Authenticate & Enter
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-5 text-center space-y-1">
          <p className="text-slate-600 text-xs">🔒 All login attempts are logged and monitored</p>
          <p className="text-slate-700 text-xs">Zero Trust AI Security Gateway • AMYPO 2026</p>
        </div>
      </div>
    </div>
  );
}
