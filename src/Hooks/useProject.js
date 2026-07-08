import { useState } from "react";

const BASE_URL = "https://pearlscrm.onrender.com/api/projects";

export default function useProject() {
    const [projects, setProjects] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = async (url, options = {}) => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                },
                ...options,
            });

            const data = await res.json();

            if (!res.ok) {
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

    // ==========================
    // GET ALL PROJECTS
    // ==========================
    const getAll = async () => {
        const data = await request(BASE_URL);
        setProjects(data);
        return data;
    };

    // ==========================
    // GET PROJECT BY ID
    // ==========================
    const getById = async (id) => {
        const data = await request(`${BASE_URL}/${id}`);
        setProject(data);
        return data;
    };

    // ==========================
    // CREATE PROJECT
    // ==========================
    const create = async (projectData) => {
        return await request(BASE_URL, {
            method: "POST",
            body: JSON.stringify(projectData),
        });
    };

    // ==========================
    // UPDATE PROJECT
    // ==========================
    const update = async (id, projectData) => {
        return await request(`${BASE_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(projectData),
        });
    };

    // ==========================
    // DELETE PROJECT
    // ==========================
    const remove = async (id) => {
        return await request(`${BASE_URL}/${id}`, {
            method: "DELETE",
        });
    };

    // ==========================
    // ADD MEMBER
    // ==========================
    const addMember = async (projectId, member) => {
        return await request(`${BASE_URL}/${projectId}/member`, {
            method: "PUT",
            body: JSON.stringify(member),
        });
    };

    // ==========================
    // REMOVE MEMBER
    // ==========================
    const removeMember = async (projectId, uid) => {
        return await request(
            `${BASE_URL}/${projectId}/member/${uid}`,
            {
                method: "DELETE",
            }
        );
    };

    return {
        projects,
        project,
        loading,
        error,
        getAll,
        getById,
        create,
        update,
        remove,
        addMember,
        removeMember,
    };
}