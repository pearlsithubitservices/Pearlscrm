import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import EmployeeSidebar from "../pages/employee/EmployeeSidebar";
import { socket } from "../config/socket";
import NotificationDrawer from "../components/NotificationDrawer";

export default function EmployeeLayout() {
  const { user, isAdmin, loading } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    if (!socket) return;
    if (!socket.connected) socket.connect();

    const handleOpenDrawer = () => setIsNotificationOpen(true);
    window.addEventListener("open-notification-drawer", handleOpenDrawer);

    return () => {
      window.removeEventListener("open-notification-drawer", handleOpenDrawer);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 bg-black rounded-xl"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in user is Admin, redirect them to main Admin Dashboard
  if (isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#FBFBFA]">
      <EmployeeSidebar />

      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}