import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  FiFileText, FiCpu, FiMessageSquare, FiCopy, FiCheck, 
  FiLoader, FiAlertTriangle, FiBookOpen 
} from 'react-icons/fi';

const AITools = ({ user }) => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [activeTab, setActiveTab] = useState('cover-letter');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [letterResult, setLetterResult] = useState('');
  const [interviewResult, setInterviewResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await API.get('/resumes');
        if (response.data?.success) {
          const list = response.data.data;
          setResumes(list);
          if (list.length > 0) {
            setSelectedResumeId(list[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching resumes:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchResumes();
  }, []);

  const handleGenerateCoverLetter = async () => {
    if (!selectedResumeId) {
      alert('Please create or select a resume first!');
      return;
    }
    if (!jobDescription.trim()) {
      alert('Please paste a target job description first!');
      return;
    }

    setLoading(true);
    setError(null);
    setLetterResult('');
    setCopied(false);

    try {
      const resumeRes = await API.get(`/resumes/${selectedResumeId}`);
      const fullResume = resumeRes.data.data;

      const response = await API.post('/ai/cover-letter', {
        resumeData: fullResume,
        jobDescription: jobDescription,
      });

      if (response.data?.success) {
        setLetterResult(response.data.data);
      }
    } catch (err) {
      console.error('Cover letter AI error:', err);
      setError(err.response?.data?.message || 'Failed to generate cover letter. OpenAI service might be offline.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInterviewQuestions = async () => {
    if (!selectedResumeId) {
      alert('Please create or select a resume first!');
      return;
    }

    setLoading(true);
    setError(null);
    setInterviewResult('');
    setCopied(false);

    try {
      const resumeRes = await API.get(`/resumes/${selectedResumeId}`);
      const fullResume = resumeRes.data.data;

      const response = await API.post('/ai/interview', {
        resumeData: fullResume,
      });

      if (response.data?.success) {
        setInterviewResult(response.data.data);
      }
    } catch (err) {
      console.error('Interview AI error:', err);
      setError(err.response?.data?.message || 'Failed to generate interview questions. OpenAI service might be offline.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
          AI Career Assistant Tools
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Draft instant cover letters and review custom mock interview preparation sheets.
        </p>
      </div>

      {fetching ? (
        <div className="flex justify-center items-center py-12">
          <FiLoader className="animate-spin text-2xl text-primary-500" />
        </div>
      ) : resumes.length === 0 ? (
        <div className="glass-card p-8 text-center rounded-2xl">
          <FiFileText className="mx-auto text-4xl text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Resumes Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Build a resume first to allow the AI engine to contextualize cover letters or interview questions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Controls Box */}
          <div className="glass-card p-6 rounded-xl space-y-6 lg:col-span-1">
            <h2 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-200">
              Tool Configurations
            </h2>

            {/* Select Resume */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Base Resume
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-dark-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {resumes.map(r => (
                  <option key={r._id} value={r._id}>{r.title}</option>
                ))}
              </select>
            </div>

            {/* Tool Selector Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Choose AI Assistant
              </label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setActiveTab('cover-letter'); setError(null); }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'cover-letter'
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-white/40 dark:bg-dark-900/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <FiFileText /> Cover Letter Generator
                </button>
                
                <button
                  onClick={() => { setActiveTab('interview-prep'); setError(null); }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'interview-prep'
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-white/40 dark:bg-dark-900/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <FiMessageSquare /> Interview Questions Prep
                </button>
              </div>
            </div>

            {/* Conditionally show JD for Cover Letter */}
            {activeTab === 'cover-letter' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Job Description
                </label>
                <textarea
                  placeholder="Paste the target job description to adapt letter highlights..."
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-dark-900/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-sans"
                />
              </div>
            )}

            {/* Run Button */}
            {activeTab === 'cover-letter' ? (
              <button
                onClick={handleGenerateCoverLetter}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm"
              >
                {loading ? <FiLoader className="animate-spin" /> : <FiCpu />} Draft Cover Letter
              </button>
            ) : (
              <button
                onClick={handleGenerateInterviewQuestions}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm"
              >
                {loading ? <FiLoader className="animate-spin" /> : <FiBookOpen />} Prepare Interview Qs
              </button>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2">
                <FiAlertTriangle className="shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {/* 1. Cover Letter Output */}
            {activeTab === 'cover-letter' && (
              <div className="glass-card p-6 rounded-xl space-y-4 min-h-[400px] flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                    <span>Generated Cover Letter</span>
                    {letterResult && (
                      <button
                        onClick={() => handleCopyText(letterResult)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-dark-900/40 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                      >
                        {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                        {copied ? 'Copied' : 'Copy Letter'}
                      </button>
                    )}
                  </h3>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                      <FiLoader className="animate-spin text-3xl text-primary-500" />
                      <p className="text-xs text-slate-400 font-semibold animate-pulse">Integrating resume context and crafting layout...</p>
                    </div>
                  ) : letterResult ? (
                    <pre className="mt-4 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/50 dark:bg-dark-950/30 p-4 rounded-lg border border-slate-100 dark:border-slate-900 max-h-[500px] overflow-y-auto">
                      {letterResult}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                      <FiFileText className="text-5xl text-slate-400/35" />
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Cover Letter Awaiting Compilation</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm">
                        Select your base resume, paste a job description, and click generate to build a tailored application letter.
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                  Tip: Always review and personalize cover letters to ensure contact values and titles match perfectly.
                </div>
              </div>
            )}

            {/* 2. Interview Prep Output */}
            {activeTab === 'interview-prep' && (
              <div className="glass-card p-6 rounded-xl space-y-4 min-h-[400px] flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                    <span>Custom Mock Interview Questions</span>
                    {interviewResult && (
                      <button
                        onClick={() => handleCopyText(interviewResult)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-dark-900/40 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                      >
                        {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                        {copied ? 'Copied' : 'Copy Questions'}
                      </button>
                    )}
                  </h3>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                      <FiLoader className="animate-spin text-3xl text-primary-500" />
                      <p className="text-xs text-slate-400 font-semibold animate-pulse">Analyzing tech stack and compiling custom questions...</p>
                    </div>
                  ) : interviewResult ? (
                    <pre className="mt-4 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/50 dark:bg-dark-950/30 p-4 rounded-lg border border-slate-100 dark:border-slate-900 max-h-[500px] overflow-y-auto">
                      {interviewResult}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                      <FiMessageSquare className="text-5xl text-slate-400/35" />
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Prep Questions Loaded</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm">
                        Select a base resume and trigger the query to generate custom behavioral and technical interview questions based on your actual history.
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                  Tip: Use these suggestions to rehearse. Highlight metric accomplishments when responding to behavioral prompts.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AITools;
