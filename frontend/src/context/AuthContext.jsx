import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuthState = (authUser) => {
    setUser(authUser);
    setRole(authUser?.role || null);
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAuthState(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get("/auth/me");
      const currentUser = response?.data?.user || null;

      if (!currentUser) {
        localStorage.removeItem("token");
        setAuthState(null);
        return null;
      }

      const profileResponse = await api.get("/profile");
      const profileUser = profileResponse?.data?.user || currentUser;
      setAuthState(profileUser);
      return profileUser;
    } catch (error) {
      console.error("Auth fetch error:", error);
      localStorage.removeItem("token");
      setAuthState(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user: authUser } = response.data;

      if (!token || !authUser) {
        throw new Error("Login response missing token or user");
      }

      localStorage.setItem("token", token);
      const profileResponse = await api.get("/profile");
      const profileUser = profileResponse?.data?.user || authUser;
      setAuthState(profileUser);
      return profileUser;
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed";
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const { token, user: authUser } = response.data;

      if (!token || !authUser) {
        throw new Error("Registration response missing token or user");
      }

      localStorage.setItem("token", token);
      setAuthState(authUser);
      return authUser;
    } catch (error) {
      const message = error?.response?.data?.message || "Registration failed";
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState(null);
  };

  const isAdmin = typeof role === "string" && role.trim().toLowerCase() === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        loading,
        login,
        register,
        logout,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);