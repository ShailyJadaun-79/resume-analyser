import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { FiSearch, FiCheck, FiCpu, FiAward, FiLoader, FiCheckCircle } from 'react-icons/fi';
import TemplatePreview from '../components/TemplatePreview';
import { STATIC_TEMPLATES, TEMPLATE_CATEGORIES } from '../templates/TemplateConstants';
import { getSampleDataForTemplate } from '../templates/SampleResumeData';

const Templates = ({ user }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const handleSelectTemplate = async (template) => {
    if (template.isPremium && !user?.isPremium) {
      alert('This is a Premium Template. Please upgrade your profile under Settings/Profile to access premium options!');
      return;
    }

    setCreating(true);
    setActiveId(template.id);
    try {
      const response = await API.post('/resumes', {
        title: `${template.name} Resume`,
        templateId: template.slug,
        resumeData: getSampleDataForTemplate(template.slug)
      });
      if (response.data?.success) {
        navigate(`/builder/${response.data.data._id}`);
      }
    } catch (error) {
      console.error('Error creating resume:', error);
      alert('Failed to initialize resume. DB connection might be offline.');
    } finally {
      setCreating(false);
      setActiveId(null);
    }
  };

  const filteredTemplates = STATIC_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tpl.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-extrabold font-outfit text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500 dark:from-primary-400 dark:to-indigo-300">
          Template Gallery
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base mt-2 max-w-2xl">
          Choose from 20 professionally crafted, ATS-friendly templates optimized for the modern job market.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center justify-between bg-white dark:bg-dark-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20 scale-105'
                  : 'bg-slate-100 dark:bg-dark-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full xl:w-96 group">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-primary-500 transition-colors">
            <FiSearch />
          </span>
          <input
            type="text"
            placeholder="Search templates (e.g. Software Engineer)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      {/* Templates Masonry / Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(320px,auto)]">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="group relative bg-white dark:bg-dark-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            {/* ATS Friendly Badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100/90 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                <FiCheckCircle className="text-green-600 dark:text-green-400" /> ATS Friendly
              </span>
            </div>

            {/* Premium Badge */}
            {tpl.isPremium && (
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                  <FiAward /> Premium
                </span>
              </div>
            )}

            {/* Visual Header (Preview Area) */}
            <div className="h-48 bg-slate-100 dark:bg-dark-950 flex items-center justify-center relative overflow-hidden">
              <TemplatePreview slug={tpl.slug} />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-300 flex items-center justify-center z-20">
                <button
                  onClick={() => handleSelectTemplate(tpl)}
                  disabled={creating}
                  className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {creating && activeId === tpl.id ? (
                    <><FiLoader className="animate-spin" /> Preparing...</>
                  ) : (
                    <><FiCheck /> Use Template</>
                  )}
                </button>
              </div>
            </div>

            {/* Template Info Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary-500">
                  {tpl.category}
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1 group-hover:text-primary-500 transition-colors">
                  {tpl.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {tpl.desc}
                </p>
              </div>
              
              {/* Mobile button */}
              <button
                onClick={() => handleSelectTemplate(tpl)}
                disabled={creating}
                className="mt-6 w-full xl:hidden py-2.5 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs hover:bg-primary-500 hover:text-white transition-colors"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-dark-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <FiSearch className="text-6xl text-slate-300 dark:text-slate-700 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No templates found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Try adjusting your search or category filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default Templates;
