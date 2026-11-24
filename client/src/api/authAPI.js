import api from './axiosInstance';

export const registerAPI = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const loginAPI = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const getMeAPI = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updateProfileAPI = async (data) => {
  const res = await api.patch('/auth/me', data);
  return res.data;
};

export const forgotPasswordAPI = async (email) => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
};