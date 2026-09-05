import { useEffect, useState } from "react";
import { apiUrl } from "../config/api.js";
import { socket } from "../config/socket.js";

const useNotification = (employeeId = "") => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // GET Notifications
  const fetchNotification = async () => {
    try {
      const endpoint = employeeId
        ? `/notification?employeeId=${encodeURIComponent(employeeId)}`
        : "/notification";
      const res = await fetch(apiUrl(endpoint));

      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // CREATE Notification
  const createNotification = async (payload) => {
    try {
      const res = await fetch(apiUrl("/notification"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create notification");
      }

      const newNotification = await res.json();

      // Update UI instantly
      setNotifications((prev) => [
        newNotification,
        ...prev,
      ]);

      return newNotification;
    } catch (error) {
      console.error(error.message);
      setError(error.message);
      return null;
    }
  };


  // MARK SINGLE NOTIFICATION AS READ
  const markAsRead = async (id) => {
    try {
      const res = await fetch(apiUrl(`/notification/${id}/read`), {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  // MARK ALL NOTIFICATIONS AS READ
  const markAllAsRead = async () => {
    try {
      const res = await fetch(apiUrl("/notification/mark-all-read"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });

      if (!res.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.error(error.message);
    }
  };

  //DELETE NOTIFICATION
  const deleteNotification = async (id) => {
    try {
      const response = await fetch(
        apiUrl(`/notification/${id}`),
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      // Update local state
      setNotifications((prev) =>
        prev.filter((item) => item._id !== id)
      );

      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    fetchNotification();
  }, [employeeId]);

  // LIVE UPDATES VIA SOCKET.IO
  // Join this employee's personal room and prepend any relevant
  // notification the moment the server broadcasts it (leave, payroll,
  // benefits, etc.) instead of waiting for a manual refresh.
  useEffect(() => {
    if (!socket) return;

    if (!socket.connected) socket.connect();
    if (employeeId) socket.emit("joinUser", employeeId);

    const handleNewNotification = (notif) => {
      if (!notif) return;
      // Only accept it if it's a broadcast (no employeeId) or targeted at this user
      const targeted = notif.employeeId || null;
      if (employeeId && targeted && String(targeted) !== String(employeeId)) return;

      setNotifications((prev) => {
        if (notif._id && prev.some((item) => item._id === notif._id)) return prev;
        return [notif, ...prev];
      });
    };

    socket.on("newNotification", handleNewNotification);
    return () => socket.off("newNotification", handleNewNotification);
  }, [employeeId]);

  return {
    notifications,
    loading,
    error,
    fetchNotification,
    createNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
  };
};

export default useNotification;