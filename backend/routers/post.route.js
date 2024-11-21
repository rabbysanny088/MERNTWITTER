const express = require("express");
const protectedRoute = require("../middleware/protectedRoute");
const {
  createPost,
  deletePost,
  commentPost,
  likeUnlikePost,
  getAllPosts,
  getLikedPosts,
  getFollowingPost,
  getUserPosts,
  deleteComment,
} = require("../controllers/post.controller");
const router = express.Router();

router.get("/all", protectedRoute, getAllPosts);
router.get("/following", protectedRoute, getFollowingPost);
router.get("/user/:username", protectedRoute, getUserPosts);
router.get("/likes/:id", protectedRoute, getLikedPosts);
router.post("/create", protectedRoute, createPost);
router.delete("/:id", protectedRoute, deletePost);
router.post("/like/:id", protectedRoute, likeUnlikePost);
router.post("/comment/:id", protectedRoute, commentPost);
router.delete("/comments/:postId/:commentId", protectedRoute, deleteComment);

module.exports = router;
