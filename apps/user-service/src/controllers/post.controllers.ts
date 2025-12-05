import { ApiError, ApiResponses, asyncHandler, cloudinaryUpload } from "@repo/utils";
import { Request, Response } from "express";
import { users, follows, eq, and, not, lt, desc, profileSettings, posts, postLikes, postComments, or, sql } from "@repo/db";


export const createPost = asyncHandler(async (req: Request, res: Response) => {
    if (!req.headers["x-user-id"]) {
        throw new ApiError(401, "Unauthorized");
    }
    const currentUserId = req.headers["x-user-id"];

    const description =
        typeof req.body.description === "string" ? req.body.description : "";

    const file = req.file as Express.Multer.File;
    if (!file) {
        throw new ApiError(400, "Image file is required");
    }

    const uploadedImage = await cloudinaryUpload(file.buffer, "post_images");

    if (!uploadedImage?.secure_url) {
        throw new ApiError(500, "Failed to upload image");
    }

    const db = req.app.locals.db;

    const post = await db
        .insert(posts)
        .values({
            userId: currentUserId,
            image: {
                secure_url: uploadedImage.secure_url,
                public_id: uploadedImage.public_id,
            },
            description,
        })
        .returning();

    res.status(201)
        .json(new ApiResponses(201, post[0], "post created successfully"));
});

export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {

    if (!req.headers["x-user-id"] || Array.isArray(req.headers["x-user-id"])) {
        throw new ApiError(401, "Unauthorized");
    }
    const currentUserId = req.headers["x-user-id"];
    const limit = Math.min(Number(req.query.limit ?? 10), 50);
    const cursorStr = req.query.cursor as string | undefined;

    let cursorDate: Date | undefined;
    let cursorId: string | undefined;

    if (cursorStr) {
        const [datePart, idPart] = cursorStr.split('_');
        if (datePart && idPart) {
            cursorDate = new Date(datePart);
            cursorId = idPart;
        }
    }

    const db = req.app.locals.db;

    const allPosts = await db
        .select({
            postId: posts.postId,
            userId: posts.userId,
            description: posts.description,
            image: posts.image,
            likesCount: posts.likes,
            commentsCount: posts.comments,
            createdAt: posts.createdAt,
            name: users.name,
            userName: users.userName,
            userAvatar: users.profilePicture,
            likedByUser: sql<boolean>`CASE WHEN ${postLikes.userId} IS NOT NULL THEN true ELSE false END`.as('liked_by_user'),
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.userId))
        .leftJoin(postLikes,
            and(
                eq(postLikes.postId, posts.postId),
                eq(postLikes.userId, currentUserId)
            )
        )
        .where(
            cursorDate && cursorId
                ? or(
                    lt(posts.createdAt, cursorDate),
                    and(eq(posts.createdAt, cursorDate), lt(posts.postId, cursorId))
                )
                : undefined
        )
        .orderBy(desc(posts.createdAt), desc(posts.postId))
        .limit(limit + 1);

    const hasNextPage = allPosts.length > limit;
    const dataToSend = hasNextPage ? allPosts.slice(0, -1) : allPosts;

    let nextCursor: string | null = null;
    if (dataToSend.length > 0) {
        const lastItem = dataToSend[dataToSend.length - 1];
        nextCursor = `${lastItem.createdAt.toISOString()}_${lastItem.postId}`;
    }

    return res.status(200).json(
        new ApiResponses(
            200,
            {
                posts: dataToSend,
                nextCursor,
                hasNextPage
            }
        ));
});

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
    if (!req.headers["x-user-id"] || Array.isArray(req.headers["x-user-id"])) {
        throw new ApiError(401, "Unauthorized");
    }
    const currentUserId = req.headers["x-user-id"];
    const db = req.app.locals.db;
    const postId = req.params.id;
    console.log(req.params);


    if (!postId) {
        throw new ApiError(400, "Post ID is required");
    }

    const result = await db.transaction(async (tx: any) => {
        const existing = await tx
            .select()
            .from(postLikes)
            .where(
                and(
                    eq(postLikes.postId, postId),
                    eq(postLikes.userId, currentUserId)
                )
            )
            .limit(1);

        if (existing.length > 0) {

            await tx.delete(postLikes)
                .where(
                    and(
                        eq(postLikes.postId, postId),
                        eq(postLikes.userId, currentUserId)
                    )
                );

            const updated = await tx.update(posts)
                .set({ likes: sql`${posts.likes} - 1` })
                .where(eq(posts.postId, postId))
                .returning({ likes: posts.likes });

            return { isLiked: false, likeCount: updated[0].likes };
        } else {

            await tx.insert(postLikes).values({
                userId: currentUserId,
                postId
            });

            const updated = await tx.update(posts)
                .set({
                    likes: sql`${posts.likes} + 1`
                })
                .where(eq(posts.postId, postId))
                .returning({ likes: posts.likes });

            return { isLiked: true, likeCount: updated[0].likes };
        }
    });

    return res.status(200).json(
        new ApiResponses(200, {
            isLiked: result.isLiked,
            likeCount: result.likeCount
        })
    );

});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.headers["x-user-id"] || Array.isArray(req.headers["x-user-id"])) {
        throw new ApiError(401, "Unauthorized");
    }
    const currentUserId = req.headers["x-user-id"];

    const { postId } = req.params;
    if (!postId) {
        throw new ApiError(400, "Post ID is required");
    }
    const { text } = req.body;
    if (!text || typeof text !== "string") {
        throw new ApiError(400, "Comment text is required");
    }

    const db = req.app.locals.db;
    const result = await db.transaction(async (tx: any) => {
        const [newComment] = await tx.insert(postComments).values({
            postId,
            userId: currentUserId,
            comment: text.trim(),
        }).returning();

        const updatedPost = await tx.update(posts)
            .set({ comments: sql`${posts.comments} + 1` })
            .where(eq(posts.postId, postId))
            .returning({ newCount: posts.comments });

        return {
            comment: newComment,
            count: updatedPost?.newCount ?? 0,
        };
    });

    return res.status(200).json(
        new ApiResponses(
            200,
            {
                comment: result.comment,
                commentCount: result.count
            },
            "Comment added successfully"
        )
    );
});