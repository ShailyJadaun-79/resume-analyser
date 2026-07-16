import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  FiFileText, FiPlus, FiTrash2, FiEdit2, FiShare2, FiActivity, FiServer, 
  FiCpu, FiCheck, FiLoader, FiAlertCircle, FiUploadCloud, FiRefreshCw 
} from 'react-icons/fi';

const DashboardHome = ({ user }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [healthStatus, setHealthStatus] = useState({ loading: false, data: null, error: null });

  // File Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [replaceTargetId, setReplaceTargetId] = useState(null);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await API.get('/resumes');
      if (response.data?.success) {
        setResumes(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError(err.response?.data?.message || 'Failed to load resumes. Database might be offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleCreateResume = async () => {
    setCreating(true);
    try {
      const response = await API.post('/resumes', {
        title: 'New Resume',
        templateId: 'modern',
      });
      if (response.data?.success) {
        const newResume = response.data.data;
        navigate(`/builder/${newResume._id}`);
      }
    } catch (err) {
      console.error('Error creating resume:', err);
      alert(err.response?.data?.message || 'Failed to initialize resume. Please check database connection.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteResume = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume? This action is permanent.')) {
      return;
    }
    try {
      const response = await API.delete(`/resumes/${id}`);
      if (response.data?.success) {
        setResumes(resumes.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error('Error deleting resume:', err);
      alert('Failed to delete resume.');
    }
  };

  const handleShareLink = (id, e) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- RESUME FILE UPLOAD HANDLERS ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'pdf' && extension !== 'docx') {
      setUploadError('Unsupported format. Only PDF and DOCX files are allowed.');
      setUploadFile(null);
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File is too large. Maximum size allowed is 5MB.');
      setUploadFile(null);
      return;
    }

    setUploadError(null);
    setUploadSuccess(null);
    setUploadFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;

    setUploadLoading(true);
    setUploadProgress(10);
    setUploadError(null);

    const formData = new FormData();
    formData.append('resume', uploadFile);

    // Simulate progress trigger
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => (prev < 90 ? prev + 15 : prev));
    }, 200);

    try {
      const response = await API.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data?.success) {
        setUploadSuccess(`Successfully uploaded "${uploadFile.name}"! Text extracted.`);
        setUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchResumes();
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error('File upload error:', err);
      setUploadError(err.response?.data?.message || 'Failed to process and upload file.');
    } finally {
      setUploadLoading(false);
    }
  };

  // --- REPLACE FILE HANDLERS ---
  const triggerReplaceFile = (id, e) => {
    if (e) e.stopPropagation();
    setReplaceTargetId(id);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleReplaceSubmit = async (e) => {
    const file = e.target.files[0];
    if (!file || !replaceTargetId) return;

    // Validate type & size
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'pdf' && extension !== 'docx') {
      alert('Unsupported format. Only PDF and DOCX files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size allowed is 5MB.');
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await API.put(`/resumes/upload/${replaceTargetId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data?.success) {
        alert(`Successfully replaced with "${file.name}"!`);
        fetchResumes();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to replace file.');
    } finally {
      setUploadLoading(false);
      setReplaceTargetId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const testBackendConnection = async () => {
    setHealthStatus({ loading: true, data: null, error: null });
    try {
      const response = await API.get('/health');
      setHealthStatus({ loading: false, data: response.data, error: null });
    } catch (err) {
      console.error('API health check error:', err);
      setHealthStatus({
        loading: false,
        data: null,
        error: err.response?.data?.message || err.message || 'Cannot reach API server. Is backend running?',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden input for replace file trigger */}
      <input 
        type="file" 
        ref={replaceInputRef}
        onChange={handleReplaceSubmit}
        className="hidden"
        accept=".pdf,.docx"
      />

      {/* Welcome Block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
            Welcome Back, {user?.name || 'Developer'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Build and optimize ATS-friendly resumes with ResumeAI.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreateResume}
            disabled={creating}
            className="btn-primary flex items-center gap-2"
          >
            {creating ? <FiLoader className="animate-spin" /> : <FiPlus />} Create New Resume
          </button>
        </div>
      </div>

      {/* Grid: Upload module and metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Resume Module */}
        <div className="glass-card p-6 rounded-xl space-y-4 lg:col-span-2">
          <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <FiUploadCloud className="text-primary-500" /> Upload Existing Resume
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload your existing resume in PDF or DOCX format. The AI scanner will extract content, calculate keyword densities, and score ATS compatibility.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx"
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-white/20"
              />
            </div>
            
            <button
              onClick={handleUploadSubmit}
              disabled={!uploadFile || uploadLoading}
              className={`px-5 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                uploadFile && !uploadLoading
                  ? 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-md'
                  : 'bg-slate-100 text-slate-400 dark:bg-dark-900/60 dark:text-slate-600'
              }`}
            >
              {uploadLoading ? <FiLoader className="animate-spin" /> : <FiUploadCloud />} Upload file
            </button>
          </div>

          {/* Upload Status Details */}
          {uploadLoading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Extracting resume metadata...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-dark-900 rounded-full h-1.5">
                <div 
                  className="bg-primary-500 h-1.5 rounded-full transition-all duration-200" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-lg flex items-center gap-2">
              <FiCheck />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2">
              <FiAlertCircle />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Small stats summary */}
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between lg:col-span-1">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity Overview</h4>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-50/50 dark:bg-dark-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-900">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Resumes</span>
                <p className="text-xl font-bold font-outfit mt-1 text-slate-900 dark:text-white">{resumes.length}</p>
              </div>
              <div className="bg-slate-50/50 dark:bg-dark-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-900">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Files Uploaded</span>
                <p className="text-xl font-bold font-outfit mt-1 text-slate-900 dark:text-white">
                  {resumes.filter(r => r.isUploaded).length}
                </p>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 italic pt-4 border-t mt-4 border-slate-200/50 dark:border-slate-800/50">
            Tip: Upload a resume to compare its content against job postings directly.
          </div>
        </div>
      </div>

      {/* Resumes Grid */}
      <div>
        <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-200 mb-4">
          My Resumes
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FiLoader className="animate-spin text-3xl text-primary-500" />
          </div>
        ) : error ? (
          <div className="glass-card p-6 text-center space-y-4">
            <FiAlertCircle className="mx-auto text-4xl text-amber-500" />
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
              {error}
            </p>
            <button onClick={fetchResumes} className="btn-secondary text-sm">
              Retry Connection
            </button>
          </div>
        ) : resumes.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl flex flex-col items-center justify-center space-y-4 border border-dashed border-slate-300 dark:border-slate-800 bg-white/20 dark:bg-dark-900/10">
            <div className="w-16 h-16 bg-slate-100 dark:bg-dark-900/60 rounded-full flex items-center justify-center text-slate-400">
              <FiFileText className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-200">
              No Resumes Yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
              Get started by uploading a file or choosing a layout template.
            </p>
            <button onClick={handleCreateResume} className="btn-primary text-sm flex items-center gap-2">
              <FiPlus /> Build Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div 
                key={resume._id} 
                onClick={() => {
                  if (resume.isUploaded) {
                    navigate(`/dashboard?tab=ats&id=${resume._id}`);
                  } else {
                    navigate(`/builder/${resume._id}`);
                  }
                }}
                className="glass-card p-5 rounded-xl space-y-4 border border-slate-200/50 dark:border-slate-800/50 hover:scale-[1.01] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-primary-500/10 rounded-lg text-primary-600 dark:text-primary-400">
                    <FiFileText className="text-xl" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      resume.isUploaded 
                        ? 'bg-indigo-500/15 text-indigo-600'
                        : 'bg-primary-500/15 text-primary-600'
                    }`}>
                      {resume.isUploaded ? '📄 File Upload' : '🏗️ Built'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      resume.atsScore >= 75 ? 'bg-green-500/10 text-green-600' :
                      resume.atsScore >= 50 ? 'bg-amber-500/10 text-amber-600' :
                      'bg-slate-500/10 text-slate-500'
                    }`}>
                      ATS: {resume.atsScore || 0}%
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-500 truncate">
                    {resume.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Last modified: {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400">
                  {resume.isUploaded ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard?tab=ats&id=${resume._id}`);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold text-primary-500"
                    >
                      <FiCpu /> Scan ATS
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/builder/${resume._id}`);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <FiEdit2 /> Edit
                    </button>
                  )}

                  {resume.isUploaded ? (
                    <button
                      onClick={(e) => triggerReplaceFile(resume._id, e)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <FiRefreshCw /> Replace
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleShareLink(resume._id, e)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    >
                      {copiedId === resume._id ? <FiCheck className="text-green-500" /> : <FiShare2 />} 
                      {copiedId === resume._id ? 'Copied' : 'Share'}
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDeleteResume(resume._id, e)}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integration Verification Panel */}
      <div className="glass-card p-6 rounded-xl space-y-4">
        <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
          <FiServer /> Integration Sanity Check
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Verify communication between this React workspace and the Express backend.
        </p>

        <div className="flex flex-wrap gap-4 items-center">
          <button 
            onClick={testBackendConnection}
            disabled={healthStatus.loading}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <FiActivity className={healthStatus.loading ? 'animate-pulse' : ''} />
            {healthStatus.loading ? 'Verifying...' : 'Check API Status'}
          </button>

          {healthStatus.data && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
              Status: Connected ({healthStatus.data.status})
            </span>
          )}

          {healthStatus.error && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              Error: API Offline
            </span>
          )}
        </div>

        {healthStatus.data && (
          <pre className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 overflow-x-auto max-h-40">
            {JSON.stringify(healthStatus.data, null, 2)}
          </pre>
        )}

        {healthStatus.error && (
          <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg text-xs font-mono text-red-600 dark:text-red-400">
            {healthStatus.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
