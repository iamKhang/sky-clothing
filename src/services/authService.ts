/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';
import { setCookies, clearCookies, getCookies } from '@/app/actions/auth';

const AUTH_API = 'http://localhost:8080/api/auth';

interface AuthResponse {
  jwt: string;
  fullName: string;
}

export const authService = {
  // Đăng nhập
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${AUTH_API}/authenticate`, {
      email,
      password
    });
    
    await setCookies(response.data.jwt, response.data.fullName);
    return response.data;
  },

  // Đăng xuất
  async logout() {
    const { token } = await getCookies();
    
    if (token) {
      try {
        await axios.post(`${AUTH_API}/logout`, null, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    await clearCookies();
  },

  // Validate token
  async validateToken(): Promise<AuthResponse | null> {
    const { token } = await getCookies();
    if (!token) return null;

    try {
      const response = await axios.post(`${AUTH_API}/validate`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await setCookies(response.data.jwt, response.data.fullName);
      return response.data;
    } catch (error) {
      await clearCookies();
      return null;
    }
  },

  // Get token from cookies
  async getToken(): Promise<string | null> {
    const { token } = await getCookies();
    return token || null;
  }
}; 