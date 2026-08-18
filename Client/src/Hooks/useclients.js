import { useState, useEffect } from "react";
import { apiUrl } from "../config/api.js";
import { staticClients } from "../Utils/staticData.js";

export default function useClients() {
    const [clients, setClients] = useState(staticClients);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);

            try {
                const response = await fetch(
                    apiUrl("/clients")
                );

                const data = await response.json();

                if (response.ok && Array.isArray(data) && data.length > 0) {
                    setClients(data);
                } else {
                    setClients(staticClients);
                }
            } catch (error) {
                console.log("Error fetching clients:", error);
                setClients(staticClients);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    return {
        clients,
        loading,
        setClients
    };
}