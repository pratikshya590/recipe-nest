import { createContext, useContext, useState, useEffect } from "react";
import { getFavourites, toggleFavourite } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role !== "admin") {
        loadFavourites();
      }
    }
  }, []);

  const loadFavourites = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await getFavourites();
      if (res.success) {
        // Service returns { data: { recipes: [] } }
        const list = res.data?.recipes ?? res.data;
        if (Array.isArray(list)) {
          setFavourites(list.map((r) => r._id));
        }
      }
    } catch (err) {
      // silently fail
    }
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    if (userData.role !== "admin") {
      setTimeout(loadFavourites, 100);
    }
  };

  const logout = () => {
    setUser(null);
    setFavourites([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const toggleFav = async (id) => {
    setFavourites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
    try {
      await toggleFavourite(id);
    } catch (err) {
      setFavourites((prev) =>
        prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      );
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, favourites, toggleFav }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);