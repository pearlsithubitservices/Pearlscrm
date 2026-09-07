import { useState, useEffect, useCallback } from "react";
import { apiUrl } from "../config/api.js";

export default function useClients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchClients = useCallback(async () => {
        setLoading(true);

        try {
            const response = await fetch(apiUrl("/clients"));
            const data = await response.json();

            if (response.ok) {
                setClients(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const deleteClient = async (id) => {
        if (!id) return false;
        try {
            const response = await fetch(apiUrl(`/clients/${id}`), {
                method: "DELETE",
            });
            if (response.ok) {
                setClients((prev) => prev.filter((c) => (c._id || c.id) !== id));
                return true;
            }
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "Failed to delete client");
        } catch (error) {
            console.error("Error deleting client:", error);
            throw error;
        }
    };

    return {
        clients,
        loading,
        setClients,
        fetchClients,
        deleteClient,
    };
}