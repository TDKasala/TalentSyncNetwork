import { apiRequest } from './queryClient';
import { queryClient } from './queryClient';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'candidate' | 'recruiter';
  profileComplete: boolean;
  language?: 'english' | 'afrikaans' | 'zulu';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'candidate' | 'recruiter';
  whatsappNumber?: string;
  location?: string;
  language?: 'english' | 'afrikaans' | 'zulu';
  consentGiven: boolean;
  companyName?: string; // Only for recruiters
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Login the user
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiRequest('POST', '/api/auth/login', credentials);
  const data: AuthResponse = await response.json();
  
  // Store the token in localStorage
  localStorage.setItem('token', data.token);
  
  // Invalidate the user query to force a refetch
  queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  
  return data;
}

// Register a new user
export async function registerUser(userData: RegisterData): Promise<AuthResponse> {
  const response = await apiRequest('POST', '/api/auth/register', userData);
  const data: AuthResponse = await response.json();
  
  // Store the token in localStorage
  localStorage.setItem('token', data.token);
  
  // Invalidate the user query to force a refetch
  queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  
  return data;
}

// Logout the user
export function logoutUser(): void {
  // Remove token from localStorage
  localStorage.removeItem('token');
  
  // Invalidate the current user
  queryClient.setQueryData(['/api/auth/me'], null);
  
  // Remove all queries from the cache
  queryClient.clear();
}

// Get the current user's token
export function getToken(): string | null {
  return localStorage.getItem('token');
}

// Get the Authorization header value
export function getAuthHeader(): string | undefined {
  const token = getToken();
  return token ? `Bearer ${token}` : undefined;
}

// Check if the user is authenticated
export function isAuthenticated(): boolean {
  return !!getToken();
}
