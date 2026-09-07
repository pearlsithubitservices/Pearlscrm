import { useState } from "react";

const API = "http://localhost:5000/api/empCourse";
// const API = "https://pearlscrm.onrender.com/api/empCourse";

export default function useCourse() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleResponse = async (res) => {
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch data");
        }

        return data;
    };

    // Create Course
    const createCourse = async (courseData) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(API, {
                method: "POST",
                body: courseData,
            });

            return await handleResponse(res);
        } catch (err) {
            const errorMsg = err.message || "Failed to create course";
            setError(errorMsg);
            console.error("Create course error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get All Courses
    const getCourses = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(API, {
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });

            return await handleResponse(res);
        } catch (err) {
            const errorMsg = err.name === 'AbortError' 
                ? "Request timeout. Backend server may be unavailable."
                : err.message || "Failed to fetch courses";
            setError(errorMsg);
            console.error("Get courses error:", err);
            // Return empty data instead of throwing
            return { data: [] };
        } finally {
            setLoading(false);
        }
    };

    // Get Course By Id
    const getCourseById = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API}/${id}`, {
                signal: AbortSignal.timeout(10000)
            });

            return await handleResponse(res);
        } catch (err) {
            const errorMsg = err.name === 'AbortError'
                ? "Request timeout. Backend server may be unavailable."
                : err.message || "Failed to fetch course";
            setError(errorMsg);
            console.error("Get course error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update Course
    const updateCourse = async (id, updatedData) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });

            return await handleResponse(res);
        } catch (err) {
            setError(err.message || "Failed to update course");
            console.error("Update course error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete Course
    const deleteCourse = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API}/${id}`, {
                method: "DELETE",
            });

            return await handleResponse(res);
        } catch (err) {
            setError(err.message || "Failed to delete course");
            console.error("Delete course error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    //DELETE ALL

    const deleteAllCourses = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(API, {
                method: "DELETE",
            });

            return await handleResponse(res);
        } catch (err) {
            setError(err.message || "Failed to delete courses");
            console.error("Delete all courses error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        createCourse,
        getCourses,
        getCourseById,
        updateCourse,
        deleteCourse,
        deleteAllCourses,
    };
}