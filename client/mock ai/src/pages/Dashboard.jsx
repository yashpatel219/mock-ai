import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Mic, MicOff, Play, RotateCcw, Trash2, Edit, Save, X, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import jsPDF from "jspdf";
import axios from "axios";

// API base URL - use environment variable or default to localhost:4000
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ----- Mock Auth (replace with real auth) -----
const useMockAuth = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("demo_user");
    return saved ? JSON.parse(saved) : { name: "Guest", email: "guest@example.com", paid: false };
  });
  useEffect(() => { localStorage.setItem("demo_user", JSON.stringify(user)); }, [user]);
  return { user, setUser };
};

// ----- STAR Feedback (same heuristic) -----
function generateStarFeedback(answer) {
  const text = (answer || "").toLowerCase();
  const hasSituation = /situation|context|problem|challenge/.test(text);
  const hasTask = /task|goal|objective|responsibilit/.test(text);
  const hasAction = /action|implemented|built|designed|led|debugg|collaborat|coordinat|optimi/.test(text);
  const hasResult = /result|impact|outcome|improved|reduced|increased|savings|kpi/.test(text);

  const strengths = [], weaknesses = [], improvements = [];
  if (hasSituation) strengths.push("Clear situation/context"); else weaknesses.push("Missing situation/context");
  if (hasTask) strengths.push("Defined task/goal"); else weaknesses.push("Missing task/goal");
  if (hasAction) strengths.push("Concrete actions described"); else weaknesses.push("Actions not explicit");
  if (hasResult) strengths.push("Measurable results"); else weaknesses.push("No measurable results");

  if (!hasResult) improvements.push("Quantify outcomes (metrics, KPIs)");
  if (!hasAction) improvements.push("Detail your actions and decisions");
  if (!hasTask) improvements.push("State the task or success criteria");
  if (!hasSituation) improvements.push("Frame the situation + constraints");

  const lengthScore = Math.min(1, text.split(/\s+/).length / 120);
  const structureScore = (hasSituation + hasTask + hasAction + hasResult) / 4;
  const rating = Math.round(((0.6 * structureScore) + (0.4 * lengthScore)) * 5 * 10) / 10;

  return { strengths, weaknesses, improvements, rating };
}

// ----- PDF Export -----
function exportAttemptToPDF({ user, role, category, question, answer, feedback, createdAt }) {
  const doc = new jsPDF();
  let y = 10;
  doc.setFontSize(16); doc.text("Interview Session Report", 10, y); y += 8;
  doc.setFontSize(11); doc.text(`User: ${user.name} (${user.email})`, 10, y); y += 6;
  doc.text(`Date: ${new Date(createdAt).toLocaleString()}`, 10, y); y += 6;
  doc.text(`Role: ${role} | Category: ${category}`, 10, y); y += 10;
  doc.text(`Q: ${question}`, 10, y); y += 10;
  doc.setFont(undefined, "bold"); doc.text("Answer:", 10, y); doc.setFont(undefined, "normal"); y += 6;
  doc.text(answer || "(no answer)", 10, y); y += 10;
  doc.text("STAR Feedback:", 10, y); y += 6;
  doc.text("Strengths:", 10, y); y += 6; feedback.strengths.forEach(s => { doc.text(`• ${s}`, 14, y); y += 6; });
  doc.text("Weaknesses:", 10, y); y += 6; feedback.weaknesses.forEach(s => { doc.text(`• ${s}`, 14, y); y += 6; });
  doc.text("Improvements:", 10, y); y += 6; feedback.improvements.forEach(s => { doc.text(`• ${s}`, 14, y); y += 6; });
  doc.text(`Rating: ${feedback.rating}/5`, 10, y); y += 10;
  doc.save(`Interview_Report_${new Date(createdAt).toISOString().slice(0,10)}.pdf`);
}

// ----- Helper Components -----
const Section = ({ title, right, children }) => (
  <div className="bg-gray-900/80 backdrop-blur rounded-xl shadow-lg p-4 md:p-6 mb-6 border border-gray-800 neon-glow">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-orange-400">{title}</h2>
      {right}
    </div>
    {children}
  </div>
);
const Pill = ({ children }) => <span className="px-3 py-1 rounded-full text-xs bg-gray-800 text-orange-400 border border-orange-500/30">{children}</span>;

