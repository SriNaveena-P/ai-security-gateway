import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, User, ChevronDown, ChevronUp, Trash2, Save, Briefcase, MapPin, DollarSign, Calendar, Building2 } from 'lucide-react';

const API = 'https://ai-security-gateway-9mr3.onrender.com' + '/api';

interface Employee {
  _id?: string;
  studentId: string; // Employee ID
  name: string;
  email: string;
  position: string;
  department: string;
  salary: string;
  joiningYear: number;
  address: string;
  skills: string[];
}

const emptyEmployee: Employee = {
  studentId: '',
  name: '',
  email: '',
  position: '',
  department: 'Cyber Security',
  salary: '',
  joiningYear: new Date().getFullYear(),
  address: '',
  skills: [],
};

const DEPARTMENT_OPTIONS = [
  'Cyber Security',
  'Software Engineering',
  'AI & Machine Learning',
  'Cloud & DevOps',
  'Product & Infrastructure',
  'Human Resources',
  'Finance & Operations'
];

const POSITION_SUGGESTIONS = [
  'AI Security Engineer',
  'Full Stack Developer',
  'Security Operations Analyst',
  'Cloud Infrastructure Lead',
  'DevOps Engineer',
  'Machine Learning Researcher',
  'Software Engineer II',
  'SOC Analyst'
];

const SKILL_OPTIONS = [
  'Python', 'React', 'Node.js', 'TypeScript', 'Cybersecurity', 
  'Zero Trust Architecture', 'AWS', 'Docker', 'Kubernetes', 'MongoDB', 
  'SQL', 'API Security', 'Penetration Testing', 'SIEM / Log Analysis', 'Git'
];

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Employee>(emptyEmployee);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/employees`, { headers });
      setEmployees(data);
    } catch {
      setEmployees([]);
    }
    setLoading(false);
  };

  const handleSkillToggle = (skill: string) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.studentId || !form.email) {
      setError('Employee Name, Employee ID and Email are required!');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await axios.post(`${API}/employees`, form, { headers });
      setSuccess(`✅ ${form.name} added successfully!`);
      setForm(emptyEmployee);
      setShowForm(false);
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save employee record');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete employee record: ${name}?`)) return;
    try {
      await axios.delete(`${API}/employees/${id}`, { headers });
      setEmployees(prev => prev.filter(e => e._id !== id));
    } catch {
      alert('Failed to delete employee record');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-sky-400" />
            Corporate Employee Records
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage organization personnel details, roles, compensation, and access permissions
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyEmployee); setError(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-sky-600/20">
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm flex items-center gap-2">
          <span>{success}</span>
        </div>
      )}

      {/* Add Employee Form */}
      {showForm && (
        <div className="bg-[#0d1425]/90 border border-slate-700/60 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-400" />
              New Employee Registration
            </h2>
            <span className="text-xs text-slate-500">Confidential Personnel Data</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name *</label>
              <input 
                value={form.name} 
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Yagavii S" 
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Employee ID *</label>
              <input 
                value={form.studentId} 
                onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))}
                placeholder="e.g. EMP-2026-086" 
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Official Email *</label>
              <input 
                type="email"
                value={form.email} 
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="e.g. yagavii@amypo.com" 
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Position / Designation</label>
              <input 
                list="positions"
                value={form.position} 
                onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
                placeholder="e.g. AI Security Engineer" 
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" 
              />
              <datalist id="positions">
                {POSITION_SUGGESTIONS.map(pos => <option key={pos} value={pos} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Department</label>
              <select 
                value={form.department} 
                onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {DEPARTMENT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Annual Salary / CTC</label>
              <input 
                value={form.salary} 
                onChange={e => setForm(p => ({ ...p, salary: e.target.value }))}
                placeholder="e.g. ₹14,50,000 / 14.5 LPA" 
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Joining Year</label>
              <input 
                type="number" 
                min={2015} 
                max={2030} 
                value={form.joiningYear}
                onChange={e => setForm(p => ({ ...p, joiningYear: parseInt(e.target.value) || 2024 }))}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Office / Location Address</label>
              <input 
                value={form.address} 
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                placeholder="e.g. OMR IT Corridor, Chennai, Tamil Nadu" 
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" 
              />
            </div>
          </div>

          {/* Technical Skills Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Technical & Domain Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map(skill => (
                <button 
                  key={skill} 
                  type="button" 
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.skills.includes(skill)
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-800 border border-slate-700/80 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200'}`}>
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">⚠️ {error}</p>}

          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-emerald-600/20">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Employee Record'}
            </button>
            <button 
              onClick={() => { setShowForm(false); setError(''); }}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Employee List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-[#0d1425]/60 border border-slate-700/40 rounded-2xl p-12 text-center">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium text-base">No employee records found</p>
          <p className="text-slate-500 text-sm mt-1">Click "Add Employee" above to register staff personnel</p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map(emp => {
            const isExpanded = expandedId === emp._id;
            return (
              <div 
                key={emp._id} 
                className="bg-[#0d1425]/80 border border-slate-700/60 hover:border-slate-600/80 rounded-2xl overflow-hidden transition-all shadow-md">
                
                {/* Main Card Row */}
                <div 
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/40 gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : emp._id!)}>
                  
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/30 flex items-center justify-center text-sky-300 font-bold text-base shadow-inner">
                      {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-100 text-base">{emp.name}</p>
                        {emp.position && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 font-medium">
                            {emp.position}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        <span className="text-slate-300 font-mono font-medium">{emp.studentId}</span> • {emp.email}
                      </p>
                    </div>
                  </div>

                  {/* Right: Key Badges & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      {emp.department && (
                        <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {emp.department}
                        </span>
                      )}

                      {emp.salary && (
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          {emp.salary}
                        </span>
                      )}

                      <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {emp.joiningYear || 2024}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                      <button 
                        onClick={e => { e.stopPropagation(); handleDelete(emp._id!, emp.name); }}
                        title="Delete Employee"
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-slate-500 hover:text-slate-300 rounded-lg">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Pane */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-800/80 bg-slate-900/40 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-slate-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                        Designation & Department
                      </p>
                      <p className="text-sm font-medium text-slate-200">{emp.position || 'Software Engineer'}</p>
                      <p className="text-slate-400 mt-0.5">{emp.department || 'Engineering'}</p>
                    </div>

                    <div>
                      <p className="text-slate-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        Office / Work Location
                      </p>
                      <p className="text-sm font-medium text-slate-200">{emp.address || 'Chennai, Tamil Nadu, India'}</p>
                      <p className="text-slate-400 mt-0.5">Joined: {emp.joiningYear || 2024}</p>
                    </div>

                    <div>
                      <p className="text-slate-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        Confidential Compensation
                      </p>
                      <p className="text-sm font-bold text-emerald-400">{emp.salary || 'Confidential'}</p>
                      <span className="inline-block mt-1 text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                        🛡️ PII Protected by Security Gateway
                      </span>
                    </div>

                    <div className="md:col-span-3 pt-2 border-t border-slate-800/60">
                      <p className="text-slate-500 uppercase tracking-wider font-semibold mb-2">Technical Skills & Expertise</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(emp.skills) && emp.skills.length > 0 ? (
                          emp.skills.map((s: any) => {
                            const skillName = typeof s === 'string' ? s : s?.name || '';
                            return (
                              <span key={skillName} className="bg-sky-500/10 border border-sky-500/20 text-sky-300 px-2.5 py-1 rounded-md text-xs font-medium">
                                {skillName}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-slate-500">No skills assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
