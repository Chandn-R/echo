import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/services/api";
import type { PostsResponse } from "@/types";

export const usePosts = () => {
    return useInfiniteQuery<PostsResponse["data"]>({
        queryKey: ["posts"],
        queryFn: async ({ pageParam }) => {
            const res = await api.get("/users/posts", {
                params: { cursor: pageParam, limit: 10 },
            });
            return res.data.data;
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        staleTime: 1000 * 60, // 1 minute
        initialPageParam: undefined,
    });
};