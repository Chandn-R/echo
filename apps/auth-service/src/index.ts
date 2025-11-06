import "dotenv/config"
import { app } from "./app.js";
import { checkEnv } from "@repo/utils";
import { initializeDatabase } from "@repo/db";


const PORT = process.env.PORT;

checkEnv(['DATABASE_URL',
    "REFRESH_TOKEN_SECRET",
    "REFRESH_TOKEN_EXPIRY",
    "ACCESS_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRY",
    'PORT']);

async function server() {
    const { db, pool } = await initializeDatabase();
    console.log("Database is active");

    app.locals.db = db;

    const server = app.listen(PORT, () => {
        console.log(`Auth Service is running on port ${PORT}`);
    });

    const gracefulShutdown = (signal: string) => {
        console.log(`\nReceived ${signal}. Shutting down gracefully..`);
        server.close(async () => {
            console.log("HTTP server closed.");
            await pool.end();
            console.log("Database pool closed.");
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

