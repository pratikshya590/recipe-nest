const express = require("express");
const router = express.Router();

// Import controller
const recipeController = require("../controllers/recipe.controller");

// Import middleware
const { protect, chefOnly, adminOnly } = require("../middleware/auth.middleware");

// Import multer for recipe image upload
const { uploadRecipeImage } = require("../../config/multer.config");

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * GET /api/recipes
 * Get all recipes with optional filters
 * Query params: page, limit, category, search
 */
router.get("/", recipeController.getAllRecipes);

/**
 * GET /api/recipes/:id
 * Get single recipe by ID
 */
router.get("/:id", recipeController.getRecipeById);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * GET /api/recipes/user/favourites
 * Get current user's favourite recipes
 */
router.get("/user/favourites", protect, recipeController.getUserFavourites);

/**
 * POST /api/recipes/:id/favourite
 * Toggle favourite on a recipe
 */
router.post("/:id/favourite", protect, recipeController.toggleFavourite);

/**
 * POST /api/recipes/:id/rate
 * Rate a recipe
 * Body: { rating } (1-5)
 */
router.post("/:id/rate", protect, recipeController.rateRecipe);

// ============================================
// CHEF ROUTES (Chef authentication required)
// ============================================

/**
 * GET /api/recipes/chef/my-recipes
 * Get all recipes by the logged-in chef
 */
router.get("/chef/my-recipes", protect, chefOnly, recipeController.getChefRecipes);

/**
 * POST /api/recipes
 * Create a new recipe
 * Body: { title, description, category, time, ingredients, instructions }
 */
router.post("/", protect, chefOnly, recipeController.createRecipe);

/**
 * PUT /api/recipes/:id
 * Update a recipe
 */
router.put("/:id", protect, chefOnly, recipeController.updateRecipe);

/**
 * PATCH /api/recipes/:id/image
 * Update recipe image
 * Content-Type: multipart/form-data
 * Field name: 'recipeImage'
 */
router.patch("/:id/image", protect, chefOnly, uploadRecipeImage.single("recipeImage"), recipeController.updateRecipeImage);

/**
 * DELETE /api/recipes/:id
 * Delete a recipe (chef can delete own, admin can delete any)
 */
router.delete("/:id", protect, recipeController.deleteRecipe);

module.exports = router;
