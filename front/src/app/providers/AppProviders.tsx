// src/app/providers/AppProviders.tsx
import { StrictMode, type ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "styled-components";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { theme } from "@/shared/styles/theme";

const GoogleClientID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
const queryClient = new QueryClient();

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
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </RecoilRoot>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </StrictMode>
  );
};
