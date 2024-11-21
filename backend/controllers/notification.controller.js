const Notification = require("../models/notification.model");

const getNotifications = async (req, res) => {
  const userId = req.user._id;
  try {
    const notification = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });
    await Notification.updateMany({ to: userId }, { read: true });
    return res.status(200).json(notification);
  } catch (error) {
    console.log("Error in getNotifications", error.message);
    return res.status(500).json({ error: error.message });
  }
};
const deleteNotifications = async (req, res) => {
  const notificationId = req.user._id;
  try {
    await Notification.deleteMany({ to: notificationId });
    return res
      .status(200)
      .json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotifications", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const deleteOneNotification = async (req, res) => {
  const userId = req.user._id;
  const notificationId = req.params.id;
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You are not allowed to delete this notification" });
    }

    await Notification.findByIdAndDelete(notificationId);
    return res
      .status(200)
      .json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log("Error in deleteOneNotification", error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNotifications,
  deleteNotifications,
  deleteOneNotification,
};
