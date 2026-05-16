const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create post
router.post("/", authMiddleware, (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ message: "Post content is required" });
  }

  const sql = "INSERT INTO posts (user_id, content) VALUES (?, ?)";

  db.query(sql, [userId, content], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to create post", error: err });
    }

    res.status(201).json({
      message: "Post created successfully",
      postId: result.insertId
    });
  });
});

// Get all posts
router.get("/", authMiddleware, (req, res) => {
  const sql = `
    SELECT 
      posts.id,
      posts.content,
      posts.created_at,
      users.id AS user_id,
      users.name AS user_name,
      COUNT(DISTINCT likes.id) AS like_count,
      COUNT(DISTINCT comments.id) AS comment_count
    FROM posts
    JOIN users ON posts.user_id = users.id
    LEFT JOIN likes ON posts.id = likes.post_id
    LEFT JOIN comments ON posts.id = comments.post_id
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to get posts", error: err });
    }

    res.json(results);
  });
});

// Get my posts
router.get("/my-posts", authMiddleware, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      posts.id,
      posts.content,
      posts.created_at,
      users.name AS user_name
    FROM posts
    JOIN users ON posts.user_id = users.id
    WHERE posts.user_id = ?
    ORDER BY posts.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to get my posts", error: err });
    }

    res.json(results);
  });
});

// Get feed posts from followed users
router.get("/feed/following", authMiddleware, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      posts.id,
      posts.content,
      posts.created_at,
      users.id AS user_id,
      users.name AS user_name,
      COUNT(DISTINCT likes.id) AS like_count,
      COUNT(DISTINCT comments.id) AS comment_count
    FROM posts
    JOIN users ON posts.user_id = users.id
    JOIN follows ON posts.user_id = follows.following_id
    LEFT JOIN likes ON posts.id = likes.post_id
    LEFT JOIN comments ON posts.id = comments.post_id
    WHERE follows.follower_id = ?
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to get feed", error: err });
    }

    res.json(results);
  });
});

// Delete own post
router.delete("/:postId", authMiddleware, (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  const sql = "DELETE FROM posts WHERE id = ? AND user_id = ?";

  db.query(sql, [postId, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to delete post", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Post not found or not allowed" });
    }

    res.json({ message: "Post deleted successfully" });
  });
});

module.exports = router;