import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoutes";
import { CreatePost } from "@/pages/CreatePost";
import Home from "@/pages/Home";
import { Login } from "@/pages/Login";
import { SignUp } from "@/pages/SignUp";
import type { RouteObject } from "react-router-dom";
import { ProfileUpdateWrapper } from "@/components/MyProfilePage";
import { UserProfileWrapper } from "@/components/UserProfilePage";
import CleanLayout from "@/components/CleanLayout";
import SearchUser from "@/pages/SearchUser";
import { ChatPage } from "@/components/chat/ChatPage";

export const routes: RouteObject[] = [
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <SignUp /> },

    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },

            {
                element: <ProtectedRoute />,
                children: [{ path: "create", element: <CreatePost /> }],
            },
        ],
    },

    {
        element: <CleanLayout />,
        children: [
            {
                element: <ProtectedRoute />,
                children: [
                    { path: "user/me", element: <ProfileUpdateWrapper /> },
                    { path: "users/:id", element: <UserProfileWrapper /> },
                    { path: "search", element: <SearchUser /> },
                    { path: "chat", element: <ChatPage /> },
                ],
            },
        ],
    },
];
