import { QueryClient } from '@tanstack/react-query';
import { createConnectTransport } from '@connectrpc/connect-web';

// Create a TanStack Query client with sensible defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time of 1 minute
      staleTime: 1000 * 60,
      // Cache time of 5 minutes
      gcTime: 1000 * 60 * 5,
      // Retry failed requests 3 times
      retry: 3,
      // Refetch on window focus
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

// Configure the Connect transport for use with TanStack Query
export const transport = createConnectTransport({
  baseUrl: "http://localhost:3030", // Your Rust backend URL
  // You can add interceptors here for auth, logging, etc.
});