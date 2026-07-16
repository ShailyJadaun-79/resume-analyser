import {
  generateSummary,
  generateBulletPoints,
  rewriteText,
  recommendSkills,
  generateCoverLetter,
  generateInterviewQuestions,
} from '../services/geminiService.js';

// @desc    Generate professional profile summary
// @route   POST /api/v1/ai/summary
// @access  Private
export const getSummarySuggestion = async (req, res, next) => {
  const { role, skills } = req.body;
  try {
    if (!role) {
      res.status(400);
      return next(new Error('Please specify a target role'));
    }
    const summary = await generateSummary(role, skills || '');
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate resume experience bullet points
// @route   POST /api/v1/ai/bullets
// @access  Private
export const getBulletSuggestions = async (req, res, next) => {
  const { role, details } = req.body;
  try {
    if (!role || !details) {
      res.status(400);
      return next(new Error('Please specify target role and task details'));
    }
    const bullets = await generateBulletPoints(role, details);
    res.status(200).json({ success: true, data: bullets });
  } catch (error) {
    next(error);
  }
};

// @desc    Rewrite/Enhance generic text
// @route   POST /api/v1/ai/improve
// @access  Private
export const getImproveSuggestions = async (req, res, next) => {
  const { text, instruction } = req.body;
  try {
    if (!text) {
      res.status(400);
      return next(new Error('Please provide text to improve'));
    }
    const result = await rewriteText(text, instruction || 'make professional');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Recommend skills
// @route   POST /api/v1/ai/skills
// @access  Private
export const getSkillsSuggestions = async (req, res, next) => {
  const { role } = req.body;
  try {
    if (!role) {
      res.status(400);
      return next(new Error('Please specify target role'));
    }
    const skills = await recommendSkills(role);
    res.status(200).json({ success: true, data: skills });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Cover Letter
// @route   POST /api/v1/ai/cover-letter
// @access  Private
export const getCoverLetterSuggestions = async (req, res, next) => {
  const { resumeData, jobDescription } = req.body;
  try {
    if (!jobDescription) {
      res.status(400);
      return next(new Error('Please specify target job description'));
    }
    const letter = await generateCoverLetter(resumeData || {}, jobDescription);
    res.status(200).json({ success: true, data: letter });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Mock Interview Questions
// @route   POST /api/v1/ai/interview
// @access  Private
export const getInterviewSuggestions = async (req, res, next) => {
  const { resumeData } = req.body;
  try {
    const questions = await generateInterviewQuestions(resumeData || {});
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
};
