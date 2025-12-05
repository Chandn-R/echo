import "dotenv/config"
import express, { Request, Response } from "express"
import cors from "cors"
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import { protectRoute } from "./middleware/authorisation.js";
import { connectDb, createRateLimiter, redisClient } from "./middleware/rateLimit.js";
import { checkEnv } from "@repo/utils";

checkEnv(["PORT", "ACCESS_TOKEN_SECRET", "CLIENT_URL"])

const PORT = process.env.PORT;
const app = express();

async function server() {
    await connectDb();

    const limiter = createRateLimiter();

    app.use(cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    }));
    app.use(helmet());
    app.use(morgan("dev"));
    app.use(cookieParser());
    app.disable("x-powered-by");
    app.use(limiter);

    const services = [
        {
            route: "/api/v1/auth",
            target: process.env.AUTH_SERVICE_URL,
            protect: false
        },
        {
            route: "/api/v1/users",
            target: process.env.USER_SERVICE_URL,
            protect: true

        },
        {
            route: "/api/v1/chats",
            target: process.env.CHAT_SERVICE_URL,
            protect: true

        },
    ];

    services.forEach(({ route, target, protect }) => {
        const proxyOptions = {
            target,
            changeOrigin: true,
            secure: false,
            on: {
                proxyReq: (proxyReq: any, req: Request, res: Response) => {

                    if (req.headers['content-type']) {
                        proxyReq.setHeader('Content-Type', req.headers['content-type']);
                    }
                    console.log("Inside proxy--------", req.user, req.user?.userId);

                    if (req.user && req.user.userId) {
                        proxyReq.setHeader('x-user-id', req.user.userId);
                    }

                    if (req.headers.cookie) {
                        proxyReq.setHeader("cookie", req.headers.cookie);
                    }
                }
            }
        };
        if (protect) {
            console.log("This is a proteced route");
            app.use(route, protectRoute, createProxyMiddleware(proxyOptions));
        } else {
            console.log("This is --not-- a proteced route");
            app.use(route, createProxyMiddleware(proxyOptions));
        }
    });

    const server = app.listen(PORT, () => {
        console.log(`Api Gateway is running on port ${PORT}`);
    });

    const gracefulShutdown = (signal: string) => {
        console.log(`\nReceived ${signal}. Shutting down gracefully..`);
        server.close(async () => {
            console.log("HTTP server closed.");
            await redisClient.destroy();
            console.log("Database connection closed.");
            process.exit(0);
        });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
}

server().catch(err => {
    console.error("Fatal error during server startup:", err);
    process.exit(1);
});