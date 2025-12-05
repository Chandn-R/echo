import express, { Router } from "express";
import { followUser, getUserProfile, unfollowUser, updateProfile } from "../controllers/user.controllers.js";
import { upload } from "src/middlewares/multer.js";

const router: Router = express.Router();

router.post("/follow/:id", followUser);
router.post("/unfollow/:id", unfollowUser);
router.post("/profile/update",upload.single("profile_picture"), updateProfile);
router.get("/profile/:id", getUserProfile);

export default router;