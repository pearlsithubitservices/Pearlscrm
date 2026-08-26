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
          if (!t || !t.assignedTo) return false;

          // Extract all target identifiers from task's assignedTo
          const targetIds = new Set();
          const targetStrings = new Set();

          if (typeof t.assignedTo === "object" && t.assignedTo !== null) {
            if (t.assignedTo._id) targetIds.add(String(t.assignedTo._id).toLowerCase());
            if (t.assignedTo.id) targetIds.add(String(t.assignedTo.id).toLowerCase());
            if (t.assignedTo.uid) targetIds.add(String(t.assignedTo.uid).toLowerCase());
            if (t.assignedTo.email) targetStrings.add(String(t.assignedTo.email).toLowerCase());
            if (t.assignedTo.name) targetStrings.add(String(t.assignedTo.name).toLowerCase());
            if (t.assignedTo.employeeName) targetStrings.add(String(t.assignedTo.employeeName).toLowerCase());
            if (t.assignedTo.displayName) targetStrings.add(String(t.assignedTo.displayName).toLowerCase());
          } else {
            const val = String(t.assignedTo).trim().toLowerCase();
            if (val) {
              targetIds.add(val);
              targetStrings.add(val);
            }
          }

          // Extract all user identifiers
          const userIdentifiers = new Set();
          if (customUserId) userIdentifiers.add(String(customUserId).toLowerCase());
          if (user?.uid) userIdentifiers.add(String(user.uid).toLowerCase());
          if (user?._id) userIdentifiers.add(String(user._id).toLowerCase());
          if (user?.id) userIdentifiers.add(String(user.id).toLowerCase());
          if (user?.email) {
            const em = String(user.email).toLowerCase();
            userIdentifiers.add(em);
            if (em.includes("@")) {
              userIdentifiers.add(em.split("@")[0]);
            }
          }
          if (user?.name) userIdentifiers.add(String(user.name).toLowerCase());
          if (user?.employeeName) userIdentifiers.add(String(user.employeeName).toLowerCase());
          if (user?.displayName) userIdentifiers.add(String(user.displayName).toLowerCase());

          // Match IDs
          for (const id of targetIds) {
            if (userIdentifiers.has(id)) return true;
          }

          // Match strings (names / emails / usernames)
          for (const str of targetStrings) {
            for (const uId of userIdentifiers) {
              if (str === uId || (str.length >= 3 && uId.length >= 3 && (str.includes(uId) || uId.includes(str)))) {
                return true;
              }
            }
          }

          return false;
        });
        setTasks(myTasks);
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