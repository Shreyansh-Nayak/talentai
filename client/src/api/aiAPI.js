import api from './axiosInstance';

export const getATSScoreAPI = async (resumeText, jobDescription) => {
  const res = await api.post('/ai/ats-score', { resumeText, jobDescription });
  return res.data;
};

export const enhanceResumeAPI = async (bullets, targetRole, industry) => {
  const res = await api.post('/ai/enhance-resume', { bullets, targetRole, industry });
  return res.data;
};

export const getInterviewQuestionsAPI = async (role, company, type) => {
  const res = await api.post('/ai/interview-prep', { role, company, type });
  return res.data;
};

export const generateJDAPI = async (data) => {
  const res = await api.post('/ai/generate-jd', data);
  return res.data;
};

export const getJobMatchAPI = async (jobDescription, userProfile) => {
  const res = await api.post('/ai/job-match', { jobDescription, userProfile });
  return res.data;
};