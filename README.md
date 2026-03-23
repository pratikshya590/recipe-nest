# 🍳 RecipeNest - Full Stack Recipe Sharing Platform

A role-based recipe sharing web application built with the MERN stack (MongoDB, Express.js, React, Node.js).

---

## 👤 Developer
- **Name:** Pratikshya Shrestha
- **Module:** CIS051-2 Web Technology and Platform
- **University:** University of Bedfordshire

---

## 🚀 Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- bcryptjs (Password Encryption)
- JSON Web Token - JWT (Authentication)
- Multer (File Upload)
- dotenv
- CORS

---

## ✅ Features Implemented

### Authentication System
- User Registration (Food Lover, Chef roles)
- User Login with JWT token
- Password encryption using bcrypt
- Token-based authentication (JWT)
- Protected routes with auth middleware
- Role-based authorization (Food Lover, Chef, Admin)
- Admin account via seed file

### File Handling System
- Profile image upload using Multer
- File type validation (jpg, png, gif, webp only)
- File size validation (max 5MB)
- Secure file storage in uploads folder
- File retrieval via static URL

### User Roles
- **Food Lover** - Browse recipes, save favourites, rate recipes
- **Chef** - Create, edit, delete recipes, manage dashboard
- **Admin** - Manage all users and recipes

---

## 📁 Project Structure

``
│
└── backend/                   # Node.js + Express Backend
    ├── config/
    │   ├── config.js          # Environment variables
    │   ├── database.js        # MongoDB connection
    │   └── multer.config.js   # File upload configuration
    ├── src/
    │   ├── controllers/       # Request handlers
    │   ├── middleware/        # Auth middleware
    │   ├── models/            # MongoDB schemas
    │   ├── route/             # API routes
    │   └── services/          # Business logic
    ├── uploads/               # Uploaded files
    ├── .env                   # Environment variables
    ├── app.js                 # Express app setup
    └── index.js               # Server entry point
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running
- Git installed

### 1. Clone the Repository
```bash
git clone <your-github-repo-link>
cd recipe-nest
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
PORT=5000
NODE_ENV=development
DB_URI=mongodb://localhost:27017/RecipeNest
JWT_SECRET=recipenest_secret_key_2024
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Create admin account:
```bash
node seed.js
```

Start backend:
```bash
npm run dev
```

Backend runs on: `http://localhost:5000`



---



## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Food Lover | emma@test.com | 123456 |
| Chef | pooja@test.com | 123456 |
| Admin | admin@recipenest.com | admin123 |

---

## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "multer": "^1.4.5",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5",
  "nodemon": "^3.0.0"
}
```


