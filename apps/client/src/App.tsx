import { useRoutes } from "react-router-dom";
import { routes } from "@/routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";

export default function ThreadsClone() {
    const checkAuthStatus = useAuthStore((s) => s.checkAuthStatus);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const routing = useRoutes(routes);

    return (
        <>
            {routing}
            <Toaster position="top-center" reverseOrder={true} />
        </>
    );
}
