import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import type { Post } from "@/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
    post: Post;
    onLike: (postId: string) => void;
}

export const PostCard: React.FC<Props> = ({ post, onLike }) => {
    const [isLiked, setIsLiked] = useState(post.likedByUser);
    const [likeCount, setLikeCount] = useState(Number(post.likesCount));
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);

    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

        setIsLikeAnimating(true);
        setTimeout(() => setIsLikeAnimating(false), 450);

        onLike(post.postId);
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <article className="border-b border-border/60 bg-background hover:bg-muted/10 transition-colors cursor-pointer pb-6">
            <div className="flex items-center gap-3 px-4 py-3">
                <Avatar className="h-10 w-10 ring-1 ring-border/30 hover:scale-[1.03] transition">
                    <AvatarImage
                        src={post.userAvatar?.secure_url}
                        alt={post.name}
                        className="object-cover"
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                        {post.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-tight">
                    <span className="font-semibold text-[14.5px] truncate">
                        {post.name}
                    </span>
                    <span className="text-muted-foreground text-[12px]">
                        @{post.userName.toLowerCase().replace(/\s+/g, "")}
                    </span>
                </div>
                <span className="ml-auto text-muted-foreground text-[12px]">
                    {formatTime(post.createdAt)}
                </span>
            </div>

            {post.image?.secure_url && (
                <div className="w-full bg-black/5">
                    <img
                        src={post.image.secure_url}
                        alt="Post"
                        loading="lazy"
                        className="w-full max-h-[540px] object-contain bg-muted/10"
                    />
                </div>
            )}

            {post.description && (
                <div className="px-4 pt-3">
                    <p className="text-[14px] leading-relaxed wrap-break-word">
                        <span className="font-semibold mr-2">
                            @{post.userName}
                        </span>
                        {post.description}
                    </p>
                </div>
            )}

            <div className="px-5 pt-5">
                <div className="flex items-center gap-8">
                    <button
                        className="flex items-center gap-1 group"
                        onClick={handleLikeClick}
                    >
                        <Heart
                            className={cn(
                                "h-5 w-5 transition-transform duration-200",
                                isLiked
                                    ? "fill-pink-600 text-pink-600 scale-[1.18]"
                                    : "text-foreground group-hover:scale-[1.12]"
                            )}
                        />
                        <span
                            className={cn(
                                "text-[15px] font-medium tabular-nums",
                                isLiked
                                    ? "text-pink-600"
                                    : "text-muted-foreground"
                            )}
                        >
                            {likeCount > 0 && likeCount}
                        </span>
                    </button>

                    <div className="flex items-center gap-1 group">
                        <MessageCircle className="h-5 w-5 text-foreground group-hover:scale-[1.12] transition-transform" />
                        <span className="text-[13px] font-medium text-muted-foreground group-hover:text-sky-500 tabular-nums">
                            {post.commentsCount > 0 && post.commentsCount}
                        </span>
                    </div>

                    <button className="group">
                        <Share2 className="h-5 w-5 text-foreground group-hover:scale-[1.12] transition-transform" />
                    </button>
                </div>
            </div>
        </article>
    );
};
