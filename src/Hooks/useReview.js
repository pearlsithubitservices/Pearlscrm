import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/review";
// const API = "https://pearlscrm.onrender.com/api/review";

export default function useReview() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [review, setReview] = useState([]);



    const handleResponse = async (res) => {
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        return data;
    };

    const createReview = async (payload) => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            return await handleResponse(res);
        } catch (err) {
            setError(err.message || "Failed to create review");
            console.error("Create review error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getReviews = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(API, {
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });

            return await handleResponse(res);
        } catch (err) {
            const errorMsg = err.name === 'AbortError' 
                ? "Request timeout. Backend server may be unavailable."
                : err.message || "Failed to fetch reviews";
            setError(errorMsg);
            console.error("Get reviews error:", err);
            // Return empty data instead of throwing
            return { data: [] };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await getReviews();
                if (res && res.data) {
                    setReview(res.data); // assuming API returns { success, data }
                } else {
                    setReview([]);
                }
            } catch (error) {
                console.error("Fetch reviews error:", error);
                setError(error.message || "Failed to load reviews");
                setReview([]);
            }
        };

        fetchReviews();
    }, []);

    const getReviewByEmployee = async (employee_uid) => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(
                `${API}/${employee_uid}`,
                { signal: AbortSignal.timeout(10000) }
            );

            return await handleResponse(res);
        } catch (err) {
            const errorMsg = err.name === 'AbortError'
                ? "Request timeout. Backend server may be unavailable."
                : err.message || "Failed to fetch review";
            setError(errorMsg);
            console.error("Get review by employee error:", err);
            return { data: [] };
        } finally {
            setLoading(false);
        }
    };

    const updateReview = async (id, payload) => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`${API}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            return await handleResponse(res);
        } catch (err) {
            setError(err.message || "Failed to update review");
            console.error("Update review error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteReview = async (id) => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`${API}/${id}`, {
                method: "DELETE",
            });

            return await handleResponse(res);
        } catch (err) {
            setError(err.message || "Failed to delete review");
            console.error("Delete review error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        createReview,
        getReviews,
        getReviewByEmployee,
        updateReview,
        deleteReview,
        review,
    };
}