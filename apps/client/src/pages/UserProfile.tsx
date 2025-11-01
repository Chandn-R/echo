import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
    CalendarDays,
    Mail,
    Users,
    ChevronRight,
    UserPlus,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useState } from "react";

interface UserProfileProps {
    user: {
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
        following: Array<{
            _id: string;
            name: string;
            username: string;
            profilePicture?: {
                secure_url: string;
            };
        }>;
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
    };
}

export function UserProfile({ user }: UserProfileProps) {
    const navigate = useNavigate();
    const joinDate = new Date(user.createdAt);
    const formattedJoinDate = joinDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const [userData, setUserData] = useState(user);

    const handleFollowUnfollow = async () => {
        try {
            const endpoint = userData.isFollowing
                ? `/users/${user._id}/unfollow`
                : `/users/${user._id}/follow`;

            const response = await api.patch(
                endpoint,
                {},
                {
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setUserData({
                    ...userData,
                    isFollowing: !userData.isFollowing,
                    followers:
                        response.data.data?.followers ?? userData.followers,
                });

                toast.success(
                    !userData.isFollowing
                        ? "Followed successfully"
                        : "Unfollowed successfully"
                );
            }
        } catch (err) {
            console.error("Error toggling follow status:", err);
            toast.error("Failed to toggle follow status");
        }
    };
    const handleLike = async (postId: string) => {
        try {
            await api.patch(`/posts/${postId}/like`);
            toast.success("post Liked");
        } catch (error) {
            console.error("Error liking post:", error);
            toast.error("Failed to like post");
        }
    };

    return (
        <div className="flex-1 min-h-screen p-4 mx-auto max-w-4xl space-y-6">
            <Card className="border-0 shadow-none">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-2 border-primary">
                            <AvatarImage
                                src={user.profilePicture?.secure_url}
                                className="h-full w-full object-cover"
                                alt={user.username}
                            />
                            <AvatarFallback className="bg-muted text-3xl font-medium">
                                {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold">
                                        {user.name}
                                    </h1>
                                    <p className="text-muted-foreground text-lg">
                                        @{user.username}
                                    </p>
                                </div>

                                <Button
                                    variant={
                                        userData.isFollowing
                                            ? "outline"
                                            : "default"
                                    }
                                    size="sm"
                                    className="gap-2"
                                    onClick={handleFollowUnfollow}
                                >
                                    <Users className="h-4 w-4" />
                                    {userData.isFollowing
                                        ? "Unfollow"
                                        : "Follow"}
                                </Button>
                            </div>

                            {user.bio && (
                                <p className="text-gray-700 dark:text-gray-300">
                                    {user.bio}
                                </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>Joined {formattedJoinDate}</span>
                                </div>
                            </div>

                            <div className="flex gap-6 pt-2">
                                <Button
                                    variant="ghost"
                                    className="gap-1 px-0 hover:bg-transparent"
                                >
                                    <span className="font-semibold">
                                        {userData.following.length}
                                    </span>
                                    <span className="text-muted-foreground">
                                        Following
                                    </span>
                                </Button>
                                <Button variant="ghost" className="gap-1 px-0">
                                    <span className="font-semibold">
                                        {user.followers.length}
                                    </span>
                                    <span className="text-muted-foreground">
                                        Followers
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4">
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>Followers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {userData.followers.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                                {userData.followers
                                    .slice(0, 2)
                                    .map((follower) => (
                                        <div
                                            key={follower._id}
                                            className="flex flex-col items-center gap-1 cursor-pointer hover:bg-muted/50 py-2 rounded-lg w-30"
                                            onClick={() =>
                                                navigate(
                                                    `/users/${follower._id}`
                                                )
                                            }
                                        >
                                            <Avatar className="h-18 w-18">
                                                <AvatarImage
                                                    src={
                                                        follower.profilePicture
                                                            ?.secure_url
                                                    }
                                                    alt={follower.username}
                                                />
                                                <AvatarFallback>
                                                    {follower.username
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="text-center">
                                                <p className="font-medium text-sm line-clamp-1">
                                                    {follower.name}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    @{follower.username}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                {userData.followers.length > 2 && (
                                    <div className="flex flex-col items-center gap-1 cursor-pointer  py-2 rounded-lg w-30">
                                        <Avatar className="h-18 w-18">
                                            <div className="flex items-center justify-center h-full w-full bg-muted">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    +
                                                    {userData.followers.length -
                                                        2}
                                                </span>
                                            </div>
                                        </Avatar>
                                        <div className="text-center">
                                            <p className="font-medium text-sm">
                                                More
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground text-sm">
                                    No followers yet
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>Following</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {userData.following.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                                {userData.following
                                    .slice(0, 2)
                                    .map((following) => (
                                        <div
                                            key={following._id}
                                            className="flex flex-col items-center gap-1 cursor-pointer hover:bg-muted/50 py-2 rounded-lg w-30"
                                            onClick={() =>
                                                navigate(
                                                    `/users/${following._id}`
                                                )
                                            }
                                        >
                                            <Avatar className="h-18 w-18">
                                                <AvatarImage
                                                    src={
                                                        following.profilePicture
                                                            ?.secure_url
                                                    }
                                                    alt={following.username}
                                                />
                                                <AvatarFallback>
                                                    {following.username
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="text-center">
                                                <p className="font-medium text-sm line-clamp-1">
                                                    {following.name}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    @{following.username}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                {userData.following.length > 2 && (
                                    <div className="flex flex-col items-center gap-1 cursor-pointer py-2 rounded-lg w-30">
                                        <Avatar className="h-18 w-18">
                                            <div className="flex items-center justify-center h-full w-full bg-muted">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    +
                                                    {userData.following.length -
                                                        2}
                                                </span>
                                            </div>
                                        </Avatar>
                                        <div className="text-center">
                                            <p className="font-medium text-sm">
                                                More
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <UserPlus className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground text-sm">
                                    Not following anyone yet
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                        Posts
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {user.posts.length > 0 ? (
                        <div className="space-y-4">
                            {user.posts.map((post) => (
                                <div
                                    key={post._id}
                                    className="border rounded-xl p-4 hover:bg-muted/50 transition-colors space-y-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage
                                                src={
                                                    user.profilePicture
                                                        ?.secure_url
                                                }
                                                alt={user.username}
                                            />
                                            <AvatarFallback>
                                                {user.username
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {user.name}
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {new Date(
                                                    post.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {post.content.map((block, index) =>
                                            block.type === "text" ? (
                                                <p
                                                    key={index}
                                                    className="text-base leading-relaxed"
                                                >
                                                    {block.value}
                                                </p>
                                            ) : block.type === "image" ? (
                                                <img
                                                    key={index}
                                                    src={block.value}
                                                    alt="Post Image"
                                                    className="rounded-lg max-h-96 w-full object-cover"
                                                />
                                            ) : null
                                        )}
                                    </div>

                                    <div className="flex gap-6 text-sm text-muted-foreground pt-2">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {post.likes.length} Likes
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ChevronRight className="h-4 w-4" />
                                            <span>
                                                {post.comments.length} Comments
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">
                                No posts yet
                            </h3>
                            <p className="text-muted-foreground mt-1">
                                When {user.name} shares something, it will
                                appear here.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
