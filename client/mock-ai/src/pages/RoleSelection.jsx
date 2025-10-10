import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaChevronLeft, 
  FaUserTie,
  FaRobot,
  FaCloud,
  FaLock,
  FaDatabase,
  FaNetworkWired,
  FaMobileAlt,
  FaCode,
  FaChartLine,
  FaGlobe,
  FaBrain
} from 'react-icons/fa';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { category } = location.state || {};

  // 🎯 Role mapping for each IT field
  const roleMap = {
    'Artificial Intelligence': [
      'AI Engineer',
      'Machine Learning Engineer',
      'Deep Learning Specialist',
      'AI Research Scientist'
    ],
    'Cloud Computing': [
      'Cloud Architect',
      'AWS Solutions Engineer',
      'DevOps Cloud Engineer',
      'Azure Administrator'
    ],
    'Cybersecurity': [
      'Security Analyst',
      'Ethical Hacker',
      'Network Security Engineer',
      'Incident Response Specialist'
    ],
    'Data Science': [
      'Data Scientist',
      'Data Analyst',
      'Business Intelligence Engineer',
      'Data Engineer'
    ],
    'Networking': [
      'Network Administrator',
      'Network Engineer',
      'System Engineer',
      'Network Security Specialist'
    ],
    'Mobile App Development': [
      'Android Developer',
      'iOS Developer',
      'React Native Developer',
      'Flutter Developer'
    ],
    'Web Development': [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Web Application Engineer'
    ],
    'DevOps': [
      'DevOps Engineer',
      'Release Manager',
      'Site Reliability Engineer (SRE)',
      'Build and Deployment Engineer'
    ],
    'Blockchain': [
      'Blockchain Developer',
      'Smart Contract Engineer',
      'Crypto Analyst',
      'Blockchain Architect'
    ],
    'Machine Learning': [
      'ML Engineer',
      'Data Scientist (ML Focus)',
      'AI Model Developer',
      'Research Data Engineer'
    ]
  };

  // Default roles if category not found
  const roles = roleMap[category?.name] || ['Software Engineer', 'Tech Lead', 'System Architect', 'Consultant'];

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

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    navigate('/dashboard', { 
      state: { category, role } 
    });
  };

  const handleBack = () => {
    navigate('/categories');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 digital-font">
      {/* Header */}
      <header className="bg-gray-800 border-b border-orange-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button 
            onClick={handleBack}
            className="flex items-center text-gray-400 hover:text-orange-500 transition-colors"
          >
            <FaChevronLeft className="mr-2" />
            Back to Categories
          </button>
          <h1 className="text-2xl font-bold text-orange-500 digital-text">InterviewPrep</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-100 mb-2 digital-text">
            Select Role for {category?.name || 'IT'} Field
          </h2>
          <p className="text-lg text-gray-400">
            Choose the role you want to practice for
          </p>
        </div>

        {/* Category Card */}
        {category && (
          <div className="flex items-center justify-center mb-8 p-4 bg-gray-800 rounded-lg border border-orange-500/20 digital-border">
            <div className={`flex items-center justify-center h-12 w-12 rounded-md ${category.color} mr-4 digital-glow`}>
              {getIconComponent(category.icon)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 digital-text">{category.name}</h3>
              <p className="text-gray-400">{category.description}</p>
            </div>
          </div>
        )}

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg border border-orange-500/20 overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/10 digital-border"
              onClick={() => handleRoleSelect(role)}
            >
              <div className="p-6 flex items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500/20 text-orange-400 mr-4 digital-glow">
                  <FaUserTie className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-100 digital-text">{role}</h3>
                  <p className="text-gray-400">Practice {category?.name} questions for {role}</p>
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

export default RoleSelection;
