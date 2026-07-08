import { useEffect, useState } from "react";

export default function usePolicies() {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API = "https://pearlscrm.onrender.com/api/reimbursementpolicy";

    // FETCH
    const fetchPolicies = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(API);

            if (!res.ok) {
                throw new Error("Failed to fetch policies");
            }

            const data = await res.json();
            setPolicies(data);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    // CREATE
    const addPolicy = async (policy) => {
        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(policy),
            });

            if (!res.ok) throw new Error("Failed to add policy");

            const data = await res.json();

            setPolicies((prev) => [data, ...prev]);

            return data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    // UPDATE
    const updatePolicy = async (id, updatedData) => {
        try {
            const res = await fetch(`${API}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) throw new Error("Failed to update policy");

            const data = await res.json();

            setPolicies((prev) =>
                prev.map((p) => (p._id === id ? data : p))
            );

            return data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    // DELETE
    const deletePolicy = async (id) => {
        try {
            const res = await fetch(`${API}/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete policy");

            setPolicies((prev) =>
                prev.filter((p) => p._id !== id)
            );

        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return {
        policies,
        loading,
        error,
        fetchPolicies,
        addPolicy,
        updatePolicy,
        deletePolicy,
    };
}