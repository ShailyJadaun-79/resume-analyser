import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: String,
  startDate: String,
  endDate: String,
  current: { type: Boolean, default: false },
  description: String,
  location: String,
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  startDate: String,
  endDate: String,
  current: { type: Boolean, default: false },
  description: String,
  location: String,
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  technologies: [String],
  link: String,
});

const languageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  proficiency: { type: String, default: 'Professional' }, // e.g. Native, Fluent, Intermediate
});

const referenceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: String,
  company: String,
  email: String,
  phone: String,
});

const customSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Untitled Resume',
      trim: true,
    },
    personalInfo: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      website: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      summary: { type: String, default: '' },
    },
    education: [educationSchema],
    experience: [experienceSchema],
    internships: [experienceSchema], // Reuse experience structure for internships
    projects: [projectSchema],
    skills: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    languages: [languageSchema],
    references: [referenceSchema],
    customSections: [customSectionSchema],
    templateId: {
      type: String,
      default: 'modern',
    },
    formatting: {
      color: { type: String, default: '#4f6bff' },
      spacing: { type: String, default: 'normal' }, // tight, normal, loose
      fontSize: { type: String, default: 'md' }, // sm, md, lg
      margin: { type: String, default: 'normal' }, // compact, normal, wide
      fontFamily: { type: String, default: 'sans' }, // sans, serif, mono, outfit
    },
    atsScore: {
      type: Number,
      default: 0,
    },
    atsSuggestions: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isUploaded: {
      type: Boolean,
      default: false,
    },
    fileName: {
      type: String,
      default: '',
    },
    filePath: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    extractedText: {
      type: String,
      default: '',
    },
    fileData: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
