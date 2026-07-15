import axiosInstance from '@/api/axios';
import type { AuthResponse, LoginCredentials, User } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>(
      '/auth/login',
      credentials
    );
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      // Even if the request fails, clear local token
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
    }
  },

  logoutLocal(): void {
    localStorage.removeItem('accessToken');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};
