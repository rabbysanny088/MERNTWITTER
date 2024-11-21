const express = require("express");
const protectedRoute = require("../middleware/protectedRoute");
const {
  getNotifications,
  deleteNotifications,
  deleteOneNotification,
} = require("../controllers/notification.controller");

const router = express.Router();

router.get("/", protectedRoute, getNotifications);
router.delete("/", protectedRoute, deleteNotifications);
router.delete("/:id", protectedRoute, deleteOneNotification);

module.exports = router;