// ----- Main App -----
export default function InterviewDashboard() {
  const { user, setUser } = useMockAuth();
  const [questions, setQuestions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [role, setRole] = useState("");
  const [category, setCategory] = useState("");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const recognitionRef = useRef(null);

  // ----- Load questions from API -----
  useEffect(() => {
    setIsLoading(true);
    axios.get(`${API_BASE_URL}/api/questions`)
      .then(res => {
        console.log("Questions API response:", res.data);
        const data = Array.isArray(res.data) ? res.data : [];
        setQuestions(data);

        // Set default role & category if not already set
        if (data.length > 0) {
          setRole(prev => prev || data[0].role);
          setCategory(prev => prev || data[0].category);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching questions:", err);
        setError("Failed to load questions. Please check if the server is running.");
        setQuestions([]);
        setIsLoading(false);
      });
  }, []);

  // ----- Load sessions for this user -----
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/sessions`)
      .then(res => {
        console.log("Sessions API response:", res.data);
        // Ensure sessions is always an array
        const sessionsData = Array.isArray(res.data) ? res.data : [];
        setSessions(sessionsData);
      })
      .catch(err => {
        console.error("Error fetching sessions:", err);
        setSessions([]); // Set to empty array on error
      });
  }, []);

  // Generate role & category options dynamically
  const roleOptions = Array.from(new Set(questions.map(q => q.role)));
  const categoryOptions = Array.from(new Set(
    questions.filter(q => q.role === role).map(q => q.category)
  ));

  // Update category when role changes to ensure it's valid
  useEffect(() => {
    if (questions.length > 0 && role) {
      const categoriesForRole = Array.from(new Set(
        questions.filter(q => q.role === role).map(q => q.category)
      ));
      
      if (!categoriesForRole.includes(category) && categoriesForRole.length > 0) {
        setCategory(categoriesForRole[0]);
      }
    }
  }, [role, questions, category]);

  const filtered = useMemo(() => (
    Array.isArray(questions) ? 
    questions.filter(q => q.role === role && q.category === category) : 
    []
  ), [questions, role, category]);

  const current = filtered[index] || null;

  // Reset index when role or category changes
  useEffect(() => {
    setIndex(0);
    setFeedback(null);
    setAnswer("");
  }, [role, category]);

  // ----- Speech to text -----
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recog = new SR();
    recog.continuous = true; recog.interimResults = true; recog.lang = "en-US";
    recog.onresult = e => {
  let transcript = "";
  for (let i = e.resultIndex; i < e.results.length; i++) {
    if (e.results[i].isFinal) {
      transcript += e.results[i][0].transcript + " ";
    }
  }
  if (transcript) {
    setAnswer(a => (a + " " + transcript).trim());
  }
};
    recog.onerror = e=>setError(e.error||"Speech recognition error");
    recognitionRef.current = recog;
    return () => recog.abort();
  }, []);

  const startMic = () => { const recog=recognitionRef.current; if(!recog){ setError("Speech recognition not supported"); return; } setListening(true); recog.start(); };
  const stopMic = () => { const recog=recognitionRef.current; if(recog) try{recog.stop();}catch{} setListening(false); };

  // ----- Submit answer -----
  const submitAnswer = () => {
    if (!current) return;
    const fb = generateStarFeedback(answer);
    setFeedback(fb);

    axios.post(`${API_BASE_URL}/api/responses`, {
      questionId: current._id,
      answer,
      feedback: fb,
      role, category
    }).then(res => {
      // Ensure we're setting an array for sessions
      const updatedSessions = Array.isArray(res.data.sessions) ? res.data.sessions : [];
      setSessions(updatedSessions);
    }).catch(err=>console.error("Error submitting response:", err));
  };

  const exportPDFHandler = () => {
    if (!feedback || !current) return;
    exportAttemptToPDF({ user, role, category, question: current.text, answer, feedback, createdAt: Date.now() });
  };

  const go = dir => { if (!filtered.length) return; setFeedback(null); setAnswer(""); setIndex(i => (i+dir+filtered.length)%filtered.length); };

  // Fix the chart data generation to handle cases where sessions is not an array
  const chartData = useMemo(() => {
    if (!Array.isArray(sessions)) return [];
    return sessions.slice(-12).map((s,i) => ({idx:i+1,rating:s.feedback?.rating || 0}));
  }, [sessions]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8 digital-bg">
      {/* Custom CSS for digital effects */}
      <style jsx>{`
        .digital-bg {
          background: linear-gradient(125deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f1a 100%);
          position: relative;
          overflow-x: hidden;
        }
        .digital-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 15% 50%, rgba(255, 165, 0, 0.03) 0%, transparent 25%),
            radial-gradient(circle at 85% 30%, rgba(255, 165, 0, 0.03) 0%, transparent 25%);
          pointer-events: none;
        }
        .neon-glow {
          box-shadow: 0 0 10px rgba(255, 165, 0, 0.2), 0 0 20px rgba(255, 165, 0, 0.1);
        }
        .neon-border {
          border: 1px solid rgba(255, 165, 0, 0.3);
        }
        .digital-text {
          text-shadow: 0 0 5px rgba(255, 165, 0, 0.5);
        }
        .digital-input {
          background: rgba(30, 30, 40, 0.7);
          border: 1px solid rgba(255, 165, 0, 0.3);
          color: #ffa500;
          transition: all 0.3s ease;
        }
        .digital-input:focus {
          outline: none;
          box-shadow: 0 0 10px rgba(255, 165, 0, 0.5);
          border-color: rgba(255, 165, 0, 0.7);
        }
        .glow-button {
          background: linear-gradient(45deg, #ff7b00, #ffaa00);
          color: #000;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        .glow-button:hover {
          box-shadow: 0 0 15px rgba(255, 165, 0, 0.7);
          transform: translateY(-2px);
        }
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 165, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 165, 0, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h1 className="text-3xl font-bold text-orange-400 digital-text">AI Mock Interview</h1>
        <div className="flex items-center gap-4">
          <span className="text-orange-300">{user.name}</span>
          <button className="p-2 rounded-full bg-gray-800 shadow-lg hover:bg-gray-700 neon-border">
            <LogOut size={20} className="text-orange-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Column - Question & Answer */}
        <div className="lg:col-span-2">
          <Section title="Interview Practice" right={<Pill>{filtered.length} questions</Pill>}>
            {/* Role & Category Selectors */}
            <div className="flex flex-wrap gap-4 mb-6">
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="px-4 py-2 rounded-lg digital-input"
              >
                {roleOptions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 rounded-lg digital-input"
              >
                {categoryOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Question Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => go(-1)} disabled={!filtered.length} className="p-2 rounded-full bg-gray-800 shadow-lg neon-border disabled:opacity-50">
                <ChevronLeft size={24} className="text-orange-400" />
              </button>
              
              <span className="text-orange-300">
                {filtered.length ? `${index + 1} of ${filtered.length}` : 'No questions'}
              </span>
              
              <button onClick={() => go(1)} disabled={!filtered.length} className="p-2 rounded-full bg-gray-800 shadow-lg neon-border disabled:opacity-50">
                <ChevronRight size={24} className="text-orange-400" />
              </button>
            </div>

            {/* Current Question */}
            {current ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-orange-300">Question:</h3>
                <p className="bg-gray-800 p-4 rounded-lg shadow-sm neon-border text-orange-200">{current.text}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-orange-300">
                {isLoading ? "Loading questions..." : "No questions available for this category"}
              </div>
            )}

            {/* Answer Input */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-orange-300">Your Answer:</h3>
                <button 
                  onClick={listening ? stopMic : startMic} 
                  className={`p-2 rounded-full ${listening ? 'bg-red-900/50 text-red-400' : 'bg-gray-800 text-orange-400'} neon-border`}
                >
                  {listening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here or use the microphone to record..."
                className="w-full h-40 p-4 rounded-lg digital-input resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={submitAnswer}
              disabled={!answer.trim() || !current}
              className="w-full glow-button py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          </Section>

          {/* Feedback Section */}
          {feedback && (
            <Section title="STAR Method Feedback">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-green-400 mb-2">Strengths</h4>
                  <ul className="list-disc list-inside">
                    {feedback.strengths.map((item, i) => (
                      <li key={i} className="text-sm text-green-300">{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-red-400 mb-2">Weaknesses</h4>
                  <ul className="list-disc list-inside">
                    {feedback.weaknesses.map((item, i) => (
                      <li key={i} className="text-sm text-red-300">{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">Improvements</h4>
                  <ul className="list-disc list-inside">
                    {feedback.improvements.map((item, i) => (
                      <li key={i} className="text-sm text-blue-300">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-orange-300">Overall Rating: {feedback.rating}/5</span>
                  <button
                    onClick={exportPDFHandler}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 neon-border text-orange-300"
                  >
                    <Download size={16} />
                    Export PDF
                  </button>
                </div>
              </div>
            </Section>
          )}
        </div>

        {/* Right Column - Progress & History */}
        <div>
          <Section title="Progress Tracking">
            <div className="h-64 grid-pattern">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="idx" stroke="#ffa500" />
                  <YAxis domain={[0, 5]} stroke="#ffa500" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 30, 40, 0.9)', 
                      border: '1px solid rgba(255, 165, 0, 0.5)',
                      borderRadius: '5px',
                      color: '#ffa500'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#ffa500" 
                    strokeWidth={2} 
                    dot={{ fill: '#ffa500', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, fill: '#ff7b00' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Recent Sessions">
            {sessions.length > 0 ? (
              <ul className="space-y-3">
                {sessions.slice(0, 5).map((session, i) => (
                  <li key={i} className="flex justify-between items-center p-3 bg-gray-800/50 rounded neon-border">
                    <div>
                      <p className="font-medium text-orange-300">{session.role} - {session.category}</p>
                      <p className="text-sm text-gray-400">{new Date(session.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="font-bold text-orange-400">{session.feedback?.rating}/5</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-orange-300 text-center py-4">No sessions yet</p>
            )}
          </Section>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-red-900/80 border border-red-700 text-red-200 px-4 py-3 rounded neon-glow"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}