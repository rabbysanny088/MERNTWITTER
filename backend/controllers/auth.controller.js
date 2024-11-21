const {
  generateTokenAndSetCookie,
} = require("../lib/utils/generateTokenAndSetCookie");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

const handleSignup = async (req, res) => {
  const { fullName, username, email, password } = req.body;

  // if (!fullName || !username || !email || !password) {
  //   return res.status(400).json({ error: "All filds are required" });
  // }
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password should be at least 6 characters" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in handleSignup", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user) {
      return res.status(400).json({ error: "User is not found" });
    } else if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Password is incorrect" });
    }
    generateTokenAndSetCookie(user._id, res);
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log("Error in handleLogin", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const handleLogout = async (req, res) => {
  try {
    await res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in handleLogout", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const handleAuthCheck = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in handleAuthCheck", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { handleSignup, handleLogin, handleLogout, handleAuthCheck };
