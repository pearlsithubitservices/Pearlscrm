import { useState, useEffect } from "react";

const API = "https://pearlscrm.onrender.com/api/payslip";

export default function usePayslip() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GET ALL
  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Failed to fetch payslips");
      }

      const data = await response.json();
      setPayslips(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const createPayslip = async (payload) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create payslip");
      }

      const data = await response.json();

      setPayslips((prev) => [data, ...prev]);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  return {
    payslips,
    loading,
    error,
    fetchPayslips,
    createPayslip,
  };
}