import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import workspace sub-pages
import DashboardHome from './DashboardHome';
import Templates from './Templates';
import ATSChecker from './ATSChecker';
import AITools from './AITools';
import Profile from './Profile';
import AdminPanel from './AdminPanel';

import { 
  FiLogOut, FiActivity, FiServer, FiCpu, FiGrid, 
  FiSettings, FiUser, FiLayout, FiMessageSquare, FiShield 
} from 'react-icons/fi';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Set active tab based on query parameters, fallback to 'dashboard'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Render correct panel workspace dynamically
  const renderActiveWorkspace = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome user={user} />;
      case 'templates':
        return <Templates user={user} />;
      case 'ats':
        return <ATSChecker user={user} />;
      case 'ai-tools':
        return <AITools user={user} />;
      case 'profile':
        return <Profile user={user} />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel /> : <DashboardHome user={user} />;
      default:
        return <DashboardHome user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-slate-200 flex transition-colors duration-300">
      {/* Dynamic Sidebar */}
      <aside className="w-64 glass-card border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between p-4 hidden md:flex shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="p-1.5 bg-primary-600 rounded-md text-white">
              <FiCpu className="text-lg" />
            </div>
            <span className="text-lg font-bold font-outfit text-slate-900 dark:text-white">
              Resume<span className="text-primary-500">AI</span>
            </span>
          </div>

          <div className="space-y-1">
            {/* Dashboard Home */}
            <button 
              onClick={() => handleTabChange('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-primary-500 text-white shadow'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/60'
              }`}
            >
              <FiGrid /> Dashboard
            </button>

            {/* Templates catalog */}
            <button 
              onClick={() => handleTabChange('templates')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'templates'
                  ? 'bg-primary-500 text-white shadow'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/60'
              }`}
            >
              <FiLayout /> Templates
            </button>

            {/* ATS Checker */}
            <button 
              onClick={() => handleTabChange('ats')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'ats'
                  ? 'bg-primary-500 text-white shadow'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/60'
              }`}
            >
              <FiCpu /> ATS Checker
            </button>

            {/* AI Tools */}
            <button 
              onClick={() => handleTabChange('ai-tools')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'ai-tools'
                  ? 'bg-primary-500 text-white shadow'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/60'
              }`}
            >
              <FiMessageSquare /> AI Career Tools
            </button>

            {/* Profile Settings */}
            <button 
              onClick={() => handleTabChange('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary-500 text-white shadow'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/60'
              }`}
            >
              <FiUser /> Profile & Settings
            </button>

            {/* Admin Controls Panel */}
            {user?.role === 'admin' && (
              <button 
                onClick={() => handleTabChange('admin')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-white shadow'
                    : 'text-amber-600 dark:text-amber-500 hover:bg-amber-500/10'
                }`}
              >
                <FiShield /> Admin Panel
              </button>
            )}
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 font-semibold text-sm transition-colors"
        >
          <FiLogOut /> Sign Out
        </button>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Header */}
        <header className="glass-card py-4 px-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 shrink-0">
          <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white uppercase tracking-wide text-xs">
            Workspace Panel / {activeTab}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm shadow">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <span className="text-xs font-semibold hidden sm:inline">{user?.name || 'Developer'}</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-500/10 rounded-lg md:hidden"
            >
              <FiLogOut />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 md:p-8 flex-1">
          {renderActiveWorkspace()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
