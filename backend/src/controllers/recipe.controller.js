const recipeService = require("../services/recipe.service");
const { NODE_ENV } = require("../../config/config");

const validateRecipe = (data) => {
  const errors = [];
  if (!data.title || data.title.trim() === "") errors.push("Title is required");
  if (!data.description || data.description.trim() === "") errors.push("Description is required");
  if (!data.category || data.category.trim() === "") errors.push("Category is required");
  if (!data.time || data.time.trim() === "") errors.push("Preparation time is required");
  if (!data.ingredients || data.ingredients.length === 0) errors.push("At least one ingredient is required");
  if (!data.instructions || data.instructions.length === 0) errors.push("At least one instruction is required");
  return errors;
};

const handleError = (res, error) => {
  console.error("Controller Error:", error.message);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    ...(NODE_ENV === "development" && { stack: error.stack }),
  });
};

const createRecipe = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.ingredients === "string") body.ingredients = body.ingredients.split("\n").filter(Boolean);
    if (typeof body.instructions === "string") body.instructions = body.instructions.split("\n").filter(Boolean);

    const errors = validateRecipe(body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    const result = await recipeService.createRecipe(body, req.user.id);
    res.status(201).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    handleError(res, error);
  }
};

const getAllRecipes = async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      category: req.query.category,
      search: req.query.search,
    };
    const result = await recipeService.getAllRecipes(options);
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    handleError(res, error);
  }
};

const getRecipeById = async (req, res) => {
  try {
    const result = await recipeService.getRecipeById(req.params.id);
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    handleError(res, error);
  }
};

const getChefRecipes = async (req, res) => {
  try {
    const result = await recipeService.getChefRecipes(req.user.id);
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    handleError(res, error);
  }
};

const updateRecipe = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.ingredients === "string") body.ingredients = body.ingredients.split("\n").filter(Boolean);
    if (typeof body.instructions === "string") body.instructions = body.instructions.split("\n").filter(Boolean);

    const result = await recipeService.updateRecipe(req.params.id, req.user.id, body);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    handleError(res, error);
  }
};

const toggleRecipeStatus = async (req, res) => {
  try {
    const result = await recipeService.toggleRecipeStatus(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const result = await recipeService.deleteRecipe(req.params.id, req.user.id, req.user.role);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    handleError(res, error);
  }
};

const rateRecipe = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }
    const result = await recipeService.rateRecipe(req.params.id, req.user.id, rating);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    handleError(res, error);
  }
};

const toggleFavourite = async (req, res) => {
  try {
    const result = await recipeService.toggleFavourite(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    handleError(res, error);
  }
};

const getUserFavourites = async (req, res) => {
  try {
    const result = await recipeService.getUserFavourites(req.user.id);
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    handleError(res, error);
  }
};

const updateRecipeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image file" });
    }
    const result = await recipeService.updateRecipeImage(req.params.id, req.user.id, req.file);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  getChefRecipes,
  updateRecipe,
  toggleRecipeStatus,
  deleteRecipe,
  rateRecipe,
  toggleFavourite,
  getUserFavourites,
  updateRecipeImage,
};