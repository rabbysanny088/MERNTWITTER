const express = require("express");
const protectedRoute = require("../middleware/protectedRoute");
const {
  getUserProfile,
  followUnfollower,
  getSuggestedUsers,
  updateUser,
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/profile/:username", protectedRoute, getUserProfile);
router.get("/suggested", protectedRoute, getSuggestedUsers);
router.post("/follow/:id", protectedRoute, followUnfollower);
router.post("/update", protectedRoute, updateUser);

module.exports = router;
