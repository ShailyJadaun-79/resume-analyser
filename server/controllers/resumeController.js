import Resume from '../models/resumeModel.js';
import { extractTextFromBuffer } from '../utils/textExtractor.js';

// @desc    Create a new resume
// @route   POST /api/v1/resumes
// @access  Private
export const createResume = async (req, res, next) => {
  try {
    const { title, templateId, resumeData } = req.body;

    const resume = await Resume.create({
      userId: req.user._id,
      title: title || 'My Resume',
      templateId: templateId || 'modern',
      personalInfo: resumeData?.personalInfo || {
        name: req.user.name,
        email: req.user.email,
        phone: '',
        location: '',
        website: '',
        github: '',
        linkedin: '',
        summary: '',
      },
      experience: resumeData?.experience || [],
      education: resumeData?.education || [],
      projects: resumeData?.projects || [],
      skills: resumeData?.skills || [],
      certifications: resumeData?.certifications || [],
      languages: resumeData?.languages || [],
      achievements: resumeData?.achievements || [],
      references: resumeData?.references || []
    });

    res.status(201).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all resumes for logged-in user
// @route   GET /api/v1/resumes
// @access  Private
export const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('title templateId atsScore isPublic isUploaded fileName fileType fileSize updatedAt createdAt')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single resume by ID
// @route   GET /api/v1/resumes/:id
// @access  Private (or Public if sharing is enabled)
export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      res.status(404);
      return next(new Error('Resume not found'));
    }

    // Check ownership
    if (resume.userId.toString() !== req.user._id.toString() && !resume.isPublic) {
      res.status(403);
      return next(new Error('Access denied: You do not own this resume'));
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a resume
// @route   PUT /api/v1/resumes/:id
// @access  Private
export const updateResume = async (req, res, next) => {
  try {
    let resume = await Resume.findById(req.params.id);

    if (!resume) {
      res.status(404);
      return next(new Error('Resume not found'));
    }

    // Check ownership
    if (resume.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied: You do not own this resume'));
    }

    // Exclude userId and fields that shouldn't be overridden directly
    const updateData = { ...req.body };
    delete updateData.userId;

    resume = await Resume.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resume
// @route   DELETE /api/v1/resumes/:id
// @access  Private
export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      res.status(404);
      return next(new Error('Resume not found'));
    }

    // Check ownership
    if (resume.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied: You do not own this resume'));
    }

    await resume.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public shared resume (unauthenticated access)
// @route   GET /api/v1/resumes/share/:id
// @access  Public
export const getPublicResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume || !resume.isPublic) {
      res.status(404);
      return next(new Error('Shared resume not found or access is set to private'));
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a new resume (PDF/DOCX)
// @route   POST /api/v1/resumes/upload
// @access  Private
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('Please upload a file'));
    }

    const { originalname, buffer, size, mimetype } = req.file;
    const fileType = originalname.split('.').pop().toLowerCase();
    
    if (fileType !== 'pdf' && fileType !== 'docx') {
      res.status(400);
      return next(new Error('Unsupported file format. Please upload a PDF or DOCX file.'));
    }

    // Extract text
    const extractedText = await extractTextFromBuffer(buffer, mimetype);

    // Convert file to base64
    const fileDataBase64 = buffer.toString('base64');

    const resume = await Resume.create({
      userId: req.user._id,
      title: originalname || 'Uploaded Resume',
      isUploaded: true,
      fileName: originalname,
      fileType,
      fileSize: size,
      fileData: fileDataBase64,
      extractedText,
      personalInfo: {
        name: req.user.name,
        email: req.user.email,
        summary: extractedText.slice(0, 500) // basic fallback
      }
    });

    res.status(201).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Replace an existing uploaded resume
// @route   PUT /api/v1/resumes/upload/:id
// @access  Private
export const replaceUploadedResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('Please upload a replacement file'));
    }

    let resume = await Resume.findById(req.params.id);
    if (!resume) {
      res.status(404);
      return next(new Error('Resume not found'));
    }

    // Check ownership
    if (resume.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied: You do not own this resume'));
    }

    const { originalname, buffer, size, mimetype } = req.file;
    const fileType = originalname.split('.').pop().toLowerCase();
    
    if (fileType !== 'pdf' && fileType !== 'docx') {
      res.status(400);
      return next(new Error('Unsupported file format. Please upload a PDF or DOCX file.'));
    }

    // Extract text
    const extractedText = await extractTextFromBuffer(buffer, mimetype);

    // Convert file to base64
    const fileDataBase64 = buffer.toString('base64');

    resume.title = originalname;
    resume.fileName = originalname;
    resume.fileType = fileType;
    resume.fileSize = size;
    resume.fileData = fileDataBase64;
    resume.extractedText = extractedText;
    resume.isUploaded = true;
    
    // Save
    await resume.save();

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};
