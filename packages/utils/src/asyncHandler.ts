import { NextFunction, Request, RequestHandler, Response } from "express";
import { ApiError } from "./apiError"

export const asyncHandler = (func: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await func(req, res, next);

        } catch (error: unknown) {

            let statusCode = 500;
            let message = "Internal Server Error";
            let success = false;

            if (error instanceof ApiError) {
                statusCode = error.statusCode;
                message = error.message;
                success = error.success || false;

            } else if (error instanceof Error) {
                message = error.message;
            }

            console.error("ERROR CAUGHT BY ASYNC_HANDLER:", error);

            res.status(statusCode).json({
                message: message,
                success: success,
            });
        }
    };
};