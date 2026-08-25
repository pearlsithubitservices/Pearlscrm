import { useEffect, useState } from "react";

// const API = "http://localhost:5000/api/review";
const API = "https://pearlscrm.onrender.com/api/review";

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

            const res = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            return await handleResponse(res);
        } finally {
            setLoading(false);
        }
    };

    const getReviews = async () => {
        try {
            setLoading(true);

            const res = await fetch(API);

            return await handleResponse(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await getReviews();

                setReview(res.data); // assuming API returns { success, data }
            } catch (error) {
                console.error(error);
            }
        };

        fetchReviews();
    }, []);

    const getReviewByEmployee = async (employee_uid) => {
        try {
            setLoading(true);

            const res = await fetch(
                `${API}/${employee_uid}`
            );

            return await handleResponse(res);
        } finally {
            setLoading(false);
        }
    };

    const updateReview = async (id, payload) => {
        try {
            setLoading(true);

            const res = await fetch(`${API}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            return await handleResponse(res);
        } finally {
            setLoading(false);
        }
    };

    const deleteReview = async (id) => {
        try {
            setLoading(true);

            const res = await fetch(`${API}/${id}`, {
                method: "DELETE",
            });

            return await handleResponse(res);
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