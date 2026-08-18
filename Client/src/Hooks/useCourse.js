import { useState } from "react";
import { apiUrl } from "../config/api.js";

const API = apiUrl("/empCourse");

export default function useCourse() {
    const [loading, setLoading] = useState(false);

    const handleResponse = async (res) => {
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message);
        }

        return data;
    };

    // Create Course
    const createCourse = async (courseData) => {
        setLoading(true);

        try {
            const res = await fetch(API, {
                method: "POST",
                
                body:courseData,
            });

            return await handleResponse(res);
        } finally {
            setLoading(false);
        }
    };

    // Get All Courses
    const getCourses = async () => {
        setLoading(true);

        try {
            const res = await fetch(API);

            return await handleResponse(res);
        } finally {
            setLoading(false);
        }
    };

    // Get Course By Id
    const getCourseById = async (id) => {
        setLoading(true);

        try {
            const res = await fetch(`${API}/${id}`);

            return await handleResponse(res);
        } finally {
            setLoading(false);
        }
    };

    // Update Course
    const updateCourse = async (id, updatedData) => {
        setLoading(true);

        try {
            const res = await fetch(`${API}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });

            return await handleResponse(res);
        } finally {
            setLoading(false);
        }
    };

    // Delete Course
    const deleteCourse = async (id) => {
        setLoading(true);

        try {
            const res = await fetch(`${API}/${id}`, {
                method: "DELETE",
            });

            return await handleResponse(res);
        } finally {
            setLoading(false);
        }
    };

    //DELETE ALL

    const deleteAllCourses = async () => {
        setLoading(true);

        try {
            const res = await fetch(API, {
                method: "DELETE",
            });

            return await handleResponse(res);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        createCourse,
        getCourses,
        getCourseById,
        updateCourse,
        deleteCourse,
        deleteAllCourses,
    };
}