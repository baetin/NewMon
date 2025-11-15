import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import { App } from "./app/App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "styled-components";
import { RecoilRoot } from "recoil";
import { theme } from "./shared/styles/theme";

const GoogleClientID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GoogleClientID}>
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <App />
        </RecoilRoot>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
