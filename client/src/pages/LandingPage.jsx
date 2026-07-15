import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiFileText, FiCpu, FiCheckCircle } from 'react-icons/fi';

const LandingPage = () => {

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-600 rounded-lg text-white">
            <FiFileText className="text-xl" />
          </div>
          <span className="text-xl font-bold tracking-tight font-outfit text-slate-900 dark:text-white">
            Resume<span className="text-primary-500">AI</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/login" className="btn-secondary py-2 px-4 text-sm">
            Sign In
          </Link>
          <Link to="/signup" className="btn-primary py-2 px-4 text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-blob-float"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-blob-float animation-delay-2000"></div>

        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <FiCpu className="animate-spin-slow" /> Powered by Advanced LLM AI
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-outfit text-slate-900 dark:text-white">
            Create ATS-Friendly Resumes with <span className="bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">AI Engine</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Build stand-out professional resumes in minutes, pass ATS screens automatically, and optimize content for your target job description.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
              Build My Resume <FiArrowRight />
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-3 text-base">
              Try ATS Checker
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-16 grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-slate-200/50 dark:border-slate-800/50 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold font-outfit text-primary-600 dark:text-primary-400">100%</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Free ATS Scanning</div>
            </div>
            <div>
              <div className="text-4xl font-bold font-outfit text-primary-600 dark:text-primary-400">30+</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Professional Templates</div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-4xl font-bold font-outfit text-primary-600 dark:text-primary-400">0s</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">PDF Export Time</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
