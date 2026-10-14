import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Bot, Key, Activity, CheckCircle, FileText, AlertTriangle, Settings, LogOut, MessageCircle, Users } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to }: { icon: any, label: string, to: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-primary-600/20 text-primary-500 shadow-[0_0_15px_rgba(14,165,233,0.15)] border border-primary-500/30'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`
    }
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium tracking-wide text-sm">{label}</span>
  </NavLink>
);

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#0a0f1c] text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d1425]/80 backdrop-blur-xl border-r border-slate-800/60 flex flex-col relative z-20">
        <div className="p-6 flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-700 shadow-[0_0_20px_rgba(14,165,233,0.4)]">
            <Shield className="w-6 h-6 text-white" />
            <div className="absolute inset-0 rounded-xl border border-white/20"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">ZeroTrust AI</h1>
            <p className="text-[10px] uppercase tracking-widest text-primary-500 font-semibold">Security Gateway</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-4 mt-2">Overview</div>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
          <SidebarItem icon={Activity} label="Action Simulator" to="/simulator" />
          
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-4 mt-8">Campus QA</div>
          <SidebarItem icon={MessageCircle} label="QA Chat & Placement" to="/qa" />
          <SidebarItem icon={Users} label="Employee Records" to="/employees" />

          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-4 mt-8">Management</div>
          <SidebarItem icon={Bot} label="AI Agents" to="/agents" />
          <SidebarItem icon={Key} label="Permissions" to="/permissions" />
          <SidebarItem icon={Shield} label="Policies" to="/policies" />
          
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-4 mt-8">Security & Audits</div>
          <SidebarItem icon={CheckCircle} label="Approvals" to="/approvals" />
          <SidebarItem icon={FileText} label="Audit Logs" to="/logs" />
          <SidebarItem icon={AlertTriangle} label="Security Alerts" to="/alerts" />
        </nav>

        <div className="p-4 border-t border-slate-800/60">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
        
        {/* Topbar */}
        <header className="h-16 border-b border-slate-800/60 bg-[#0d1425]/50 backdrop-blur-md flex items-center justify-between px-8 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span className="text-sm font-medium text-slate-300">System Active & Protecting</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/settings" className="text-slate-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-3 pl-6 border-l border-slate-700/50">
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-white">
                AD
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-200 leading-none">Admin User</p>
                <p className="text-[11px] text-slate-500 mt-1">SOC Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto relative z-10 p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
