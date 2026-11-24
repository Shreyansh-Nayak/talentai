import api from './axiosInstance';

// Send a message to the platform agent. Pass the current sessionId (if any)
// so the conversation continues server-side instead of starting fresh.
export const sendAgentMessageAPI = async (message, sessionId) => {
  const res = await api.post('/agent/chat', { message, sessionId });
  return res.data; // { sessionId, reply, toolTrace }
};

export const getAgentSessionsAPI = async () => {
  const res = await api.get('/agent/sessions');
  return res.data;
};

export const getAgentSessionAPI = async (id) => {
  const res = await api.get(`/agent/sessions/${id}`);
  return res.data;
};
