import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "./components/SocketProvider.tsx";

import App from "./App.tsx";
import { ErrorBoundary } from "./lib/ErrorBoundary.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <BrowserRouter>
                <ErrorBoundary>
                    <AuthProvider>
                        <SocketProvider>
                            <App />
                        </SocketProvider>
                    </AuthProvider>
                </ErrorBoundary>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>
);
