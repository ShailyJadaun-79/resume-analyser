import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { 
  FiArrowLeft, FiSave, FiPrinter, FiCpu, FiPlus, FiTrash2, 
  FiLayers, FiSliders, FiFileText, FiLoader, FiCheck, FiChevronDown, FiChevronUp, FiLayout, FiX
} from 'react-icons/fi';
import { TemplateRegistry } from '../templates/TemplateRegistry';
import { STATIC_TEMPLATES } from '../templates/TemplateConstants';
import TemplatePreview from '../components/TemplatePreview';

const ResumeBuilder = () => {
  const { id: resumeId } = useParams();
  const navigate = useNavigate();
  
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  
  // Custom templates rendering rules
  const [styles, setStyles] = useState({
    color: '#4f6bff',
    spacing: 'normal',
    fontSize: 'md',
    margin: 'normal',
    fontFamily: 'sans'
  });

  const saveTimeoutRef = useRef(null);

  // Fetch resume details on mount
  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/resumes/${resumeId}`);
        if (response.data?.success) {
          const data = response.data.data;
          setResume(data);
          if (data.formatting) {
            setStyles(data.formatting);
          }
        }
      } catch (err) {
        console.error('Failed to load resume:', err);
        alert('Could not fetch resume details. Server or database might be offline.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [resumeId, navigate]);

  // Debounced Auto-Save Mechanism
  const triggerAutoSave = (updatedResume) => {
    setSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await API.put(`/resumes/${resumeId}`, updatedResume);
        setSaving(false);
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    }, 1500); // 1.5s debounce window
  };

  const handleFieldChange = (section, field, value) => {
    const updated = {
      ...resume,
      [section]: {
        ...resume[section],
        [field]: value
      }
    };
    setResume(updated);
    triggerAutoSave(updated);
  };

  const handleArrayChange = (section, index, field, value) => {
    const arr = [...resume[section]];
    arr[index] = {
      ...arr[index],
      [field]: value
    };
    const updated = { ...resume, [section]: arr };
    setResume(updated);
    triggerAutoSave(updated);
  };

  const addArrayItem = (section, emptyObject) => {
    const updated = {
      ...resume,
      [section]: [...resume[section], emptyObject]
    };
    setResume(updated);
    triggerAutoSave(updated);
  };

  const removeArrayItem = (section, index) => {
    const updated = {
      ...resume,
      [section]: resume[section].filter((_, idx) => idx !== index)
    };
    setResume(updated);
    triggerAutoSave(updated);
  };

  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    const updated = { ...resume, skills: skillsArray };
    setResume(updated);
    triggerAutoSave(updated);
  };

  const handleStyleChange = (key, val) => {
    const updatedStyles = { ...styles, [key]: val };
    setStyles(updatedStyles);
    const updated = { ...resume, formatting: updatedStyles };
    setResume(updated);
    triggerAutoSave(updated);
  };

  // --- AI INTEGRATIONS WRAPPER CALLS ---
  
  const handleAISummary = async () => {
    if (!resume?.personalInfo?.name) {
      alert('Please fill out your Target Title / Name before generating summary!');
      return;
    }
    setAiLoading(true);
    try {
      const skillsStr = resume.skills?.join(', ') || 'software development';
      const response = await API.post('/ai/summary', {
        role: resume.title,
        skills: skillsStr
      });
      if (response.data?.success) {
        handleFieldChange('personalInfo', 'summary', response.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('AI Generation failed. Check OpenAI variables.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIBullets = async (index) => {
    const exp = resume.experience[index];
    if (!exp.position || !exp.company) {
      alert('Please specify Job Position and Company first!');
      return;
    }
    setAiLoading(true);
    try {
      const response = await API.post('/ai/bullets', {
        role: exp.position,
        details: exp.description || 'developed standard product modules'
      });
      if (response.data?.success) {
        handleArrayChange('experience', index, 'description', response.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('AI Generation failed. Check OpenAI variables.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISkills = async () => {
    setAiLoading(true);
    try {
      const response = await API.post('/ai/skills', {
        role: resume.title || 'Software Engineer'
      });
      if (response.data?.success) {
        const skillsArray = response.data.data.split(',').map(s => s.trim()).filter(Boolean);
        const updated = { ...resume, skills: skillsArray };
        setResume(updated);
        triggerAutoSave(updated);
      }
    } catch (err) {
      console.error(err);
      alert('AI Recommendation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col justify-center items-center">
        <FiLoader className="animate-spin text-4xl text-primary-500 mb-2" />
        <span className="text-xs text-slate-500 font-semibold uppercase font-outfit">Loading Builder Workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-dark-950 flex flex-col text-slate-800 dark:text-slate-200">
      {/* Header bar */}
      <header className="glass-card py-4 px-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 select-none print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-lg text-slate-500">
            <FiArrowLeft />
          </Link>
          <input
            type="text"
            value={resume.title}
            onChange={(e) => {
              const updated = { ...resume, title: e.target.value };
              setResume(updated);
              triggerAutoSave(updated);
            }}
            className="bg-transparent font-bold border-b border-transparent hover:border-slate-400 focus:border-primary-500 outline-none text-slate-900 dark:text-white px-1 py-0.5 text-sm"
          />
          {saving ? (
            <span className="text-[10px] text-slate-400 flex items-center gap-1.5"><FiLoader className="animate-spin" /> Auto-saving...</span>
          ) : (
            <span className="text-[10px] text-green-500 flex items-center gap-1.5"><FiCheck /> Saved</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsTemplateGalleryOpen(true)}
            className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5"
          >
            <FiLayout /> Change Template
          </button>
          <button onClick={handlePrint} className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5">
            <FiPrinter /> PDF / Export
          </button>
          <Link to="/dashboard?tab=ats" className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5">
            <FiCpu /> ATS Check
          </Link>
        </div>
      </header>

      {/* Editor Split-Screen Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Multi-Step Editor Form */}
        <div className="w-full md:w-[45%] bg-white dark:bg-dark-900 border-r border-slate-200/50 dark:border-slate-800/50 overflow-y-auto p-6 space-y-6 print:hidden scroll-smooth select-none">
          {/* Section Selector Menu */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-dark-950/60 p-1 rounded-xl">
            {['personal', 'experience', 'projects', 'skills', 'education', 'formatting'].map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  activeSection === sec
                    ? 'bg-white dark:bg-dark-900 text-primary-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Form Content boxes */}
          {activeSection === 'personal' && (
            <div className="space-y-4">
              <h3 className="font-bold font-outfit text-slate-900 dark:text-white border-b pb-1.5 text-sm flex items-center gap-2">
                <FiFileText className="text-primary-500" /> Personal Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Candidate Name</label>
                  <input
                    type="text"
                    value={resume.personalInfo?.name || ''}
                    onChange={(e) => handleFieldChange('personalInfo', 'name', e.target.value)}
                    className="glass-input mt-1 text-xs"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={resume.personalInfo?.email || ''}
                    onChange={(e) => handleFieldChange('personalInfo', 'email', e.target.value)}
                    className="glass-input mt-1 text-xs"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Contact Phone</label>
                  <input
                    type="text"
                    value={resume.personalInfo?.phone || ''}
                    onChange={(e) => handleFieldChange('personalInfo', 'phone', e.target.value)}
                    className="glass-input mt-1 text-xs"
                    placeholder="+1-555-0199"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Location</label>
                  <input
                    type="text"
                    value={resume.personalInfo?.location || ''}
                    onChange={(e) => handleFieldChange('personalInfo', 'location', e.target.value)}
                    className="glass-input mt-1 text-xs"
                    placeholder="New York, NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Website</label>
                  <input
                    type="text"
                    value={resume.personalInfo?.website || ''}
                    onChange={(e) => handleFieldChange('personalInfo', 'website', e.target.value)}
                    className="glass-input mt-1 text-xs text-[11px]"
                    placeholder="portfolio.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">GitHub</label>
                  <input
                    type="text"
                    value={resume.personalInfo?.github || ''}
                    onChange={(e) => handleFieldChange('personalInfo', 'github', e.target.value)}
                    className="glass-input mt-1 text-xs text-[11px]"
                    placeholder="github.com/user"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">LinkedIn</label>
                  <input
                    type="text"
                    value={resume.personalInfo?.linkedin || ''}
                    onChange={(e) => handleFieldChange('personalInfo', 'linkedin', e.target.value)}
                    className="glass-input mt-1 text-xs text-[11px]"
                    placeholder="linkedin.com/in/user"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Professional Summary</label>
                  <button 
                    onClick={handleAISummary}
                    disabled={aiLoading}
                    className="text-[10px] font-semibold text-primary-500 hover:text-primary-600 flex items-center gap-1"
                  >
                    <FiCpu /> Generate with AI
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={resume.personalInfo?.summary || ''}
                  onChange={(e) => handleFieldChange('personalInfo', 'summary', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-dark-900/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-sans"
                  placeholder="Summary of experience and accomplishments..."
                />
              </div>
            </div>
          )}

          {activeSection === 'experience' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-1.5">
                <h3 className="font-bold font-outfit text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <FiLayers className="text-primary-500" /> Work History
                </h3>
                <button
                  onClick={() => addArrayItem('experience', { company: '', position: '', startDate: '', endDate: '', current: false, description: '', location: '' })}
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-primary-500 text-white rounded hover:bg-primary-600 flex items-center gap-1 shadow-sm"
                >
                  <FiPlus /> Add Entry
                </button>
              </div>

              <div className="space-y-4">
                {resume.experience?.map((exp, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-4 relative bg-slate-50/20">
                    <button
                      onClick={() => removeArrayItem('experience', idx)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-600"
                      title="Remove Entry"
                    >
                      <FiTrash2 />
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleArrayChange('experience', idx, 'company', e.target.value)}
                          className="glass-input mt-1 text-xs"
                          placeholder="Google, Microsoft, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Position</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => handleArrayChange('experience', idx, 'position', e.target.value)}
                          className="glass-input mt-1 text-xs"
                          placeholder="Software Engineer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => handleArrayChange('experience', idx, 'startDate', e.target.value)}
                          className="glass-input mt-1 text-xs"
                          placeholder="Oct 2022"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">End Date</label>
                        <input
                          type="text"
                          disabled={exp.current}
                          value={exp.current ? 'Present' : exp.endDate}
                          onChange={(e) => handleArrayChange('experience', idx, 'endDate', e.target.value)}
                          className="glass-input mt-1 text-xs"
                          placeholder="Present"
                        />
                      </div>
                      <div className="flex items-center pt-5">
                        <input
                          type="checkbox"
                          id={`exp-curr-${idx}`}
                          checked={exp.current}
                          onChange={(e) => handleArrayChange('experience', idx, 'current', e.target.checked)}
                          className="rounded text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor={`exp-curr-${idx}`} className="ml-1.5 text-xs text-slate-500 font-semibold select-none">Currently Here</label>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Responsibilities & Achievements</label>
                        <button
                          onClick={() => handleAIBullets(idx)}
                          disabled={aiLoading}
                          className="text-[10px] font-semibold text-primary-500 hover:text-primary-600 flex items-center gap-1"
                        >
                          <FiCpu /> Enhance with AI
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={exp.description}
                        onChange={(e) => handleArrayChange('experience', idx, 'description', e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-dark-900/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-sans"
                        placeholder="Start bullet points with action verbs..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-1.5">
                <h3 className="font-bold font-outfit text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <FiLayers className="text-primary-500" /> Projects
                </h3>
                <button
                  onClick={() => addArrayItem('projects', { name: '', description: '', technologies: [], link: '' })}
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-primary-500 text-white rounded hover:bg-primary-600 flex items-center gap-1 shadow-sm"
                >
                  <FiPlus /> Add Project
                </button>
              </div>

              <div className="space-y-4">
                {resume.projects?.map((proj, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-4 relative bg-slate-50/20">
                    <button
                      onClick={() => removeArrayItem('projects', idx)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-600"
                    >
                      <FiTrash2 />
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Project Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => handleArrayChange('projects', idx, 'name', e.target.value)}
                          className="glass-input mt-1 text-xs"
                          placeholder="SaaS Landing Page"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Technologies (comma-separated)</label>
                        <input
                          type="text"
                          value={proj.technologies?.join(', ') || ''}
                          onChange={(e) => {
                            const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            handleArrayChange('projects', idx, 'technologies', arr);
                          }}
                          className="glass-input mt-1 text-xs"
                          placeholder="React, Node.js"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Project Link (Optional)</label>
                      <input
                        type="text"
                        value={proj.link || ''}
                        onChange={(e) => handleArrayChange('projects', idx, 'link', e.target.value)}
                        className="glass-input mt-1 text-xs"
                        placeholder="github.com/repo"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Description</label>
                      <textarea
                        rows={3}
                        value={proj.description}
                        onChange={(e) => handleArrayChange('projects', idx, 'description', e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-dark-900/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-sans"
                        placeholder="Write a clear summary of what was engineered..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'skills' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-1.5">
                <h3 className="font-bold font-outfit text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <FiSliders className="text-primary-500" /> Core Skills
                </h3>
                <button
                  onClick={handleAISkills}
                  disabled={aiLoading}
                  className="text-[10px] font-semibold text-primary-500 hover:text-primary-600 flex items-center gap-1"
                >
                  <FiCpu /> Recommend Skills
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Skills (comma-separated)</label>
                <textarea
                  rows={6}
                  value={resume.skills?.join(', ') || ''}
                  onChange={handleSkillsChange}
                  className="w-full p-3 mt-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-dark-900/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono"
                  placeholder="React, Node.js, Mongoose, REST APIs, Git..."
                />
              </div>
            </div>
          )}

          {activeSection === 'education' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-1.5">
                <h3 className="font-bold font-outfit text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <FiLayers className="text-primary-500" /> Education
                </h3>
                <button
                  onClick={() => addArrayItem('education', { school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', current: false, description: '', location: '' })}
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-primary-500 text-white rounded hover:bg-primary-600 flex items-center gap-1 shadow-sm"
                >
                  <FiPlus /> Add Degree
                </button>
              </div>

              <div className="space-y-4">
                {resume.education?.map((edu, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-4 relative bg-slate-50/20">
                    <button
                      onClick={() => removeArrayItem('education', idx)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-600"
                    >
                      <FiTrash2 />
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">School / University</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleArrayChange('education', idx, 'school', e.target.value)}
                          className="glass-input mt-1 text-xs"
                          placeholder="Stanford University"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleArrayChange('education', idx, 'degree', e.target.value)}
                          className="glass-input mt-1 text-xs"
                          placeholder="Bachelor of Science"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Field of Study</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy || ''}
                          onChange={(e) => handleArrayChange('education', idx, 'fieldOfStudy', e.target.value)}
                          className="glass-input mt-1 text-xs"
                          placeholder="Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                        <input
                          type="text"
                          value={edu.startDate || ''}
                          onChange={(e) => handleArrayChange('education', idx, 'startDate', e.target.value)}
                          className="glass-input mt-1 text-xs"
                          placeholder="Sep 2018"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">End Date</label>
                        <input
                          type="text"
                          value={edu.endDate || ''}
                          onChange={(e) => handleArrayChange('education', idx, 'endDate', e.target.value)}
                          className="glass-input mt-1 text-xs"
                          placeholder="Jun 2022"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'formatting' && (
            <div className="space-y-6">
              <h3 className="font-bold font-outfit text-slate-900 dark:text-white border-b pb-1.5 text-sm flex items-center gap-2">
                <FiSliders className="text-primary-500" /> Style Parameters
              </h3>

              <div className="space-y-4">
                {/* Brand Colors Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Theme Accent Color</label>
                  <div className="flex gap-3">
                    {['#4f6bff', '#22c55e', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4', '#111827'].map(c => (
                      <button
                        key={c}
                        onClick={() => handleStyleChange('color', c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full shadow border-2 transition-all ${
                          styles.color === c ? 'scale-110 border-white ring-2 ring-primary-500' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Font Families */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Font Pairing</label>
                  <select
                    value={styles.fontFamily}
                    onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-dark-900/40 text-sm outline-none"
                  >
                    <option value="sans">System Sans (Inter)</option>
                    <option value="outfit">SaaS Premium (Outfit)</option>
                    <option value="serif">Academic Professional (Merriweather)</option>
                    <option value="mono">LaTeX Technical (Fira Code)</option>
                  </select>
                </div>

                {/* Spacings */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Section Spacing</label>
                  <select
                    value={styles.spacing}
                    onChange={(e) => handleStyleChange('spacing', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-dark-900/40 text-sm outline-none"
                  >
                    <option value="tight">Tight</option>
                    <option value="normal">Normal</option>
                    <option value="loose">Loose</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Resume Sheet View Representation */}
        <div className="flex-1 bg-slate-200/50 dark:bg-dark-950 overflow-y-auto p-8 flex justify-center print:bg-white print:p-0 print:overflow-visible print:h-auto">
          {/* Printable Sheet */}
          <div 
            id="printable-resume"
            className="print:m-0 print:p-0 print:w-full print:shadow-none print:border-none relative"
          >
            {TemplateRegistry[resume.templateId] ? (
              React.createElement(TemplateRegistry[resume.templateId], { resume, styles })
            ) : (
              React.createElement(TemplateRegistry['modern-ats'], { resume, styles })
            )}

            <div className="text-[9px] text-center text-slate-400 pt-6 border-t mt-6 print:hidden">
              Created with ResumeAI Builder. Unlimited PDF exports.
            </div>
          </div>

        </div>
      </div>
      
      {/* Stylesheet override block for printing formatting */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          #printable-resume, #printable-resume * {
            visibility: visible;
          }
          #printable-resume {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
          }
        }
      `}</style>

      {/* Template Gallery Modal */}
      {isTemplateGalleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6 print:hidden animate-fade-in">
          <div className="bg-slate-50 dark:bg-dark-950 w-full max-w-7xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 z-10">
              <div>
                <h2 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Change Template</h2>
                <p className="text-sm text-slate-500 mt-1">Select a new layout. Your data will be preserved automatically.</p>
              </div>
              <button 
                onClick={() => setIsTemplateGalleryOpen(false)}
                className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(320px,auto)]">
                {STATIC_TEMPLATES.map((tpl) => (
                  <div key={tpl.id} className="group relative bg-white dark:bg-dark-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer" onClick={() => {
                      const updated = { ...resume, templateId: tpl.slug };
                      setResume(updated);
                      triggerAutoSave(updated);
                      setIsTemplateGalleryOpen(false);
                    }}>
                    
                    <div className="h-48 bg-slate-100 dark:bg-dark-950 flex items-center justify-center relative overflow-hidden">
                      <TemplatePreview slug={tpl.slug} />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-300 flex items-center justify-center z-20">
                        <span className="bg-primary-500 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                          <FiCheck /> Use Template
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary-500">{tpl.category}</span>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1 group-hover:text-primary-500 transition-colors">{tpl.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{tpl.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
