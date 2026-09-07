import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../config/api";

export default function useTotalLeave() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalLeave, setTotalLeave] = useState(null);

    const BASE_URL = apiUrl("/totalLeave");
    const employeeId = user?.profile?.empId || user?.empId || user?.id || user?.uid || user?._id;

    // ================= GET =================
    const getTotalLeave = async () => {
        try {
            setLoading(true);

            const res = await fetch(`${BASE_URL}/${employeeId}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            setTotalLeave(data);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ================= CREATE =================
    const createTotalLeave = async (payload) => {
        try {
            setLoading(true);

            const res = await fetch(BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            setTotalLeave(data);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ================= UPDATE =================
    const updateTotalLeave = async (payload) => {
        try {
            setLoading(true);

            const res = await fetch(`${BASE_URL}/${employeeId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            setTotalLeave(data);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        totalLeave,
        loading,
        error,
        getTotalLeave,
        createTotalLeave,
        updateTotalLeave,
    };
}