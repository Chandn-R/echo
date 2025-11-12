import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoutes";
import { CreatePost } from "@/pages/CreatePost";
import Home from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import type { RouteObject } from "react-router-dom";
import { ProfileUpdateWrapper } from "@/components/MyProfilePage";
import { UserProfileWrapper } from "@/components/UserProfilePage";
import SearchUser from "@/pages/SearchUser";
// import { ChatPage } from "@/components/chat/ChatPage";

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
                    { path: "user/me", element: <ProfileUpdateWrapper /> },
                    { path: "users/:id", element: <UserProfileWrapper /> },
                    { path: "search", element: <SearchUser /> },
                    // { path: "chat", element: <ChatPage /> },
                ],
            },
        ],
    },
];
