import api from './axiosInstance';

export const applyToJobAPI = async (data) => {
  const res = await api.post('/applications', data);
  return res.data;
};

export const getMyApplicationsAPI = async () => {
  const res = await api.get('/applications/my');
  return res.data;
};

export const getJobApplicationsAPI = async (jobId) => {
  const res = await api.get(`/applications/job/${jobId}`);
  return res.data;
};

export const getAllEmployerApplicationsAPI = async () => {
  const res = await api.get('/applications/employer/all');
  return res.data;
};

export const updateApplicationStatusAPI = async (id, status) => {
  const res = await api.patch(`/applications/${id}/status`, { status });
  return res.data;
};