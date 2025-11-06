import express from "express";
import type { Express } from "express";


export const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


import authRoutes from "./routes/route.js";

app.use("/", authRoutes);