import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiCheckCircle, FiAlertCircle, FiLoader, FiArrowLeft } from 'react-icons/fi';

const VerifyEmail = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { verifyEmail, error: authError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const emailParam = searchParams.get('email') || '';
  const isRegistered = searchParams.get('registered') === 'true';

  const onSubmit = async (data) => {
    setLoading(true);
    setLocalError(null);
    try {
      const result = await verifyEmail(data.email, data.code);
      if (result?.success) {
        navigate('/dashboard');
      } else {
        setLocalError(result?.message || 'Verification failed. Please check the code.');
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
          Verify Email
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Enter the 6-digit verification code sent to your email.
        </p>

        {isRegistered && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium">
            <FiCheckCircle className="text-sm shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Account created!</span> A 6-digit confirmation code has been dispatched.
            </div>
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
                disabled={loading || !!emailParam}
                defaultValue={emailParam}
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
            <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              6-Digit Verification Code
            </label>
            <input
              type="text"
              disabled={loading}
              placeholder="123456"
              maxLength={6}
              className={`glass-input text-center text-xl font-bold tracking-[0.5em] font-mono ${errors.code ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
              {...register('code', { 
                required: 'Verification code is required',
                minLength: { value: 6, message: 'Must be exactly 6 digits' },
                pattern: { value: /^[0-9]+$/, message: 'Must contain numbers only' }
              })}
            />
            {errors.code && (
              <span className="text-xs text-red-500 mt-1 block">{errors.code.message}</span>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? <FiLoader className="animate-spin text-lg" /> : 'Verify Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Didn't receive a code? Check your spam folder or wait a few minutes. If you run locally, check the backend console terminal for logged codes!
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
