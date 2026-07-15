import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { FiLogOut, FiActivity, FiServer, FiCpu, FiGrid, FiSettings, FiUser } from 'react-icons/fi';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [healthStatus, setHealthStatus] = useState({ loading: false, data: null, error: null });

  useEffect(() => {
    // Check if token exists, otherwise redirect to login
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!token) {
      navigate('/login');
    } else if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const testBackendConnection = async () => {
    setHealthStatus({ loading: true, data: null, error: null });
    try {
      // Connect to server health route
      const response = await API.get('/health');
      setHealthStatus({ loading: false, data: response.data, error: null });
    } catch (error) {
      console.error('API health check error:', error);
      setHealthStatus({
        loading: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Cannot reach API server. Is backend running?',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-slate-200 flex">
      {/* Mini Sidebar */}
      <aside className="w-64 glass-card border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between p-4 hidden md:flex">
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
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium text-sm">
              <FiGrid /> Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium text-sm transition-colors">
              <FiUser /> Profile
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium text-sm transition-colors">
              <FiSettings /> Settings
            </button>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 font-semibold text-sm transition-colors"
        >
          <FiLogOut /> Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="glass-card py-4 px-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
          <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">
            User Workspace
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <span className="text-sm font-semibold hidden sm:inline">{user?.name || 'Developer User'}</span>
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
        <main className="p-6 md:p-8 space-y-6 max-w-5xl">
          <div className="glass-card p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
              <FiServer /> Core Client-Server Integration
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Verify communication between this React frontend and your Express backend API. Make sure your Express backend server is running on <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">localhost:5000</code>.
            </p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <button 
                onClick={testBackendConnection}
                disabled={healthStatus.loading}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <FiActivity className={healthStatus.loading ? 'animate-pulse' : ''} />
                {healthStatus.loading ? 'Verifying...' : 'Test API Connection'}
              </button>

              {healthStatus.data && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                  Status: Connected ({healthStatus.data.status})
                </span>
              )}

              {healthStatus.error && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                  Error: API Offline
                </span>
              )}
            </div>

            {/* Connection feedback box */}
            {healthStatus.data && (
              <pre className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 overflow-x-auto max-h-40">
                {JSON.stringify(healthStatus.data, null, 2)}
              </pre>
            )}

            {healthStatus.error && (
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg text-xs font-mono text-red-600 dark:text-red-400">
                {healthStatus.error}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
