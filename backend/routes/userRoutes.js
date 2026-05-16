const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users except logged-in user
router.get("/", authMiddleware, (req, res) => {
  const loggedInUserId = req.user.id;

  const sql = `
    SELECT 
      users.id,
      users.name,
      users.email,
      users.created_at,
      CASE 
        WHEN follows.id IS NULL THEN 0 
        ELSE 1 
      END AS is_following
    FROM users
    LEFT JOIN follows 
      ON users.id = follows.following_id 
      AND follows.follower_id = ?
    WHERE users.id != ?
    ORDER BY users.created_at DESC
  `;

  db.query(sql, [loggedInUserId, loggedInUserId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to get users", error: err });
    }

    res.json(results);
  });
});

// Get single user profile
router.get("/:id", authMiddleware, (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT 
      users.id,
      users.name,
      users.email,
      users.created_at,
      COUNT(DISTINCT followers.id) AS followers_count,
      COUNT(DISTINCT following.id) AS following_count,
      COUNT(DISTINCT posts.id) AS posts_count
    FROM users
    LEFT JOIN follows AS followers ON users.id = followers.following_id
    LEFT JOIN follows AS following ON users.id = following.follower_id
    LEFT JOIN posts ON users.id = posts.user_id
    WHERE users.id = ?
    GROUP BY users.id
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to get user profile", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]);
  });
});

module.exports = router;