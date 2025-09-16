import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GOOGLE_LOGIN_URL, API_BASE_URL } from "../api/auth";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if we're returning from Google OAuth with a success indicator
    const success = searchParams.get('success');
    const fromAuth = searchParams.get('fromAuth');
    
    if (success === 'true' || fromAuth === 'true') {
      completeAuthProcess();
    }
  }, [searchParams, navigate]);

  const completeAuthProcess = async () => {
    setIsProcessing(true);
    setMessage("Completing authentication...");
    
    try {
      const res = await fetch(`${API_BASE_URL}/me`, { 
        credentials: "include" 
      });
      
      if (res.ok) {
        const data = await res.json();
        if (!data.isProfileComplete) {
          navigate("/profile-setup");
        } else {
          navigate("/categories");
        }
      } else {
        setMessage("Authentication completed but couldn't fetch user data");
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setMessage("Error connecting to server. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Build the Google OAuth URL with a redirect parameter
  const getGoogleOAuthUrl = () => {
    const url = new URL(GOOGLE_LOGIN_URL);
    url.searchParams.append('redirect_success', 'true');
    return url.toString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 digital-font">
      {/* Header */}
      <header className="bg-gray-800 border-b border-orange-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-orange-500 digital-text">InterviewPrep</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[calc(100vh-140px)]">
        <div className="w-full max-w-md bg-gray-800 rounded-lg border border-orange-500/20 overflow-hidden digital-border">
          {/* Header Section */}
          <div className="bg-gray-800 border-b border-orange-500/30 p-6 text-center">
            <h1 className="text-3xl font-bold text-orange-500 digital-text">InterviewPrep</h1>
            <p className="text-orange-400/80 mt-2">Practice makes perfect</p>
          </div>
          
          {/* Content Section */}
          <div className="p-6">
            {message && (
              <div className="mb-4 p-3 bg-orange-500/10 text-orange-400 rounded-lg text-center digital-glow">
                {message}
              </div>
            )}
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-100 mb-2 digital-text">Welcome Back</h2>
              <p className="text-gray-400">Sign in to continue your interview preparation</p>
            </div>
            
            {/* Google Sign-in Button */}
            {!isProcessing ? (
              <>
                <a
                  href={getGoogleOAuthUrl()}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-700 border border-orange-500/30 rounded-lg text-gray-100 font-medium hover:bg-orange-500/10 transition-all duration-200 digital-glow hover:digital-glow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </a>
                
                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-grow border-t border-orange-500/20"></div>
                  <span className="mx-4 text-gray-500 text-sm">or</span>
                  <div className="flex-grow border-t border-orange-500/20"></div>
                </div>
              </>
            ) : (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            )}
            
            {/* Demo Features */}
            <div className="bg-orange-500/10 p-4 rounded-lg mt-6 digital-border">
              <h3 className="font-medium text-orange-400 mb-3 digital-text">Why create an account?</h3>
              <ul className="text-sm text-orange-300/90 space-y-2">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Personalized interview practice
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Track your progress over time
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Access to all interview categories
                </li>
              </ul>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-800 border-t border-orange-500/20 py-4 px-6 text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-orange-500/20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>© 2023 InterviewPrep. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;