import axios from 'axios';

// ---------------------------------------------------------
// 1. EXISTING API INSTANCE (Untouched for other services)
// ---------------------------------------------------------
const api = axios.create({
  baseURL: 'http://localhost:8080/auth', // Kept exactly as you had it
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------
// 2. CHAT API INSTANCE (Corrected to route through Gateway)
// ---------------------------------------------------------
const chatApi = axios.create({
  baseURL: 'http://localhost:8080', // <-- Changed from 8082 to 8080
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------
// REQUEST INTERCEPTORS (Attach Tokens)
// ---------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

chatApi.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------
// RESPONSE INTERCEPTORS (Handle Expired Tokens)
// ---------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

chatApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { chatApi };