import { ApiError, ApiResponses, asyncHandler, cloudinaryUpload } from "@repo/utils";
import { Request, Response } from "express";
import { users, follows, eq, and, not, profileSettings, posts } from "@repo/db";

export const followUser = asyncHandler(async (req: Request, res: Response) => {
    const userToFollowId = req.params.id;
    const currentUserId = req.user?.userId;
    const db = req.app.locals.db;

    if (!currentUserId) {
        throw new ApiError(401, "User not authenticated");
    }

    if (!userToFollowId) {
        throw new ApiError(400, "User ID is required");
    }

    if (userToFollowId === currentUserId) {
        throw new ApiError(400, "You cannot follow yourself");
    }

    const userToFollow = await db.select({ username: users.userName })
        .from(users)
        .where(eq(users.userId, userToFollowId))
        .limit(1);

    if (!userToFollow[0]) {
        throw new ApiError(404, "User not found");
    }

    const existingFollow = await db.select()
        .from(follows)
        .where(and(
            eq(follows.followerId, currentUserId),
            eq(follows.followingId, userToFollowId)
        ))
        .limit(1);

    if (existingFollow.length > 0) {
        throw new ApiError(400, "You are already following this user");
    }

    await db.insert(follows).values({
        followerId: currentUserId,
        followingId: userToFollowId
    });

    res.status(200).json(
        new ApiResponses(200, null, `Following ${userToFollow[0].username}`)
    );
});

export const unfollowUser = asyncHandler(async (req: Request, res: Response) => {
    const userToUnfollowId = req.params.id;
    const currentUserId = req.user?.userId;
    const db = req.app.locals.db;

    if (!currentUserId) {
        throw new ApiError(401, "User not authenticated");
    }

    if (!userToUnfollowId) {
        throw new ApiError(401, "User not authenticated");
    }

    if (userToUnfollowId === currentUserId) {
        throw new ApiError(400, "You cannot unfollow yourself");
    }

    const userToUnfollow = await db.select({ username: users.userName })
        .from(users)
        .where(eq(users.userId, userToUnfollowId))
        .limit(1);

    if (!userToUnfollow[0]) {
        throw new ApiError(404, "User not found");
    }

    const deletedFollow = await db.delete(follows)
        .where(and(
            eq(follows.followerId, currentUserId),
            eq(follows.followingId, userToUnfollowId)
        ))
        .returning();

    if (deletedFollow.length === 0) {
        throw new ApiError(400, "You are not following this user");
    }

    res.status(200).json(
        new ApiResponses(200, null, `Unfollowed ${userToUnfollow[0].username}`)
    );
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const currentUserId = req.user?.userId;
    const {
        name, username, email,
        bio, birthDate, private: isPrivate, country, language
    } = req.body;
    const profilePicture = req.file as Express.Multer.File | undefined;
    const db = req.app.locals.db;

    if (!currentUserId) {
        throw new ApiError(401, "User not authenticated");
    }

    if (username) {
        const existingUser = await db.select()
            .from(users)
            .where(and(
                eq(users.userName, username),
                not(eq(users.userId, currentUserId))
            ))
            .limit(1);

        if (existingUser.length > 0) {
            throw new ApiError(400, "Username is already taken");
        }
    }

    if (email) {
        const existingEmail = await db.select()
            .from(users)
            .where(and(
                eq(users.email, email),
                not(eq(users.userId, currentUserId))
            ))
            .limit(1);

        if (existingEmail.length > 0) {
            throw new ApiError(400, "Email is already in use");
        }
    }

    const userUpdateData: Partial<typeof users.$inferInsert> = {};
    const profileUpdateData: Partial<typeof profileSettings.$inferInsert> = {};

    if (profilePicture) {
        try {
            const uploadedImage = await cloudinaryUpload(
                profilePicture.buffer,
                "profile_pictures"
            );
            userUpdateData.profilePicture = uploadedImage;
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            throw new ApiError(500, "Failed to upload profile picture");
        }
    }

    if (name) userUpdateData.name = name;
    if (username) userUpdateData.userName = username;
    if (email) userUpdateData.email = email;

    if (bio) profileUpdateData.bio = bio;
    if (birthDate) profileUpdateData.birthDate = birthDate; // Expecting "YYYY-MM-DD" string
    if (isPrivate !== undefined) profileUpdateData.private = isPrivate; // Check for boolean
    if (country) profileUpdateData.country = country;
    if (language) profileUpdateData.language = language;

    try {
        await db.transaction(async (tx: any) => {
            if (Object.keys(userUpdateData).length > 0) {
                await tx.update(users)
                    .set(userUpdateData)
                    .where(eq(users.userId, currentUserId));
            }

            if (Object.keys(profileUpdateData).length > 0) {
                await tx.update(profileSettings)
                    .set(profileUpdateData)
                    .where(eq(profileSettings.userId, currentUserId));
            }
        });
    } catch (error: any) {
        throw new ApiError(500, `Profile update failed: ${error.message}`);
    }

    const updatedProfile = await db.select()
        .from(users)
        .leftJoin(profileSettings, eq(users.userId, profileSettings.userId))
        .where(eq(users.userId, currentUserId))
        .limit(1);

    if (!updatedProfile[0]) {
        throw new ApiError(404, "Failed to retrieve updated profile");
    }

    const responseData = {
        ...updatedProfile[0].Users,
        ...updatedProfile[0].ProfileSettings,
    };

    res.status(200).json(
        new ApiResponses(200, responseData, "Profile updated successfully")
    );
});

