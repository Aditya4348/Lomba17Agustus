import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.tsx";
import { CompetitionProvider } from "./context/CompetitionContext.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CompetitionProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <App />
        </CompetitionProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
