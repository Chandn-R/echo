import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError, asyncHandler } from "@repo/utils";

interface AuthPayload extends JwtPayload {
    id: string;
}

export const protectRoute = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;

    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
        throw new ApiError(401, "Unauthorized: No token provided");
    }

    try {
        const decoded = jwt.verify(token, accessTokenSecret);

        if (typeof decoded !== 'object' || !decoded.id) {
            throw new Error("Invalid token payload");
        }
        const payload = decoded as AuthPayload;
        req.user = { userId: payload.id };
        console.log("Users token verified");
        next();

    } catch (error) {

        if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, "Unauthorized: Session expired");
        }

        throw new ApiError(401, "Unauthorized: Invalid token");
    }
});