import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<any> {
  const { method = 'GET', body, headers = {} } = options;
  
  // Get auth token if it exists
  const authToken = localStorage.getItem('authToken');
  
  // Create combined headers
  const combinedHeaders = new Headers(headers);
  
  // Add auth header if token exists
  if (authToken) {
    combinedHeaders.set('Authorization', `Bearer ${authToken}`);
  }
  
  // Add content type for JSON bodies
  if (body) {
    combinedHeaders.set('Content-Type', 'application/json');
  }
  
  const res = await fetch(url, {
    method,
    headers: combinedHeaders,
    body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // Parse JSON response if available
  try {
    return await res.json();
  } catch (error) {
    // Return empty object if no JSON content
    return {};
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add authorization header if token exists
    const authToken = localStorage.getItem('authToken');
    const headers = new Headers();
    
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
