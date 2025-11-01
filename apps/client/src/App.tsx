import { useRoutes } from "react-router-dom";
import { routes } from "@/routes/AppRoutes";
import { Toaster } from "react-hot-toast";

export default function ThreadsClone() {
    const routing = useRoutes(routes);

    return (
        <>
            {routing}
            <Toaster position="top-center" reverseOrder={true} />
        </>
    );
}
