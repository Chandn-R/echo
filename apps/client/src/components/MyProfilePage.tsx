import { ProfilePage } from "@/pages/ProfilePage";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuthStore } from "@/stores/useAuthStore";

// --- UPDATED INTERFACE ---
// Added birthDate, private, country, and language
interface FullUserProfile {
    userId: string;
    name: string;
    userName: string;
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

    // Added from profileSettings schema
    birthDate?: string; // Assuming API sends as ISO string
    private?: boolean;
    country?: string;
    language?: string;
}
// --- END OF UPDATE ---

export const ProfileUpdateWrapper = () => {
    const user = useAuthStore((state) => state.user);

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
                console.log("Fetching profile for user ID:", user.userId);

                const res = await api.get(`/users/profile/${user.userId}`);
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

    if (loading) {
        return <p>Loading profile...</p>;
    }
    if (!profile) {
        return <p>Failed to load profile data.</p>;
    }

    // Pass the full profile to ProfilePage
    // Note: We rename 'user' prop to 'initialUser' to avoid confusion
    // with the 'user' variable from the auth store.
    return <ProfilePage initialUser={profile} />;
};