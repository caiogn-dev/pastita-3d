import api from './api';
import * as SecureStore from 'expo-secure-store';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login/', credentials);
  const { token, user } = response.data;

  await SecureStore.setItemAsync('access_token', token);
  await SecureStore.setItemAsync('user', JSON.stringify(user));

  return response.data;
};

export const register = async (data: RegisterData): Promise<any> => {
  const response = await api.post('/auth/register/', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('user');
};

export const getStoredUser = async (): Promise<User | null> => {
  const userStr = await SecureStore.getItemAsync('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await SecureStore.getItemAsync('access_token');
  return !!token;
};
