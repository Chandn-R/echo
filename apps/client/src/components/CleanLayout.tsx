import Logo from "@/assets/logo.svg";
import { Home, User, Search, PlusCircle, MessageSquare } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function CleanLayout() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const protectedNavigate = (path: string) => {
        if (!user) {
            navigate("/login");
        } else {
            navigate(path);
        }
    };

    return (
        <div className="flex w-full">
            <aside className="w-30 py-4 bg-background flex flex-col items-center h-screen sticky top-0">
                <div className="mb-10 mt-3 hover:brightness-125">
                    <button
                        className="rounded-lg h-16 w-16"
                        onClick={() => navigate("/")}
                    >
                        <img src={Logo} alt="logo" className="w-16 h-16" />
                    </button>
                </div>

                <nav className="flex flex-col items-center space-y-6 ml-1 flex-1 p-1">
                    <button
                        onClick={() => navigate("/")}
                        className="rounded-lg h-12 w-12 ml-5 brightness-75 hover:brightness-125"
                    >
                        <Home className="h-6 w-6" />
                    </button>
                    <button
                        onClick={() => protectedNavigate("/search")}
                        className="rounded-lg h-12 ml-5 brightness-75 hover:brightness-125 w-12"
                    >
                        <Search className="h-6 w-6" />
                    </button>
                    <button
                        onClick={() => protectedNavigate("/create")}
                        className="rounded-lg h-12 brightness-75 hover:brightness-125 ml-5 w-12"
                    >
                        <PlusCircle className="h-6 w-6" />
                    </button>
                    <button
                        onClick={() => protectedNavigate("/chat")}
                        className="rounded-lg h-12 brightness-75 hover:brightness-125 ml-5 w-12"
                    >
                        <MessageSquare className="h-6 w-6" />
                    </button>
                </nav>

                <div className="flex flex-col py-4 gap-3 ml-8 ">
                    <ModeToggle />
                    <button className="rounded-lg h-12 brightness-75 hover:brightness-125 w-12">
                        <User
                            // 4. Use the helper and the user ID from the context
                            onClick={() => protectedNavigate("/user/me")}
                            className="h-6 w-6"
                        />
                    </button>
                </div>
            </aside>
            <main className="flex-1 flex justify-center items-center max-w-full min-h-screen p-4">
                <Outlet />
            </main>
        </div>
    );
}

export default CleanLayout;
