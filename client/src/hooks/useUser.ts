import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { User } from "@shared/schema";

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: any) => Promise<User | null>;
  logout: () => void;
}

export function useUser(): UseUserReturn {
  const [initialized, setInitialized] = useState(false);
  
  // Get current user data
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    retry: false,
    enabled: initialized,
  });
  
  // Initialize after component mount to avoid SSR issues
  useEffect(() => {
    setInitialized(true);
  }, []);
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string, password: string }) => {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.user && response.token) {
        localStorage.setItem('authToken', response.token);
        return response.user;
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      if (response.user && response.token) {
        localStorage.setItem('authToken', response.token);
        return response.user;
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    queryClient.setQueryData(['/api/auth/me'], null);
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    
    // Redirect to home page
    window.location.href = '/';
  };
  
  // Login function
  const login = async (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password });
  };
  
  // Register function
  const register = async (userData: any) => {
    return registerMutation.mutateAsync(userData);
  };
  
  return {
    user: user || null,
    isLoading,
    error: error as Error | null,
    login,
    register,
    logout,
  };
}