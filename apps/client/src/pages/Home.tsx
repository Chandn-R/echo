import { usePosts } from "@/hooks/usePosts";
import { PostCard } from "@/components/PostCard";
import { toast } from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { Post } from "@/types";

export default function Home() {
    const user = useAuthStore((s) => s.user);
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = usePosts();

    const observerElem = useRef<HTMLDivElement>(null);

    const handleLike = async (postId: string) => {
        if (!user) return toast.error("Please login first");
        try {
            await api.post(`users/posts/like/${postId}`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to like post");
        }
    };

    useEffect(() => {
        const el = observerElem.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
            },
            { rootMargin: "200px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNextPage, fetchNextPage]);

    if (isError) return <ErrorState />;

    return (
        <div className="flex flex-col min-h-screen w-full border-x border-border bg-background">
            <div className="flex-1 px-4">
                {isLoading ? (
                    <div className="flex flex-col gap-5">
                        {[1, 2, 3, 4].map((i) => (
                            <PostSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-5">
                            {data?.pages.map((page, i) => (
                                <div key={i} className="contents">
                                    {page.posts.map((post: Post) => (
                                        <div
                                            key={post.postId}
                                            className="bg-background border border-border/40 rounded-xl shadow-sm hover:shadow-md transition"
                                        >
                                            <PostCard
                                                post={post}
                                                onLike={handleLike}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Bottom loader */}
                        <div
                            ref={observerElem}
                            className="py-6 flex justify-center min-h-[80px]"
                        >
                            {isFetchingNextPage ? (
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            ) : !hasNextPage && data?.pages[0]?.posts.length ? (
                                <span className="text-sm text-muted-foreground font-medium">
                                    You've reached the end
                                </span>
                            ) : null}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// --- Helper Components ---

function ErrorState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
            <p className="text-red-500 font-medium">Failed to load feed</p>
            <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium underline hover:text-primary transition-colors"
            >
                Retry
            </button>
        </div>
    );
}

function PostSkeleton() {
    return (
        <div className="px-4 py-4 flex gap-3 animate-pulse border border-border/20 rounded-xl">
            <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-muted" />
            </div>
            <div className="flex-1 space-y-3 pt-1">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-28 bg-muted rounded-md" />
                    <div className="h-4 w-20 bg-muted/60 rounded-md" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-full bg-muted/50 rounded-md" />
                    <div className="h-4 w-2/3 bg-muted/50 rounded-md" />
                </div>
                <div className="h-52 w-full bg-muted/40 rounded-xl mt-1" />
            </div>
        </div>
    );
}
