import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Feed() {
  const token = localStorage.getItem("token");

  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [feedPosts, setFeedPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchFeed = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts/feed/following`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFeedPosts(res.data);
    } catch (err) {
      console.log("Failed to get feed", err);
    }
  };

  const fetchAllPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAllPosts(res.data);
    } catch (err) {
      console.log("Failed to get posts", err);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setMedia(null);
      setPreview(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/quicktime",
      "video/webm"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, GIF, MP4, MOV, and WEBM files are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert("File size must be less than 25MB");
      e.target.value = "";
      return;
    }

    setMedia(file);
    setPreview(URL.createObjectURL(file));
  };

  const createPost = async (e) => {
    e.preventDefault();

    if (!content.trim() && !media) {
      alert("Please write something or select media");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("content", content);
      if (media) {
        formData.append("media", media);
      }

      await axios.post(`${API_URL}/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setContent("");
      setMedia(null);
      setPreview(null);

      const fileInput = document.getElementById("mediaUpload");
      if (fileInput) fileInput.value = "";

      fetchFeed();
      fetchAllPosts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchAllPosts();
  }, []);

  return (
    <div className="container">
      <div className="card create-post-card">
        <h2>Create Post</h2>

        <form onSubmit={createPost}>
          <textarea
            placeholder="What is on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <label className="file-label" htmlFor="mediaUpload">
            Choose Image or Video
          </label>

          <input
            id="mediaUpload"
            className="file-input"
            type="file"
            accept="image/*,video/mp4,video/quicktime,video/webm"
            onChange={handleMediaChange}
          />

          {preview && media?.type.startsWith("image/") && (
            <img className="media-preview" src={preview} alt="Preview" />
          )}

          {preview && media?.type.startsWith("video/") && (
            <video className="media-preview" src={preview} controls />
          )}

          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Post"}
          </button>
        </form>
      </div>

      <h2>My Social Feed</h2>
      <p>Posts from users you follow.</p>

      {feedPosts.length === 0 && (
        <div className="card">
          <p>No feed posts yet. Follow users from the Users page.</p>
        </div>
      )}

      {feedPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          refreshPosts={() => {
            fetchFeed();
            fetchAllPosts();
          }}
        />
      ))}

      <h2>All Posts</h2>

      {allPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          refreshPosts={() => {
            fetchFeed();
            fetchAllPosts();
          }}
        />
      ))}
    </div>
  );
}

export default Feed;