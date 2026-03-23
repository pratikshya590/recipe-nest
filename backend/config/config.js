require('dotenv').config();

module.exports = {
    // Server
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",

    // Database
    DB_URI: process.env.DB_URI || "mongodb://localhost:27017/RecipeNest",

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || "recipenest_secret_key_2024",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

    // CORS
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173"
};
