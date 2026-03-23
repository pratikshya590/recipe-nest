const Recipe = require("../models/recipe.model");
const { deleteOldFile, getFileUrl } = require("../../config/multer.config");

const createRecipe = async (recipeData, chefId) => {
  try {
    const recipe = new Recipe({
      title: recipeData.title,
      description: recipeData.description,
      category: recipeData.category,
      time: recipeData.time,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      chef: chefId,
    });

    await recipe.save();
    await recipe.populate("chef", "name avatar");

    return {
      success: true,
      message: "Recipe created successfully",
      data: { recipe },
    };
  } catch (error) {
    console.error("Error in createRecipe:", error.message);
    throw error;
  }
};

const getAllRecipes = async (options = {}) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    if (options.category && options.category !== "All") {
      query.category = options.category;
    }
    if (options.search) {
      query.$or = [
        { title: { $regex: options.search, $options: "i" } },
        { description: { $regex: options.search, $options: "i" } },
      ];
    }

    const recipes = await Recipe.find(query)
      .populate("chef", "name avatar")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Recipe.countDocuments(query);

    return {
      success: true,
      data: {
        recipes,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  } catch (error) {
    console.error("Error in getAllRecipes:", error.message);
    throw error;
  }
};

const getRecipeById = async (recipeId) => {
  try {
    const recipe = await Recipe.findById(recipeId).populate("chef", "name avatar bio");
    if (!recipe) {
      const error = new Error("Recipe not found");
      error.statusCode = 404;
      throw error;
    }
    return { success: true, data: { recipe } };
  } catch (error) {
    console.error("Error in getRecipeById:", error.message);
    throw error;
  }
};

const getChefRecipes = async (chefId) => {
  try {
    const recipes = await Recipe.find({ chef: chefId, isActive: true })
      .populate("chef", "name avatar")
      .sort({ createdAt: -1 });

    return { success: true, data: { recipes } };
  } catch (error) {
    console.error("Error in getChefRecipes:", error.message);
    throw error;
  }
};

const updateRecipe = async (recipeId, chefId, updateData) => {
  try {
    const recipe = await Recipe.findOne({ _id: recipeId, chef: chefId });
    if (!recipe) {
      const error = new Error("Recipe not found or not authorized");
      error.statusCode = 404;
      throw error;
    }

    const allowedUpdates = ["title", "description", "category", "time", "ingredients", "instructions"];
    const filteredData = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, filteredData, {
      new: true,
      runValidators: true,
    }).populate("chef", "name avatar");

    return {
      success: true,
      message: "Recipe updated successfully",
      data: { recipe: updatedRecipe },
    };
  } catch (error) {
    console.error("Error in updateRecipe:", error.message);
    throw error;
  }
};

const deleteRecipe = async (recipeId, userId, userRole) => {
  try {
    const query = userRole === "admin" ? { _id: recipeId } : { _id: recipeId, chef: userId };
    const recipe = await Recipe.findOneAndUpdate(
      query,
      { isActive: false },
      { new: true }
    );

    if (!recipe) {
      const error = new Error("Recipe not found or not authorized");
      error.statusCode = 404;
      throw error;
    }

    return { success: true, message: "Recipe deleted successfully" };
  } catch (error) {
    console.error("Error in deleteRecipe:", error.message);
    throw error;
  }
};

const rateRecipe = async (recipeId, userId, rating) => {
  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      const error = new Error("Recipe not found");
      error.statusCode = 404;
      throw error;
    }

    // Calculate new average rating
    const newRatingCount = recipe.ratingCount + 1;
    const newRating = ((recipe.rating * recipe.ratingCount) + rating) / newRatingCount;

    recipe.rating = Math.round(newRating * 10) / 10;
    recipe.ratingCount = newRatingCount;
    await recipe.save();

    return {
      success: true,
      message: "Recipe rated successfully",
      data: { rating: recipe.rating, ratingCount: recipe.ratingCount },
    };
  } catch (error) {
    console.error("Error in rateRecipe:", error.message);
    throw error;
  }
};

const toggleFavourite = async (recipeId, userId) => {
  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      const error = new Error("Recipe not found");
      error.statusCode = 404;
      throw error;
    }

    const isFavourited = recipe.favouritedBy.includes(userId);

    if (isFavourited) {
      recipe.favouritedBy.pull(userId);
    } else {
      recipe.favouritedBy.push(userId);
    }

    await recipe.save();

    return {
      success: true,
      message: isFavourited ? "Removed from favourites" : "Added to favourites",
      data: { isFavourited: !isFavourited },
    };
  } catch (error) {
    console.error("Error in toggleFavourite:", error.message);
    throw error;
  }
};

const getUserFavourites = async (userId) => {
  try {
    const recipes = await Recipe.find({
      favouritedBy: userId,
      isActive: true,
    }).populate("chef", "name avatar");

    return { success: true, data: { recipes } };
  } catch (error) {
    console.error("Error in getUserFavourites:", error.message);
    throw error;
  }
};

const updateRecipeImage = async (recipeId, chefId, file) => {
  try {
    const recipe = await Recipe.findOne({ _id: recipeId, chef: chefId });
    if (!recipe) {
      const error = new Error("Recipe not found or not authorized");
      error.statusCode = 404;
      throw error;
    }

    // Delete old image if exists
    if (recipe.image) {
      deleteOldFile(recipe.image, "recipe");
    }

    // Save new image
    const imageUrl = getFileUrl(file.filename, "recipe");
    recipe.image = imageUrl;
    await recipe.save();

    return {
      success: true,
      message: "Recipe image updated successfully",
      data: { recipe },
    };
  } catch (error) {
    console.error("Error in updateRecipeImage:", error.message);
    throw error;
  }
};

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  getChefRecipes,
  updateRecipe,
  deleteRecipe,
  rateRecipe,
  toggleFavourite,
  getUserFavourites,
  updateRecipeImage,
};
