import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient = null;

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isDummyKey = !apiKey || apiKey === 'dummy' || apiKey.startsWith('your_') || apiKey.trim() === '';

  if (isDummyKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Gemini Service] Run Mode: 🧪 Simulated Mock Mode (No valid GEMINI_API_KEY detected)');
    }
    return null;
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
};

// --- MOCK SIMULATED AI RESPONSES FOR DEVELOPMENT ---
const getMockResponse = (type, promptContext = '') => {
  if (type === 'summary') {
    return 'Results-driven professional with a proven track record of designing, building, and deploying scalable software systems. Adept at leveraging modern technology stacks to optimize performance, collaborate with cross-functional teams, and deliver robust software architectures that align with business objectives.';
  }
  
  if (type === 'bullets') {
    return [
      'Engineered and deployed modular cloud systems, improving overall system throughput and reliability by 27%.',
      'Collaborated closely with product teams to design modern, intuitive user interfaces that enhanced customer satisfaction by 15%.',
      'Refactored legacy codebases to apply clean architectural patterns, decreasing database query latency and technical debt.',
      'Participated in agile ceremonies, contributing to sprint planning, codebase audits, and CI/CD pipeline deployments.'
    ].join('\n');
  }

  if (type === 'skills') {
    return 'React.js, Node.js, Express.js, TypeScript, Next.js, MongoDB, RESTful APIs, Git, Docker, CI/CD, Agile Methodology';
  }

  if (type === 'cover-letter') {
    return `Dear Hiring Manager,

I am writing to express my strong interest in the open position. With a background in building scalable web applications and optimizing software architectures, I am confident in my ability to make an immediate impact on your engineering team.

My technical background aligns well with the requirements listed in your job description. I look forward to the opportunity to discuss how my skills and experience can contribute to the success of your organization.

Sincerely,
Job Applicant`;
  }

  if (type === 'interview') {
    return [
      '1. Can you describe a challenging technical problem you solved, and the architecture you chose to address it?',
      '2. How do you approach optimizing database queries and caching in an Express/MongoDB stack?',
      '3. Tell me about a time you had to learn a new framework or technology quickly. What was your process?'
    ].join('\n');
  }

  return `Simulated AI suggestion based on your input: "${promptContext.slice(0, 100)}..."`;
};

// --- CORE GEMINI AI SERVICES ---

// 1. Generate Summary
export const generateSummary = async (role, skills) => {
  const client = getGeminiClient();
  const prompt = `Write a professional 3-4 sentence resume summary profile for a developer specializing in ${role} with skills in ${skills}. Focus on value, achievements, and impact. Do not include markdown formatting.`;

  if (!client) {
    return getMockResponse('summary', `${role} - ${skills}`);
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('[Gemini Service Summary Error]:', error.message);
    return getMockResponse('summary', `${role} - ${skills}`);
  }
};

// 2. Generate Bullet Points
export const generateBulletPoints = async (role, details) => {
  const client = getGeminiClient();
  const prompt = `Generate 4 professional, results-oriented resume bullet points for a ${role} position. Detail elements: ${details}. Write using active action verbs and quantify metrics if possible. Do not include markdown formatting.`;

  if (!client) {
    return getMockResponse('bullets', `${role} - ${details}`);
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('[Gemini Service Bullets Error]:', error.message);
    return getMockResponse('bullets', `${role} - ${details}`);
  }
};

// 3. Improve / Rewrite Text
export const rewriteText = async (text, instruction) => {
  const client = getGeminiClient();
  const prompt = `Rewrite the following resume text to make it more professional, impactful, and grammatical. Goal instruction: ${instruction}. Original text: "${text}"`;

  if (!client) {
    return `Enhanced text: Improved and optimized for professional clarity. "${text}"`;
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('[Gemini Service Improve Error]:', error.message);
    return `Enhanced text: "${text}"`;
  }
};

// 4. Skills Recommendation
export const recommendSkills = async (role) => {
  const client = getGeminiClient();
  const prompt = `Recommend a comma-separated list of 10 modern technical skills and frameworks that are highly sought after for a ${role} role. Return ONLY the comma-separated skills, no extra text.`;

  if (!client) {
    return getMockResponse('skills', role);
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('[Gemini Service Skills Error]:', error.message);
    return getMockResponse('skills', role);
  }
};

// 5. Cover Letter Generator
export const generateCoverLetter = async (resumeData, jobDescription) => {
  const client = getGeminiClient();
  const prompt = `Write a professional cover letter for a job application.
    Resume Details: ${JSON.stringify(resumeData)}
    Target Job Description: ${jobDescription}`;

  if (!client) {
    return getMockResponse('cover-letter', jobDescription);
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('[Gemini Service Cover Letter Error]:', error.message);
    return getMockResponse('cover-letter', jobDescription);
  }
};

// 6. Interview Questions Generator
export const generateInterviewQuestions = async (resumeData) => {
  const client = getGeminiClient();
  const prompt = `Review this candidate profile and suggest 3 customized technical and situational behavioral interview questions with brief answer guidance hints. Profile: ${JSON.stringify(resumeData)}`;

  if (!client) {
    return getMockResponse('interview');
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('[Gemini Service Interview Error]:', error.message);
    return getMockResponse('interview');
  }
};

// 7. Gemini-powered ATS Score Scorer
export const analyzeATSWithAI = async (resumeText, jobDescription) => {
  const client = getGeminiClient();
  const prompt = `Perform a comprehensive ATS optimization audit on this candidate resume text.
    Resume Content: "${resumeText}"
    Target Job Description: "${jobDescription || 'Standard software engineering role'}"
    
    Respond STRICTLY in JSON format with the following fields:
    {
      "score": number (0-100),
      "formattingAnalysis": string[],
      "weakBulletPoints": string[],
      "suggestions": string[],
      "keywordDensity": { [key: string]: number },
      "matchedKeywords": string[],
      "missingKeywords": string[]
    }`;

  if (!client) {
    return null;
  }

  try {
    const model = client.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text().trim());
  } catch (error) {
    console.error('[Gemini ATS Scorer Error]:', error.message);
    return null;
  }
};
