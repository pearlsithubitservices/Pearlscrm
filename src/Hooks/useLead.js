import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function useLead(id) {

    const [lead, setLead] = useState({});
    const [fulllead, setFullLead] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const BASE_URL = "https://pearlscrm.onrender.com/api/leads";
    // const BASE_URL = "http://localhost:5000/api/leads"; // For local development

    useEffect(() => {
        if (id) {
            fetchLead();
        }
        fetchfullLead();
    }, [id]);

    const fetchLead = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${BASE_URL}/${id}`);

            const data = await response.json();

            setLead(data);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // UPDATE LEAD
    const updateLead = async (leadId, updatedData) => {
        try {
            setLoading(true);

            const response = await fetch(`${BASE_URL}/${leadId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            if (leadId === id) {
                await fetchLead();
            }

            await fetchfullLead();

            return data;

        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const fetchfullLead = async () => {
        try {

            const response = await fetch(BASE_URL);

            const data = await response.json();

            setFullLead(data);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const addNote = async (leadId, note) => {
        try {
            setLoading(true);

            const response = await fetch(`${BASE_URL}/${leadId}/notes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(note),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            if (leadId === id) {
                await fetchLead();
            }

            return data;

        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // DELETE LEAD
    const deleteLead = async (leadId) => {
        try {
            setLoading(true);

            const response = await fetch(`${BASE_URL}/${leadId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            await fetchfullLead();

            return data;

        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // DELETE NOTE
    const deleteNote = async (leadId, noteId) => {
        try {
            setLoading(true);

            const response = await fetch(`${BASE_URL}/${leadId}/notes/${noteId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            return data;

        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        lead,
        loading,
        fetchLead,
        fetchfullLead,
        fulllead,
        addNote,
        deleteLead,
        deleteNote,
        updateLead,
    };
}