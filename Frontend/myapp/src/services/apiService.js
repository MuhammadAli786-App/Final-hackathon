import axios from 'axios'

const API_BASE_URL = 'https://final-hakathon-backend-production.up.railway.app/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

// Handle errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token')
//       localStorage.removeItem('user')
//       window.location.href = '/login'
//     }
//     return Promise.reject(error)
//   }
// )
// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      // Unauthorized → logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (status === 403) {
      // Forbidden → just show alert, don't logout
      alert(error.response?.data?.message || "You do not have access to this feature.");
    }

    return Promise.reject(error);
  }
);
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (data) => api.post('/auth/signup', data),
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

export const patientService = {
  create: (data) => api.post('/patients', data),
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`)
}

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getByRole: (role) => api.get('/users', { params: { role } }),
  getById: (id) => api.get(`/users/${id}`)
}

export const appointmentService = {
  create: (data) => api.post('/appointments', data),
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`)
}

export const prescriptionService = {
  create: (data) => api.post('/prescriptions', data),
  getById: (id) => api.get(`/prescriptions/${id}`),
  getPdf: (id) => api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' }),
  explain: (id) => api.post(`/prescriptions/${id}/explain`, {}),
  uploadAttachment: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/prescriptions/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const diagnosisService = {
  checkSymptoms: (data) => api.post('/diagnosis/check', data),
  getPatientLogs: (patientId) => api.get(`/diagnosis/patient/${patientId}`),
  getLog: (id) => api.get(`/diagnosis/${id}`)
}

export const analyticsService = {
  getAdminStats: () => api.get('/analytics/admin'),
  getDoctorStats: () => api.get('/analytics/doctor')
}

export const uploadService = {
  uploadPatientDocument: (patientId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('patientId', patientId)
    return api.post('/uploads/patient-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadPrescriptionAttachment: (prescriptionId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('prescriptionId', prescriptionId)
    return api.post('/uploads/prescription-attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteFile: (fileId) => api.delete('/uploads/file', { data: { fileId } })
}

export const subscriptionService = {
  getStatus: () => api.get('/subscriptions/status'),
  getPlans: () => api.get('/subscriptions/plans'),
  getPlanDetails: (planName) => api.get(`/subscriptions/plans/${planName}`),
  upgradePlan: (planName, paymentMethod = 'mock') => 
    api.post('/subscriptions/upgrade', { planName, paymentMethod }),
  downgradePlan: () => api.post('/subscriptions/downgrade', {}),
  getFeatures: () => api.get('/subscriptions/features'),
  checkFeature: (featureName) => api.get(`/subscriptions/features/${featureName}`),
  getUsageStats: () => api.get('/subscriptions/usage'),
  getAdminSubscriptions: () => api.get('/subscriptions/admin/all'),
  extendTrial: (userId, days) => 
    api.post('/subscriptions/admin/extend-trial', { userId, days })
}

export default api
