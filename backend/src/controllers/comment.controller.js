const Comment = require("../models/Comment.model");
const { NODE_ENV } = require("../../config/config");

const handleError = (res, error) => {
  console.error("Comment Controller Error:", error.message);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(NODE_ENV === "development" && { stack: error.stack }),
  });
};

// GET /api/comments/:recipeId — public
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ recipe: req.params.recipeId, isActive: true })
      .populate("user", "name avatar role")
      .populate("replies.user", "name avatar role")
      .sort({ createdAt: -1 });

    // Filter out inactive replies
    const filtered = comments.map((c) => {
      const obj = c.toObject();
      obj.replies = obj.replies.filter((r) => r.isActive !== false);
      return obj;
    });

    res.status(200).json({ success: true, data: { comments: filtered } });
  } catch (error) {
    handleError(res, error);
  }
};

// POST /api/comments/:recipeId — logged in users
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }
    if (text.length > 500) {
      return res.status(400).json({ success: false, message: "Comment cannot exceed 500 characters" });
    }

    const comment = await Comment.create({
      recipe: req.params.recipeId,
      user: req.user.id,
      text: text.trim(),
    });

    await comment.populate("user", "name avatar role");
    res.status(201).json({ success: true, message: "Comment added", data: { comment } });
  } catch (error) {
    handleError(res, error);
  }
};

// POST /api/comments/:commentId/reply — chef only (or admin)
const addReply = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Reply text is required" });
    }
    if (text.length > 500) {
      return res.status(400).json({ success: false, message: "Reply cannot exceed 500 characters" });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Only chef or admin can reply
    if (req.user.role !== "chef" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only chefs can reply to comments" });
    }

    comment.replies.push({ user: req.user.id, text: text.trim() });
    await comment.save();

    // Populate and return the full updated comment
    await comment.populate("user", "name avatar role");
    await comment.populate("replies.user", "name avatar role");

    const obj = comment.toObject();
    obj.replies = obj.replies.filter((r) => r.isActive !== false);

    res.status(201).json({ success: true, message: "Reply added", data: { comment: obj } });
  } catch (error) {
    handleError(res, error);
  }
};

// DELETE /api/comments/comment/:commentId — own comment or admin
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    if (comment.user.toString() !== req.user.id && req.user.role !== "admin" && req.user.role !== "chef") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    comment.isActive = false;
    await comment.save();
    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    handleError(res, error);
  }
};

// DELETE /api/comments/:commentId/reply/:replyId — chef or admin
const deleteReply = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    if (reply.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    reply.isActive = false;
    await comment.save();
    res.status(200).json({ success: true, message: "Reply deleted" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getComments, addComment, addReply, deleteComment, deleteReply };