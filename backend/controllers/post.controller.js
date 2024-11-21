const Post = require("../models/post.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const { v2: cloudinary } = require("cloudinary");

const createPost = async (req, res) => {
  const { text } = req.body;
  let { img } = req.body;
  const userId = req.user._id.toString();
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    if (img) {
      const uploadedRes = await cloudinary.uploader.upload(img);
      img = uploadedRes.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });
    await newPost.save();

    const populatedPost = await Post.findById(newPost._id).populate(
      "user",
      "fullName username profileImg"
    );

    return res.status(201).json(populatedPost);
  } catch (error) {
    console.log("Error in createPost", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deletePost = async (req, res) => {
  const deleteId = req.params.id;
  try {
    const post = await Post.findById(deleteId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const likeUnlikePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      // user unliked
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      return res.status(200).json(updatedLikes);
    } else {
      // user liked
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      const updatedLikes = post.likes;
      return res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts controller: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    return res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getLikedPosts controller: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getFollowingPost = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const following = user.following;

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    return res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPost controller: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts controller: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const commentPost = async (req, res) => {
  const { text } = req.body;
  const postId = req.params.id;
  const userId = req.user._id;

  try {
    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const comment = {
      user: userId,
      text,
    };

    post.comments.push(comment);

    await post.save();

    const updatedPost = await Post.findById(postId).populate(
      "comments.user",
      "fullName username profileImg"
    );
    return res.status(200).json(updatedPost);
  } catch (error) {
    console.log("Error in commentOnPost controller: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this comment" });
    }

    await Post.updateOne(
      { _id: postId },
      { $pull: { comments: { _id: commentId } } }
    );

    const updatedPost = await Post.findById(postId).populate(
      "comments.user",
      "fullName username profileImg"
    );

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.log("Error in deleteComment controller: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllPosts,
  getUserPosts,
  getFollowingPost,
  getLikedPosts,
  createPost,
  deletePost,
  likeUnlikePost,
  deleteComment,
  commentPost,
};
