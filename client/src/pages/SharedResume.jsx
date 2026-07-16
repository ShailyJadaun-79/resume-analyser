import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { FiLoader, FiPrinter, FiCpu, FiAlertCircle } from 'react-icons/fi';

const SharedResume = () => {
  const { id: resumeId } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedResume = async () => {
      try {
        setLoading(true);
        // Calls the public share endpoint
        const response = await API.get(`/resumes/share/${resumeId}`);
        if (response.data?.success) {
          setResume(response.data.data);
        }
      } catch (err) {
        console.error(err);
        setError('This shared resume link is invalid or has been set to private.');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedResume();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <FiLoader className="animate-spin text-4xl text-primary-500 mb-2" />
        <span className="text-xs text-slate-500 font-semibold uppercase font-outfit">Loading Shared Resume...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
        <FiAlertCircle className="text-5xl text-amber-500 mb-4" />
        <h2 className="text-xl font-bold font-outfit text-slate-800">Shared Link Offline</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">{error}</p>
        <Link to="/" className="btn-primary mt-6 text-xs">
          Return to ResumeAI
        </Link>
      </div>
    );
  }

  const styles = resume.formatting || {
    color: '#4f6bff',
    fontFamily: 'sans'
  };

  return (
    <div className="min-h-screen bg-slate-200/50 p-8 flex flex-col items-center justify-start gap-6 print:bg-white print:p-0">
      
      {/* Floating control header - hidden during printing */}
      <div className="w-[210mm] flex justify-between items-center bg-white/70 backdrop-blur-md border border-slate-200/50 p-4 rounded-xl shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary-600 rounded-md text-white">
            <FiCpu className="text-sm" />
          </div>
          <span className="text-sm font-bold font-outfit text-slate-900">
            ResumeAI <span className="text-xs font-normal text-slate-400">/ Shared Link</span>
          </span>
        </div>
        <button 
          onClick={() => window.print()}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
        >
          <FiPrinter /> Print or Save PDF
        </button>
      </div>

      {/* Actual Resume Sheet */}
      <div 
        id="printable-resume"
        style={{ 
          fontFamily: styles.fontFamily === 'serif' ? 'Merriweather, serif' : 
                      styles.fontFamily === 'mono' ? 'Fira Code, monospace' : 
                      styles.fontFamily === 'outfit' ? 'Outfit, sans-serif' : 'Inter, sans-serif',
          borderColor: styles.color
        }}
        className="w-[210mm] min-h-[297mm] h-fit bg-white text-slate-900 p-12 shadow-xl border-t-8 rounded-sm select-text flex flex-col justify-between print:shadow-none print:w-full print:min-h-0 print:border-none print:p-0"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-slate-900">
              {resume.personalInfo?.name || 'Candidate Name'}
            </h1>
            <p className="text-sm font-semibold tracking-wide" style={{ color: styles.color }}>
              {resume.title}
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1 border-b pb-3">
              {resume.personalInfo?.email && <span>{resume.personalInfo.email}</span>}
              {resume.personalInfo?.phone && <span>{resume.personalInfo.phone}</span>}
              {resume.personalInfo?.location && <span>{resume.personalInfo.location}</span>}
              {resume.personalInfo?.website && <span className="font-mono">{resume.personalInfo.website}</span>}
              {resume.personalInfo?.github && <span className="font-mono">github: {resume.personalInfo.github}</span>}
              {resume.personalInfo?.linkedin && <span className="font-mono">in: {resume.personalInfo.linkedin}</span>}
            </div>
          </div>

          {/* Summary */}
          {resume.personalInfo?.summary && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: styles.color }}>
                Summary
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                {resume.personalInfo.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {resume.experience?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: styles.color, borderColor: `${styles.color}20` }}>
                Work Experience
              </h3>
              <div className="space-y-3">
                {resume.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{exp.position} — <span className="opacity-80">{exp.company}</span></span>
                      <span className="font-normal text-[11px] text-slate-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    <pre className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-wrap max-w-full text-justify">
                      {exp.description}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resume.projects?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: styles.color, borderColor: `${styles.color}20` }}>
                Technical Projects
              </h3>
              <div className="space-y-3">
                {resume.projects.map((proj, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{proj.name} {proj.link && <span className="font-normal font-mono text-[10px] text-slate-400">({proj.link})</span>}</span>
                      <span className="font-semibold text-[10px] text-slate-500">{proj.technologies?.join(' | ')}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed text-justify">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resume.skills?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: styles.color, borderColor: `${styles.color}20` }}>
                Technical Skills & Frameworks
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {resume.skills.join(', ')}
              </p>
            </div>
          )}

          {/* Education */}
          {resume.education?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: styles.color, borderColor: `${styles.color}20` }}>
                Education
              </h3>
              <div className="space-y-2">
                {resume.education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs text-slate-700">
                    <div>
                      <span className="font-bold text-slate-800">{edu.school}</span>
                      <p className="text-[11px] mt-0.5">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                    </div>
                    <span className="text-[11px] text-slate-500">{edu.startDate} - {edu.endDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-[9px] text-center text-slate-400 pt-6 border-t mt-6 print:hidden">
          Shared via ResumeAI. All rights reserved.
        </div>
      </div>

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
    </div>
  );
};

export default SharedResume;
