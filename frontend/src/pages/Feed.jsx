import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Feed() {
  const token = localStorage.getItem("token");

  const [content, setContent] = useState("");
  const [feedPosts, setFeedPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);

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

  const createPost = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      await axios.post(
        `${API_URL}/posts`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setContent("");
      fetchFeed();
      fetchAllPosts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create post");
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchAllPosts();
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h2>Create Post</h2>

        <form onSubmit={createPost}>
          <textarea
            placeholder="What is on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button type="submit">Post</button>
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