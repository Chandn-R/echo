import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { MessageCircle, Heart } from "lucide-react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface Post {
    _id: string;
    user: {
        _id: string;
        username: string;
        profilePicture: {
            secure_url: string;
        };
    };
    content: {
        type: "text" | "image";
        value: string;
        _id: string;
    }[];
    likes: string[];
    comments: {
        _id: string;
        user: {
            _id: string;
            username: string;
            profilePicture: {
                secure_url: string;
            };
        };
        content: string;
    }[];
    createdAt: string;
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
}

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const fetchPosts = async (cursor?: string) => {
        try {
            if (cursor) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const res = await api.get("/posts", {
                params: {
                    lastPostId: cursor,
                    limit: 10,
                },
            });

            const newPosts: Post[] = res.data.data.posts;

            setPosts((prev) => (cursor ? [...prev, ...newPosts] : newPosts));
            setNextCursor(res.data.data.nextCursor);
            setHasNextPage(res.data.data.hasNextPage);
        } catch (error) {
            console.error("Error fetching posts:", error);
            toast.error("Failed to fetch posts");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLike = async (postId: string) => {
        if (!user) {
            toast.error("Please log in to like posts");
            navigate("/login");
            return;
        }

        try {
            setPosts((prev) =>
                prev.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              isLiked: !post.isLiked,
                              likeCount: post.isLiked
                                  ? post.likeCount - 1
                                  : post.likeCount + 1,
                          }
                        : post
                )
            );
            await api.patch(`/posts/${postId}/like`);
        } catch (error) {
            console.error("Error liking post:", error);
            toast.error("Failed to like post");
            setPosts((prev) =>
                prev.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              isLiked: !post.isLiked,
                              likeCount: post.isLiked
                                  ? post.likeCount + 1
                                  : post.likeCount - 1,
                          }
                        : post
                )
            );
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            day: "numeric",
            month: "short",
        }).format(date);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >=
                    document.body.offsetHeight - 300 &&
                !loadingMore &&
                hasNextPage
            ) {
                fetchPosts(nextCursor || undefined);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loadingMore, hasNextPage, nextCursor]);

    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 max-w-2xl min-h-screen p-4 space-y-4 mx-auto">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="rounded-xl shadow-sm">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                                    <div className="h-3 w-full bg-muted rounded animate-pulse" />
                                    <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="flex-1 max-w-3xl min-h-screen p-4 space-y-4 mx-auto">
            {posts.map((post) => (
                <Card
                    key={post._id}
                    className="rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                    <CardContent className="p-4">
                        <div className="flex gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={post.user?.profilePicture?.secure_url}
                                    className="h-full w-full object-cover rounded-full"
                                    alt={post.user.username}
                                />
                                <AvatarFallback className="bg-muted">
                                    {post.user.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-4 mt-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">
                                            <button
                                                onClick={() => {
                                                    if (!user) {
                                                        navigate("/login");
                                                    } else {
                                                        navigate(
                                                            `/users/${post.user._id}`
                                                        );
                                                    }
                                                }}
                                            >
                                                {post.user.username}
                                            </button>
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            · {formatDate(post.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2 font-medium">
                                    {post.content.map((block) => (
                                        <div key={block._id}>
                                            {block.type === "text" ? (
                                                <p className="text-sm">
                                                    {block.value}
                                                </p>
                                            ) : (
                                                <img
                                                    src={block.value}
                                                    alt="Post content"
                                                    className="rounded-md max-h-80 object-contain"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between pt-2">
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`h-8 px-2 ${
                                                post.isLiked
                                                    ? "text-rose-500 "
                                                    : "text-muted-foreground hover:text-rose-500"
                                            }`}
                                            onClick={() => handleLike(post._id)}
                                        >
                                            <Heart
                                                className="w-4 h-4 mr-1"
                                                fill={
                                                    post.isLiked
                                                        ? "currentColor"
                                                        : "none"
                                                }
                                                stroke="currentColor"
                                            />
                                            <span className="text-xs">
                                                {post.likeCount}
                                            </span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-muted-foreground hover:text-blue-500"
                                        >
                                            <MessageCircle className="w-4 h-4 mr-1" />
                                            <span className="text-xs">
                                                {post.commentCount}
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {loadingMore && <p className="text-center">Loading more posts...</p>}
            {!hasNextPage && <p className="text-center text-muted-foreground">You've reached the end!</p>}
        </div>
    );
}