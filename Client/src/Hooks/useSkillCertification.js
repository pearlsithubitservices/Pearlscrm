import { useState } from "react";
import { apiUrl } from "../config/api.js";

const BASE_URL = apiUrl("/skillscertification");

export default function useSkillCertification() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    // ================= COMMON HANDLER =================
    const request = async (apiCall) => {
        try {
            setLoading(true);
            setError(null);

            const res = await apiCall();
            const json = await res.json();

            if (!res.ok) {
                throw new Error(
                    json.message || "Something went wrong"
                );
            }

            setData(json.data);
            return json;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ================= SKILLS =================
    const addSkill = (payload) =>
        request(() =>
            fetch(`${BASE_URL}/skill`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })
        );

    const updateSkill = (
        employee_uid,
        skill_id,
        payload
    ) =>
        request(() =>
            fetch(
                `${BASE_URL}/skill/${employee_uid}/${skill_id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            )
        );

    const deleteSkill = (employee_uid, skill_id) =>
        request(() =>
            fetch(
                `${BASE_URL}/skill/${employee_uid}/${skill_id}`,
                {
                    method: "DELETE",
                }
            )
        );

    // ================= CERTIFICATIONS =================
    const addCertification = (payload) =>
        request(() =>
            fetch(`${BASE_URL}/certification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })
        );

    const updateCertification = (
        employee_uid,
        cert_id,
        payload
    ) =>
        request(() =>
            fetch(
                `${BASE_URL}/certification/${employee_uid}/${cert_id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            )
        );

    const deleteCertification = (
        employee_uid,
        cert_id
    ) =>
        request(() =>
            fetch(
                `${BASE_URL}/certification/${employee_uid}/${cert_id}`,
                {
                    method: "DELETE",
                }
            )
        );

    // ================= GET =================
    const getAll = () =>
        request(() =>
            fetch(`${BASE_URL}/`)
        );

    const getById = (id) =>
        request(() =>
            fetch(`${BASE_URL}/${id}`)
        );

    return {
        // state
        loading,
        error,
        data,

        // skills
        addSkill,
        updateSkill,
        deleteSkill,

        // certifications
        addCertification,
        updateCertification,
        deleteCertification,

        // fetch
        getAll,
        getById,
    };
}