export const myProfile = asyncHandler(async (req: Request, res: Response) => {
    const currentUserId = req.params?.id;
    const db = req.app.locals.db;

    if (!currentUserId) {
        throw new ApiError(401, "User not authenticated");
    }
    const userProfile = await db.select()
        .from(users)
        .leftJoin(profileSettings, eq(users.userId, profileSettings.userId))
        .where(eq(users.userId, currentUserId))
        .limit(1);

    if (!userProfile[0]) {
        throw new ApiError(404, "Failed to retrieve user profile");
    }

    const responseData = {
        ...userProfile[0].Users,
        ...userProfile[0].ProfileSettings,
    };

    res.status(200).json(
        new ApiResponses(200, responseData, "User profile retrieved succussfully")
    );
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const currentUserId = req.user._id;

    console.log("Received userId from URL:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const userData = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },

        {
            $project: {
                password: 0,
                __v: 0,
            },
        },

        {
            $lookup: {
                from: "users",
                localField: "followers",
                foreignField: "_id",
                as: "followers",
                pipeline: [{ $project: { username: 1, profilePicture: 1 } }],
            },
        },

        {
            $lookup: {
                from: "users",
                localField: "following",
                foreignField: "_id",
                as: "following",
                pipeline: [{ $project: { username: 1, profilePicture: 1 } }],
            },
        },

        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "user",
                as: "posts",
            },
        },
    ]);
    const user = userData[0];
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isFollowing = user.followers.some(
        (follower: any) => follower._id.toString() === currentUserId.toString()
    );

    res.status(200).json(
        new ApiResponses(
            200,
            { ...user, isFollowing },
            "User retrieved successfully"
        )
    );
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const query: string = req.query.query?.toString() || "";
    const limit: number = parseInt(req.query.limit as string) || 10;
    const lastId: string = req.query.lastId?.toString() || "";

    const filter: any = {};

    if (query) {
        const regex = new RegExp(query, "i");
        filter.username = regex;
    }

    if (lastId) {
        filter._id = { $lt: new mongoose.Types.ObjectId(lastId) };
    }

    const users = await User.find(filter)
        .sort({ _id: -1 })
        .limit(limit + 1);

    const hasNextPage = users.length > limit;
    if (hasNextPage) users.pop();

    res.status(200).json(
        new ApiResponses(
            200,
            {
                users,
                pagination: {
                    hasNextPage,
                    lastId: users.length ? users[users.length - 1]._id : null,
                },
            },
            "Users retrieved successfully"
        )
    );
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
    const currentUserId = req.user?.userId;
    const { description } = req.body;
    const files = req.files as Express.Multer.File[];
    const db = req.app.locals.db;

    if (!files || files.length === 0) {
        throw new ApiError(400, "Image file is required to create a post");
    }

    const file = files[0]
    if (!file) {
        throw new ApiError(400, "Image file is required to create a post");
    }

    const uploadedImage = await cloudinaryUpload(
        file.buffer,
        "post_images"
    );

    const post = await db.insert(posts).values({
        userId: currentUserId,
        image: {
            secure_url: uploadedImage.secure_url,
            public_id: uploadedImage.public_id
        },
        description: description || "",
    })

    res.status(201)
        .json(new ApiResponses(201, post, "Post created successfully"));
});