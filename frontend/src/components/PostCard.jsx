import { useState } from "react";
import axios from "axios";
import CommentBox from "./CommentBox";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function PostCard({ post, refreshPosts }) {
  const token = localStorage.getItem("token");

  const [showComments, setShowComments] = useState(false);

  const likePost = async () => {
    try {
      await axios.post(
        `${API_URL}/likes/${post.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      refreshPosts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to like post");
    }
  };

  const unlikePost = async () => {
    try {
      await axios.delete(`${API_URL}/likes/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      refreshPosts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to unlike post");
    }
  };

  return (
    <div className="card">
      <div className="post-meta">
        Posted by {post.user_name} | {new Date(post.created_at).toLocaleString()}
      </div>

      <p>{post.content}</p>

      <div className="actions">
        <button onClick={likePost}>Like</button>
        <button className="secondary" onClick={unlikePost}>
          Unlike
        </button>

        <span>{post.like_count} likes</span>
        <span>{post.comment_count} comments</span>

        <button
          className="secondary"
          onClick={() => setShowComments(!showComments)}
        >
          {showComments ? "Hide Comments" : "Show Comments"}
        </button>
      </div>

      {showComments && (
        <CommentBox postId={post.id} onCommentAdded={refreshPosts} />
      )}
    </div>
  );
}

export default PostCard;