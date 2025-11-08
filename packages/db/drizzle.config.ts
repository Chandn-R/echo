import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv"
import "dotenv/config"


export default defineConfig({
    schema: ["./src/schema/schema.ts","./src/schema/relations.ts"],
    out: "./migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    breakpoints: true,
    verbose: true,
    strict: true,
});
