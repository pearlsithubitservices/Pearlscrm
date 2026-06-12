import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:5000/api/feedback";

export default function useFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GET ALL FEEDBACK
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL);
      setFeedbacks(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // CREATE FEEDBACK
  const createFeedback = async (data) => {
    try {
      const res = await axios.post(BASE_URL, data);
      setFeedbacks((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      setError(err.message);
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