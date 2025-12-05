import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/services/api";
import { UserProfile } from "@/components/profile/UserProfile";
import { Loader2 } from "lucide-react";
import type { FullUserProfile } from "@/types";

export const MyProfilePage = () => {
    const { user: authUser } = useAuthStore();
    const [profile, setProfile] = useState<FullUserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!authUser?.userId) return;
        // Fetch using ID to reuse the same backend controller
        api.get(`/users/profile/${authUser.userId}`)
           .then(res => setProfile(res.data.data))
           .catch(console.error)
           .finally(() => setLoading(false));
    }, [authUser]);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    if (!profile) return <div className="p-10 text-center text-red-500">Failed to load profile</div>;

    return <UserProfile user={profile} isOwnProfile={true} />;
};