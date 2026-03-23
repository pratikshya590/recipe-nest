const express = require("express");
const cors = require("cors");
const path = require("path");

const { PORT, NODE_ENV, CLIENT_URL } = require("./config/config");
const connectDB = require("./config/database");
const authRoutes = require("./src/route/auth.routes");
const recipeRoutes = require("./src/route/recipe.routes");

const app = express();

// CORS middleware - allows frontend to connect
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving - for uploaded images

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log("Uploads path:", path.join(__dirname, "uploads")); // debug
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });


// Database connection
connectDB();

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RecipeNest API",
    version: "1.0.0",
    status: "running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    statusCode,
  });
});

module.exports = app;
