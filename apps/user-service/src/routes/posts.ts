import express, { Router } from "express";
import { createPost, getAllPosts, toggleLike } from "src/controllers/post.controllers.js";
import { upload } from "src/middlewares/multer.js";

const router: Router = express.Router();

router.post("/", upload.single("image"), createPost);
router.get("/", getAllPosts);
router.post("/like/:id", toggleLike);

export default router;