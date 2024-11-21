import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineDelete } from "react-icons/ai";
import { BiRepost } from "react-icons/bi";
import { FaRegComment, FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Link } from "react-router-dom";
import { formatPostDate } from "../../utils/date";
import LoadingSpinner from "./LoadingSpinner";

const Post = ({ post }) => {
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [comment, setComment] = useState("");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((p) => p._id !== post._id);
      });
    },
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${post._id}`, {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    },
    onSuccess: (updatedLikes) => {
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData) return [];
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const {
    mutate: commentPost,
    isPending: isCommenting,
    isError,
    error,
  } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: comment }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    },
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData) return [];
        return oldData.map((post) => {
          if (post._id === updatedPost._id) {
            return { ...post, comments: updatedPost.comments };
          }
          return post;
        });
      });
      setComment("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: deleteComment } = useMutation({
    mutationFn: async (commentId) => {
      try {
        const res = await fetch(
          `/api/posts/comments/${post._id}/${commentId}`,
          {
            method: "DELETE",
          }
        );

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to delete comment");
        }
        return data; // Make sure to return the data here
      } catch (error) {
        console.error("Error deleting comment: ", error);
        throw new Error(error.message || "Something went wrong with deletion");
      }
    },
    onSuccess: (updatedDeleteComment) => {
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData) return [];
        return oldData.map((post) => {
          if (post._id === post._id) {
            return { ...post, comments: updatedDeleteComment.comments };
          }
          return post;
        });
      });
    },

    onSettled: () => {
      setDeletingCommentId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const postOwner = post?.user;
  const isLiked = post?.likes.includes(authUser?._id);

  const isMyPost = authUser?._id === post?.user?._id;

  const formattedDate = formatPostDate(post?.createdAt);

  const commentRef = useRef(null);

  useEffect(() => {
    if (post?.comments?.length > 0 && commentRef.current) {
      commentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [post?.comments]);

  const handleDeletePost = (commentId) => {
    deletePost(commentId);
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    commentPost();
  };

  const handleLikePost = () => {
    if (isLiking) return;
    likePost();
  };
  const handleDeleteComment = (commentId) => {
    setDeletingCommentId(commentId);
    deleteComment(commentId, {
      onSettled: () => {
        setDeletingCommentId(null);
      },
    });
  };

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link
            to={`/profile/${postOwner?.username}`}
            className="w-8 rounded-full overflow-hidden"
          >
            <img src={postOwner?.profileImg || "/avatar-placeholder.png"} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            {postOwner?.fullName}
            <span className="text-gray-700 flex gap-1 text-sm">
              @{postOwner?.username}
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <div className="dropdown dropdown-bottom flex justify-end items-center flex-1">
                <div tabIndex={0} role="button" className="m-1 ">
                  <HiOutlineDotsVertical className="w-6 h-6 text-gray-500 cursor-pointer" />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a onClick={() => handleDeletePost(comment._id)}>
                      {isDeleting ? "Deleting..." : "Delete"}
                    </a>
                    <Link to={`/profile/${postOwner?.username}`}>Profile</Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post?.text}</span>
            {post?.img && (
              <img
                src={post?.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
              />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() =>
                  document
                    .getElementById("comments_modal" + post._id)
                    .showModal()
                }
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post?.comments?.length}
                </span>
              </div>
              {/* We're using Modal Component from DaisyUI */}
              <dialog
                id={`comments_modal${post?._id}`}
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    {post?.comments?.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {post?.comments?.map((comment) => (
                      <div
                        ref={commentRef}
                        key={comment._id}
                        className="flex gap-2 items-start p-4 bg-bgColor rounded"
                      >
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <Link
                              to={`/profile/${comment.user.username}`}
                              className="font-bold"
                            >
                              <img
                                src={
                                  comment?.user.profileImg ||
                                  "/avatar-placeholder.png"
                                }
                                alt={`${comment.user.fullName} avatar`}
                              />
                            </Link>{" "}
                          </div>
                        </div>

                        <div className="flex flex-col flex-1">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              <Link
                                to={`/profile/${comment.user.username}`}
                                className="font-bold"
                              >
                                {comment.user.fullName}
                              </Link>
                            </span>
                            <span className="text-gray-700 text-sm">
                              <Link
                                to={`/profile/${comment.user.username}`}
                                className="font-bold"
                              >
                                @{comment.user.username}
                              </Link>
                            </span>
                          </div>
                          <div className="text-sm">{comment.text}</div>
                        </div>
                        {comment.user._id === authUser?._id && (
                          <div className="cursor-pointer hover:text-red-500">
                            {deletingCommentId === comment._id ? (
                              "Deleting..."
                            ) : (
                              <AiOutlineDelete
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteComment(comment._id);
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <form
                    className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                    onSubmit={handlePostComment}
                  >
                    <textarea
                      className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                      {isCommenting ? "Posting..." : "Post"}
                    </button>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {isLiking && <LoadingSpinner size="sm" />}
                {!isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
                )}

                <span
                  className={`text-sm  group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500" : "text-slate-500"
                  }`}
                >
                  {post.likes.length}
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Post;
