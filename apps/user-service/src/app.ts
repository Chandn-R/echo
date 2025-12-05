import express from "express";
import type { Express } from "express";
import morgan from "morgan";


export const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";

app.use("/", userRoutes);
app.use("/posts", postRoutes);