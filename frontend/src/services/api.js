const API_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// AUTH 
export const registerUser = async (formData) => {
  const res = await fetch(`${API_URL}/auth/register`, { method: "POST", body: formData });
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
  const res = await fetch(`${API_URL}/auth/profile`, { headers: authHeaders() });
  return res.json();
};

export const updateProfile = async (data) => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify(data),
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

export const changePassword = async (currentPassword, newPassword) => {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST", headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return res.json();
};

export const getChefs = async () => {
  const res = await fetch(`${API_URL}/auth/chefs`);
  return res.json();
};

//  RECIPES 
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
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  return res.json();
};

export const updateRecipe = async (id, data) => {
  const res = await fetch(`${API_URL}/recipes/${id}`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify(data),
  });
  return res.json();
};

export const toggleRecipeStatus = async (id) => {
  const res = await fetch(`${API_URL}/recipes/${id}/status`, {
    method: "PATCH", headers: authHeaders(),
  });
  return res.json();
};

export const deleteRecipe = async (id) => {
  const res = await fetch(`${API_URL}/recipes/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
  return res.json();
};

export const rateRecipe = async (id, rating) => {
  const res = await fetch(`${API_URL}/recipes/${id}/rate`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify({ rating }),
  });
  return res.json();
};

export const toggleFavourite = async (id) => {
  const res = await fetch(`${API_URL}/recipes/${id}/favourite`, {
    method: "POST", headers: authHeaders(),
  });
  return res.json();
};

export const getFavourites = async () => {
  const res = await fetch(`${API_URL}/recipes/user/favourites`, { headers: authHeaders() });
  return res.json();
};

export const getChefRecipes = async () => {
  const res = await fetch(`${API_URL}/recipes/chef/my-recipes`, { headers: authHeaders() });
  return res.json();
};

//  COMMENTS 
export const getComments = async (recipeId) => {
  const res = await fetch(`${API_URL}/comments/${recipeId}`);
  return res.json();
};

export const addComment = async (recipeId, text) => {
  const res = await fetch(`${API_URL}/comments/${recipeId}`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify({ text }),
  });
  return res.json();
};

export const deleteComment = async (commentId) => {
  const res = await fetch(`${API_URL}/comments/comment/${commentId}`, {
    method: "DELETE", headers: authHeaders(),
  });
  return res.json();
};

export const addReply = async (commentId, text) => {
  const res = await fetch(`${API_URL}/comments/${commentId}/reply`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify({ text }),
  });
  return res.json();
};

export const deleteReply = async (commentId, replyId) => {
  const res = await fetch(`${API_URL}/comments/${commentId}/reply/${replyId}`, {
    method: "DELETE", headers: authHeaders(),
  });
  return res.json();
};

//  REPORTS 
export const createReport = async (data) => {
  const res = await fetch(`${API_URL}/reports`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  return res.json();
};

export const getAllReports = async (status) => {
  const params = status ? `?status=${status}` : "";
  const res = await fetch(`${API_URL}/reports${params}`, { headers: authHeaders() });
  return res.json();
};

export const updateReportStatus = async (reportId, status) => {
  const res = await fetch(`${API_URL}/reports/${reportId}`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status }),
  });
  return res.json();
};

//  ADMIN 
export const getAllUsers = async () => {
  const res = await fetch(`${API_URL}/auth/users`, { headers: authHeaders() });
  return res.json();
};

export const deleteUser = async (id) => {
  const res = await fetch(`${API_URL}/auth/users/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
  return res.json();
};