import { ApiError, setApiBaseUrl } from '@bpagoaga/calisthenics-api-client';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.tsx';
import { AuthQueryKeys } from './queries/auth';
import { API_URL } from './config';
import './index.css';

setApiBaseUrl(API_URL);

/** Only a lost connection or a server error is worth retrying; a 4xx answer won't change. */
const shouldRetry = (failureCount: number, error: Error) =>
  failureCount < 2 && error instanceof ApiError && (error.status === 0 || error.status >= 500);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetry, staleTime: 30_000 },
  },
  queryCache: new QueryCache({
    // The session expired: refresh it, and the route guard sends the user to the sign-in page.
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401)
        void queryClient.invalidateQueries({ queryKey: [AuthQueryKeys.Session] });
    },
  }),
});

const root = document.getElementById('root');
if (!root) throw new Error('#root is missing from index.html');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
