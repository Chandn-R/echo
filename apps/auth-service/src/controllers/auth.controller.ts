import type { Request, Response } from "express";
import { asyncHandler } from "@repo/utils";
import { ApiError } from "@repo/utils";
import { ApiResponses } from "@repo/utils";
import jwt, { Secret } from "jsonwebtoken";
import { eq, or, profileSettings } from "@repo/db";
import * as bcrypt from "bcryptjs";
import type { StringValue } from "ms";
import { users, type User } from "@repo/db";


const refreshTokenSecret: Secret = process.env.REFRESH_TOKEN_SECRET!
const accessTokenSecret: Secret = process.env.ACCESS_TOKEN_SECRET!
const refreshTokenExpiry = `${Number(process.env.REFRESH_TOKEN_EXPIRY)}${process.env.REFRESH_TOKEN_EXPIRY_UNIT?.toLowerCase()}` as StringValue
const accessTokenExpiry = `${Number(process.env.ACCESS_TOKEN_EXPIRY)}${process.env.ACCESS_TOKEN_EXPIRY_UNIT?.toLowerCase()}` as StringValue

const refreshToken = (id: string) => {
    return jwt.sign(
        { id: id },
        refreshTokenSecret,
        { expiresIn: refreshTokenExpiry }
    )
};

const accessToken = (id: string) => {
    return jwt.sign(
        { id: id },
        accessTokenSecret,
        { expiresIn: accessTokenExpiry }
    )
};

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { name, username, email, password } = req.body;
    const db = req.app.locals.db;

    if (!name || !username || !email || !password) {
        throw new ApiError(404, "Please fill all the fields");
    }

    const existingUser = await db.select().from(users).where(or(eq(users.userName, username), eq(users.email, email))).limit(1);

    if (existingUser.length > 0) {
        throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.transaction(async (tx) => {
        const createNewUser = await tx.insert(users).values({
            name: name,
            userName: username,
            email: email,
            password: hashedPassword,
        }).returning({ id: users.userId });

        if (!createNewUser[0]) {
            throw new ApiError(400, "User not created, transaction rolled back");
        }

        const newUserId = createNewUser[0].id;

        await tx.insert(profileSettings).values({
            userId: newUserId,
        });

        return createNewUser[0];
    });

    if (!newUser) {
        throw new ApiError(500, "Something went wrong during user creation");
    }

    res.status(201).json(
        new ApiResponses(
            201,
            newUser,
            "User created successfully"
        )
    );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const db = req.app.locals.db;
    console.log(email, password);


    if (!email || !password) {
        throw new ApiError(400, "Please provide email and password");
    }

    const user: User = await db.query.users.findFirst({
        where: eq(users.email, email)
    })

    if (!user) {
        throw new ApiError(401, "User with this email does not exist");
    }

    const hashedPassword = user.password as string;
    const checkPassword = await bcrypt.compare(password, hashedPassword);

    if (!checkPassword) {
        throw new ApiError(401, "Invalid Password");
    }

    const cookieOptions = {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: false,
        path: "/",
    };

    res.cookie("refreshToken", refreshToken(user.userId), cookieOptions);

    return res.status(200).json(
        new ApiResponses(
            200,
            {
                id: user.userId,
                username: user.userName,
                email: user.email,
                name: user.name,
                profilePicture: user.profilePicture,
                accessToken: accessToken(user.userId),
            },
            "Login successful"
        )
    );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    // const user = req.user._id;

    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "none" as const,
        path: "/",
    });

    // logger.info(`User ${user}logged out`);

    res.status(200).json(
        new ApiResponses(
            200,
            null,
            "Logout successful"));
});

export const refreshAccessToken = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies?.refreshToken;
        console.log(token)
        const db = req.app.locals.db;


        if (!token) {
            throw new ApiError(401, "Refresh token missing");
        }

        let verifiedToken: any;
        try {
            verifiedToken = jwt.verify(
                token,
                process.env.REFRESH_TOKEN_SECRET as string
            );
        } catch (err) {
            throw new ApiError(403, "Invalid or expired refresh token");
        }

        console.log(`hello,${verifiedToken.id}`);

        const user: User = await db.query.users.findFirst({
            where: eq(users.userId, verifiedToken.id),
            columns: {
                password: false
            }
        })

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        res.status(200).json(
            new ApiResponses(
                200,
                {
                    user,
                    newAccessToken: accessToken(user.userId),
                },
                "New access token generated"
            )
        );
    }
);