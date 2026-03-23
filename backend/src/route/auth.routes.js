const express = require("express");
const router = express.Router();

// Import controller
const authController = require("../controllers/auth.controller");

// Import middleware
const { protect, adminOnly } = require("../middleware/auth.middleware");

// Import multer for avatar upload
const { uploadAvatar } = require("../../config/multer.config");

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * POST /api/auth/register
 * Register a new user (foodlover or chef)
 * Body: { name, email, password, role }
 * File: avatar (optional)
 */
router.post("/register", uploadAvatar.single("avatar"), authController.register);

/**
 * POST /api/auth/login
 * Login existing user
 * Body: { email, password }
 */
router.post("/login", authController.login);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post("/logout", protect, authController.logout);

/**
 * GET /api/auth/profile
 * Get current user's profile
 */
router.get("/profile", protect, authController.getProfile);

/**
 * PUT /api/auth/profile
 * Update current user's profile
 * Body: { name, bio }
 */
router.put("/profile", protect, authController.updateProfile);

/**
 * PATCH /api/auth/avatar
 * Update user's avatar
 * Content-Type: multipart/form-data
 * Field name: 'avatar'
 */
router.patch("/avatar", protect, uploadAvatar.single("avatar"), authController.updateAvatar);

/**
 * POST /api/auth/change-password
 * Change user's password
 * Body: { currentPassword, newPassword }
 */
router.post("/change-password", protect, authController.changePassword);

// ============================================
// ADMIN ROUTES (Admin authentication required)
// ============================================

/**
 * GET /api/auth/users
 * Get all users with pagination
 */
router.get("/users", protect, adminOnly, authController.getAllUsers);

/**
 * GET /api/auth/users/:id
 * Get specific user by ID
 */
router.get("/users/:id", protect, adminOnly, authController.getUserById);

/**
 * DELETE /api/auth/users/:id
 * Deactivate a user (soft delete)
 */
router.delete("/users/:id", protect, adminOnly, authController.deactivateUser);

module.exports = router;
