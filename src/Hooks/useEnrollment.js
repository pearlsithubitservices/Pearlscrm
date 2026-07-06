import { useCallback } from "react";

const API = "https://pearlscrm.onrender.com/api/empenrollment";

export default function useEnrollment() {
    const handleResponse = async (res) => {
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        return data;
    };

    //GET ALL DATA
    const getEnrollments = useCallback(async () => {
        const res = await fetch(API);

        return handleResponse(res);
    }, []);

    //GET DATA BY ID
    const getEnrollmentById = useCallback(async (id) => {
        const res = await fetch(`${API}/${id}`);

        return handleResponse(res);
    }, []);

    //GET EMPLOYEE ENROLLMENT DATA
    const getEmployeeEnrollments = useCallback(async (employee_uid) => {
        const res = await fetch(`${API}/employee/${employee_uid}`);

        return handleResponse(res);
    }, []);

    //CREATE ENROLLMENT DATA
    const createEnrollment = useCallback(async (enrollmentData) => {
        const res = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(enrollmentData),
        });
        console.log(enrollmentData);
        return handleResponse(res);
    }, []);

    //UPDATE ENROLLMENT
    const updateEnrollment = useCallback(async (id, updatedData) => {
        const res = await fetch(`${API}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
        });

        return handleResponse(res);
    }, []);

    //DELETE ENROLLMENT
    const deleteEnrollment = useCallback(async (id) => {
        const res = await fetch(`${API}/${id}`, {
            method: "DELETE",
        });

        return handleResponse(res);
    }, []);

    return {
        getEnrollments,
        getEnrollmentById,
        getEmployeeEnrollments,
        createEnrollment,
        updateEnrollment,
        deleteEnrollment,
    };
}