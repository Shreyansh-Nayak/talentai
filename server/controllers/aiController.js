const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper to call Groq
const callGroq = async (prompt, jsonMode = true) => {
  const response = await groq.chat.completions.create({
    model:    'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
    temperature: 0.7,
    ...(jsonMode && { response_format: { type: 'json_object' } }),
  });
  return response.choices[0].message.content;
};

// 1. ATS Resume Scorer
exports.atsScore = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: 'Resume and job description required' });
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer.
Compare this resume against the job description carefully.
Return ONLY valid JSON with this exact structure, no extra text:
{
  "score": <number between 0 and 100>,
  "matched": ["keyword1", "keyword2"],
  "missing": ["missing1", "missing2"],
  "suggestions": [
    {
      "type": "critical",
      "title": "short title",
      "desc": "detailed description"
    },
    {
      "type": "warning",
      "title": "short title",
      "desc": "detailed description"
    },
    {
      "type": "success",
      "title": "short title",
      "desc": "detailed description"
    }
  ]
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

    const raw    = await callGroq(prompt, true);
    const result = JSON.parse(raw);
    res.json(result);

  } catch (err) {
    console.error('ATS Error:', err.message);
    res.status(500).json({ message: 'AI analysis failed. Try again.' });
  }
};

// 2. Resume Bullet Enhancer
exports.enhanceResume = async (req, res) => {
  try {
    const { bullets, targetRole, industry } = req.body;

    if (!bullets) {
      return res.status(400).json({ message: 'Bullet points required' });
    }

    const prompt = `You are an expert resume writer specializing in tech resumes.
Rewrite these resume bullet points for a ${targetRole || 'Software Engineer'} role in the ${industry || 'tech'} industry.

Rules:
- Start each bullet with a strong action verb (Engineered, Architected, Optimized, etc.)
- Add specific metrics and numbers wherever possible
- Use industry-relevant keywords
- Keep each bullet to 1-2 lines maximum
- Sound professional and impactful

Return ONLY valid JSON with no extra text:
{
  "enhanced": [
    "Enhanced bullet point 1",
    "Enhanced bullet point 2"
  ]
}

ORIGINAL BULLETS:
${bullets}`;

    const raw    = await callGroq(prompt, true);
    const result = JSON.parse(raw);
    res.json(result);

  } catch (err) {
    console.error('Enhance Error:', err.message);
    res.status(500).json({ message: 'Enhancement failed. Try again.' });
  }
};

// 3. Interview Question Generator
exports.interviewPrep = async (req, res) => {
  try {
    const { role, company, type } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const prompt = `You are an expert technical interviewer at a top tech company.
Generate 4 ${type || 'Technical'} interview questions for a ${role} position at a ${company || 'top tech'} company.

For each question provide:
- A clear, specific interview question
- A preparation tip for the candidate
- A brief sample answer framework

Return ONLY valid JSON with no extra text:
{
  "questions": [
    {
      "q": "interview question here",
      "tip": "preparation tip here",
      "answer": "sample answer framework here"
    }
  ]
}`;

    const raw    = await callGroq(prompt, true);
    const result = JSON.parse(raw);
    res.json(result);

  } catch (err) {
    console.error('Interview Error:', err.message);
    res.status(500).json({ message: 'Question generation failed. Try again.' });
  }
};

// 4. Job Description Generator
exports.generateJD = async (req, res) => {
  try {
    const { title, skills, experience, tone } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Job title is required' });
    }

    const prompt = `Write a compelling, bias-free job description for a ${title} role.

Details:
- Required Skills: ${skills || 'relevant technical skills'}
- Experience: ${experience || '3+'} years
- Tone: ${tone || 'Professional'}

Structure the JD with these sections:
1. About the Role (2-3 sentences)
2. What You'll Do (5 bullet points)
3. What We're Looking For (5 bullet points)
4. Nice to Have (3 bullet points)
5. What We Offer (3 bullet points)

Keep it under 400 words. Make it engaging, inclusive and free of bias.
Return only the job description text, no JSON needed.`;

    const result = await callGroq(prompt, false);
    res.json({ description: result });

  } catch (err) {
    console.error('JD Error:', err.message);
    res.status(500).json({ message: 'JD generation failed. Try again.' });
  }
};

// 5. Job Match Score
exports.jobMatch = async (req, res) => {
  try {
    const { jobDescription, userProfile } = req.body;

    if (!jobDescription || !userProfile) {
      return res.status(400).json({ message: 'Job description and profile required' });
    }

    const prompt = `You are an AI job matching engine.
Rate how well this candidate profile matches the job description on a scale of 0-100.

Return ONLY valid JSON with no extra text:
{
  "matchScore": <number 0-100>,
  "reasons": ["reason1", "reason2", "reason3"],
  "missingSkills": ["skill1", "skill2"]
}

CANDIDATE PROFILE:
${JSON.stringify(userProfile)}

JOB DESCRIPTION:
${jobDescription}`;

    const raw    = await callGroq(prompt, true);
    const result = JSON.parse(raw);
    res.json(result);

  } catch (err) {
    console.error('Match Error:', err.message);
    res.status(500).json({ message: 'Job matching failed. Try again.' });
  }
};