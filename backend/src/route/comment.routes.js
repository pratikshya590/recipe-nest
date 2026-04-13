const express = require("express");
const router = express.Router();
const { getComments, addComment, addReply, deleteComment, deleteReply } = require("../controllers/Comment.controller");
const { protect } = require("../middleware/auth.middleware");

// Get all comments for a recipe (public)
router.get("/:recipeId", getComments);

// Add a comment to a recipe (logged in)
router.post("/:recipeId", protect, addComment);

// Add a reply to a comment (chef/admin only )
router.post("/:commentId/reply", protect, addReply);

// Delete a comment
router.delete("/comment/:commentId", protect, deleteComment);

// Delete a reply
router.delete("/:commentId/reply/:replyId", protect, deleteReply);

module.exports = router;