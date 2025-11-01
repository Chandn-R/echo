import { ProfilePage } from "@/pages/ProfilePage";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface FullUserProfile {
    _id: string;
    name: string;
    username: string;
    email: string;
    followers: Array<{
        _id: string;
        name: string;
        username: string;
        profilePicture?: {
            secure_url: string;
        };
    }>;
    following: string[];
    bio: string;
    profilePicture?: {
        secure_url: string;
    };
    posts: Array<{
        _id: string;
        user: string;
        content: Array<{
            type: "text" | "image";
            value: string;
            public_id?: string;
        }>;
        likes: Array<string>;
        comments: Array<string>;
        createdAt: string;
        updatedAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
    isFollowing: boolean;
}

export const ProfileUpdateWrapper = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<FullUserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        const fetchProfile = async () => {
            try {
                console.log(" Fetching", user);

                console.log("Fetching profile for user ID:", user._id);

                const res = await api.get(`/users/${user._id}`);
                setProfile(res.data.data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (loading) {
        return <p>Loading profile...</p>;
    }
    if (!profile) {
        return <p>Failed to load profile data.</p>;
    }

    return <ProfilePage user={profile} />;
};
