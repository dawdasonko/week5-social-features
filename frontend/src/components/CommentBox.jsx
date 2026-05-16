import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function CommentBox({ postId, onCommentAdded }) {
  const token = localStorage.getItem("token");

  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/comments/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComments(res.data);
    } catch (err) {
      console.log("Failed to get comments", err);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    try {
      await axios.post(
        `${API_URL}/comments/${postId}`,
        { comment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setComment("");
      fetchComments();

      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add comment");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div>
      <form onSubmit={addComment}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button type="submit">Comment</button>
      </form>

      {comments.map((item) => (
        <div className="comment" key={item.id}>
          <strong>{item.user_name}</strong>
          <p>{item.comment}</p>
        </div>
      ))}
    </div>
  );
}

export default CommentBox;