import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../config/api";

const useTasks = (customUserId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(apiUrl("/tasks"));
      if (!res.ok) {
        throw new Error(`Failed to fetch tasks: ${res.statusText}`);
      }
      const data = await res.json();
      const allTasks = (Array.isArray(data) ? data : []).map((t) => ({
        ...t,
        id: t._id || t.id,
        uid: t._id || t.uid || t.id,
      }));

      if (user?.role === "Admin" || user?.role === "admin") {
        setTasks(allTasks);
      } else {
        const myTasks = allTasks.filter((t) => {
          if (!t) return false;
          const target = String(
            typeof t.assignedTo === "object" ? t.assignedTo?._id || t.assignedTo?.uid || t.assignedTo?.name || "" : t.assignedTo || ""
          ).toLowerCase();
          const email = String(user?.email || "").toLowerCase();
          const uid = String(user?.uid || "").toLowerCase();
          const mongoId = String(user?._id || "").toLowerCase();
          const name = String(
            user?.displayName || user?.name || user?.employeeName || ""
          ).toLowerCase();

          return (
            target === uid ||
            target === mongoId ||
            target === email ||
            (email && target.includes(email)) ||
            (name && target === name)
          );
        });
        setTasks(myTasks.length > 0 ? myTasks : allTasks);
      }
    } catch (error) {
      console.error("MongoDB tasks fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, customUserId]);

  return { tasks, loading, refetch: fetchTasks };
};

export default useTasks;