import axios from 'axios';

export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    err.userMessage = err.response?.data?.message || 'Bağlantı hatası';
    return Promise.reject(err);
  }
);

/** Basit CRUD yardımcısı — yeni modüller için tekrar kullanılabilir */
export const resource = (path) => ({
  list: (params) => api.get(path, { params }).then((r) => r.data),
  get: (id) => api.get(`${path}/${id}`).then((r) => r.data),
  create: (data) => api.post(path, data).then((r) => r.data),
  update: (id, data) => api.put(`${path}/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`${path}/${id}`),
});

export const usersApi = resource('/users');
export const classroomsApi = resource('/classrooms');
export const studentsApi = resource('/students');
export const homeworksApi = {
  ...resource('/homeworks'),
  checks: (id) => api.get(`/homeworks/${id}/checks`).then((r) => r.data),
  saveChecks: (id, rows) => api.put(`/homeworks/${id}/checks`, rows).then((r) => r.data),
};
export const lessonsApi = resource('/lessons');
export const reportsApi = {
  dashboard: () => api.get('/reports/dashboard').then((r) => r.data),
  classroom: (id) => api.get(`/reports/classroom/${id}`).then((r) => r.data),
  student: (id) => api.get(`/reports/student/${id}`).then((r) => r.data),
  overview: () => api.get('/reports/overview').then((r) => r.data),
  classroomCsv: async (id, name) => {
    const r = await api.get(`/reports/classroom/${id}/csv`, { responseType: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(r.data);
    a.download = `sinif-raporu-${name}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};
