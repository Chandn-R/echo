import express from "express";
import type { Express } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";

export const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));


import authRoutes from "./routes/route.js";

app.use("/", authRoutes);