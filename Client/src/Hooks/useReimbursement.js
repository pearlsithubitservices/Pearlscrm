// Hooks/useReimbursementClaim.js

import { useState } from "react";
import { apiUrl } from "../config/api.js";

const API_URL =
    apiUrl("/reimbursement");

export default function useReimbursement() {
    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(null);

    const request = async (
        url,
        method = "GET",
        body = null,
        isFormData = false
    ) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${API_URL}${url}`,
                {
                    method,

                    headers: isFormData
                        ? {}
                        : {
                              "Content-Type":
                                  "application/json",
                          },

                    body: body
                        ? isFormData
                            ? body
                            : JSON.stringify(body)
                        : null,
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        data.error
                );
            }

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const submitClaim = async (
        claimData
    ) => {
        const formData =
            new FormData();

        Object.entries(claimData).forEach(
            ([key, value]) => {
                if (
                    value !== null &&
                    value !== undefined
                ) {
                    formData.append(
                        key,
                        value
                    );
                }
            }
        );

        return request(
            "/",
            "POST",
            formData,
            true
        );
    };

    const getClaims = () => {
        return request("/");
    };

    const getEmployeeClaims = (
        employee_uid
    ) => {
        return request(
            `/${employee_uid}`
        );
    };

    const updateStatus = (
        id,
        status,
        remarks = ""
    ) => {
        return request(
            `/${id}/status`,
            "PATCH",
            {
                status,
                remarks,
            }
        );
    };

    return {
        loading,
        error,
        submitClaim,
        getClaims,
        getEmployeeClaims,
        updateStatus,
    };
}