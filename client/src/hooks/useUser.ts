import { useQuery } from '@tanstack/react-query';
import { User, getAuthHeader, isAuthenticated } from '@/lib/auth';

export function useUser() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      if (!isAuthenticated()) {
        return null;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': getAuthHeader() || '',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Clear invalid token
            localStorage.removeItem('token');
            return null;
          }
          throw new Error('Failed to fetch user data');
        }

        return await response.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}
