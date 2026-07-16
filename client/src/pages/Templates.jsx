import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { FiLayout, FiSearch, FiCheck, FiCpu, FiAward, FiLoader } from 'react-icons/fi';

const TEMPLATE_CATEGORIES = ['All', 'Modern', 'Minimal', 'Professional', 'Executive', 'Creative', 'Academic'];

// Predefined list of 30 ATS-friendly templates (80-90% FREE)
const STATIC_TEMPLATES = [
  // Modern
  { id: 't1', name: 'Vanguard Modern', slug: 'vanguard', category: 'Modern', isPremium: false, desc: 'Clean single-column developer format with custom left highlights.' },
  { id: 't2', name: 'Stellar Tech', slug: 'stellar', category: 'Modern', isPremium: false, desc: 'Bold fonts and compact tables optimized for technology sectors.' },
  { id: 't3', name: 'Quantum Dev', slug: 'quantum', category: 'Modern', isPremium: false, desc: 'Compact developer layout prioritizing technology stacks and tools.' },
  { id: 't4', name: 'Nexus Bold', slug: 'nexus', category: 'Modern', isPremium: true, desc: 'Premium modern layout featuring colored section highlights.' },
  { id: 't5', name: 'Helix Modern', slug: 'helix', category: 'Modern', isPremium: false, desc: 'Designed for tech professionals seeking a layout with minimal borders.' },
  // Minimal
  { id: 't6', name: 'Sleek Minimalist', slug: 'sleek', category: 'Minimal', isPremium: false, desc: 'Extremely clean typography design focusing purely on content.' },
  { id: 't7', name: 'Nordic Clean', slug: 'nordic', category: 'Minimal', isPremium: false, desc: 'Elegant spacing and font hierarchy for maximum readability.' },
  { id: 't8', name: 'Nova Simple', slug: 'nova', category: 'Minimal', isPremium: false, desc: 'Ultra-thin dividers and clean labels. Perfect for junior devs.' },
  { id: 't9', name: 'Aero Minimal', slug: 'aero', category: 'Minimal', isPremium: false, desc: 'Generous margins and spacious layouts designed to feel premium.' },
  { id: 't10', name: 'Void Clean', slug: 'void', category: 'Minimal', isPremium: true, desc: 'Premium minimalist card-styled resume layout.' },
  // Professional
  { id: 't11', name: 'Standard Corporate', slug: 'corporate', category: 'Professional', isPremium: false, desc: 'Classic double-column template accepted globally by HR firms.' },
  { id: 't12', name: 'Synergy Corporate', slug: 'synergy', category: 'Professional', isPremium: false, desc: 'Structured grid formatting prioritizing work history details.' },
  { id: 't13', name: 'Prime Professional', slug: 'prime', category: 'Professional', isPremium: false, desc: 'Crisp font weights, perfect for technical team leads.' },
  { id: 't14', name: 'Capital Business', slug: 'capital', category: 'Professional', isPremium: false, desc: 'Traditional corporate formatting optimized for senior architects.' },
  { id: 't15', name: 'Vex Professional', slug: 'vex', category: 'Professional', isPremium: true, desc: 'Premium dark-tinted professional resume template.' },
  // Executive
  { id: 't16', name: 'Director Suite', slug: 'director', category: 'Executive', isPremium: false, desc: 'Sophisticated single-column format showing leadership metrics.' },
  { id: 't17', name: 'Summit Elite', slug: 'summit', category: 'Executive', isPremium: false, desc: 'Optimized for high-impact achievements and statistics.' },
  { id: 't18', name: 'Apex Executive', slug: 'apex', category: 'Executive', isPremium: false, desc: 'Elegant serif typography for engineering directors.' },
  { id: 't19', name: 'Vanguard Elite', slug: 'vanguard-elite', category: 'Executive', isPremium: true, desc: 'Premium gold-highlighted layout for executives.' },
  { id: 't20', name: 'Crown Executive', slug: 'crown', category: 'Executive', isPremium: false, desc: 'Classy headings with dedicated segments for board positions.' },
  // Creative
  { id: 't21', name: 'Spectrum Web', slug: 'spectrum', category: 'Creative', isPremium: false, desc: 'Vibrant sidebar and colored grids for web designers.' },
  { id: 't22', name: 'Aura Creative', slug: 'aura', category: 'Creative', isPremium: false, desc: 'Unique headers and skill-bars that show portfolio highlights.' },
  { id: 't23', name: 'Pixel Designer', slug: 'pixel', category: 'Creative', isPremium: false, desc: 'Designed for front-end developers and UI engineers.' },
  { id: 't24', name: 'Prism Bright', slug: 'prism', category: 'Creative', isPremium: true, desc: 'Premium multi-colored creative template.' },
  { id: 't25', name: 'Echo Design', slug: 'echo', category: 'Creative', isPremium: false, desc: 'Modern asymmetry layout showcasing tech skills on the left.' },
  // Academic
  { id: 't26', name: 'Scholar CV', slug: 'scholar', category: 'Academic', isPremium: false, desc: 'Standard CV structure prioritizing publications and research.' },
  { id: 't27', name: 'Campus Academic', slug: 'campus', category: 'Academic', isPremium: false, desc: 'Clean serif layout for university student applications.' },
  { id: 't28', name: 'Fellow CV', slug: 'fellow', category: 'Academic', isPremium: false, desc: 'Detailed format for fellowships and grant proposals.' },
  { id: 't29', name: 'LaTex Classic', slug: 'latex', category: 'Academic', isPremium: false, desc: 'Classic LaTeX style resume format. Pass ATS with 100% score.' },
  { id: 't30', name: 'Oxford Elite', slug: 'oxford', category: 'Academic', isPremium: true, desc: 'Premium CV layout for university professors and leads.' }
];

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
          Explore ATS-Friendly Templates
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Choose from over 30 professionally designed, recruiter-tested layouts.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <FiSearch />
          </span>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pl-10 text-xs py-3"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => handleSelectTemplate(tpl)}
            className="glass-card flex flex-col justify-between rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 hover:scale-[1.01] transition-all cursor-pointer group"
          >
            {/* Visual Header representing template styles */}
            <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-dark-950 dark:to-dark-900 flex items-center justify-center relative border-b border-slate-200/40 dark:border-slate-800/40">
              <FiLayout className="text-4xl text-slate-400 group-hover:text-primary-500 transition-colors" />
              
              {tpl.isPremium && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                  <FiAward /> Premium
                </span>
              )}
            </div>

            {/* Description Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary-500">
                    {tpl.category}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mt-1 group-hover:text-primary-500 transition-colors">
                  {tpl.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {tpl.desc}
                </p>
              </div>

              <button
                disabled={creating}
                className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  tpl.isPremium && !user?.isPremium
                    ? 'bg-slate-100 text-slate-400 dark:bg-dark-900/60 dark:text-slate-600'
                    : 'bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-500 hover:text-white shadow-sm'
                }`}
              >
                {creating && activeId === tpl.id ? (
                  <>
                    <FiLoader className="animate-spin" /> Preparing...
                  </>
                ) : (
                  <>
                    <FiCheck /> Use Layout
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 glass-card p-6">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            No templates match your search criteria. Try a different filter or search term.
          </p>
        </div>
      )}
    </div>
  );
};

export default Templates;
