import "dotenv/config"
import express, { Request, Response } from "express"
import cors from "cors"
import helmet from "helmet";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import { protectRoute } from "./middleware/authorisation.js";
import { connectDb, createRateLimiter, redisClient } from "./middleware/rateLimit.js";
import { checkEnv } from "@repo/utils";

checkEnv(["PORT", "ACCESS_TOKEN_SECRET"])


const PORT = process.env.PORT;
const app = express();

async function server() {
    await connectDb();

    const limiter = createRateLimiter();

    // Middlewares
    app.use(cors({
        origin: "http://localhost:5173",
        credentials: true,
    }));
    app.use(helmet());
    app.use(morgan("combined"));
    app.disable("x-powered-by"); // Hide Express server information
    app.use(limiter);
    app.use(protectRoute);

    const services = [
        {
            route: "/api/v1/auth",
            target: "http://localhost:5001",
        },
        {
            route: "/api/v1/users",
            target: "http://localhost:5002",
        },
        {
            route: "/api/v1/chats",
            target: "http://localhost:5003",
        },
    ];

    services.forEach(({ route, target }) => {
        const proxyOptions = {
            target,
            changeOrigin: true,
            secure: false,
            onProxyReq: (proxyReq: any, req: Request, res: Response) => {
                if (req.headers.cookie) {
                    proxyReq.setHeader("cookie", req.headers.cookie);
                }
            },
            onProxyRes: (proxyRes: any) => {
                proxyRes.headers["Access-Control-Allow-Origin"] = "http://localhost:5173";
                proxyRes.headers["Access-Control-Allow-Credentials"] = "true";
            },
        };
        app.use(route, createProxyMiddleware<Request, Response>(proxyOptions));
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



