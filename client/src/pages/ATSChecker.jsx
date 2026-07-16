import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { 
  FiAward, FiCheckCircle, FiAlertTriangle, FiList, FiCpu, 
  FiFileText, FiArrowRight, FiLoader, FiDownload, FiCheck, FiRefreshCw 
} from 'react-icons/fi';

const ATSChecker = ({ user }) => {
  const [searchParams] = useSearchParams();
  const queryResumeId = searchParams.get('id');

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [currentResume, setCurrentResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [error, setError] = useState(null);

  // AI Tailoring State
  const [tailoringLoading, setTailoringLoading] = useState(false);
  const [tailoredText, setTailoredText] = useState('');
  const [copiedTailored, setCopiedTailored] = useState(false);

  // Fetch resumes list on mount
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await API.get('/resumes');
        if (response.data?.success) {
          const list = response.data.data;
          setResumes(list);
          
          // Pre-select search param ID if present
          if (queryResumeId) {
            setSelectedResumeId(queryResumeId);
          } else if (list.length > 0) {
            setSelectedResumeId(list[0]._id);
          }
        }
      } catch (err) {
        console.error('Error loading resumes:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchResumes();
  }, [queryResumeId]);

  // Auto-run analysis when selected resume changes
  useEffect(() => {
    if (selectedResumeId && resumes.length > 0) {
      handleRunAnalysis();
    }
  }, [selectedResumeId, resumes.length]);

  const handleRunAnalysis = async () => {
    if (!selectedResumeId) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setMatchData(null);
    setTailoredText('');

    try {
      // 1. Fetch resume details (resolves all fields)
      const resumeRes = await API.get(`/resumes/${selectedResumeId}`);
      const fullResume = resumeRes.data.data;
      setCurrentResume(fullResume);

      // 2. ATS Score check
      const scoreRes = await API.post('/ats/score', { resume: fullResume });
      setAnalysis(scoreRes.data.data);

      // 3. Job Match check (if JD is pasted)
      if (jobDescription.trim()) {
        const matchRes = await API.post('/ats/match', {
          resume: fullResume,
          jobDescription: jobDescription
        });
        setMatchData(matchRes.data.data);
      }
    } catch (err) {
      console.error('ATS scan error:', err);
      setError(err.response?.data?.message || 'Failed to complete ATS scan.');
    } finally {
      setLoading(false);
    }
  };

  // --- AI RESUME TAILORING HANDLER ---
  const handleTailorResume = async () => {
    if (!selectedResumeId) return;
    if (!jobDescription.trim()) {
      alert('Please paste a target Job Description to tailor the resume for!');
      return;
    }

    setTailoringLoading(true);
    try {
      const resumeRes = await API.get(`/resumes/${selectedResumeId}`);
      const fullResume = resumeRes.data.data;
      
      const resumeContent = fullResume.isUploaded 
        ? fullResume.extractedText 
        : `Name: ${fullResume.personalInfo?.name || ''}
           Summary: ${fullResume.personalInfo?.summary || ''}
           Skills: ${fullResume.skills?.join(', ') || ''}
           Experience: ${JSON.stringify(fullResume.experience || [])}`;

      const response = await API.post('/ai/improve', {
        text: resumeContent,
        instruction: `Tailor and optimize this resume content to match the target job description. Incorporate missing keywords and align achievements: "${jobDescription.slice(0, 1000)}"`
      });

      if (response.data?.success) {
        setTailoredText(response.data.data);
      }
    } catch (err) {
      console.error('AI tailoring failed:', err);
      alert('Failed to tailor resume with AI. Gemini service offline.');
    } finally {
      setTailoringLoading(false);
    }
  };

  const handleDownloadTailored = () => {
    if (!tailoredText) return;
    
    // Trigger browser file download
    const element = document.createElement("a");
    const file = new Blob([tailoredText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "AI_Tailored_Optimized_Resume.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyTailored = () => {
    navigator.clipboard.writeText(tailoredText);
    setCopiedTailored(true);
    setTimeout(() => setCopiedTailored(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
          AI ATS Score Checker & Tailoring
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Scan compatibility, audit bullet points, and generate optimized resume iterations tailored to job postings.
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
            Build a resume or upload a file first to execute ATS scan diagnostics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Controls Box */}
          <div className="glass-card p-6 rounded-xl space-y-6 lg:col-span-1">
            <h2 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-200">
              Analysis Controls
            </h2>
            
            {/* Select Resume */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Resume
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-dark-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {resumes.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.isUploaded ? `📄 [File] ${r.title}` : `🏗️ [Built] ${r.title}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Pasted Job Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Job Description
              </label>
              <textarea
                placeholder="Paste the target job description here to analyze keyword gaps, calculate compatibility scores, and enable AI tailoring..."
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-dark-900/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-sans"
              />
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm animate-fade-in"
            >
              {loading ? <FiLoader className="animate-spin" /> : <FiCpu />} Re-run Analysis
            </button>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2">
                <FiAlertTriangle className="shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Results Output */}
          <div className="lg:col-span-2 space-y-6">
            {!analysis && !loading && (
              <div className="glass-card p-12 text-center rounded-xl flex flex-col items-center justify-center space-y-3">
                <FiAward className="text-5xl text-primary-500/30" />
                <h3 className="text-lg font-bold font-outfit text-slate-700 dark:text-slate-300">Ready to Scan</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm">
                  Select a resume and click analyze. The diagnostic engine will check formatting rules, action verbs, and keyword densities.
                </p>
              </div>
            )}

            {loading && (
              <div className="glass-card p-16 text-center rounded-xl space-y-4">
                <FiLoader className="animate-spin text-4xl text-primary-500 mx-auto" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold animate-pulse">
                  Analyzing resume data and checking keyword matches...
                </p>
              </div>
            )}

            {analysis && (
              <div className="space-y-6">
                {/* Scoring metrics row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ATS Score card */}
                  <div className="glass-card p-6 rounded-xl flex items-center gap-6">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="8" fill="transparent" />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-primary-500" strokeWidth="8" fill="transparent"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * analysis.score) / 100}
                        />
                      </svg>
                      <span className="absolute text-xl font-bold font-outfit text-slate-800 dark:text-white">
                        {analysis.score}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">ATS Score</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Computed formatting, layout indices, bullet verb strengths, and verification validations.
                      </p>
                    </div>
                  </div>

                  {/* Job Match Card */}
                  {matchData ? (
                    <div className="glass-card p-6 rounded-xl flex items-center gap-6">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="8" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-green-500" strokeWidth="8" fill="transparent"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * matchData.matchPercentage) / 100}
                          />
                        </svg>
                        <span className="absolute text-xl font-bold font-outfit text-slate-800 dark:text-white">
                          {matchData.matchPercentage}%
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Job Match %</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Calculated overlap density matching key job description terms against your content.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card p-6 rounded-xl flex flex-col justify-center border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/10">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Match Status</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Paste a job description in the left panel to trigger matching comparison rules.
                      </p>
                    </div>
                  )}
                </div>

                {/* Exctracted Document Text Viewer */}
                {currentResume && (
                  <div className="glass-card p-5 rounded-xl space-y-4">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                      <FiFileText className="text-primary-500" /> Extracted Resume Content
                    </h3>
                    {currentResume.isUploaded ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <div className="truncate">File Name: <span className="text-slate-800 dark:text-slate-200 font-mono font-normal normal-case">{currentResume.fileName}</span></div>
                          <div>File Size: <span className="text-slate-800 dark:text-slate-200 font-normal">{Math.round(currentResume.fileSize / 1024)} KB</span></div>
                          <div>Upload Date: <span className="text-slate-800 dark:text-slate-200 font-normal">{new Date(currentResume.createdAt).toLocaleDateString()}</span></div>
                        </div>
                        <div className="w-full bg-slate-50/60 dark:bg-dark-950/20 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-lg overflow-y-auto max-h-60 text-xs font-sans whitespace-pre-wrap leading-relaxed select-text text-justify text-slate-700 dark:text-slate-300">
                          {currentResume.extractedText}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <div>Template Style: <span className="text-slate-800 dark:text-slate-200 font-normal font-mono normal-case">{currentResume.templateId}</span></div>
                          <div>Last Updated: <span className="text-slate-800 dark:text-slate-200 font-normal">{new Date(currentResume.updatedAt).toLocaleDateString()}</span></div>
                        </div>
                        <div className="w-full bg-slate-50/60 dark:bg-dark-950/20 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-lg overflow-y-auto max-h-60 text-xs leading-relaxed select-text">
                          <p className="font-bold text-slate-900 dark:text-white mb-1.5">{currentResume.personalInfo?.name || 'Untitled Candidate'}</p>
                          <p className="text-slate-600 dark:text-slate-400 mb-3">{currentResume.personalInfo?.summary || 'No summary profile entered.'}</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Skills:</p>
                          <p className="text-slate-600 dark:text-slate-400 mb-3">{currentResume.skills?.join(', ') || 'No skills entered.'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Suggestions and Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {/* Suggestions list */}
                  <div className="glass-card p-5 rounded-xl space-y-4 md:col-span-2">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <FiList className="text-primary-500" /> Actionable Recommendations
                    </h3>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {analysis.formattingAnalysis?.map((item, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start p-3 rounded-lg bg-red-500/5 text-red-700 dark:text-red-400 text-xs">
                          <FiAlertTriangle className="shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                      
                      {analysis.suggestions?.map((item, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start p-3 rounded-lg bg-amber-500/5 text-amber-700 dark:text-amber-400 text-xs">
                          <FiAlertTriangle className="shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}

                      {analysis.weakBulletPoints?.map((item, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start p-3 rounded-lg bg-slate-100 dark:bg-dark-900 text-slate-600 dark:text-slate-400 text-xs">
                          <FiAlertTriangle className="shrink-0 mt-0.5 text-amber-500" />
                          <span>{item}</span>
                        </div>
                      ))}

                      {analysis.formattingAnalysis?.length === 0 && 
                       analysis.suggestions?.length === 0 && 
                       analysis.weakBulletPoints?.length === 0 && (
                        <div className="flex gap-2 items-center p-3 rounded-lg bg-green-500/10 text-green-600 text-xs">
                          <FiCheckCircle />
                          <span>Perfect! Your resume text matches standard formatting.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="glass-card p-5 rounded-xl space-y-4 md:col-span-1">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <FiAward className="text-primary-500" /> Detected Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-1">
                      {Object.keys(analysis.keywordDensity || {}).length === 0 ? (
                        <p className="text-slate-400 text-xs italic">No technology terms found.</p>
                      ) : (
                        Object.entries(analysis.keywordDensity).map(([kw, count]) => (
                          <span key={kw} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold">
                            {kw} <span className="bg-primary-500 text-white text-[9px] px-1 rounded">{count}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Job match and AI Tailoring */}
                {matchData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    
                    {/* Job Match stats */}
                    <div className="glass-card p-6 rounded-xl space-y-5">
                      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <FiCpu className="text-green-500" /> Match Metrics & Suggestions
                      </h3>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-green-600">Matched</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {matchData.matchedKeywords?.map(kw => (
                            <span key={kw} className="px-2 py-0.5 rounded bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-red-500">Missing</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {matchData.missingKeywords?.map(kw => (
                            <span key={kw} className="px-2 py-0.5 rounded bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-semibold">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                        {matchData.suggestions?.map((item, idx) => (
                          <p key={idx} className="flex gap-2 items-start">
                            <span className="text-green-500">•</span>
                            <span>{item}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* AI Tailoring Interface */}
                    <div className="glass-card p-6 rounded-xl space-y-4">
                      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <FiCpu className="text-primary-500 animate-pulse" /> AI Resume Optimizer
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ask Gemini to optimize this resume text automatically to bridge missing keywords and align qualifications.
                      </p>

                      {!tailoredText ? (
                        <button
                          onClick={handleTailorResume}
                          disabled={tailoringLoading}
                          className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2"
                        >
                          {tailoringLoading ? <FiLoader className="animate-spin" /> : <FiCpu />} Tailor Resume with AI
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-green-500 flex items-center gap-1.5"><FiCheck /> Tailored!</span>
                            <div className="flex gap-2">
                              <button
                                onClick={handleCopyTailored}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-dark-900 text-xs font-bold text-slate-600 flex items-center gap-1"
                              >
                                {copiedTailored ? 'Copied' : 'Copy'}
                              </button>
                              <button
                                onClick={handleDownloadTailored}
                                className="px-2.5 py-1 rounded bg-primary-500 text-white hover:bg-primary-600 text-xs font-bold flex items-center gap-1.5 shadow"
                              >
                                <FiDownload /> Download Text
                              </button>
                            </div>
                          </div>
                          
                          <textarea
                            readOnly
                            rows={8}
                            value={tailoredText}
                            className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/30 text-xs font-mono select-all focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSChecker;
