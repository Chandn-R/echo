import { useRoutes } from "react-router-dom";
import { routes } from "@/routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function ThreadsClone() {
    const checkAuthStatus = useAuthStore((s) => s.checkAuthStatus);
    const queryClient = new QueryClient();

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const routing = useRoutes(routes);

    return (
        <>
            <QueryClientProvider client={queryClient}>
                {routing}
                <Toaster position="top-center" reverseOrder={true} />
            </QueryClientProvider>
        </>
    );
}
