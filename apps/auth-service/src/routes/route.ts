import express, { Router } from "express";
import { register, login, logout, refreshAccessToken, } from "../controllers/auth.controller.js";

const router: Router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshAccessToken);

export default router;