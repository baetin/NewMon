import { type ReactNode, StrictMode } from 'react';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from 'styled-components';

import { queryClient } from '@/shared/lib';
import { theme } from '@/shared/styles/theme';

const GoogleClientID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;

interface Props {
  children: ReactNode;
}

export const AppProviders = ({ children }: Props) => {
  return (
    <StrictMode>
      <GoogleOAuthProvider clientId={GoogleClientID}>
        <ThemeProvider theme={theme}>
          <RecoilRoot>
            <QueryClientProvider client={queryClient}>
              {children}
              <ToastContainer autoClose={2000} limit={1} />
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </RecoilRoot>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </StrictMode>
  );
};
