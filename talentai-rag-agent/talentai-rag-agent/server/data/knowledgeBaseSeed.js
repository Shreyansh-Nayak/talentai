/**
 * Seed content for the KnowledgeBase collection - platform FAQs/policies
 * that the RAG pipeline retrieves for "how does X work" style questions.
 * Run via: node scripts/seedKnowledgeBase.js
 */
module.exports = [
  {
    category: 'ats',
    title: 'How does the ATS resume score work?',
    content:
      'The ATS Resume Scorer compares your resume text against a specific job description using an LLM. ' +
      'It returns a score from 0-100 based on keyword overlap, relevant skills, and phrasing, plus a list ' +
      'of matched keywords, missing keywords, and prioritized suggestions (critical, warning, success) to ' +
      'improve your match. It is meant to approximate how a real Applicant Tracking System would filter your resume.',
  },
  {
    category: 'seeker',
    title: 'How does the AI Job Match score work?',
    content:
      'Job Match compares your candidate profile (skills, experience, title) against a job description and ' +
      'returns a 0-100 match score, the top reasons you are a good fit, and any skills you are missing. ' +
      'It is generated per-job and updates whenever you update your profile.',
  },
  {
    category: 'seeker',
    title: 'How does Resume Bullet Enhancer work?',
    content:
      'Paste your existing resume bullet points along with a target role and industry. The AI rewrites each ' +
      'bullet to start with a strong action verb, add measurable impact where possible, and use role-relevant ' +
      'keywords, while keeping each bullet to one or two lines.',
  },
  {
    category: 'seeker',
    title: 'How does Interview Prep work?',
    content:
      'Interview Prep generates a set of interview questions tailored to a role, company, and interview type ' +
      '(e.g. Technical, Behavioral). Each question comes with a preparation tip and a sample answer framework ' +
      'to help you structure your response.',
  },
  {
    category: 'employer',
    title: 'How does the Job Description Generator work?',
    content:
      'Employers give a job title plus optional skills, experience level, and tone. The AI writes a full, ' +
      'bias-free job description with sections for the role summary, responsibilities, requirements, nice-to-haves, ' +
      'and benefits, under 400 words.',
  },
  {
    category: 'employer',
    title: 'How do I verify my company on TalentAI?',
    content:
      'Company verification (the isVerified badge shown next to a company name) is currently managed by ' +
      'TalentAI admins. Once your company profile is reviewed and confirmed legitimate, it is marked verified, ' +
      'which increases trust with job seekers browsing your listings.',
  },
  {
    category: 'platform',
    title: 'How do I apply to a job?',
    content:
      'From a job listing, click Apply and submit your resume along with an optional cover note. You can track ' +
      'the status of every application (applied, under review, shortlisted, interview, rejected, or hired) from ' +
      'your Applications page.',
  },
  {
    category: 'platform',
    title: 'How do I post a job as an employer?',
    content:
      'Employers use the Post Job page to create a listing with a title, description, required skills, salary ' +
      'range, location, job type, and experience level. Listings can be edited or closed at any time from My Jobs.',
  },
  {
    category: 'account',
    title: 'What are the different account roles on TalentAI?',
    content:
      'TalentAI has three account roles: seeker (job seekers who browse and apply to jobs), employer (who post ' +
      'and manage job listings and review applicants), and admin (who oversee users, jobs, and platform analytics).',
  },
  {
    category: 'general',
    title: 'What is TalentAI?',
    content:
      'TalentAI is an AI-powered job portal connecting job seekers and employers, with built-in AI tools for ' +
      'resume scoring, resume enhancement, interview preparation, job description generation, and job matching, ' +
      'plus a conversational assistant that can answer questions about the platform, jobs, and companies.',
  },
];
