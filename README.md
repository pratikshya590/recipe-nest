# RecipeNest — Full Stack Recipe Sharing Platform

A role-based recipe sharing web application built with the MERN stack (MongoDB, Express.js, React, Node.js). Users can discover recipes, chefs can publish their creations, and admins can moderate the platform.



##  Developer

- **Name:** Pratikshya Shrestha
- **Module:** CIS051-2 Web Technology and Platform
- **University:** University of Bedfordshire

---

##  Technologies Used

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- bcryptjs — Password hashing
- JSON Web Token (JWT) — Authentication
- Multer — File uploads
- dotenv — Environment variables
- CORS — Cross-origin requests

### Frontend
- React 18 (Vite)
- React Router DOM — Client-side routing
- Context API — Global auth state
- Fetch API — HTTP requests
- CSS — Custom styling (no UI library)

---

##  Features Implemented

###  Authentication System
- User registration with role selection (Food Lover or Chef)
- Login with JWT token and role-based redirection
- Password hashing with bcrypt
- Protected routes with auth middleware
- Role-based authorization (Food Lover, Chef, Admin)
- Password show/hide toggle on login and register
- Admin account created via seed file

###  File Handling
- Profile avatar upload (registration + profile update)
- Recipe image upload
- File type validation (jpg, png, gif, webp)
- File size limit (max 5MB)
- Static file serving from uploads folder

###  Chef Features
- Create recipes with title, category, time, description, ingredients, instructions, image
- **Draft & Publish System** — save recipes as private drafts or publish to all users
- Toggle recipe between draft and published at any time
- Edit existing recipes (all fields including image)
- Delete recipes
- View all comments left on their recipes
- **Reply to comments** from food lovers (e.g. answer ingredient questions)
- Delete comments or replies
- Update profile (name, bio, avatar)
- Change password

###  Food Lover Features
- Browse all published recipes with search and category filter
- View full recipe detail (ingredients, instructions, chef info)
- Rate recipes (1–5 stars)
- Add/remove recipes from favourites
- View saved favourites page
- Leave comments on recipes
- View chef replies to comments
- **Report recipes** for inappropriate content
- Browse chef profiles and their bios

###  Admin Features
- View system overview (total users, chefs, recipes, pending reports)
- View and manage all users and chefs
- View detailed chef profiles including bio and their recipes
- Click into any recipe for full detail view
- Delete users and recipes
- **Report & Moderation System** — view all reports, filter by status (pending, resolved, ignored)
- Mark reports as resolved or ignored
- View reported content directly from report panel

###  Comment System
- Food lovers can comment on any published recipe
- Chefs can reply to comments on their own recipes
- Comments show user name, role badge, and date
- Replies are nested under the original comment with a green Chef badge
- Comment and reply deletion for owners and admins

###  Report & Moderation System
- Any logged-in user can report a recipe
- Reason selection: Spam, Offensive, Inappropriate, Wrong Info, Other
- Optional details field
- Admin receives all reports with pending count badge in sidebar
- Admin can resolve, ignore, or view the reported content

---

##  Project Structure

```
recipe-nest/
│
├── backend/
│   ├── config/
│   │   ├── config.js              # Environment variables
│   │   ├── database.js            # MongoDB connection
│   │   └── multer.config.js       # File upload config
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── recipe.controller.js
│   │   │   ├── comment.controller.js
│   │   │   └── report.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── recipe.model.js
│   │   │   ├── comment.model.js
│   │   │   └── report.model.js
│   │   ├── route/
│   │   │   ├── auth.routes.js
│   │   │   ├── recipe.routes.js
│   │   │   ├── comment.routes.js
│   │   │   └── report.routes.js
│   │   └── services/
│   │       ├── auth.service.js
│   │       └── recipe.service.js
│   ├── uploads/
│   │   ├── avatars/
│   │   └── recipes/
│   ├── .env
│   ├── app.js
│   ├── index.js
│   └── seed.js
│
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── AuthContext.jsx     # Global auth + favourites state
    │   │   ├── Icons.jsx           # SVG icon components
    │   │   ├── Navbar.jsx
    │   │   └── Shared.jsx          # RecipeCard, StarRating, Toast
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── HomePage.jsx
    │   │   ├── RecipeDetailPage.jsx
    │   │   ├── FavouritesPage.jsx
    │   │   ├── ChefsPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── ChefDashboard.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── services/
    │   │   └── api.js              # All API calls
    │   └── styles/
    │       └── App.css
    ├── index.html
    └── vite.config.js
```

---

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running locally
- Git installed

### 1. Clone the Repository
```bash
git clone <https://github.com/pratikshya590/recipe-nest.git>
cd recipe-nest
```

### 2. Setup Backend
```bash
cd backend
npm install 


Create the admin account:
   bash
node seed.js


Start the backend server:
   bash
npm run dev


Backend runs on: `http://localhost:5000`

### 3. Setup Frontend
    bash
cd ../frontend
npm install
npm run dev


Frontend runs on: `http://localhost:5173`


## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login user |
| GET | `/chefs` | Public | Get all chefs |
| GET | `/profile` | Protected | Get own profile |
| PUT | `/profile` | Protected | Update profile |
| PATCH | `/avatar` | Protected | Upload avatar |
| POST | `/change-password` | Protected | Change password |
| GET | `/users` | Admin | Get all users |
| DELETE | `/users/:id` | Admin | Deactivate user |

### Recipes — `/api/recipes`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all published recipes |
| GET | `/:id` | Public | Get recipe by ID |
| GET | `/user/favourites` | Protected | Get user favourites |
| GET | `/chef/my-recipes` | Chef | Get chef's own recipes (incl. drafts) |
| POST | `/` | Chef | Create recipe |
| PUT | `/:id` | Chef | Update recipe |
| PATCH | `/:id/status` | Chef | Toggle draft/published |
| PATCH | `/:id/image` | Chef | Upload recipe image |
| POST | `/:id/rate` | Protected | Rate a recipe |
| POST | `/:id/favourite` | Protected | Toggle favourite |
| DELETE | `/:id` | Chef/Admin | Delete recipe |

### Comments — `/api/comments`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/:recipeId` | Public | Get comments for a recipe |
| POST | `/:recipeId` | Protected | Add a comment |
| POST | `/:commentId/reply` | Chef/Admin | Reply to a comment |
| DELETE | `/comment/:commentId` | Protected | Delete a comment |
| DELETE | `/:commentId/reply/:replyId` | Chef/Admin | Delete a reply |

### Reports — `/api/reports`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Protected | Submit a report |
| GET | `/` | Admin | Get all reports |
| PATCH | `/:reportId` | Admin | Update report status |

---

## Dependencies

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

### Frontend
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "react-router-dom": "^6.0.0",
  "vite": "^5.0.0"
}
```

---

## User Roles Summary

| Feature | Food Lover | Chef | Admin |
|---------|-----------|------|-------|
| Browse recipes | ✅ | ✅ | ✅ |
| View recipe detail | ✅ | ✅ | ✅ |
| Rate recipes | ✅ | ✅ | — |
| Favourite recipes | ✅ | ✅ | — |
| Comment on recipes | ✅ | ✅ | — |
| Reply to comments | — | ✅ | ✅ |
| Report recipes | ✅ | ✅ | — |
| Create recipes | — | ✅ | — |
| Draft / Publish | — | ✅ | — |
| Edit / Delete own recipes | — | ✅ | — |
| View own comments dashboard | — | ✅ | — |
| Manage all users | — | — | ✅ |
| Manage all recipes | — | — | ✅ |
| Moderate reports | — | — | ✅ |