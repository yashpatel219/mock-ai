import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaRobot,
  FaCloud,
  FaLock,
  FaDatabase,
  FaNetworkWired,
  FaMobileAlt,
  FaCode,
  FaChartLine,
  FaGlobe,
  FaBrain,
  FaSignOutAlt,
  FaChevronRight
} from 'react-icons/fa';
import { API_BASE_URL } from '../api/auth';

const CategorySelection = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 🔥 Updated Trending IT Fields
  const categories = [
    { id: 1, name: 'Artificial Intelligence', icon: 'robot', description: 'Explore AI, ML, and neural networks', color: 'bg-orange-500/20 text-orange-400' },
    { id: 2, name: 'Cloud Computing', icon: 'cloud', description: 'Learn AWS, Azure, and cloud architecture', color: 'bg-orange-500/20 text-orange-400' },
    { id: 3, name: 'Cybersecurity', icon: 'lock', description: 'Master ethical hacking and data protection', color: 'bg-orange-500/20 text-orange-400' },
    { id: 4, name: 'Data Science', icon: 'database', description: 'Analyze data using Python, R, and SQL', color: 'bg-orange-500/20 text-orange-400' },
    { id: 5, name: 'Networking', icon: 'network-wired', description: 'Understand routers, firewalls, and TCP/IP', color: 'bg-orange-500/20 text-orange-400' },
    { id: 6, name: 'Mobile App Development', icon: 'mobile-alt', description: 'Build Android and iOS apps using React Native or Flutter', color: 'bg-orange-500/20 text-orange-400' },
    { id: 7, name: 'Web Development', icon: 'code', description: 'Frontend and backend development using MERN stack', color: 'bg-orange-500/20 text-orange-400' },
    { id: 8, name: 'DevOps', icon: 'chart-line', description: 'Automate, deploy, and monitor software pipelines', color: 'bg-orange-500/20 text-orange-400' },
    { id: 9, name: 'Blockchain', icon: 'globe', description: 'Build decentralized apps and smart contracts', color: 'bg-orange-500/20 text-orange-400' },
    { id: 10, name: 'Machine Learning', icon: 'brain', description: 'Develop models and algorithms for prediction', color: 'bg-orange-500/20 text-orange-400' }
  ];

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'robot': return <FaRobot className="text-xl" />;
      case 'cloud': return <FaCloud className="text-xl" />;
      case 'lock': return <FaLock className="text-xl" />;
      case 'database': return <FaDatabase className="text-xl" />;
      case 'network-wired': return <FaNetworkWired className="text-xl" />;
      case 'mobile-alt': return <FaMobileAlt className="text-xl" />;
      case 'code': return <FaCode className="text-xl" />;
      case 'chart-line': return <FaChartLine className="text-xl" />;
      case 'globe': return <FaGlobe className="text-xl" />;
      case 'brain': return <FaBrain className="text-xl" />;
      default: return <FaCode className="text-xl" />;
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigate('/roles', {
      state: { category }
    });
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/logout`, { credentials: 'include' });
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 digital-font">
      {/* Header */}
      <header className="bg-gray-800 border-b border-orange-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-500 digital-text">InterviewPrep</h1>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                  <span className="text-sm">{user.name.charAt(0)}</span>
                </div>
                <span className="ml-2 text-gray-300">{user.name}</span>
              </div>
            ) : (
              <span className="text-gray-400">Loading...</span>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <FaSignOutAlt className="text-lg" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-100 mb-2 digital-text">Select IT Field</h2>
          <p className="text-lg text-gray-400">Choose a trending IT field to start exploring interview questions</p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-gray-800 rounded-lg border border-orange-500/20 overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/10 digital-border"
              onClick={() => handleCategorySelect(category)}
            >
              <div className="p-6">
                <div className={`flex items-center justify-center h-12 w-12 rounded-md ${category.color} mb-4 digital-glow`}>
                  {getIconComponent(category.icon)}
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-2 digital-text">{category.name}</h3>
                <p className="text-gray-400 mb-4">{category.description}</p>
                <div className="flex items-center text-orange-500 font-medium digital-text">
                  <span>Explore Questions</span>
                  <FaChevronRight className="ml-1 text-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 mt-12 py-6 border-t border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>© 2025 InterviewPrep. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CategorySelection;
