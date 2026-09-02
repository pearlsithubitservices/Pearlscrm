import { useEffect, useState, useCallback } from "react";
import { apiUrl } from "../config/api.js";

export default function usePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl("/payment"));
      if (response.ok) {
        const data = await response.json();
        setPayments(Array.isArray(data) ? data : []);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const addPayment = async (paymentData) => {
    const response = await fetch(apiUrl("/payment"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create payment");
    }
    await fetchPayments();
    return data;
  };

  const updatePayment = async (id, paymentData) => {
    const response = await fetch(apiUrl(`/payment/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update payment");
    }
    await fetchPayments();
    return data;
  };

  const deletePayment = async (id) => {
    const response = await fetch(apiUrl(`/payment/${id}`), {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete payment");
    }
    await fetchPayments();
    return data;
  };

  return {
    payments,
    loading,
    error,
    fetchPayments,
    addPayment,
    updatePayment,
    deletePayment,
  };
}
