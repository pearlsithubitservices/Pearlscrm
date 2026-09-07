import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiUrl from "../config/api";

const API_URL = apiUrl("/ticket");

const useTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

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
            console.error("FETCH TICKETS ERROR:", err.message);
        } finally {
            setLoading(false);
        }
    };

    // CREATE TICKET
    const createTicket = async (payload) => {
        try {
            const formData = new FormData();

            const empId = user?.uid || user?.id || "EMP001";
            const empName = user?.displayName || user?.name || (user?.email ? user.email.split("@")[0] : "Employee");

            formData.append("employeeId", empId);
            formData.append("employeeName", empName);
            formData.append("issuedcategory", payload.issuedcategory || "General");
            formData.append("priority", payload.priority || "medium");
            formData.append("subject", payload.subject || payload.issuedcategory || "Ticket");
            formData.append("description", payload.description || "");

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

            const createdItem = data.data || data;
            setTickets((prev) => [createdItem, ...prev]);

            return createdItem;
        } catch (err) {
            setError(err.message);
            console.error("CREATE TICKET ERROR:", err.message);
            return null;
        }
    };

    // UPDATE TICKET STATUS / ASSIGNED
    const updateTicketStatus = async (ticketId, payload) => {
        try {
            const res = await fetch(`${API_URL}/${ticketId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update ticket");
            }

            const updatedItem = data.data || data;
            setTickets((prev) =>
                prev.map((t) => (t._id === ticketId ? { ...t, ...updatedItem } : t))
            );

            return updatedItem;
        } catch (err) {
            setError(err.message);
            console.error("UPDATE TICKET ERROR:", err.message);
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
        updateTicketStatus,
    };
};

export default useTicket;