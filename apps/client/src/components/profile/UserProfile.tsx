import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
    MapPin, Calendar, Lock, LogOut, Users, UserPlus, 
    MoreHorizontal, Heart, MessageSquare, Trash2 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ProfileSettingsDialog } from "./ProfileSettingsDialog";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import type { FullUserProfile, UserPost } from "@/types";

interface Props {
    user: FullUserProfile;
    isOwnProfile: boolean;
}

export function UserProfile({ user: initialUser, isOwnProfile }: Props) {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [user, setUser] = useState<FullUserProfile>(initialUser);
    
    useEffect(() => { setUser(initialUser); }, [initialUser]);

    const handleFollowToggle = async () => {
        try {
            // Updated to use POST and correct routes
            const endpoint = user.isFollowing 
                ? `/users/unfollow/${user.userId}` 
                : `/users/follow/${user.userId}`;
            
            await api.post(endpoint);
            
            setUser(prev => ({
                ...prev,
                isFollowing: !prev.isFollowing,
                followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
            }));
            toast.success(user.isFollowing ? "Unfollowed" : "Followed");
        } catch (err) {
            toast.error("Action failed");
        }
    };

    const handleDeletePost = async (postId: string) => {
        try {
            await api.delete(`/posts/${postId}`);
            setUser(prev => ({
                ...prev,
                posts: prev.posts.filter((p) => p.postId !== postId)
            }));
            toast.success("Post deleted");
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- LEFT SIDEBAR --- */}
                <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-20 space-y-6">
                        <Card className="rounded-xl shadow-sm border-border/60">
                            <div className="flex flex-col items-center p-6 pb-2">
                                <Avatar className="h-28 w-28 mb-4 border-4 border-background ring-1 ring-border/20">
                                    <AvatarImage src={user.profilePicture?.secure_url} className="object-cover" />
                                    <AvatarFallback className="text-3xl bg-muted">{user.userName[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <h1 className="text-xl font-bold">{user.name}</h1>
                                <p className="text-muted-foreground font-medium">@{user.userName}</p>
                            </div>

                            <CardContent className="space-y-6">
                                {user.bio && (
                                    <p className="text-sm text-center leading-relaxed px-2 text-foreground/80">{user.bio}</p>
                                )}

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    {user.country && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> {user.country}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Joined {formatDate(user.createdAt)}
                                    </div>
                                    {user.private && (
                                        <div className="flex items-center gap-2 text-amber-600">
                                            <Lock className="w-4 h-4" /> Private Account
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <p className="font-bold text-lg text-foreground">{user.posts.length}</p>
                                        <p className="text-xs text-muted-foreground uppercase">Posts</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-foreground">{user.followersCount}</p>
                                        <p className="text-xs text-muted-foreground uppercase">Followers</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-foreground">{user.followingCount}</p>
                                        <p className="text-xs text-muted-foreground uppercase">Following</p>
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-col gap-2">
                                    {isOwnProfile ? (
                                        <>
                                            <ProfileSettingsDialog user={user} onUpdate={(updated) => setUser({...user, ...updated})} />
                                            <Button variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => { logout(); navigate("/login"); }}>
                                                <LogOut className="w-4 h-4 mr-2" /> Log Out
                                            </Button>
                                        </>
                                    ) : (
                                        <Button 
                                            variant={user.isFollowing ? "outline" : "default"} 
                                            onClick={handleFollowToggle}
                                            className="w-full"
                                        >
                                            {user.isFollowing ? (
                                                <><Users className="w-4 h-4 mr-2" /> Unfollow</>
                                            ) : (
                                                <><UserPlus className="w-4 h-4 mr-2" /> Follow</>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* --- RIGHT SIDE (Posts) --- */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold pb-2 border-b">Posts</h2>
                    
                    {user.posts.length === 0 ? (
                        <div className="text-center py-12 border rounded-xl border-dashed bg-muted/20">
                            <p className="text-muted-foreground">No posts yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {user.posts.map((post: UserPost) => (
                                <Card key={post.postId} className="border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center p-4 pb-2 space-y-0">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user.profilePicture?.secure_url} />
                                                <AvatarFallback>{user.userName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm">{user.name}</span>
                                                <span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        
                                        {isOwnProfile && (
                                            <div className="ml-auto">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleDeletePost(post.postId)} className="text-red-500">
                                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </CardHeader>
                                    
                                    <CardContent className="p-0">
                                        {post.description && <div className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-wrap">{post.description}</div>}
                                        {post.image?.secure_url && (
                                            <div className="border-y border-border/40 bg-muted/20">
                                                <img src={post.image.secure_url} className="w-full max-h-[500px] object-contain" alt="Post" />
                                            </div>
                                        )}
                                    </CardContent>
                                    
                                    <div className="p-3 flex gap-4 text-muted-foreground">
                                        <div className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> <span className="text-xs font-medium">{post.likes}</span></div>
                                        <div className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> <span className="text-xs font-medium">{post.comments}</span></div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}