import { useState, useCallback } from "react";
import apiUrl from "../config/api";

const useAttendanceCorrection = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const submitCorrection = async (formData) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(
                apiUrl("/empAttendanceCorrection"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Request failed");
            }

            setSuccess(true);
            return data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getCorrections = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(apiUrl("/empAttendanceCorrection"));
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch corrections");
            return data.data || [];
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(
                apiUrl(`/empAttendanceCorrection/${id}/status`),
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update status");
            }

            return data;
        } catch (err) {
            throw typeof err === "string" ? err : err.message;
        }
    };

    return {
        submitCorrection,
        getCorrections,
        updateStatus,
        loading,
        error,
        success,
    };
};

export default useAttendanceCorrection;