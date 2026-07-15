import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col items-center justify-center px-6 text-center relative">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-red-500/5 rounded-full blur-3xl animate-blob-float"></div>
      </div>

      <div className="relative z-10 space-y-6 max-w-md glass-card rounded-2xl p-10 shadow-2xl">
        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
          <FiAlertCircle className="text-3xl" />
        </div>

        <h1 className="text-4xl font-extrabold font-outfit text-slate-900 dark:text-white">
          404 - Page Not Found
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          The page you are looking for doesn't exist or has been moved to a different address.
        </p>

        <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm w-full justify-center">
          <FiHome /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
