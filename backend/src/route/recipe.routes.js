const express = require("express");
const router = express.Router();

const recipeController = require("../controllers/recipe.controller");
const { protect, chefOnly } = require("../middleware/auth.middleware");
const { uploadRecipeImage } = require("../../config/multer.config");

// PUBLIC 
router.get("/", recipeController.getAllRecipes);

// SPECIFIC PATHS before /:id 
router.get("/user/favourites", protect, recipeController.getUserFavourites);
router.get("/chef/my-recipes", protect, chefOnly, recipeController.getChefRecipes);

//  PUBLIC single recipe 
router.get("/:id", recipeController.getRecipeById);

//  PROTECTED 
router.post("/:id/favourite", protect, recipeController.toggleFavourite);
router.post("/:id/rate", protect, recipeController.rateRecipe);

//  CHEF ONLY 
router.post("/", protect, chefOnly, recipeController.createRecipe);
router.put("/:id", protect, chefOnly, recipeController.updateRecipe);
router.patch("/:id/status", protect, chefOnly, recipeController.toggleRecipeStatus);
router.patch("/:id/image", protect, chefOnly, uploadRecipeImage.single("recipeImage"), recipeController.updateRecipeImage);

//  DELETE 
router.delete("/:id", protect, recipeController.deleteRecipe);

module.exports = router;