import { useState, useEffect } from "react";
import { apiUrl } from "../config/api.js";

export default function useClients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);

        try {
            const response = await fetch(apiUrl("/clients"));
            const data = await response.json();

            if (response.ok) {
                setClients(data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        clients,
        loading,
        setClients,
        fetchClients
    };
}