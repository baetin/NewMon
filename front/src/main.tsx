import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import { App } from "./app/App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "styled-components";
import { RecoilRoot } from "recoil";
import { theme } from "./shared/styles/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const GoogleClientID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GoogleClientID}>
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </RecoilRoot>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
