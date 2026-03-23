const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define upload directories
const UPLOAD_DIRS = {
    avatars: path.join(__dirname, "../uploads/avatars"),
    recipes: path.join(__dirname, "../uploads/recipes"),
};

// Create directories if they don't exist
Object.values(UPLOAD_DIRS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

// Storage configuration
const createStorage = (uploadDir) => {
    return multer.diskStorage({
        // Where to store files
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },

        // How to name files
        filename: (req, file, cb) => {
            // Get original name without extension
            const originalName = path.parse(file.originalname).name;

            // Clean filename
            const cleanName = originalName
                .toLowerCase()
                .replace(/\s+/g, "-")       // replace spaces with dashes
                .replace(/[^a-z0-9\-]/g, ""); // remove special characters

            // Create unique suffix
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

            // Get extension
            const extension = path.extname(file.originalname);

            // Final filename
            const finalName = `${cleanName}-${uniqueSuffix}${extension}`;

            cb(null, finalName);
        },
    });
};

// File filter - only images allowed
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
    ];

    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        const error = new Error("Only image files (jpg, png, gif, webp) are allowed");
        error.code = "LIMIT_FILE_TYPE";
        cb(error, false);
    }
};

// Create multer config
const createMulterConfig = (uploadDir, maxFileSize = 5 * 1024 * 1024) => {
    return multer({
        storage: createStorage(uploadDir),
        fileFilter: fileFilter,
        limits: {
            fileSize: maxFileSize, // 5MB default
            files: 1,
        },
    });
};

// Multer instances
const uploadAvatar = createMulterConfig(UPLOAD_DIRS.avatars);
const uploadRecipeImage = createMulterConfig(UPLOAD_DIRS.recipes);

// Delete old file
const deleteOldFile = (filename, type) => {
    if (!filename) return;

    const dir = type === "avatar" ? UPLOAD_DIRS.avatars : UPLOAD_DIRS.recipes;
    const filePath = path.join(dir, filename);

    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        } catch (err) {
            console.error(`Error deleting file: ${err.message}`);
        }
    }
};

// Get file URL
const getFileUrl = (filename, type) => {
    if (!filename) return null;
    const folder = type === "avatar" ? "avatars" : "recipes";
    return `/uploads/${folder}/${filename}`;
};

module.exports = {
    uploadAvatar,
    uploadRecipeImage,
    deleteOldFile,
    getFileUrl,
    UPLOAD_DIRS,
};
