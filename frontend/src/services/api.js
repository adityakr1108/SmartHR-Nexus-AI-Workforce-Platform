import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401 and token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh-token');
        const newToken = data.accessToken;
        localStorage.setItem('accessToken', newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API service helpers
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  uploadAvatar: (id, file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return api.post(`/employees/${id}/avatar`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const departmentAPI = {
  getAll: () => api.get('/departments'),
};


export const attendanceAPI = {
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: (data) => api.post('/attendance/checkout', data),
  getToday: () => api.get('/attendance/today'),
  getHistory: (params) => api.get('/attendance', { params }),
  getReport: (params) => api.get('/attendance/report', { params }),
};

export const payrollAPI = {
  getAll: (params) => api.get('/payroll', { params }),
  getById: (id) => api.get(`/payroll/${id}`),
  process: (data) => api.post('/payroll/process', data),
  approve: (id) => api.patch(`/payroll/${id}/approve`),
  generatePayslip: (id) => api.get(`/payroll/${id}/payslip`, { responseType: 'blob' }),
};

export const recruitmentAPI = {
  getJobs: (params) => api.get('/recruitment/jobs', { params }),
  createJob: (data) => api.post('/recruitment/jobs', data),
  updateJob: (id, data) => api.put(`/recruitment/jobs/${id}`, data),
  getApplications: (params) => api.get('/recruitment/applications', { params }),
  applyJob: (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v));
    return api.post('/recruitment/applications', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  updateStage: (id, data) => api.patch(`/recruitment/applications/${id}/stage`, data),
  getPipelineStats: () => api.get('/recruitment/pipeline/stats'),
};

export const performanceAPI = {
  getReviews: (params) => api.get('/performance', { params }),
  createReview: (data) => api.post('/performance', data),
  updateReview: (id, data) => api.put(`/performance/${id}`, data),
  submitSelfAssessment: (id, data) => api.post(`/performance/${id}/self-assessment`, data),
};

export const aiAPI = {
  chat: (messages) => api.post('/ai/chat', { messages }),
  getPerformanceInsights: (data) => api.post('/ai/performance-insights', data),
  optimizePayroll: (data) => api.post('/ai/payroll-optimize', data),
};

export const dashboardAPI = {
  getAdminStats: () => api.get('/dashboard/admin'),
  getManagerStats: () => api.get('/dashboard/manager'),
  getEmployeeStats: () => api.get('/dashboard/employee'),
};

export const leaveAPI = {
  getAll: (params) => api.get('/leaves', { params }),
  create: (data) => api.post('/leaves', data),
  approve: (id, data) => api.patch(`/leaves/${id}/approve`, data),
  reject: (id, data) => api.patch(`/leaves/${id}/reject`, data),
};

export default api;
