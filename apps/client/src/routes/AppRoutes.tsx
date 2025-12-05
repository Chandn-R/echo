import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoutes";
import { CreatePost } from "@/pages/CreatePost";
import Home from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import type { RouteObject } from "react-router-dom";
import SearchUser from "@/pages/SearchUser";
import { MyProfilePage } from "@/pages/MyProfilePage";
import { PublicProfilePage } from "@/pages/PublicProfilePage";

export const routes: RouteObject[] = [
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Register /> },

    {
        path: "/",
        element: <Layout />,
        children: [
            {
                element: <ProtectedRoute />,
                children: [
                    { index: true, element: <Home /> },

                    { path: "create", element: <CreatePost /> },
                    { path: "user/me", element: <MyProfilePage /> },
                    { path: "users/:id", element: <PublicProfilePage /> },
                    { path: "search", element: <SearchUser /> },
                    // { path: "chat", element: <ChatPage /> },
                ],
            },
        ],
    },
];
