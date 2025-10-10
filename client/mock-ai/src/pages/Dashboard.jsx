import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Mic, MicOff, ChevronLeft, ChevronRight, LogOut, ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import jsPDF from "jspdf";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { generateFeedback } from "../uitls/feedback.js";

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/auth";

// Mock Auth Hook
const useMockAuth = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("demo_user");
    return saved
      ? JSON.parse(saved)
      : { name: "Guest", email: "guest@example.com", paid: false, isGuest: true };
  });
  const [loading, setLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/me`, {
          credentials: "include",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
        });

        if (res.status === 401) {
          setUser({ name: "Guest", email: "guest@example.com", paid: false, isGuest: true });
          setBackendAvailable(true);
          return;
        }

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        if (data.isAuthenticated && data.user) {
          setUser({ name: data.user.name || "User", email: data.user.email || "user@example.com", paid: data.user.paid || false, id: data.user.id, isGuest: false, ...data.user });
        }
        setBackendAvailable(true);
      } catch (err) {
        console.error("Error fetching user:", err);
        setBackendAvailable(!err.message.includes("Failed to fetch"));
        setUser({ name: "Guest", email: "guest@example.com", paid: false, isGuest: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    localStorage.setItem("demo_user", JSON.stringify(user));
  }, [user]);

  const login = () => {
    window.location.href = `${API_BASE_URL}/google`;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, { method: "GET", credentials: "include" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      const guestUser = { name: "Guest", email: "guest@example.com", paid: false, isGuest: true };
      setUser(guestUser);
      localStorage.setItem("demo_user", JSON.stringify(guestUser));
    }
  };

  return { user, setUser, loading, backendAvailable, login, logout };
};

// Enhanced PDF Export with better formatting
function exportAttemptToPDF({ user, role, category, questions, answers, feedbacks, averageRating, createdAt }) {
  const doc = new jsPDF();
  let y = 10;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(255, 165, 0);
  doc.text("Interview Performance Report", 105, y, { align: "center" });
  y += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date(createdAt).toLocaleString()}`, 105, y, { align: "center" });
  y += 15;

  // User Information
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Candidate: ${user.name}`, 20, y);
  doc.text(`Email: ${user.email}`, 20, y + 6);
  doc.text(`Role: ${role}`, 20, y + 12);
  doc.text(`Category: ${category}`, 20, y + 18);
  doc.text(`Overall Rating: ${averageRating.toFixed(1)}/5`, 20, y + 24);
  y += 35;

  // Overall Performance Summary
  doc.setFontSize(14);
  doc.setTextColor(255, 165, 0);
  doc.text("Overall Performance Summary", 20, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  let performanceSummary = "";
  if (averageRating >= 4.0) {
    performanceSummary = "Excellent performance! You demonstrated strong technical knowledge and communication skills. Continue working on advanced scenarios to further enhance your expertise.";
  } else if (averageRating >= 3.0) {
    performanceSummary = "Good performance with solid fundamentals. Focus on deepening your technical knowledge and improving answer structure to reach the next level.";
  } else {
    performanceSummary = "Areas for improvement identified. Focus on strengthening fundamental concepts and practicing structured responses to improve your interview performance.";
  }
  
  const summaryLines = doc.splitTextToSize(performanceSummary, 170);
  doc.text(summaryLines, 20, y);
  y += summaryLines.length * 5 + 10;

  // Detailed Question Analysis
  doc.setFontSize(14);
  doc.setTextColor(255, 165, 0);
  doc.text("Detailed Question Analysis", 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  questions.forEach((question, index) => {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const answer = answers[index] || "No answer provided";
    const feedback = feedbacks[index];
    
    if (feedback) {
      // Question
      doc.setFont(undefined, "bold");
      doc.text(`Q${index + 1}: ${question.text}`, 20, y);
      y += 6;
      
      // Rating
      doc.setFont(undefined, "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Rating: ${feedback.rating}/5`, 20, y);
      y += 5;
      
      // Answer (truncated if too long)
      doc.setTextColor(0, 0, 0);
      const shortAnswer = answer.length > 150 ? answer.substring(0, 150) + "..." : answer;
      const answerLines = doc.splitTextToSize(`Answer: ${shortAnswer}`, 170);
      doc.text(answerLines, 20, y);
      y += answerLines.length * 5 + 3;
      
      // Key Feedback
      if (feedback.strengths && feedback.strengths.length > 0) {
        doc.setTextColor(0, 128, 0);
        doc.text(`Strengths: ${feedback.strengths[0]}`, 20, y);
        y += 5;
      }
      
      if (feedback.improvements && feedback.improvements.length > 0) {
        doc.setTextColor(0, 0, 255);
        doc.text(`Improvement: ${feedback.improvements[0]}`, 20, y);
        y += 5;
      }
      
      doc.setTextColor(0, 0, 0);
      y += 8;
    }
  });

  // Final Recommendations
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(255, 165, 0);
  doc.text("Recommendations for Improvement", 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const recommendations = [];
  if (averageRating < 3.0) {
    recommendations.push(
      "Focus on mastering fundamental concepts in your field",
      "Practice structuring your answers using the STAR method (Situation, Task, Action, Result)",
      "Work on technical depth and specific examples",
      "Improve communication clarity and confidence"
    );
  } else if (averageRating < 4.0) {
    recommendations.push(
      "Deepen knowledge in advanced topics and edge cases",
      "Practice articulating complex concepts clearly",
      "Work on time management during responses",
      "Focus on real-world project examples and outcomes"
    );
  } else {
    recommendations.push(
      "Continue staying updated with latest industry trends",
      "Practice leadership and system design questions",
      "Consider mentoring others to reinforce knowledge",
      "Prepare for advanced technical discussions"
    );
  }

  recommendations.forEach((rec, i) => {
    doc.text(`• ${rec}`, 20, y);
    y += 5;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    doc.text("Generated by InterviewPrep AI", 105, 295, { align: "center" });
  }

  // Save file with timestamp
  const timestamp = new Date(createdAt).toISOString().slice(0, 10).replace(/-/g, '');
  doc.save(`Interview_Report_${user.name.replace(/\s+/g, '_')}_${timestamp}.pdf`);
}

// Helper Components
const Section = ({ title, right, children }) => (
  <div className="bg-gray-900/80 backdrop-blur rounded-xl shadow-lg p-4 md:p-6 mb-6 border border-gray-800 neon-glow">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-orange-400">{title}</h2>
      {right}
    </div>
    {children}
  </div>
);

const Pill = ({ children }) => (
  <span className="px-3 py-1 rounded-full text-xs bg-gray-800 text-orange-400 border border-orange-500/30">{children}</span>
);

// Main App Component
export default function InterviewDashboard() {
  const { user, loading, logout, backendAvailable } = useMockAuth();
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill(""));
  const [feedbacks, setFeedbacks] = useState(Array(10).fill(null));
  const [submitted, setSubmitted] = useState(Array(10).fill(false));
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { category, role } = location.state || {};
  const recognitionRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Enhanced redirect with better error handling
  useEffect(() => {
    if (!category || !role) {
      console.warn("No category or role selected, redirecting to categories");
      navigate("/categories");
    }
  }, [category, role, navigate]);

  // Enhanced session initialization with proper category/role handling
  useEffect(() => {
    if (!category || !role) return;

    const initializeInterview = async () => {
      setIsLoading(true);
      try {
        // Extract category and role names properly
        const categoryName = category?.name || category;
        const roleName = role?.name || role;

        console.log("Initializing interview for:", { categoryName, roleName });

        // Create session
        const sessionRes = await axios.post(
          "https://mock-ai-1-8xa5.onrender.com/api/sessions",
          { 
            role: roleName, 
            category: categoryName, 
            responses: [] 
          },
          { headers: { Accept: "application/json" }, credentials: "include" }
        );
        setSessionId(sessionRes.data._id);

        // Fetch questions with detailed logging
        console.log("Fetching questions from API...");
        const res = await axios.get("https://mock-ai-1-8xa5.onrender.com/api/questions", {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        
        const data = Array.isArray(res.data) ? res.data : [];
        console.log("Total questions fetched:", data.length);
        
        // Log first few questions to see their structure
        if (data.length > 0) {
          console.log("Sample questions structure:", data.slice(0, 3));
        }

        // Enhanced filtering with detailed logging
        const filteredQuestions = data.filter((q) => {
          const qCategory = (q.category || "").toLowerCase().trim();
          const qRole = (q.role || "").toLowerCase().trim();
          const targetCategory = categoryName.toLowerCase().trim();
          const targetRole = roleName.toLowerCase().trim();
          
          const matches = qCategory === targetCategory && qRole === targetRole;
          
          if (matches) {
            console.log("Matched question:", { 
              question: q.text, 
              category: q.category, 
              role: q.role 
            });
          }
          
          return matches;
        });

        console.log(`Found ${filteredQuestions.length} questions for ${categoryName} - ${roleName}`);

        const questionsToSet = filteredQuestions.length >= 10
          ? filteredQuestions.slice(0, 10)
          : [...filteredQuestions, ...generateAdditionalQuestions(filteredQuestions, 10 - filteredQuestions.length, categoryName, roleName)];
        
        console.log("Final questions to set:", questionsToSet.length);
        setQuestions(questionsToSet);
        
        if (filteredQuestions.length === 0) {
          setError(`No specific questions found for ${roleName} in ${categoryName}. Using general questions.`);
        }
      } catch (err) {
        console.error("Error initializing interview:", err);
        setError("Failed to load questions. Using mock questions.");
        setQuestions(generateMockQuestions(10, category, role));
      } finally {
        setIsLoading(false);
      }
    };

    initializeInterview();
  }, [category, role]);

  // Enhanced question generation with proper context
  const generateAdditionalQuestions = (baseQuestions, count, category, role) => {
    const categorySpecificTemplates = {
      'Artificial Intelligence': [
        "Explain the difference between supervised and unsupervised learning.",
        "How would you handle overfitting in a neural network?",
        "Describe your experience with TensorFlow or PyTorch.",
        "What are some common applications of computer vision?",
        "How do you approach hyperparameter tuning?"
      ],
      'Cloud Computing': [
        "Compare AWS, Azure, and GCP for enterprise solutions.",
        "How do you ensure security in cloud infrastructure?",
        "Describe your experience with container orchestration.",
        "What strategies do you use for cost optimization in cloud?",
        "How do you handle disaster recovery in cloud environments?"
      ],
      'Cybersecurity': [
        "Explain the CIA triad in cybersecurity.",
        "How would you conduct a vulnerability assessment?",
        "Describe your experience with SIEM tools.",
        "What are the latest trends in cybersecurity threats?",
        "How do you ensure compliance with security standards?"
      ],
      'Data Science': [
        "Explain the CRISP-DM methodology.",
        "How do you handle missing data in your datasets?",
        "Describe your experience with SQL and NoSQL databases.",
        "What metrics do you use to evaluate model performance?",
        "How do you communicate technical findings to non-technical stakeholders?"
      ],
      'Web Development': [
        "Explain the difference between REST and GraphQL.",
        "How do you optimize website performance?",
        "Describe your experience with React/Vue/Angular.",
        "What strategies do you use for cross-browser compatibility?",
        "How do you ensure web application security?"
      ]
    };

    const defaultTemplates = [
      "What approaches do you take to solve complex problems?",
      "Describe a time you had to adapt to a significant change at work.",
      "How do you ensure quality in your work?",
      "Tell me about a time you had to meet a tight deadline.",
      "What strategies do you use to communicate with stakeholders?"
    ];

    const templates = categorySpecificTemplates[category] || defaultTemplates;

    return Array.from({ length: count }, (_, i) => ({
      _id: `gen-${Date.now()}-${i}`,
      text: templates[i % templates.length],
      category: category,
      role: role,
    }));
  };

  // Enhanced mock questions with context
  const generateMockQuestions = (count, category, role) => {
    const categoryName = category?.name || category;
    const roleName = role?.name || role;
    
    const baseTemplates = [
      `As a ${roleName} in ${categoryName}, describe your most challenging project.`,
      `What specific skills in ${categoryName} make you suitable for ${roleName}?`,
      `How do you stay updated with the latest trends in ${categoryName}?`,
      `Describe a technical problem you solved in ${categoryName} and your approach.`,
      `What tools and technologies are essential for ${roleName} in ${categoryName}?`,
      `How do you handle tight deadlines in ${categoryName} projects?`,
      `What's your experience with team collaboration in ${categoryName} environments?`,
      `How do you ensure code quality in ${categoryName} development?`,
      `Describe your approach to learning new ${categoryName} technologies.`,
      `What makes you passionate about ${categoryName} as a ${roleName}?`
    ];

    return Array.from({ length: count }, (_, i) => ({
      _id: `mock-${Date.now()}-${i}`,
      text: baseTemplates[i % baseTemplates.length],
      category: categoryName,
      role: roleName,
    }));
  };

  // Fetch sessions with better error handling
  const fetchSessions = async (retryCount = 3, delay = 1000) => {
    setSessionsLoading(true);
    try {
      for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
          const res = await axios.get("https://mock-ai-1-8xa5.onrender.com/api/sessions", {
            headers: { Accept: "application/json" },
            withCredentials: true,
          });

          const sortedSessions = Array.isArray(res.data)
            ? res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            : [];
          
          setSessions(sortedSessions);
          return;
        } catch (err) {
          console.error(`Error fetching sessions (attempt ${attempt}):`, err);
          if (attempt < retryCount) await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      setSessions([]);
    } catch (err) {
      console.error("Unexpected error in fetchSessions:", err);
      setError("Failed to fetch session data. Please try again.");
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (backendAvailable) fetchSessions();
    else setError("Backend is unavailable. Session tracking is disabled.");
  }, [backendAvailable]);

  const filtered = useMemo(() => (Array.isArray(questions) ? questions.slice(0, 10) : []), [questions]);
  const current = filtered[index] || null;
  const currentAnswer = answers[index] || "";
  const currentFeedback = feedbacks[index] || null;
  const isCurrentSubmitted = submitted[index] || false;

  // Reset state when category/role changes
  useEffect(() => {
    setIndex(0);
    setAnswers(Array(10).fill(""));
    setFeedbacks(Array(10).fill(null));
    setSubmitted(Array(10).fill(false));
    setAverageRating(0);
    setShowCompletionModal(false);
  }, [role, category]);

  // Calculate average rating
  useEffect(() => {
    const submittedFeedbacks = feedbacks.filter((f) => f !== null);
    setAverageRating(submittedFeedbacks.length > 0 ? submittedFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / submittedFeedbacks.length : 0);
  }, [feedbacks]);

  // Check if all questions are completed and show modal
  useEffect(() => {
    const allCompleted = submitted.filter((s) => s).length === 10;
    if (allCompleted && !showCompletionModal) {
      setShowCompletionModal(true);
    }
  }, [submitted, showCompletionModal]);

  // Speech Recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recog = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";
    recog.onresult = (e) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) transcript += e.results[i][0].transcript + " ";
      }
      if (transcript) {
        setAnswers((prev) => {
          const newAnswers = [...prev];
          newAnswers[index] = (newAnswers[index] + " " + transcript).trim();
          return newAnswers;
        });
      }
    };
    recog.onerror = (e) => setError(e.error || "Speech recognition error");
    recognitionRef.current = recog;
    return () => recog.abort();
  }, [index]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;
    if (Math.abs(diff) > swipeThreshold) go(diff > 0 ? 1 : -1);
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const startMic = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition not supported");
      return;
    }
    setListening(true);
    recognitionRef.current.start();
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    }
    setListening(false);
  };

  const submitAnswer = async () => {
    if (!current || isSubmitting || isCurrentSubmitted) return;
    if (currentAnswer.length < 30) {
      setError("Please provide a more detailed answer (at least 30 characters)");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const feedbackData = generateFeedback(currentAnswer, current.category?.toLowerCase() || "behavioral");
      feedbackData.detailedAnalysis = `Your answer was analyzed using the ${current.category} evaluation criteria. `;
      feedbackData.detailedAnalysis += feedbackData.rating >= 4
        ? "You provided a strong response that demonstrates relevant experience and skills."
        : feedbackData.rating >= 3
        ? "You provided a good response but there is room for improvement in certain areas."
        : "Your response needs significant improvement to effectively address the question.";

      // Update feedbacks and submitted states
      setFeedbacks((prev) => {
        const newFeedbacks = [...prev];
        newFeedbacks[index] = feedbackData;
        return newFeedbacks;
      });
      setSubmitted((prev) => {
        const newSubmitted = [...prev];
        newSubmitted[index] = true;
        return newSubmitted;
      });

      // Save response to backend
      const saveRes = await axios.post(
        "https://mock-ai-1-8xa5.onrender.com/api/responses",
        {
          questionId: current._id,
          question: current.text,
          answer: currentAnswer,
          feedback: feedbackData,
          role: role?.name || role,
          category: category?.name || category,
        },
        { headers: { Accept: "application/json" }, credentials: "include" }
      );

      // Update session in backend
      if (sessionId) {
        try {
          await axios.patch(
            `https://mock-ai-1-8xa5.onrender.com/api/sessions/${sessionId}`,
            { responseId: saveRes.data._id, rating: feedbackData.rating },
            { headers: { Accept: "application/json" }, credentials: "include" }
          );

          setSessions((prevSessions) => {
            const updatedSessions = [...prevSessions];
            const currentSessionIndex = updatedSessions.findIndex((s) => s._id === sessionId);
            const newResponse = {
              questionId: current._id,
              question: current.text,
              answer: currentAnswer,
              rating: feedbackData.rating,
            };

            if (currentSessionIndex >= 0) {
              updatedSessions[currentSessionIndex] = {
                ...updatedSessions[currentSessionIndex],
                responses: [...(updatedSessions[currentSessionIndex].responses || []), newResponse],
                createdAt: updatedSessions[currentSessionIndex].createdAt || new Date().toISOString(),
              };
            } else {
              updatedSessions.unshift({
                _id: sessionId,
                role: role?.name || role,
                category: category?.name || category,
                responses: [newResponse],
                createdAt: new Date().toISOString(),
              });
            }

            return updatedSessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          });
        } catch (sessionError) {
          console.error("Session update failed:", sessionError);
          setError("Response saved but session update failed. Your answer was still recorded.");
        }
      }

      await fetchSessions();
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError("An error occurred while submitting your answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportPDFHandler = () => {
    exportAttemptToPDF({
      user,
      role: role?.name || role,
      category: category?.name || category,
      questions: filtered,
      answers,
      feedbacks,
      averageRating,
      createdAt: Date.now(),
    });
    setShowCompletionModal(false);
  };

  const go = (dir) => {
    if (!filtered.length) return;
    setIndex((i) => (i + dir + filtered.length) % filtered.length);
  };

  const allSubmitted = useMemo(() => submitted.filter((s) => s).length === 10, [submitted]);

  const chartData = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return Array.from({ length: 10 }, (_, i) => ({ question: i + 1, rating: 0 }));
    }

    const currentSession = sessions.find((s) => s._id === sessionId) || sessions[0];
    if (!currentSession) {
      return Array.from({ length: 10 }, (_, i) => ({ question: i + 1, rating: 0 }));
    }

    const data = Array.from({ length: 10 }, (_, i) => ({
      question: i + 1,
      rating: currentSession.responses?.[i]?.rating || 0,
    }));

    return data;
  }, [sessions, sessionId]);

  const handleBackToCategories = () => {
    navigate("/categories");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8 digital-bg">
      <style>{`
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
          background: radial-gradient(circle at 15% 50%, rgba(255, 165, 0, 0.03) 0%, transparent 25%),
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
          background-image: linear-gradient(rgba(255, 165, 0, 0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 165, 0, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .carousel-container {
          touch-action: pan-y;
        }
        @media (max-width: 768px) {
          .user-info { display: none; }
          .user-info-mobile { display: block; margin-bottom: 1rem; }
        }
        @media (min-width: 769px) {
          .user-info-mobile { display: none; }
        }
      `}</style>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full neon-glow border border-orange-500/30"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="text-green-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-orange-400 mb-2">Interview Completed! 🎉</h3>
                <p className="text-gray-300 mb-4">
                  Congratulations! You've completed all 10 questions with an average rating of <span className="text-orange-400 font-bold">{averageRating.toFixed(1)}/5</span>.
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Download your detailed performance report to review your strengths, weaknesses, and areas for improvement.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCompletionModal(false)}
                    className="flex-1 py-3 rounded-lg font-medium bg-gray-700 text-orange-300 hover:bg-gray-600 transition-colors"
                  >
                    Continue Reviewing
                  </button>
                  <button
                    onClick={exportPDFHandler}
                    className="flex-1 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-500 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToCategories}
            className="flex items-center text-orange-400 hover:text-orange-300 transition-colors p-2 rounded-lg bg-gray-800/50 neon-border"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Categories
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-orange-400 digital-text">AI Mock Interview</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="user-info hidden md:flex flex-col items-end">
            <span className="text-orange-300 text-sm">{user.name}</span>
            <span className="text-orange-400/70 text-xs">{user.email}</span>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-full bg-gray-800 shadow-lg neon-border hover:bg-gray-700 transition-colors"
            title="Logout"
          >
            <LogOut size={20} className="text-orange-400" />
          </button>
        </div>
      </div>

      <div className="user-info-mobile bg-gray-800/50 p-3 rounded-lg neon-border mb-4">
        <span className="text-orange-300 block">{user.name}</span>
        <span className="text-orange-400/70 text-sm">{user.email}</span>
        {!backendAvailable && <p className="text-red-400 text-xs mt-2">Backend unavailable. Some features may be limited.</p>}
      </div>

      {/* Enhanced Category/Role Display */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg neon-border">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-orange-400 digital-text mb-2">
              {role?.name || role} - {category?.name || category}
            </h2>
            <p className="text-gray-300">
              Practice interview questions specifically tailored for your selected role and category
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm border border-orange-500/30">
              Role: {role?.name || role}
            </div>
            <div className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm border border-orange-500/30">
              Category: {category?.name || category}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2">
          <Section title="Interview Practice" right={<Pill>{filtered.length} questions</Pill>}>
            <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
              <div className="px-3 py-1 md:px-4 md:py-2 rounded-lg digital-input text-sm md:text-base">
                <span className="text-orange-300">Role: </span>{role?.name || role || "Not selected"}
              </div>
              <div className="px-3 py-1 md:px-4 md:py-2 rounded-lg digital-input text-sm md:text-base">
                <span className="text-orange-300">Category: </span>{category?.name || category || "Not selected"}
              </div>
              <div className="px-3 py-1 md:px-4 md:py-2 rounded-lg digital-input text-sm md:text-base">
                <span className="text-orange-300">Progress: </span>{submitted.filter((s) => s).length}/10
              </div>
              <div className="px-3 py-1 md:px-4 md:py-2 rounded-lg digital-input text-sm md:text-base">
                <span className="text-orange-300">Avg: </span>{averageRating.toFixed(1)}/5
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <button onClick={() => go(-1)} disabled={!filtered.length} className="p-2 rounded-full bg-gray-800 shadow-lg neon-border disabled:opacity-50">
                <ChevronLeft size={24} className="text-orange-400" />
              </button>
              <span className="text-orange-300">{filtered.length ? `${index + 1} of ${filtered.length}` : "No questions"}{isCurrentSubmitted && " ✓"}</span>
              <button onClick={() => go(1)} disabled={!filtered.length} className="p-2 rounded-full bg-gray-800 shadow-lg neon-border disabled:opacity-50">
                <ChevronRight size={24} className="text-orange-400" />
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
                <p className="text-orange-300">Loading questions for {role?.name || role} - {category?.name || category}...</p>
              </div>
            ) : current ? (
              <div className="mb-6" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                <h3 className="text-lg font-semibold mb-4 text-orange-300">Question:</h3>
                <p className="bg-gray-800 p-4 rounded-lg shadow-sm neon-border text-orange-200">{current.text}</p>
                <p className="text-xs text-orange-400/60 mt-2 text-center">Swipe left/right to navigate questions</p>
              </div>
            ) : (
              <div className="text-center py-8 text-orange-300">
                No questions available for {role?.name || role} - {category?.name || category}
                <button onClick={() => navigate("/categories")} className="block mt-4 mx-auto px-4 py-2 glow-button rounded-lg">
                  Choose Different Category/Role
                </button>
              </div>
            )}

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-orange-300">Your Answer:</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-orange-300 hidden md:inline">{currentAnswer.length}/30 characters</span>
                  <button
                    onClick={listening ? stopMic : startMic}
                    disabled={isCurrentSubmitted || !backendAvailable}
                    className={`p-2 rounded-full ${listening ? "bg-red-900/50 text-red-400" : "bg-gray-800 text-orange-400"} neon-border disabled:opacity-50`}
                  >
                    {listening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                </div>
              </div>
              <div className="md:hidden flex justify-between items-center mb-2">
                <span className="text-sm text-orange-300">{currentAnswer.length}/30 characters</span>
              </div>
              <textarea
                value={currentAnswer}
                onChange={(e) => setAnswers((prev) => {
                  const newAnswers = [...prev];
                  newAnswers[index] = e.target.value;
                  return newAnswers;
                })}
                disabled={isCurrentSubmitted || !backendAvailable}
                placeholder="Type your answer here or use the microphone to record (minimum 30 characters)..."
                className="w-full h-40 p-4 rounded-lg digital-input resize-none disabled:opacity-50"
              />
              {currentAnswer.length > 0 && currentAnswer.length < 30 && !isCurrentSubmitted && (
                <p className="text-red-400 text-sm mt-2">Please provide a more detailed answer (at least 30 characters)</p>
              )}
            </div>

            {!isCurrentSubmitted ? (
              <button
                onClick={submitAnswer}
                disabled={!currentAnswer.trim() || currentAnswer.length < 30 || !current || isSubmitting || !backendAvailable}
                className="w-full glow-button py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  "Submit Answer"
                )}
              </button>
            ) : (
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={() => setSubmitted((prev) => {
                    const newSubmitted = [...prev];
                    newSubmitted[index] = false;
                    return newSubmitted;
                  })}
                  className="w-full md:w-1/2 py-3 rounded-lg font-medium bg-gray-700 text-orange-300 hover:bg-gray-600"
                >
                  Edit Answer
                </button>
                <button onClick={() => go(1)} className="w-full md:w-1/2 glow-button py-3 rounded-lg font-medium">
                  Next Question
                </button>
              </div>
            )}

            {/* Always show download button when all completed */}
            {allSubmitted && (
              <button
                onClick={exportPDFHandler}
                className="w-full mt-4 py-3 rounded-lg font-medium bg-green-700 text-white hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download Complete PDF Report
              </button>
            )}
          </Section>

          {currentFeedback && (
            <Section title="Interview Feedback">
              <div className="mb-4">
                <h4 className="font-semibold text-orange-300 mb-2">Detailed Analysis:</h4>
                <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg neon-border">{currentFeedback.detailedAnalysis || "No detailed analysis available."}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <h4 className="font-semibold text-green-400 mb-2">Strengths</h4>
                  <ul className="list-disc list-inside">{(currentFeedback.strengths || []).map((item, i) => <li key={i} className="text-sm text-green-300">{item}</li>)}</ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-400 mb-2">Weaknesses</h4>
                  <ul className="list-disc list-inside">{(currentFeedback.weaknesses || []).map((item, i) => <li key={i} className="text-sm text-red-300">{item}</li>)}</ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">Improvements</h4>
                  <ul className="list-disc list-inside">{(currentFeedback.improvements || []).map((item, i) => <li key={i} className="text-sm text-blue-300">{item}</li>)}</ul>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-orange-300">Rating: {currentFeedback.rating || 0}/5</span>
                  <span className="font-semibold text-orange-300">Average: {averageRating.toFixed(1)}/5</span>
                </div>
              </div>
            </Section>
          )}
        </div>

        <div>
          <Section
            title="Progress Tracking"
            right={<button onClick={() => fetchSessions()} className="text-orange-400 hover:text-orange-300" title="Refresh progress data">↻</button>}
          >
            <div className="h-64 grid-pattern">
              {sessionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
                  <p className="text-orange-300">Loading progress data...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-orange-300">No progress data available. Complete an interview to see your progress.</div>
              ) : (
               <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="question" label={{ value: "Question", position: "insideBottom", fill: "#ffa500" }} />
                    <YAxis domain={[0, 5]} label={{ value: "Rating", angle: -90, position: "insideLeft", fill: "#ffa500" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30, 30, 40, 0.9)",
                        border: "1px solid rgba(255, 165, 0, 0.5)",
                        borderRadius: "5px",
                        color: "#ffa500",
                      }}
                      formatter={(value, name, props) => [`${value}/5`, `Question ${props.payload.question}`]}
                    />
                    <Line dataKey="rating" stroke="#ffa500" strokeWidth={2} dot={{ r: 4, fill: "#ffa500" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Section>

          <Section title="Question Progress">
            <div className="relative carousel-container">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div
                    className={`p-3 rounded neon-border flex justify-between items-center ${
                      submitted[index] ? "border-green-500/50 bg-gray-800/50" : "bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-orange-400">{index + 1}.</span>
                      <span className={`truncate max-w-xs ${submitted[index] ? "text-green-300" : "text-gray-300"}`}>
                        {filtered[index]?.text.substring(0, 40)}...
                      </span>
                    </div>
                    {submitted[index] && <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full">✓</span>}
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center mt-4 gap-2">
                {filtered.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`w-2 h-2 rounded-full ${i === index ? "bg-orange-500" : "bg-gray-600"} ${submitted[i] ? "ring-2 ring-green-500" : ""}`}
                    aria-label={`Go to question ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </Section>

          <Section title="Current Session">
            {sessionId ? (
              <div className="space-y-3">
                {sessions
                  .filter((session) => session._id === sessionId)
                  .map((session, i) => {
                    const avgRating = session.responses?.length > 0 ? session.responses.reduce((sum, r) => sum + (r.rating || 0), 0) / session.responses.length : 0;
                    const completedQuestions = session.responses?.length || 0;
                    const totalQuestions = 10;

                    return (
                      <div key={i} className="p-4 bg-gray-800/50 rounded neon-border">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <p className="font-medium text-orange-300">{session.role || role?.name || role} - {session.category || category?.name || category}</p>
                            <p className="text-sm text-gray-400">{session.createdAt ? new Date(session.createdAt).toLocaleDateString() : "Today"}</p>
                          </div>
                          <span className="font-bold text-orange-400 text-xl">{avgRating.toFixed(1)}/5</span>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-orange-300">Progress:</span>
                            <span className="text-orange-400">{completedQuestions}/{totalQuestions}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(completedQuestions / totalQuestions) * 100}%` }}></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center p-2 bg-gray-900/50 rounded">
                            <div className="text-orange-300 font-semibold">Questions</div>
                            <div className="text-orange-400">{completedQuestions}</div>
                          </div>
                          <div className="text-center p-2 bg-gray-900/50 rounded">
                            <div className="text-orange-300 font-semibold">Avg Rating</div>
                            <div className="text-orange-400">{avgRating.toFixed(1)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-orange-300 text-center py-4">No active session. Start answering questions to begin.</p>
            )}
          </Section>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-orange-500/30 p-3 flex justify-between md:hidden z-20">
        <button onClick={() => go(-1)} disabled={!filtered.length} className="p-2 rounded-full bg-gray-800 shadow-lg neon-border disabled:opacity-50">
          <ChevronLeft size={24} className="text-orange-400" />
        </button>
        <span className="text-orange-300 self-center">{index + 1}/{filtered.length}</span>
        <button onClick={() => go(1)} disabled={!filtered.length} className="p-2 rounded-full bg-gray-800 shadow-lg neon-border disabled:opacity-50">
          <ChevronRight size={24} className="text-orange-400" />
        </button>
      </div>

      <div className="h-16 md:hidden"></div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-16 md:bottom-4 right-4 bg-red-900/80 border border-red-700 text-red-200 px-4 py-3 rounded neon-glow flex items-center z-30"
        >
          {error}
          <button onClick={() => setError("")} className="ml-4 text-red-300 hover:text-white">×</button>
        </motion.div>
      )}
    </div>
  );
}