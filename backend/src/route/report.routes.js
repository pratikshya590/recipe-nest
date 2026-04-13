// report.routes.js
const express = require("express");
const router = express.Router();
const { createReport, getAllReports, updateReportStatus } = require("../controllers/Report.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

router.post("/", protect, createReport);                              // any user
router.get("/", protect, adminOnly, getAllReports);                   // admin only
router.patch("/:reportId", protect, adminOnly, updateReportStatus);  // admin only

module.exports = router;