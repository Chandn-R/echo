import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, User, Search, PlusCircle, MessageSquare } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function Layout() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const protectedNavigate = (path: string) => {
        if (!user) {
            navigate("/login");
        } else {
            console.log(user);

            navigate(path);
        }
    };

    return (
        <div className="flex w-full">
            <aside className="w-30 py-4 bg-background flex flex-col items-center h-screen sticky top-0">
                <div className="mb-10 mt-3 hover:brightness-125">
                    <button className="rounded-lg h-16 w-16">
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
                            onClick={() => protectedNavigate(`/user/me`)}
                            className="h-6 w-6"
                        />
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex justify-center items-center max-w-4xl min-h-screen p-4">
                <Outlet />
            </main>

            <div className="hidden lg:block w-64">
                <div className="sticky top-0 h-screen p-4 space-y-6 overflow-y-auto">
                    <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">
                                Trending Threads
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {[
                                "#React",
                                "#Shadcn",
                                "#ThreadsClone",
                                "#NextJS",
                            ].map((tag) => (
                                <div
                                    key={tag}
                                    className="flex items-center justify-between hover:bg-accent p-2 rounded cursor-pointer"
                                >
                                    <span className="text-sm">{tag}</span>
                                    <span className="text-xs text-muted-foreground">
                                        2.4k
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="">
                            <CardTitle className="text-base">
                                Recommended
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-5">
                            {[1, 2, 3, 4].map((user) => (
                                <div
                                    key={user}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage
                                                src={`/avatars/suggested-${user}.png`}
                                            />
                                            <AvatarFallback>
                                                SU{user}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">
                                            user_{user}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full h-8 text-xs"
                                    >
                                        Follow
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Layout;
