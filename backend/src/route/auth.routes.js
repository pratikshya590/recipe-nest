const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");
const { uploadAvatar } = require("../../config/multer.config");

// ── PUBLIC ───────────────────────────────────────────────────────────────────
router.post("/register", uploadAvatar.single("avatar"), authController.register);
router.post("/login", authController.login);

// Public: anyone can browse chefs
router.get("/chefs", authController.getChefs);

// ── PROTECTED ────────────────────────────────────────────────────────────────
router.post("/logout", protect, authController.logout);
router.get("/profile", protect, authController.getProfile);
router.put("/profile", protect, authController.updateProfile);
router.patch("/avatar", protect, uploadAvatar.single("avatar"), authController.updateAvatar);
router.post("/change-password", protect, authController.changePassword);

// ── ADMIN ONLY ───────────────────────────────────────────────────────────────
router.get("/users", protect, adminOnly, authController.getAllUsers);
router.get("/users/:id", protect, adminOnly, authController.getUserById);
router.delete("/users/:id", protect, adminOnly, authController.deactivateUser);

module.exports = router;