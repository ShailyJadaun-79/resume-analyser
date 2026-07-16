import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  FiUsers, FiGrid, FiDollarSign, FiCpu, FiTrendingUp, 
  FiUserCheck, FiShield, FiLoader, FiAlertTriangle 
} from 'react-icons/fi';

const AdminPanel = () => {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsRes = await API.get('/admin/stats');
      const usersRes = await API.get('/admin/users');
      
      if (statsRes.data?.success) {
        setMetrics(statsRes.data.data.metrics);
      }
      if (usersRes.data?.success) {
        setUsers(usersRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin details:', err);
      setError('Failed to fetch administrative metrics. Ensure the database connection is whitelisted and active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleTogglePremium = async (userId, currentStatus) => {
    setUpdatingId(userId);
    try {
      const response = await API.put(`/admin/users/${userId}`, {
        isPremium: !currentStatus,
      });
      if (response.data?.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, isPremium: !currentStatus } : u));
      }
    } catch (err) {
      alert('Failed to update premium credentials.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    setUpdatingId(userId);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const response = await API.put(`/admin/users/${userId}`, {
        role: newRole,
      });
      if (response.data?.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      alert('Failed to update account role permissions.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
          Administrative Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Monitor platforms usage metrics, whitelists, role distributions, and conversion performance.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <FiLoader className="animate-spin text-3xl text-primary-500" />
        </div>
      ) : error ? (
        <div className="glass-card p-8 text-center space-y-4">
          <FiAlertTriangle className="mx-auto text-4xl text-amber-500 animate-pulse" />
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">{error}</p>
          <button onClick={fetchAdminData} className="btn-secondary text-sm">
            Refresh Data
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="glass-card p-5 rounded-xl flex items-center gap-4">
              <div className="p-3.5 bg-primary-500/10 rounded-lg text-primary-600 dark:text-primary-400">
                <FiUsers className="text-xl" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Users</span>
                <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">{metrics?.totalUsers || 0}</h3>
              </div>
            </div>

            {/* Total Resumes */}
            <div className="glass-card p-5 rounded-xl flex items-center gap-4">
              <div className="p-3.5 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                <FiGrid className="text-xl" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Resumes Created</span>
                <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">{metrics?.totalResumes || 0}</h3>
              </div>
            </div>

            {/* Premium Accounts */}
            <div className="glass-card p-5 rounded-xl flex items-center gap-4">
              <div className="p-3.5 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                <FiDollarSign className="text-xl" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Premium Users</span>
                <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">{metrics?.premiumUsers || 0}</h3>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="glass-card p-5 rounded-xl flex items-center gap-4">
              <div className="p-3.5 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <FiTrendingUp className="text-xl" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Conversion Rate</span>
                <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">{metrics?.conversionRate || 0}%</h3>
              </div>
            </div>
          </div>

          {/* User Management Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-white">Registered Accounts list</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-dark-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/50 dark:border-slate-800/50">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4">Membership</th>
                    <th className="p-4">Access Level</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50/40 dark:hover:bg-dark-900/20 text-slate-700 dark:text-slate-300">
                      <td className="p-4 font-semibold">{u.name}</td>
                      <td className="p-4 font-mono text-[11px]">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isVerified 
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {u.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isPremium 
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-slate-100 text-slate-400 dark:bg-dark-900/30'
                        }`}>
                          {u.isPremium ? '★ Premium' : 'Free'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-primary-500 uppercase tracking-wide text-[10px]">
                        {u.role}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          disabled={updatingId === u._id}
                          onClick={() => handleTogglePremium(u._id, u.isPremium)}
                          className="px-2.5 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-600 text-[10px] font-bold transition-colors"
                        >
                          Toggle Premium
                        </button>
                        <button
                          disabled={updatingId === u._id}
                          onClick={() => handleToggleRole(u._id, u.role)}
                          className="px-2.5 py-1.5 rounded bg-primary-500/10 hover:bg-primary-500 hover:text-white text-primary-600 text-[10px] font-bold transition-colors"
                        >
                          Toggle Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
