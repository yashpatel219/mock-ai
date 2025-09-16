import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBrain, 
  FaUsers, 
  FaCode, 
  FaChartLine, 
  FaGraduationCap, 
  FaSignOutAlt,
  FaChevronRight
} from 'react-icons/fa';
import { API_BASE_URL } from '../api/auth';

const CategorySelection = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  const categories = [
    { id: 1, name: 'Behavioural', icon: 'brain', description: 'Evaluate communication and interpersonal skills', color: 'bg-orange-500/20 text-orange-400' },
    { id: 2, name: 'Company Fit', icon: 'users', description: 'Assess alignment with company values and culture', color: 'bg-orange-500/20 text-orange-400' },
    { id: 3, name: 'Technical', icon: 'code', description: 'Test technical knowledge and problem-solving abilities', color: 'bg-orange-500/20 text-orange-400' },
    { id: 4, name: 'Leadership', icon: 'chart-line', description: 'Evaluate leadership and management capabilities', color: 'bg-orange-500/20 text-orange-400' },
    { id: 5, name: 'Case Study', icon: 'graduation-cap', description: 'Analyze real-world scenarios and solutions', color: 'bg-orange-500/20 text-orange-400' }
  ];

  const getIconComponent = (iconName) => {
    switch(iconName) {
      case 'brain': return <FaBrain className="text-xl" />;
      case 'users': return <FaUsers className="text-xl" />;
      case 'code': return <FaCode className="text-xl" />;
      case 'chart-line': return <FaChartLine className="text-xl" />;
      case 'graduation-cap': return <FaGraduationCap className="text-xl" />;
      default: return <FaBrain className="text-xl" />;
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

  // Fetch logged in user
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
          <h2 className="text-3xl font-bold text-gray-100 mb-2 digital-text">Select Assessment Category</h2>
          <p className="text-lg text-gray-400">Choose a category to practice for your upcoming interview</p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <span>Start Practice</span>
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
          <p>© 2023 InterviewPrep. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CategorySelection;
