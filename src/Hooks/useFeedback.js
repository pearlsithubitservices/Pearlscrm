import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiUrl from "../config/api";

const BASE_URL = apiUrl("/feedback");

export default function useFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // GET ALL FEEDBACK
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(BASE_URL);

      if (!res.ok) {
        throw new Error("Failed to fetch feedbacks");
      }

      const data = await res.json();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // CREATE FEEDBACK
  const createFeedback = async (payload) => {
    try {
      setError(null);

      const empName = user?.displayName || user?.name || (user?.email ? user.email.split("@")[0] : "Employee");

      const requestData = {
        ...payload,
        employeeId: user?.uid || user?.id,
        employeeName: empName,
      };

      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        throw new Error("Failed to create feedback");
      }

      const responseData = await res.json();

      setFeedbacks((prev) => [responseData, ...prev]);

      return responseData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // UPDATE FEEDBACK STATUS
  const updateFeedbackStatus = async (id, payload) => {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update feedback status");

      const updatedItem = await res.json();
      setFeedbacks((prev) =>
        prev.map((fb) => (fb._id === id || fb.id === id ? updatedItem : fb))
      );
      return updatedItem;
    } catch (err) {
      console.error("Update feedback status error:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return {
    feedbacks,
    loading,
    error,
    createFeedback,
    fetchFeedbacks,
    updateFeedbackStatus,
  };
}