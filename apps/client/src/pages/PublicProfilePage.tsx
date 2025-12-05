import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";
import { UserProfile } from "@/components/profile/UserProfile";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import type { FullUserProfile } from "@/types";

export const PublicProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const { user: authUser } = useAuthStore();
    const [profile, setProfile] = useState<FullUserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!id) return;
        api.get(`/users/profile/${id}`)
           .then(res => setProfile(res.data.data))
           .catch(console.error)
           .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    if (!profile) return <div className="p-10 text-center text-muted-foreground">User not found</div>;

    // Determine if this is actually the current user
    const isMe = authUser?.userId === profile.userId;

    return <UserProfile user={profile} isOwnProfile={isMe} />;
};