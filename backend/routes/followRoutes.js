const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Follow user
router.post("/:userId", authMiddleware, (req, res) => {
  const followerId = req.user.id;
  const followingId = req.params.userId;

  if (parseInt(followerId) === parseInt(followingId)) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  const sql = "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)";

  db.query(sql, [followerId, followingId], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "You already follow this user" });
      }

      return res.status(500).json({ message: "Failed to follow user", error: err });
    }

    res.status(201).json({ message: "User followed successfully" });
  });
});

// Unfollow user
router.delete("/:userId", authMiddleware, (req, res) => {
  const followerId = req.user.id;
  const followingId = req.params.userId;

  const sql = "DELETE FROM follows WHERE follower_id = ? AND following_id = ?";

  db.query(sql, [followerId, followingId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to unfollow user", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "You are not following this user" });
    }

    res.json({ message: "User unfollowed successfully" });
  });
});

// Get followers of a user
router.get("/:userId/followers", authMiddleware, (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      users.id,
      users.name,
      users.email
    FROM follows
    JOIN users ON follows.follower_id = users.id
    WHERE follows.following_id = ?
    ORDER BY follows.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to get followers", error: err });
    }

    res.json(results);
  });
});

// Get users that a user is following
router.get("/:userId/following", authMiddleware, (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      users.id,
      users.name,
      users.email
    FROM follows
    JOIN users ON follows.following_id = users.id
    WHERE follows.follower_id = ?
    ORDER BY follows.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to get following", error: err });
    }

    res.json(results);
  });
});

module.exports = router;