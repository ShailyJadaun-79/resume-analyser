import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';

const ResetPassword = () => {
  const { token } = useParams();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { resetPassword, error: authError } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [localError, setLocalError] = useState(null);

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setLocalError(null);
    setSuccessMsg(null);
    try {
      const result = await resetPassword(token, data.password);
      if (result?.success) {
        setSuccessMsg(result.message || 'Password updated successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setLocalError(result?.message || 'Failed to update password.');
      }
    } catch (err) {
      setLocalError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex items-center justify-center px-6 py-12 relative transition-colors duration-300">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-blob-float"></div>
      </div>

      <div className="relative z-10 w-full max-w-md glass-card rounded-2xl p-8 shadow-2xl">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6">
          <FiArrowLeft /> Back to login
        </Link>

        <h2 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white mb-2">
          Reset Password
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Create a new strong password for your account.
        </p>

        {successMsg && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium">
            <FiCheckCircle className="text-sm shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Success!</span> {successMsg}
              <p className="mt-1 text-[10px] opacity-80">Redirecting you to the sign-in page in a few seconds...</p>
            </div>
          </div>
        )}

        {(localError || authError) && (
          <div className="mb-4 flex items-center gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
            <FiAlertCircle className="text-sm shrink-0" />
            {localError || authError}
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <FiLock />
                </span>
                <input
                  type="password"
                  disabled={loading}
                  placeholder="••••••••"
                  className={`glass-input pl-10 ${errors.password ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
              </div>
              {errors.password && (
                <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <FiLock />
                </span>
                <input
                  type="password"
                  disabled={loading}
                  placeholder="••••••••"
                  className={`glass-input pl-10 ${errors.confirmPassword ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: (val) => val === passwordVal || 'Passwords do not match'
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-xs text-red-500 mt-1 block">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? <FiLoader className="animate-spin text-lg" /> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
