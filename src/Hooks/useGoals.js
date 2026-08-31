import { useState } from "react";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/mygoal`;

export default function useGoals() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const safeJson = async (res) => {
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  };

  const handleResponse = async (res) => {
    const data = await safeJson(res);

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  };

  const request = async (fn) => {
    setLoading(true);
    setError(null);

    try {
      return await fn();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createGoal = (data) =>
    request(async () => {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      return handleResponse(res);
    });

  //GET GOALS
  const getGoals = () =>
    request(async () => {
      const res = await fetch(API);
      return handleResponse(res);
    });

  //GET GOALS BY ID
  const getGoalById = (id) =>
    request(async () => {
      const res = await fetch(`${API}/${id}`);
      return handleResponse(res);
    });

  const updateGoal = (id, data) =>
    request(async () => {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      return handleResponse(res);
    });

  const updateProgress = (id, data) =>
    request(async () => {
      const res = await fetch(`${API}/${id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      return handleResponse(res);
    });

  const deleteGoal = (id) =>
    request(async () => {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      return handleResponse(res);
    });

  return {
    loading,
    error,
    createGoal,
    getGoals,
    updateGoal,
    updateProgress,
    deleteGoal,
    getGoalById,
  };
}