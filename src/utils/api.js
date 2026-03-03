import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.status, error.response?.data);

        // Only redirect to login if token is actually invalid
        // Don't redirect on authorization errors (403) or other issues
        if (error.response?.status === 401) {
            const errorMessage = error.response?.data?.message?.toLowerCase() || '';

            // Only redirect if it's a token validation issue
            if (errorMessage.includes('token') || errorMessage.includes('authentication')) {
                console.log('Token invalid, redirecting to login...');
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Only redirect if not already on login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getCurrentUser: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

// Course API
export const courseAPI = {
    create: (data) => api.post('/courses', data),
    getAll: () => api.get('/courses'),
    getById: (id) => api.get(`/courses/${id}`),
    update: (id, data) => api.put(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`),
};

// Attendance API
export const attendanceAPI = {
    mark: (data) => api.post('/attendance/mark', data),
    getRecords: (params) => api.get('/attendance/records', { params }),
    getStudentAttendance: (id, params) => api.get(`/attendance/student/${id}`, { params }),
    getCourseAttendance: (id) => api.get(`/attendance/course/${id}`),
    getStats: (params) => api.get('/attendance/stats', { params }),
};

export default api;
