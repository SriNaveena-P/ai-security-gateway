import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, User, ChevronDown, ChevronUp, Trash2, Save } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

interface Employee {
  _id?: string;
  studentId: string;
  name: string;
  email: string;
  gpa: number;
  attendance: number;
  skills: string[];
  completedProjects: number;
  codingChallengesSolved: number;
  softSkills: string[];
  course: string;
}

const emptyEmployee: Employee = {
  studentId: '',
  name: '',
  email: '',
  gpa: 0,
  attendance: 0,
  skills: [],
  completedProjects: 0,
  codingChallengesSolved: 0,
  softSkills: [],
  course: '',
};

const SKILL_OPTIONS = ['Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'MongoDB', 'Java', 'C++', 'AWS', 'Docker', 'Git', 'Machine Learning', 'Data Analysis'];
const SOFT_SKILL_OPTIONS = ['Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Time Management', 'Critical Thinking'];
const COURSE_OPTIONS = ['Full Stack Web Development', 'Data Science & ML', 'Cloud Computing', 'DevOps Engineering', 'Cybersecurity'];

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
      // If endpoint doesn't exist yet, use empty array
      setEmployees([]);
    }
    setLoading(false);
  };

  const handleSkillToggle = (skill: string, type: 'skills' | 'softSkills') => {
    setForm(prev => ({
      ...prev,
      [type]: prev[type].includes(skill)
        ? prev[type].filter(s => s !== skill)
        : [...prev[type], skill]
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.studentId || !form.email) {
      setError('Name, Student ID and Email are required!');
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
      setError(err.response?.data?.message || 'Failed to save employee');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await axios.delete(`${API}/employees/${id}`, { headers });
      setEmployees(prev => prev.filter(e => e._id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Employee / Student Records</h1>
          <p className="text-slate-400 text-sm mt-1">Add and manage employee details for QA chatbot access</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyEmployee); setError(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium text-sm transition-all">
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm">{success}</div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-[#0d1425]/80 border border-slate-700/60 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-100 mb-2">➕ New Employee Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Full Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Naveena P" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Student ID *</label>
              <input value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))}
                placeholder="e.g. AMYPO2024006" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Email *</label>
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="e.g. naveena@gmail.com" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">GPA (0-10)</label>
              <input type="number" min={0} max={10} step={0.1} value={form.gpa}
                onChange={e => setForm(p => ({ ...p, gpa: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Attendance %</label>
              <input type="number" min={0} max={100} value={form.attendance}
                onChange={e => setForm(p => ({ ...p, attendance: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Course</label>
              <select value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Select course</option>
                {COURSE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Projects Completed</label>
              <input type="number" min={0} value={form.completedProjects}
                onChange={e => setForm(p => ({ ...p, completedProjects: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Coding Challenges Solved</label>
              <input type="number" min={0} value={form.codingChallengesSolved}
                onChange={e => setForm(p => ({ ...p, codingChallengesSolved: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">Technical Skills</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map(skill => (
                <button key={skill} type="button" onClick={() => handleSkillToggle(skill, 'skills')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    form.skills.includes(skill)
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Soft Skills */}
          <div>
            <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">Soft Skills</label>
            <div className="flex flex-wrap gap-2">
              {SOFT_SKILL_OPTIONS.map(skill => (
                <button key={skill} type="button" onClick={() => handleSkillToggle(skill, 'softSkills')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    form.softSkills.includes(skill)
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">⚠️ {error}</p>}

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-all">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Employee'}
            </button>
            <button onClick={() => { setShowForm(false); setError(''); }}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium text-sm transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Employee List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-[#0d1425]/60 border border-slate-700/40 rounded-2xl p-12 text-center">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No employees added yet</p>
          <p className="text-slate-600 text-sm mt-1">Click "Add Employee" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map(emp => (
            <div key={emp._id} className="bg-[#0d1425]/80 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/30"
                onClick={() => setExpandedId(expandedId === emp._id ? null : emp._id!)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">{emp.name}</p>
                    <p className="text-xs text-slate-500">{emp.studentId} • {emp.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex gap-3 text-xs">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">GPA: {emp.gpa}</span>
                    <span className="bg-sky-500/10 text-sky-400 px-2 py-1 rounded-full">Attendance: {emp.attendance}%</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDelete(emp._id!, emp.name); }}
                    className="p-1.5 text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedId === emp._id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
              </div>

              {expandedId === emp._id && (
                <div className="px-5 pb-5 border-t border-slate-700/50 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Course</p>
                    <p className="text-sm text-slate-300">{emp.course || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Projects</p>
                    <p className="text-sm text-slate-300">{emp.completedProjects}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Coding Challenges</p>
                    <p className="text-sm text-slate-300">{emp.codingChallengesSolved}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tech Skills</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {emp.skills.map(s => <span key={s} className="text-xs bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Soft Skills</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {emp.softSkills.map(s => <span key={s} className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
