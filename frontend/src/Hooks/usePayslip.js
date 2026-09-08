import { useState, useEffect, useCallback } from "react";
import { apiUrl } from "../config/api";

export default function usePayslip() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAPI = () => apiUrl("/payslip");

  // GET ALL
  const fetchPayslips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getAPI());

      if (!response.ok) {
        throw new Error("Failed to fetch payslips");
      }

      const data = await response.json();
      setPayslips(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // CREATE
  const createPayslip = async (payload) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getAPI(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to create payslip");
      }

      setPayslips((prev) => [data, ...prev]);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // UPDATE STATUS
  const updatePayslipStatus = async (id, status) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${getAPI()}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to update payslip status");
      }

      setPayslips((prev) =>
        prev.map((item) => (item._id === id ? data : item))
      );

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const deletePayslip = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${getAPI()}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || data.error || "Failed to delete payslip");
      }

      setPayslips((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  return {
    payslips,
    loading,
    error,
    fetchPayslips,
    createPayslip,
    updatePayslipStatus,
    deletePayslip,
  };
}