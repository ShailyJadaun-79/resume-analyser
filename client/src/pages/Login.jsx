import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiArrowLeft, FiAlertCircle, FiLoader } from 'react-icons/fi';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const sessionExpired = searchParams.get('expired') === 'true';

  const onSubmit = async (data) => {
    setLoading(true);
    setLocalError(null);
    try {
      const result = await login(data.email, data.password);
      if (result?.success) {
        navigate('/dashboard');
      } else if (result?.notVerified) {
        // Automatically redirect to verify-email route
        navigate(`/verify-email?email=${encodeURIComponent(result.email)}`);
      } else {
        setLocalError(result?.message || 'Login failed. Please check credentials.');
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
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6">
          <FiArrowLeft /> Back to website
        </Link>

        <h2 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Access your resumes and AI tools.
        </p>

        {sessionExpired && (
          <div className="mb-4 flex items-center gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <FiAlertCircle className="text-sm shrink-0" />
            Session expired. Please sign in again.
          </div>
        )}

        {(localError || authError) && (
          <div className="mb-4 flex items-center gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
            <FiAlertCircle className="text-sm shrink-0" />
            {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <FiMail />
              </span>
              <input
                type="email"
                disabled={loading}
                placeholder="you@example.com"
                className={`glass-input pl-10 ${errors.email ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
                })}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold">
                Forgot Password?
              </Link>
            </div>
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

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? <FiLoader className="animate-spin text-lg" /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
