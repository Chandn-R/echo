export interface Post {
    postId: string;
    userId: string;
    description: string | null;
    image: { secure_url: string; public_id: string } | null;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
    name: string;
    userName: string;
    userAvatar: { secure_url: string } | null;
    likedByUser: boolean;
}

export interface PostsResponse {
    data: {
        posts: Post[];
        nextCursor: string | null;
        hasNextPage: boolean;
    }
}
export interface postProps {
    post: Post;
    onLike: (postId: string) => void;
}

export interface UserPost {
    postId: string;
    userId: string;
    image: { secure_url: string; public_id: string } | null;
    description: string;
    likes: number;
    comments: number;
    createdAt: string;
    updatedAt: string;
}

export interface FullUserProfile {
    userId: string;
    name: string;
    userName: string;
    email: string;
    profilePicture?: { secure_url: string };
    createdAt: string;
    
    // Settings (can be null/undefined if not set yet)
    bio?: string;
    birthDate?: string;
    private?: boolean;
    country?: string;
    language?: string;

    // Aggregates
    followersCount: number;
    followingCount: number;
    posts: UserPost[];
    isFollowing: boolean; // Computed by backend
}