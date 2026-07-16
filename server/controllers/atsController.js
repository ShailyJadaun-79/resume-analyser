import { analyzeATSWithAI } from '../services/geminiService.js';

// List of strong action verbs for resume bullet points
const STRONG_ACTION_VERBS = new Set([
  'led', 'designed', 'engineered', 'implemented', 'developed', 'managed',
  'built', 'created', 'architected', 'optimized', 'reduced', 'increased',
  'spearheaded', 'accelerated', 'integrated', 'automated', 'improved',
  'launched', 'directed', 'coordinated', 'formulated', 'established',
  'overhauled', 'facilitated', 'maximized', 'minimized', 'programmed',
  'solved', 'deployed', 'collaborated', 'analyzed', 'reviewed'
]);

// List of standard developer skills keywords
const TECH_KEYWORDS = [
  'javascript', 'typescript', 'react', 'node', 'express', 'mongodb', 'mongoose',
  'sql', 'postgres', 'python', 'java', 'html', 'css', 'git', 'docker', 'aws',
  'agile', 'scrum', 'rest api', 'graphql', 'redux', 'tailwind', 'bootstrap',
  'ci/cd', 'testing', 'jest', 'kubernetes', 'gcp', 'next.js', 'vue', 'angular'
];

// Helper to extract all text content from a resume object
const extractResumeText = (resume) => {
  if (resume.isUploaded && resume.extractedText) {
    return resume.extractedText.toLowerCase();
  }
  let text = '';
  
  if (resume.personalInfo) {
    text += ` ${resume.personalInfo.name || ''} ${resume.personalInfo.summary || ''}`;
  }
  
  if (resume.skills && Array.isArray(resume.skills)) {
    text += ` ${resume.skills.join(' ')}`;
  }
  
  if (resume.experience && Array.isArray(resume.experience)) {
    resume.experience.forEach(exp => {
      text += ` ${exp.position || ''} ${exp.company || ''} ${exp.description || ''}`;
    });
  }

  if (resume.internships && Array.isArray(resume.internships)) {
    resume.internships.forEach(intern => {
      text += ` ${intern.position || ''} ${intern.company || ''} ${intern.description || ''}`;
    });
  }
  
  if (resume.projects && Array.isArray(resume.projects)) {
    resume.projects.forEach(proj => {
      text += ` ${proj.name || ''} ${proj.description || ''} ${(proj.technologies || []).join(' ')}`;
    });
  }

  if (resume.education && Array.isArray(resume.education)) {
    resume.education.forEach(edu => {
      text += ` ${edu.school || ''} ${edu.degree || ''} ${edu.fieldOfStudy || ''} ${edu.description || ''}`;
    });
  }
  
  return text.toLowerCase();
};

