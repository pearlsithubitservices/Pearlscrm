import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../config/api.js";

const API_URL = apiUrl("/contribution");

export default function useContribution() {
    const { user } = useAuth();

    const [contributions, setContributions] = useState([]);
    const [employeeContributions, setEmployeeContributions] =
        useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Create
    const createContribution = async (formData) => {
        console.log(formData);
        try {
            setLoading(true);
            

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    employeeId: user.uid,
                }),
            });

            const data = await response.json();

            if (!response.ok)
                throw new Error(data.message);

            setContributions((prev) => [
                data.contribution,
                ...prev,
            ]);

            return {
                success: true,
                contribution: data.contribution,
            };
        } catch (err) {
            setError(err.message);

            return {
                success: false,
                error: err.message,
            };
        } finally {
            setLoading(false);
        }
    };

    // Get All
    const getContributions = async () => {
        try {
            setLoading(true);

            const response = await fetch(API_URL);

            const data = await response.json();

            setContributions(data);

            return data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Get By Employee
    const getContributionsByEmployee = async (
        employeeId
    ) => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/by-employee`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        employeeId,
                    }),
                }
            );

            const data = await response.json();

            setEmployeeContributions(
                data.contributions || []
            );

            return data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Update
    const updateContribution = async (
        id,
        formData
    ) => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok)
                throw new Error(data.message);

            setContributions((prev) =>
                prev.map((item) =>
                    item._id === id
                        ? data.contribution
                        : item
                )
            );

            return {
                success: true,
                contribution: data.contribution,
            };
        } catch (err) {
            setError(err.message);

            return {
                success: false,
                error: err.message,
            };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getContributions();
    }, []);

    return {
        loading,
        error,

        contributions,
        employeeContributions,

        createContribution,
        getContributions,
        getContributionsByEmployee,
        updateContribution,
    };
}