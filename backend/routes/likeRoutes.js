const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Like a post
router.post("/:postId", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  const sql = "INSERT INTO likes (user_id, post_id) VALUES (?, ?)";

  db.query(sql, [userId, postId], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "You already liked this post" });
      }

      return res.status(500).json({ message: "Failed to like post", error: err });
    }

    res.status(201).json({ message: "Post liked successfully" });
  });
});

// Unlike a post
router.delete("/:postId", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  const sql = "DELETE FROM likes WHERE user_id = ? AND post_id = ?";

  db.query(sql, [userId, postId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to unlike post", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "You have not liked this post" });
    }

    res.json({ message: "Post unliked successfully" });
  });
});

// Get likes of a post
router.get("/:postId", authMiddleware, (req, res) => {
  const postId = req.params.postId;

  const sql = `
    SELECT 
      likes.id,
      users.id AS user_id,
      users.name,
      users.email,
      likes.created_at
    FROM likes
    JOIN users ON likes.user_id = users.id
    WHERE likes.post_id = ?
    ORDER BY likes.created_at DESC
  `;

  db.query(sql, [postId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to get likes", error: err });
    }

    res.json(results);
  });
});

module.exports = router;