import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/payslip";

export default function usePayslip() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GET ALL
  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setPayslips(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const createPayslip = async (data) => {
    const res = await axios.post(API, data);
    setPayslips((prev) => [res.data, ...prev]);
    return res.data;
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