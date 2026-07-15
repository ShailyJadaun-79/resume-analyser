import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { forgotPassword, error: authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [localError, setLocalError] = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);
    setLocalError(null);
    setSuccessMsg(null);
    try {
      const result = await forgotPassword(data.email);
      if (result?.success) {
        setSuccessMsg(result.message || 'Password reset link dispatched! Please check your email.');
      } else {
        setLocalError(result?.message || 'Failed to dispatch reset link.');
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
          Forgot Password
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Provide your email address and we'll send you a password reset link.
        </p>

        {successMsg && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium">
            <FiCheckCircle className="text-sm shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Success!</span> {successMsg}
              <p className="mt-1 text-[10px] opacity-80">
                If running locally, check the backend console terminal for the generated reset link.
              </p>
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? <FiLoader className="animate-spin text-lg" /> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
