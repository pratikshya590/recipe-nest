const Report = require("../models/Report.model");
const { NODE_ENV } = require("../../config/config");

const handleError = (res, error) => {
  console.error("Report Controller Error:", error.message);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(NODE_ENV === "development" && { stack: error.stack }),
  });
};

// any logged in user can report
const createReport = async (req, res) => {
  try {
    const { targetType, targetRecipe, targetUser, reason, details } = req.body;

    if (!targetType || !reason) {
      return res.status(400).json({ success: false, message: "targetType and reason are required" });
    }
    if (!["recipe", "user"].includes(targetType)) {
      return res.status(400).json({ success: false, message: "targetType must be recipe or user" });
    }
    if (!["spam", "offensive", "inappropriate", "wrong_info", "other"].includes(reason)) {
      return res.status(400).json({ success: false, message: "Invalid reason" });
    }

    const report = await Report.create({
      reporter: req.user.id,
      targetType,
      targetRecipe: targetType === "recipe" ? targetRecipe : null,
      targetUser: targetType === "user" ? targetUser : null,
      reason,
      details: details || "",
    });

    res.status(201).json({ success: true, message: "Report submitted. Thank you!", data: { report } });
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/reports — admin only
const getAllReports = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const reports = await Report.find(query)
      .populate("reporter", "name email")
      .populate("targetRecipe", "title image category")
      .populate("targetUser", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { reports } });
  } catch (error) {
    handleError(res, error);
  }
};

// PATCH /api/reports/:reportId — admin updates status
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "reviewed", "resolved", "ignored"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.status(200).json({ success: true, message: "Report status updated", data: { report } });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { createReport, getAllReports, updateReportStatus };