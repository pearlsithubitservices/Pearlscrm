import { useEffect, useState } from "react";
import { apiUrl } from "../config/api.js";

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

  return {
    notifications,
    loading,
    error,
    fetchNotification,
    createNotification,
    deleteNotification,
  };
};

export default useNotification;