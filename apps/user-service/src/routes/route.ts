import express, { Router } from "express";
import { followUser, unfollowUser, updateProfile, myProfile, createPost } from "../controllers/user.controller.js";

const router: Router = express.Router();

router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);
router.post("/profile", updateProfile);
router.get("/profile/:id", myProfile);
router.post("/post", createPost);

export default router;