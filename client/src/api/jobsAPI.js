import api from './axiosInstance';

export const getJobsAPI = async (params = {}) => {
  const res = await api.get('/jobs', { params });
  return res.data;
};

export const getJobAPI = async (id) => {
  const res = await api.get(`/jobs/${id}`);
  return res.data;
};

export const createJobAPI = async (data) => {
  const res = await api.post('/jobs', data);
  return res.data;
};

export const updateJobAPI = async (id, data) => {
  const res = await api.put(`/jobs/${id}`, data);
  return res.data;
};

export const deleteJobAPI = async (id) => {
  const res = await api.delete(`/jobs/${id}`);
  return res.data;
};

export const getMyJobsAPI = async () => {
  const res = await api.get('/jobs/my');
  return res.data;
};