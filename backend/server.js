require("dotenv").config();
const express = require("express");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const authRoute = require("./routers/auth.route");
const userRoute = require("./routers/user.route");
const postRoute = require("./routers/post.route");
const notificationRoute = require("./routers/notification.route");
const connectToMongoDB = require("./db/connection");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const __dirnames = path.resolve();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

const PORT = process.env.PORT || 4000;

// middleware
app.use(
  cors({
    origin: "http://localhost:5173/",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/notifications", notificationRoute);

app.use(express.static(path.join(__dirnames, "/frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirnames, "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Sever is running at http://localhost:${PORT}`);
  connectToMongoDB();
});
