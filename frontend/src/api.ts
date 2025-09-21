import axios from 'axios';
import { useAuthStore } from './stores/auth';
import { API_URL } from './config';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minute timeout for large operations
});

// Request interceptor to add the token to headers
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const token = authStore.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
  return config;
});

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      error.message = 'Network error. Please check if the server is running.';
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
    }
    
    return Promise.reject(error);
  }
);

// --- TypeScript Interfaces --- //
interface Credentials {
  email?: string;
  password?: string;
}

export interface UserData {
  fullName?: string;
  email?: string;
  role?: 'Super Admin' | 'Admin' | 'Manager' | 'Agent' | 'User';
  status?: 'active' | 'inactive';
  designation?: string;
  division?: string;
  password?: string;
}

interface ProfileData {
  fullName?: string;
  email?: string;
  designation?: string;
  division?: string;
}

// --- Authentication --- //
export const login = (credentials: Credentials) => {
  return apiClient.post('/auth/login', credentials);
};

export const register = (userData: UserData) => {
  return apiClient.post('/auth/register', userData);
};

// --- User Profile --- //
export const getProfile = () => {
  return apiClient.get('/users/profile');
};

export const getMe = () => {
  return apiClient.get('/users/me');
};

export const updateMe = (profileData: ProfileData) => {
  return apiClient.put('/users/me', profileData);
};

// --- Admin: User Management --- //
export const getUsers = () => {
  return apiClient.get('/users');
};

export const getUserById = (id: number | string) => {
  return apiClient.get(`/users/${id}`);
};

export const updateUser = (id: number | string, userData: UserData) => {
  return apiClient.put(`/users/${id}`, userData);
};

export const deleteUser = (id: number | string) => {
  return apiClient.delete(`/users/${id}`);
};

export const createUser = (userData: UserData) => {
  return apiClient.post('/users', userData);
};

// --- Content --- //
export const deleteContent = (id: number | string) => {
  return apiClient.delete(`/content/${id}`);
};

export default apiClient;

// --- Billing Profile / Meter Readings --- //
export const uploadBillingProfileFiles = (formData: FormData) => {
  return apiClient.post('/meter-readings/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getMeterReadingsByMeterNo = (meterNo: string) => {
  return apiClient.get(`/meter-readings/${encodeURIComponent(meterNo)}`);
};

export const getMeterReadingsInBulk = (meterNos: string[]) => {
  return apiClient.post('/meter-readings/bulk', { meterNos });
};

export const deleteAllBillingProfileData = () => {
  return apiClient.delete('/meter-readings/all');
};