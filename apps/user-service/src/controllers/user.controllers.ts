import { ApiError, ApiResponses, asyncHandler, cloudinaryUpload } from "@repo/utils";
import { Request, Response } from "express";
import { users, follows, eq, and, not, profileSettings, posts, count, desc } from "@repo/db";


export const followUser = asyncHandler(async (req: Request, res: Response) => {
    const userToFollowId = req.params.id;
    const currentUserId = req.headers["x-user-id"] as string;
    const db = req.app.locals.db;

    if (!currentUserId) throw new ApiError(401, "User not authenticated");
    if (!userToFollowId) throw new ApiError(400, "User ID is required");
    if (userToFollowId === currentUserId) throw new ApiError(400, "You cannot follow yourself");

    const [targetUser] = await db.select({ username: users.userName })
        .from(users)
        .where(eq(users.userId, userToFollowId))
        .limit(1);

    if (!targetUser) throw new ApiError(404, "User not found");

    const [existingFollow] = await db.select()
        .from(follows)
        .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, userToFollowId)))
        .limit(1);

    if (existingFollow) throw new ApiError(400, "Already following");

    await db.insert(follows).values({ followerId: currentUserId, followingId: userToFollowId });

    res.status(200).json(new ApiResponses(200, null, `Following ${targetUser.username}`));
});

export const unfollowUser = asyncHandler(async (req: Request, res: Response) => {
    const userToUnfollowId = req.params.id;
    const currentUserId = req.headers["x-user-id"] as string;
    const db = req.app.locals.db;

    if (!currentUserId) throw new ApiError(401, "User not authenticated");
    if (!userToUnfollowId) throw new ApiError(400, "User ID is required");

    const [deleted] = await db.delete(follows)
        .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, userToUnfollowId)))
        .returning();

    if (!deleted) throw new ApiError(400, "You were not following this user");

    res.status(200).json(new ApiResponses(200, null, "Unfollowed successfully"));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const currentUserId = req.headers["x-user-id"] as string;
    const db = req.app.locals.db;

    const { name, username, email, bio, birthDate, private: isPrivate, country, language } = req.body;
    const profilePicture = req.file as Express.Multer.File | undefined;

    if (!currentUserId) throw new ApiError(401, "Unauthorized");

    if (username) {
        const [taken] = await db.select().from(users)
            .where(and(eq(users.userName, username), not(eq(users.userId, currentUserId))));
        if (taken) throw new ApiError(400, "Username taken");
    }
    if (email) {
        const [taken] = await db.select().from(users)
            .where(and(eq(users.email, email), not(eq(users.userId, currentUserId))));
        if (taken) throw new ApiError(400, "Email taken");
    }

    const userUpdates: any = {};
    if (name) userUpdates.name = name;
    if (username) userUpdates.userName = username;
    if (email) userUpdates.email = email;

    if (profilePicture) {
        const uploaded = await cloudinaryUpload(profilePicture.buffer, "profile_picture");
        userUpdates.profilePicture = uploaded;
    }

    const settingsUpdates: any = {};
    if (bio !== undefined) settingsUpdates.bio = bio;
    if (birthDate) settingsUpdates.birthDate = birthDate;
    if (isPrivate !== undefined) settingsUpdates.private = isPrivate === 'true' || isPrivate === true;
    if (country) settingsUpdates.country = country;
    if (language) settingsUpdates.language = language;

    await db.transaction(async (tx: any) => {
        if (Object.keys(userUpdates).length > 0) {
            await tx.update(users).set(userUpdates).where(eq(users.userId, currentUserId));
        }

        if (Object.keys(settingsUpdates).length > 0) {
            const [exists] = await tx.select().from(profileSettings).where(eq(profileSettings.userId, currentUserId));

            if (exists) {
                await tx.update(profileSettings).set(settingsUpdates).where(eq(profileSettings.userId, currentUserId));
            } else {
                await tx.insert(profileSettings).values({ userId: currentUserId, ...settingsUpdates });
            }
        }
    });

    res.status(200).json(new ApiResponses(200, null, "Profile updated successfully"));
});

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const targetUserId = req.params.id || req.headers["x-user-id"] as string;
    const currentUserId = req.headers["x-user-id"] as string;
    const db = req.app.locals.db;

    if (!targetUserId) throw new ApiError(400, "User ID required");

    const [user] = await db
        .select({
            userId: users.userId,
            name: users.name,
            userName: users.userName,
            email: users.email,
            profilePicture: users.profilePicture,
            createdAt: users.createdAt,
            bio: profileSettings.bio,
            birthDate: profileSettings.birthDate,
            private: profileSettings.private,
            country: profileSettings.country,
            language: profileSettings.language,
        })
        .from(users)
        .leftJoin(profileSettings, eq(users.userId, profileSettings.userId))
        .where(eq(users.userId, targetUserId))
        .limit(1);

    if (!user) throw new ApiError(404, "User not found");

    const [followerData] = await db.select({ value: count() }).from(follows).where(eq(follows.followingId, targetUserId));
    const [followingData] = await db.select({ value: count() }).from(follows).where(eq(follows.followerId, targetUserId));

    let isFollowing = false;
    if (currentUserId && currentUserId !== targetUserId) {
        const [check] = await db.select().from(follows)
            .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUserId)));
        isFollowing = !!check;
    }

    const userPosts = await db
        .select({
            postId: posts.postId,
            image: posts.image,
            description: posts.description,
            likes: posts.likes,
            comments: posts.comments,
            createdAt: posts.createdAt
        })
        .from(posts)
        .where(eq(posts.userId, targetUserId))
        .orderBy(desc(posts.createdAt));

    const responseData = {
        ...user,
        followersCount: followerData?.value || 0,
        followingCount: followingData?.value || 0,
        isFollowing,
        posts: userPosts
    };

    res.status(200).json(new ApiResponses(200, responseData, "Profile fetched"));
});