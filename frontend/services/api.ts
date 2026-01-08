import axios from 'axios';
import { Platform } from 'react-native';

// Base URL for backend API - adjust this to match your backend URL
// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, use localhost
// For physical device, use your computer's IP address
const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api'; // Android emulator
    }
    return 'http://localhost:3000/api'; // iOS simulator or web
  }
  return 'https://your-backend-url.com/api'; // Production
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginData {
  phone: string;
  password: string;
}

export interface RegisterData {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
}

export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка входа');
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка регистрации');
    }
  },
};

export default api;

