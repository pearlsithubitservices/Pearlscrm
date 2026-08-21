import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

/**
 * Modular Protected Route Component
 * 
 * @param {string} allowedRole - "admin" | "employee" | "any"
 */
export default function ProtectedRoute({ allowedRole = "any" }) {
  const { user, role, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#09090f]">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl shadow-purple-500/20"
        />
      </div>
    );
  }

  // 1. If not authenticated, redirect to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Strict Role Checks
  if (allowedRole === "admin" && !isAdmin) {
    // Non-admin trying to access Admin pages -> redirect to Employee Portal
    return <Navigate to="/employee-dashboard" replace />;
  }

  if (allowedRole === "employee" && isAdmin) {
    // Admin trying to access Employee pages -> redirect to Admin Dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
