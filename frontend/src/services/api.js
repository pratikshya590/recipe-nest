const API_URL = "http://localhost:5000/api";

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Auth headers
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ─── AUTH ────────────────────────────────────
export const registerUser = async (formData) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    body: formData, // FormData for file upload
  });
  return res.json();
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const getProfile = async () => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const updateProfile = async (data) => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const uploadAvatar = async (formData) => {
  const res = await fetch(`${API_URL}/auth/avatar`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  return res.json();
};

// ─── RECIPES ─────────────────────────────────
export const getRecipes = async (category, search) => {
  const params = new URLSearchParams();
  if (category && category !== "All") params.append("category", category);
  if (search) params.append("search", search);
  const res = await fetch(`${API_URL}/recipes?${params}`);
  return res.json();
};

export const getRecipeById = async (id) => {
  const res = await fetch(`${API_URL}/recipes/${id}`);
  return res.json();
};

export const createRecipe = async (data) => {
  const res = await fetch(`${API_URL}/recipes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateRecipe = async (id, data) => {
  const res = await fetch(`${API_URL}/recipes/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteRecipe = async (id) => {
  const res = await fetch(`${API_URL}/recipes/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};

export const rateRecipe = async (id, rating) => {
  const res = await fetch(`${API_URL}/recipes/${id}/rate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ rating }),
  });
  return res.json();
};

export const toggleFavourite = async (id) => {
  const res = await fetch(`${API_URL}/recipes/${id}/favourite`, {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
};

export const getFavourites = async () => {
  const res = await fetch(`${API_URL}/recipes/user/favourites`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const getChefRecipes = async () => {
  const res = await fetch(`${API_URL}/recipes/chef/my-recipes`, {
    headers: authHeaders(),
  });
  return res.json();
};

// ─── ADMIN ───────────────────────────────────
export const getAllUsers = async () => {
  const res = await fetch(`${API_URL}/auth/users`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const deleteUser = async (id) => {
  const res = await fetch(`${API_URL}/auth/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};