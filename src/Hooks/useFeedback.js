import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000/api/feedback";

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
      setFeedbacks(data);
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

      const requestData = {
        ...payload,
        employeeId: user?.uid,
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
  
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return {
    feedbacks,
    loading,
    error,
    createFeedback,
    fetchFeedbacks,
  };
}