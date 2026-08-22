import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

const useTasks = (customUserId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      collection(db, "tasks"),
      (snapshot) => {
        const allTasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          _id: doc.id,
          uid: doc.id,
          ...doc.data(),
        }));

        if (user?.role === "Admin" || user?.role === "admin") {
          setTasks(allTasks);
        } else {
          const myTasks = allTasks.filter((t) => {
            if (!t) return false;
            const target = String(t.assignedTo || "").toLowerCase();
            const email = String(user?.email || "").toLowerCase();
            const uid = String(user?.uid || "").toLowerCase();
            const name = String(
              user?.displayName || user?.name || user?.employeeName || ""
            ).toLowerCase();

            return (
              target === uid ||
              target === email ||
              (email && target.includes(email)) ||
              (name && target === name) ||
              target === String(user?._id || "").toLowerCase()
            );
          });
          setTasks(myTasks.length > 0 ? myTasks : allTasks);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore tasks fetch error:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user, customUserId]);

  return { tasks, loading };
};

export default useTasks;