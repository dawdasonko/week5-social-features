const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add comment to post
router.post("/:postId", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ message: "Comment is required" });
  }

  const sql = "INSERT INTO comments (user_id, post_id, comment) VALUES (?, ?, ?)";

  db.query(sql, [userId, postId, comment], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to add comment", error: err });
    }

    res.status(201).json({
      message: "Comment added successfully",
      commentId: result.insertId
    });
  });
});

// Get comments for a post
router.get("/:postId", authMiddleware, (req, res) => {
  const postId = req.params.postId;

  const sql = `
    SELECT 
      comments.id,
      comments.comment,
      comments.created_at,
      users.id AS user_id,
      users.name AS user_name,
      users.email
    FROM comments
    JOIN users ON comments.user_id = users.id
    WHERE comments.post_id = ?
    ORDER BY comments.created_at DESC
  `;

  db.query(sql, [postId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to get comments", error: err });
    }

    res.json(results);
  });
});

// Delete own comment
router.delete("/:commentId", authMiddleware, (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user.id;

  const sql = "DELETE FROM comments WHERE id = ? AND user_id = ?";

  db.query(sql, [commentId, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to delete comment", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Comment not found or not allowed" });
    }

    res.json({ message: "Comment deleted successfully" });
  });
});

module.exports = router;