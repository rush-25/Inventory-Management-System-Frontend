import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './store/AppContext';
import { AuthProvider } from './store/AuthContext';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
