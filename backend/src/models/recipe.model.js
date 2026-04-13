const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a recipe title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
      enum: ["Desserts", "Italian", "Newari", "Drinks", "Other"],
    },
    time: {
      type: String,
      required: [true, "Please provide preparation time"],
    },
    ingredients: {
      type: [String],
      required: [true, "Please provide ingredients"],
    },
    instructions: {
      type: [String],
      required: [true, "Please provide instructions"],
    },
    image: {
      type: String,
      default: null,
    },
    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    favouritedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Draft/Publish system
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model("Recipe", RecipeSchema);

module.exports = Recipe;