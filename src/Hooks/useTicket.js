import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/ticket";

const useTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth()

    // GET ALL TICKETS
    const fetchTickets = async () => {
        try {
            setLoading(true);

            const res = await fetch(API_URL);

            if (!res.ok) {
                throw new Error("Failed to fetch tickets");
            }

            const data = await res.json();

            setTickets(data);
            setError(null);

            return data;
        } catch (err) {
            setError(err.message);
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // CREATE TICKET
    const createTicket = async (payload) => {
        try {
            const formData = new FormData();

            formData.append("employeeId", user.uid);
            formData.append("employeeName", user.displayName || "Deepan");

            formData.append("issuedcategory", payload.issuedcategory);
            formData.append("priority", payload.priority);
            formData.append("subject", payload.subject);
            formData.append("description", payload.description);

            if (payload.file) {
                formData.append("attachment", payload.file);
            }

            const res = await fetch(API_URL, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to create ticket");
            }

            setTickets((prev) => [data.data, ...prev]);

            return data.data;
        } catch (err) {
            setError(err.message);
            console.error(err.message);

            return null;
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    return {
        tickets,
        loading,
        error,
        fetchTickets,
        createTicket,
    };
};

export default useTicket;