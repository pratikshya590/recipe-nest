const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // What is being reported
    targetType: {
      type: String,
      enum: ["recipe", "user"],
      required: true,
    },
    targetRecipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reason: {
      type: String,
      enum: ["spam", "offensive", "inappropriate", "wrong_info", "other"],
      required: true,
    },
    details: {
      type: String,
      trim: true,
      maxlength: [300, "Details cannot exceed 300 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "ignored"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", ReportSchema);

module.exports = Report;