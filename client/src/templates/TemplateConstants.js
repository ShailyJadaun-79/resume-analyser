export const TEMPLATE_CATEGORIES = ['All', 'Modern', 'Executive', 'Entry Level', 'Tech', 'Business', 'Creative'];

export const STATIC_TEMPLATES = [
  // Modern
  { id: 't1', name: 'Modern ATS', slug: 'modern-ats', category: 'Modern', isPremium: false, desc: 'Clean, parsable layout with a modern bold header.' },
  { id: 't2', name: 'Professional', slug: 'professional', category: 'Modern', isPremium: false, desc: 'Centered, serif typography for traditional roles.' },
  { id: 't3', name: 'Corporate', slug: 'corporate', category: 'Modern', isPremium: false, desc: 'Tracking wide uppercase headers for a structured corporate feel.' },
  { id: 't4', name: 'Minimal', slug: 'minimal', category: 'Modern', isPremium: false, desc: 'Lightweight and elegant minimalist design.' },

  // Executive
  { id: 't5', name: 'Executive', slug: 'executive', category: 'Executive', isPremium: true, desc: 'Premium serif typography with clear demarcations for C-Suite.' },
  { id: 't6', name: 'MBA', slug: 'mba', category: 'Executive', isPremium: false, desc: 'High-impact layout optimized for business school graduates.' },

  // Entry Level
  { id: 't7', name: 'Fresher', slug: 'fresher', category: 'Entry Level', isPremium: false, desc: 'Optimized for candidates with entry-level experience.' },
  { id: 't8', name: 'Student', slug: 'student', category: 'Entry Level', isPremium: false, desc: 'Focuses heavily on education and projects.' },
  { id: 't9', name: 'Two Column', slug: 'two-column', category: 'Entry Level', isPremium: false, desc: 'Compact split layout for maximizing single page space.' },

  // Tech
  { id: 't10', name: 'Software Engineer', slug: 'software-engineer', category: 'Tech', isPremium: false, desc: 'Mono font details emphasizing tech stacks and GitHub.' },
  { id: 't11', name: 'Data Analyst', slug: 'data-analyst', category: 'Tech', isPremium: false, desc: 'Clean layout focusing on metrics and business impact.' },

  // Creative
  { id: 't12', name: 'Creative', slug: 'creative', category: 'Creative', isPremium: true, desc: 'Gradient headers and unique styling for design roles.' },
  { id: 't13', name: 'UI/UX Designer', slug: 'ui-ux-designer', category: 'Creative', isPremium: false, desc: 'Italic accents and clean spacing tailored for designers.' },

  // Business / Management
  { id: 't14', name: 'Product Manager', slug: 'product-manager', category: 'Business', isPremium: false, desc: 'Tight tracking to fit complex product histories.' },
  { id: 't15', name: 'Marketing', slug: 'marketing', category: 'Business', isPremium: false, desc: 'Bold, central focus for marketing professionals.' },
  { id: 't16', name: 'Sales', slug: 'sales', category: 'Business', isPremium: false, desc: 'Impact-driven layout to showcase revenue numbers.' },
  { id: 't17', name: 'Finance', slug: 'finance', category: 'Business', isPremium: false, desc: 'Traditional, rigid formatting trusted by banks.' },
  { id: 't18', name: 'HR', slug: 'hr', category: 'Business', isPremium: false, desc: 'Empathetic, clear, and readable structure.' },

  // Others
  { id: 't19', name: 'Teacher', slug: 'teacher', category: 'Entry Level', isPremium: false, desc: 'Serif academic layout for education professionals.' },
  { id: 't20', name: 'Healthcare', slug: 'healthcare', category: 'Modern', isPremium: false, desc: 'Clean, trustworthy design for medical professionals.' }
];
