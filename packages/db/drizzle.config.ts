import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: 'dist/libs/db/schema/schemas/*.ts',
    out: "libs/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    breakpoints: true,
    verbose: true,
    strict: true,
});
