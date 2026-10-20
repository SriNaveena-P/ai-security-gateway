import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API = (import.meta.env.VITE_API_URL || 'https://ai-security-gateway-9mr3.onrender.com') + '/api/v1';

interface Source {
  record_id: string;
  snippet: string;
}

interface Message {
  id: number;
  type: 'user' | 'bot';
  text: string;
  sources?: Source[];
  confidence?: number;
  timestamp: Date;
  gateway?: {
    checked: boolean;
    decision: 'ALLOW' | 'BLOCK' | 'APPROVAL_REQUIRED';
    riskScore: number;
    riskLevel: string;
    reasons: string[];
    threats: string[];
  };
}

interface EligibilityResult {
  eligible: boolean;
  matchPercentage: number;
  companyName: string;
  role: string;
  salaryRange: string;
  skillGaps: { skill: string; required: boolean; studentLevel: string; recommendation: string }[];
  recommendations: string[];
  reasons: string[];
}

interface CompanyMatch {
  companyName: string;
  role: string;
  matchPercentage: number;
  eligible: boolean;
  salaryRange: string;
}

const quickQuestions = [
  'What courses does AMYPO offer?',
  'What is the fee structure?',
  'What is the placement eligibility policy?',
  'What modules are in Full Stack Web Development?',
  'What companies hire from AMYPO?',
  'What is the attendance policy?',
];

const students = [
  { id: 'AMYPO2024001', name: 'Arun Kumar' },
  { id: 'AMYPO2024002', name: 'Priya Sharma' },
  { id: 'AMYPO2024003', name: 'Rajesh Menon' },
  { id: 'AMYPO2024004', name: 'Deepa Lakshmi' },
  { id: 'AMYPO2024005', name: 'Mohammed Faisal' },
];

const companies = ['TCS', 'Infosys', 'Amazon', 'Wipro', 'Google'];

