import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  FiUser, FiMail, FiLock, FiAward, FiTrash2, 
  FiAlertTriangle, FiCheckCircle, FiLoader 
} from 'react-icons/fi';

const Profile = () => {
  const { user, logout } = useAuth();
  const { register: profileReg, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    defaultValues: { name: user?.name, email: user?.email }
  });
  const { register: passReg, handleSubmit: handlePassSubmit, watch, reset: resetPassForm, formState: { errors: passErrors } } = useForm();
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState(null);
  const [passSuccess, setPassSuccess] = useState(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState(null);

  const [profileError, setProfileError] = useState(null);
  const [passError, setPassError] = useState(null);

  const newPasswordVal = watch('newPassword');

  const onUpdateProfile = async (data) => {
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const response = await API.put('/auth/profile', data);
      if (response.data?.success) {
        setProfileSuccess('Profile details updated successfully!');
        // Update user storage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Force session refresh by reloading profile or letting component reload
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const onUpdatePassword = async (data) => {
    setPassLoading(true);
    setPassError(null);
    setPassSuccess(null);
    try {
      const response = await API.put('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (response.data?.success) {
        setPassSuccess('Password changed successfully!');
        resetPassForm();
      }
    } catch (err) {
      setPassError(err.response?.data?.message || 'Current password might be incorrect.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleUpgradeAccount = async () => {
    setUpgradeLoading(true);
    setUpgradeSuccess(null);
    try {
      const response = await API.put('/auth/upgrade');
      if (response.data?.success) {
        setUpgradeSuccess('Congratulations! Account upgraded to Premium.');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      alert('Failed to upgrade account.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Deleting your account will permanently wipe all your saved resumes. This cannot be undone. Are you sure?')) {
      return;
    }
    if (!window.confirm('FINAL CONFIRMATION: Type OK to delete.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await API.delete('/auth/account');
      if (response.data?.success) {
        alert('Your account has been deleted.');
        logout();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
          Profile & Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage personal credentials, security keys, and premium membership configurations.
        </p>
      </div>

      {/* Profile Photo and Premium Status banner */}
      <div className="glass-card p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold font-outfit shadow-md">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                user?.isPremium 
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 dark:bg-dark-900/60 dark:text-slate-400'
              }`}>
                {user?.isPremium ? '★ Premium Member' : 'Free Tier'}
              </span>
            </div>
          </div>
        </div>

        {!user?.isPremium && (
          <button
            onClick={handleUpgradeAccount}
            disabled={upgradeLoading}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            {upgradeLoading ? <FiLoader className="animate-spin" /> : <FiAward />} Upgrade to Premium
          </button>
        )}

        {upgradeSuccess && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-lg flex items-center gap-2">
            <FiCheckCircle /> {upgradeSuccess}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-6 rounded-xl space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
            <FiUser className="text-primary-500" /> Account Information
          </h3>

          {profileSuccess && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 text-xs rounded-lg flex items-center gap-2">
              <FiCheckCircle /> {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-lg flex items-center gap-2">
              <FiAlertTriangle /> {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-500">Full Name</label>
              <input
                type="text"
                disabled={profileLoading}
                className="glass-input text-xs"
                {...profileReg('name', { required: 'Name is required' })}
              />
              {profileErrors.name && <span className="text-[10px] text-red-500 mt-1 block">{profileErrors.name.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-500">Email Address</label>
              <input
                type="email"
                disabled={profileLoading}
                className="glass-input text-xs"
                {...profileReg('email', { 
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
                })}
              />
              {profileErrors.email && <span className="text-[10px] text-red-500 mt-1 block">{profileErrors.email.message}</span>}
            </div>

            <button type="submit" disabled={profileLoading} className="btn-primary text-xs w-full py-2.5 flex items-center justify-center gap-2">
              {profileLoading ? <FiLoader className="animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="glass-card p-6 rounded-xl space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
            <FiLock className="text-primary-500" /> Security Settings
          </h3>

          {passSuccess && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 text-xs rounded-lg flex items-center gap-2">
              <FiCheckCircle /> {passSuccess}
            </div>
          )}

          {passError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-lg flex items-center gap-2">
              <FiAlertTriangle /> {passError}
            </div>
          )}

          <form onSubmit={handlePassSubmit(onUpdatePassword)} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-500">Current Password</label>
              <input
                type="password"
                disabled={passLoading}
                placeholder="••••••••"
                className="glass-input text-xs"
                {...passReg('currentPassword', { required: 'Current password is required' })}
              />
              {passErrors.currentPassword && <span className="text-[10px] text-red-500 mt-1 block">{passErrors.currentPassword.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-500">New Password</label>
              <input
                type="password"
                disabled={passLoading}
                placeholder="Minimum 6 characters"
                className="glass-input text-xs"
                {...passReg('newPassword', { 
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Must be at least 6 characters' }
                })}
              />
              {passErrors.newPassword && <span className="text-[10px] text-red-500 mt-1 block">{passErrors.newPassword.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-500">Confirm New Password</label>
              <input
                type="password"
                disabled={passLoading}
                placeholder="••••••••"
                className="glass-input text-xs"
                {...passReg('confirmPassword', { 
                  required: 'Please confirm new password',
                  validate: (val) => val === newPasswordVal || 'Passwords do not match'
                })}
              />
              {passErrors.confirmPassword && <span className="text-[10px] text-red-500 mt-1 block">{passErrors.confirmPassword.message}</span>}
            </div>

            <button type="submit" disabled={passLoading} className="btn-primary text-xs w-full py-2.5 flex items-center justify-center gap-2">
              {passLoading ? <FiLoader className="animate-spin" /> : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 rounded-xl border border-red-500/20 bg-red-500/[0.02] space-y-4">
        <h3 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2 border-b border-red-500/10 pb-2">
          <FiAlertTriangle /> Danger Zone
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Delete Account Permanently</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Once deleted, your account details and all saved resumes are completely wiped and cannot be recovered.
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md hover:shadow-lg hover:shadow-red-600/20 flex items-center gap-2 self-start"
          >
            {deleteLoading ? <FiLoader className="animate-spin" /> : <FiTrash2 />} Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
