import { useState, useEffect, useCallback } from "react";
import { apiUrl } from "../config/api";

export default function useBenefits() {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAPI = () => apiUrl("/benefits");

  const fetchBenefits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(getAPI());
      const json = await res.json();
      if (res.ok && json.success) {
        setBenefits(json.data || []);
      } else {
        setBenefits([]);
      }
    } catch (err) {
      console.error("Fetch Benefits Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBenefit = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(getAPI(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to create benefit");
      }
      setBenefits((prev) => [json.data, ...prev]);
      return json.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBenefit = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${getAPI()}/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete benefit");
      }
      setBenefits((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, [fetchBenefits]);

  return {
    benefits,
    loading,
    error,
    fetchBenefits,
    createBenefit,
    deleteBenefit,
  };
}
