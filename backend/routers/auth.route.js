const express = require("express");
const {
  handleSignup,
  handleLogout,
  handleLogin,
  handleAuthCheck,
} = require("../controllers/auth.controller");
const protectedRoute = require("../middleware/protectedRoute");
const router = express.Router();

router.get("/check", protectedRoute, handleAuthCheck);
router.post("/signup", handleSignup);
router.post("/login", handleLogin);
router.post("/logout", handleLogout);

module.exports = router;
