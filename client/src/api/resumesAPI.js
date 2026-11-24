import api from './axiosInstance';

export const uploadResumeAPI = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const res = await api.post('/resumes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // { id, fileName, uploadedAt }
};

export const getMyResumeUrlAPI = async () => {
  const res = await api.get('/resumes/my-url');
  return res.data; // { url, fileName, expiresIn }
};

export const deleteMyResumeAPI = async () => {
  const res = await api.delete('/resumes');
  return res.data;
};
export const getApplicantResumeUrlAPI = async (applicationId) => {
  const res = await api.get(`/resumes/application/${applicationId}`);
  return res.data; // { url, fileName, expiresIn }
};
export const getMyResumeTextAPI = async () => {
  const res = await api.get('/resumes/my-text');
  return res.data; // { text, fileName }
};