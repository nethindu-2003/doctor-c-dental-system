import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/auth',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add a "Request Interceptor"
// This runs before EVERY request to attach the Token
api.interceptors.request.use(
    (config) => {
        // Get token from Session Storage (saved during Login)
        const token = sessionStorage.getItem('token');
        
        // If token exists, add it to the Header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Add a "Response Interceptor" 
// If the backend says "403 Forbidden" (Token expired), force logout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 403) {
            // Token invalid/expired -> Clear storage & Redirect
            // localStorage.removeItem('token');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;