import { useState } from "react";

const API = "http://localhost:5000/api/activity";

const useActivity = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = async (url, options = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                },
                ...options,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Create Activity
    const createActivity = async (activityData) => {
        return request(API, {
            method: "POST",
            body: JSON.stringify(activityData),
        });
    };
    // Get All Activities
    const getAllActivities = async () => {
        return request(API);
    };

    // Get Activities
    const getActivities = async (employee_uid) => {
        return request(`${API}/${employee_uid}`);
    };

    // Update Activity
    const updateActivity = async (id, activityData) => {
        return request(`${API}/${id}`, {
            method: "PUT",
            body: JSON.stringify(activityData),
        });
    };

    // Delete Activity
    const deleteActivity = async (id) => {
        return request(`${API}/${id}`, {
            method: "DELETE",
        });
    };

    return {
        loading,
        error,
        createActivity,
        getAllActivities,
        getActivities,
        updateActivity,
        deleteActivity,
    };
};

export default useActivity;