// @desc    Calculate ATS Score and provide section suggestions
// @route   POST /api/v1/ats/score
// @access  Private
export const getATSAnalysis = async (req, res, next) => {
  const { resume } = req.body;

  try {
    if (!resume) {
      res.status(400);
      return next(new Error('Please provide resume details to check'));
    }

    const resumeText = extractResumeText(resume);

    // Try AI-based analysis first if API key is active
    const aiAnalysis = await analyzeATSWithAI(resumeText, '');
    if (aiAnalysis) {
      return res.status(200).json({
        success: true,
        data: aiAnalysis
      });
    }

    let score = 100;
    const formattingIssues = [];
    const grammarAnalysis = [];
    const weakBullets = [];
    const suggestions = [];
    
    // 1. Evaluate Personal Information section
    if (!resume.personalInfo?.name) {
      score -= 10;
      formattingIssues.push('Missing Candidate Name. Standard ATS files require full name headings.');
    }
    if (!resume.personalInfo?.email) {
      score -= 10;
      formattingIssues.push('Missing contact email. Recruiters will be unable to message you.');
    }
    if (!resume.personalInfo?.phone) {
      score -= 5;
      formattingIssues.push('Missing phone number.');
    }

    // 2. Evaluate Summary section
    if (!resume.personalInfo?.summary || resume.personalInfo.summary.length < 50) {
      score -= 10;
      suggestions.push('Add a professional summary block. Focus on your expertise and 1-2 key achievements (minimum 50 characters).');
    }

    // 3. Evaluate Skills section
    if (!resume.skills || resume.skills.length === 0) {
      score -= 15;
      suggestions.push('Add technical and soft skills. ATS software uses these keywords to index your profile.');
    } else if (resume.skills.length < 5) {
      score -= 5;
      suggestions.push('List at least 5 core technical skills to pass index density filters.');
    }

    // 4. Evaluate Experience and Bullet Points
    if (!resume.experience || resume.experience.length === 0) {
      score -= 15;
      suggestions.push('Add professional work experience. This is the most heavily weighted section.');
    } else {
      resume.experience.forEach((exp, idx) => {
        const desc = exp.description || '';
        
        // Check formatting - length
        if (desc.length < 20) {
          score -= 3;
          formattingIssues.push(`Job description at ${exp.company || 'Job #' + (idx + 1)} is too short. Add details.`);
        }
        
        // Bullet verbs check
        const bullets = desc.split('\n').map(b => b.trim().replace(/^[-•*+]\s*/, '')).filter(Boolean);
        bullets.forEach(bullet => {
          const firstWord = bullet.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
          if (firstWord && !STRONG_ACTION_VERBS.has(firstWord)) {
            weakBullets.push(`"${bullet.slice(0, 50)}..." at ${exp.company} starts with "${firstWord}". Use strong action verbs like 'Engineered', 'Developed', or 'Led' instead.`);
          }
        });
      });
    }

    // 5. Keyword Density Analysis
    const keywordsFound = {};
    TECH_KEYWORDS.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'g');
      const count = (resumeText.match(regex) || []).length;
      if (count > 0) {
        keywordsFound[kw] = count;
      }
    });

    // Score deduction cap
    if (weakBullets.length > 0) {
      score -= Math.min(weakBullets.length * 2, 10);
    }
    
    res.status(200).json({
      success: true,
      data: {
        score: Math.max(score, 10), // Floor score at 10
        formattingAnalysis: formattingIssues,
        grammarAnalysis,
        weakBulletPoints: weakBullets,
        suggestions,
        keywordDensity: keywordsFound
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare Resume against Job Description
// @route   POST /api/v1/ats/match
// @access  Private
export const getJobMatch = async (req, res, next) => {
  const { resume, jobDescription } = req.body;

  try {
    if (!resume || !jobDescription) {
      res.status(400);
      return next(new Error('Please provide resume details and target job description'));
    }

    const resumeText = extractResumeText(resume);
    const jobText = jobDescription.toLowerCase();
    
    // Extract keywords present in the Job Description
    const detectedJobKeywords = TECH_KEYWORDS.filter(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(jobText);
    });

    if (detectedJobKeywords.length === 0) {
      // If no tech keywords found in JD, fall back to standard terms
      return res.status(200).json({
        success: true,
        data: {
          matchPercentage: 70,
          matchedKeywords: [],
          missingKeywords: [],
          suggestions: ['The job description did not contain recognizable engineering keywords. Ensure you paste the full job description.']
        }
      });
    }

    // Identify which keywords are matched and which are missing
    const matchedKeywords = [];
    const missingKeywords = [];

    detectedJobKeywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(resumeText)) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    const matchPercentage = Math.round((matchedKeywords.length / detectedJobKeywords.length) * 100);
    
    // Formulate improvement recommendations
    const suggestions = [];
    if (missingKeywords.length > 0) {
      suggestions.push(`Integrate missing technical skills: ${missingKeywords.slice(0, 5).join(', ')} into your skills profile or project descriptions.`);
    }
    if (matchPercentage < 60) {
      suggestions.push('Resume compatibility is currently low. Rewrite resume bullet points to target the requirements of the job description.');
    } else {
      suggestions.push('High match compatibility! Standardize spelling and fonts before exporting.');
    }

    res.status(200).json({
      success: true,
      data: {
        matchPercentage,
        matchedKeywords,
        missingKeywords,
        suggestions
      }
    });
  } catch (error) {
    next(error);
  }
};