export default function QAChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, type: 'bot', text: '👋 Welcome to the **AMYPO Campus QA System**! Ask me about courses, fees, placement, policies, or check your placement eligibility.\n\nTry the quick questions below or type your own!', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'placement'>('chat');
  const [selectedStudent, setSelectedStudent] = useState(students[0].id);
  const [selectedCompany, setSelectedCompany] = useState(companies[0]);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [companyMatches, setCompanyMatches] = useState<CompanyMatch[]>([]);
  const [placementLoading, setPlacementLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'en-IN';
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Please use Chrome.');
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return;

    const userMsg: Message = { id: Date.now(), type: 'user', text: question, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/ask`, { question, user_id: 'demo-user' });
      const botMsg: Message = {
        id: Date.now() + 1, type: 'bot', text: data.answer,
        sources: data.sources, confidence: data.confidence,
        gateway: data.gateway, timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, type: 'bot',
        text: '❌ Error: Could not get an answer. Please check if the backend is running.',
        timestamp: new Date()
      }]);
    }
    setLoading(false);
  };

  const checkEligibility = async () => {
    setPlacementLoading(true);
    setEligibility(null);
    try {
      const { data } = await axios.post(`${API}/placement/check`, {
        studentId: selectedStudent, companyName: selectedCompany
      });
      setEligibility(data);
    } catch (err) {
      alert('Error checking eligibility');
    }
    setPlacementLoading(false);
  };

  const suggestCompanies = async () => {
    setPlacementLoading(true);
    setCompanyMatches([]);
    try {
      const { data } = await axios.post(`${API}/placement/suggest`, { studentId: selectedStudent });
      setCompanyMatches(data);
    } catch (err) {
      alert('Error getting suggestions');
    }
    setPlacementLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('chat')}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          💬 Campus QA Chat
        </button>
        <button onClick={() => setActiveTab('placement')}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${activeTab === 'placement' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          🎯 Placement Matcher
        </button>
      </div>

      {activeTab === 'chat' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.type === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800'}`}>
                  <div className="whitespace-pre-wrap text-sm">{msg.text}</div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200/50">
                      <p className="text-xs font-semibold mb-1 opacity-70">📄 Sources:</p>
                      {msg.sources.map((s, i) => (
                        <div key={i} className="text-xs bg-white/80 rounded p-2 mb-1 text-gray-600">
                          <span className="font-medium text-indigo-600">[{i + 1}]</span> {s.snippet.substring(0, 120)}...
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Confidence */}
                  {msg.confidence !== undefined && msg.confidence > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-300 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${msg.confidence > 0.7 ? 'bg-green-500' : msg.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${msg.confidence * 100}%` }} />
                      </div>
                      <span className="text-xs opacity-60">{Math.round(msg.confidence * 100)}% confidence</span>
                    </div>
                  )}

                  {/* Security Gateway Badge */}
                  {msg.gateway && (
                    <div className={`mt-3 pt-2 border-t rounded-lg px-3 py-2 text-xs ${
                      msg.gateway.decision === 'BLOCK'
                        ? 'bg-red-100 border-red-300 text-red-700'
                        : msg.gateway.decision === 'APPROVAL_REQUIRED'
                        ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                        : msg.gateway.checked
                        ? 'bg-green-100 border-green-300 text-green-700'
                        : 'bg-gray-100 border-gray-200 text-gray-500'
                    }`}>
                      <div className="flex items-center gap-1.5 font-semibold mb-1">
                        🛡️ Security Gateway:
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          msg.gateway.decision === 'BLOCK' ? 'bg-red-500 text-white'
                          : msg.gateway.decision === 'APPROVAL_REQUIRED' ? 'bg-yellow-500 text-white'
                          : 'bg-green-500 text-white'
                        }`}>
                          {msg.gateway.decision === 'BLOCK' ? '🛑 BLOCKED'
                            : msg.gateway.decision === 'APPROVAL_REQUIRED' ? '⏸️ APPROVAL REQUIRED'
                            : msg.gateway.checked ? '✅ ALLOWED' : '⬜ SKIPPED'}
                        </span>
                        {msg.gateway.checked && (
                          <span className="ml-auto text-xs opacity-70">Risk: {msg.gateway.riskScore}/100</span>
                        )}
                      </div>
                      {msg.gateway.reasons[0] && (
                        <p className="opacity-80">{msg.gateway.reasons[0]}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors whitespace-nowrap">
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2 items-center">
              <input type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder={listening ? '🎤 Listening...' : 'Ask about courses, fees, placement, policies...'}
                className={`flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all ${listening ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />

              {/* Mic Button */}
              <button
                onClick={toggleVoice}
                title={listening ? 'Stop listening' : 'Speak your question'}
                className={`p-2.5 rounded-xl transition-all duration-200 ${listening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-300'
                  : 'bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm6 6a1 1 0 0 1 1 1 7 7 0 0 1-6 6.93V19h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.07A7 7 0 0 1 5 10a1 1 0 0 1 2 0 5 5 0 0 0 10 0 1 1 0 0 1 1-1z"/>
                </svg>
              </button>

              <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'placement' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Placement Eligibility Checker</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm">
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Company</label>
                <select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm">
                  {companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={checkEligibility} disabled={placementLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium">
                  Check Eligibility
                </button>
                <button onClick={suggestCompanies} disabled={placementLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
                  Suggest All
                </button>
              </div>
            </div>
          </div>

          {/* Eligibility Result */}
          {eligibility && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {eligibility.companyName} — {eligibility.role}
                </h3>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${eligibility.eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {eligibility.eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}
                </span>
              </div>

              {/* Match Percentage Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Match Score</span>
                  <span className="font-bold text-indigo-600">{eligibility.matchPercentage}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${eligibility.matchPercentage >= 75 ? 'bg-green-500' : eligibility.matchPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${eligibility.matchPercentage}%` }} />
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">💰 Salary Range: <span className="font-semibold text-gray-800">{eligibility.salaryRange}</span></p>

              {/* Reasons */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Evaluation Breakdown:</h4>
                <div className="space-y-1">
                  {eligibility.reasons.map((r, i) => (
                    <p key={i} className="text-sm text-gray-600">{r}</p>
                  ))}
                </div>
              </div>

              {/* Skill Gaps */}
              {eligibility.skillGaps.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-red-600 mb-2">⚠️ Skill Gaps:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {eligibility.skillGaps.map((sg, i) => (
                      <div key={i} className="bg-red-50 rounded-lg p-3 text-sm">
                        <p className="font-medium text-red-700">{sg.skill} — {sg.studentLevel}</p>
                        <p className="text-red-600 text-xs mt-1">💡 {sg.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {eligibility.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-amber-600 mb-2">📋 Recommendations:</h4>
                  <ul className="space-y-1">
                    {eligibility.recommendations.map((r, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">→</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Company Matches */}
          {companyMatches.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🏢 Company Match Rankings</h3>
              <div className="space-y-3">
                {companyMatches.map((cm, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-300">#{i + 1}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{cm.companyName}</p>
                        <p className="text-sm text-gray-500">{cm.role} • {cm.salaryRange}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-lg text-indigo-600">{cm.matchPercentage}%</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${cm.eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {cm.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
