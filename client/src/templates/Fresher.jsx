import React from 'react';

const Fresher = ({ resume, styles }) => {
  const { personalInfo = {}, experience = [], education = [], skills = [], projects = [] } = resume || {};
  const primaryColor = styles?.color || '#3b82f6';

  return (
    <div className="bg-white text-slate-900 p-8 min-h-[1056px] w-[816px] mx-auto shadow-md" style={{ fontFamily: styles?.fontFamily || 'sans-serif' }}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-center" style={{ color: primaryColor }}>
          {personalInfo?.name || 'Your Name'}
        </h1>
        <p className="text-lg font-medium text-slate-600 mt-1">{resume?.title || 'Job Title'}</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 mt-2">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
          {personalInfo?.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo?.github && <span>{personalInfo.github}</span>}
          {personalInfo?.website && <span>{personalInfo.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo?.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold border-b-2 mb-2 pb-1" style={{ borderColor: primaryColor, color: primaryColor }}>
            Professional Summary
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{personalInfo.summary}</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="space-y-6">
          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b-2 mb-3 pb-1" style={{ borderColor: primaryColor, color: primaryColor }}>
                Work Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-base font-bold text-slate-800">{exp.position} <span className="font-normal text-slate-600">at {exp.company}</span></h3>
                      <span className="text-sm text-slate-500 whitespace-nowrap">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b-2 mb-3 pb-1" style={{ borderColor: primaryColor, color: primaryColor }}>
                Projects
              </h2>
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-base font-bold text-slate-800">
                        {proj.name} {proj.link && <a href={proj.link} className="text-xs text-blue-500 ml-2 font-normal">Link</a>}
                      </h3>
                      <span className="text-sm text-slate-500">{proj.technologies?.join(', ')}</span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b-2 mb-3 pb-1" style={{ borderColor: primaryColor, color: primaryColor }}>
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx}>
                    <h3 className="text-base font-bold text-slate-800">{edu.school}</h3>
                    <p className="text-sm text-slate-700">{edu.degree} in {edu.fieldOfStudy}</p>
                    <p className="text-sm text-slate-500">{edu.startDate} - {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h2 className="text-xl font-bold border-b-2 mb-3 pb-1" style={{ borderColor: primaryColor, color: primaryColor }}>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-1 text-sm rounded border border-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fresher;
