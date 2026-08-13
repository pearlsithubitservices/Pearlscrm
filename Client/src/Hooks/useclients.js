import { useState, useEffect } from "react";

export default function useClients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);

            try {
                const response = await fetch(
                    "http://localhost:5000/api/clients"
                );

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

        fetchClients();
    }, []);

    return {
        clients,
        loading,
        setClients
    };
}