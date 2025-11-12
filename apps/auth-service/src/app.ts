import express from "express";
import type { Express } from "express";
import cookieParser from "cookie-parser";

export const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


import authRoutes from "./routes/route.js";

app.use("/", authRoutes);