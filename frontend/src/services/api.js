import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
});

const getTicketToken = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ticket = urlParams.get('ticketchecker');
  if (ticket) {
    sessionStorage.setItem('ticketchecker', ticket);
    return ticket;
  }
  return sessionStorage.getItem('ticketchecker') || '';
};

api.interceptors.request.use(config => {
  config.headers['X-App-Token'] = getTicketToken();
  return config;
});

export default api;
