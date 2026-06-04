// Hooks/useTask.js

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

const useTask = (id) => {
  const [task, setTask] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(
      doc(db, "tasks", id),
      (snapshot) => {
        if (snapshot.exists()) {
          setTask({
            id: snapshot.id,
            ...snapshot.data(),
          });
        }

        setLoading(false);
      }
    );

    return () => unsub();
  }, [id]);

  return { task, loading };
};

export default useTask;