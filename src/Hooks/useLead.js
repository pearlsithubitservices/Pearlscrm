import { useEffect, useState } from "react";
import { apiUrl } from "../config/api.js";

export default function useLead(id) {
  const [lead, setLead] = useState({});
  const [fulllead, setFullLead] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLead();
    }
    fetchfullLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl(`/leads/${id}`));
      if (response.ok) {
        const data = await response.json();
        setLead(data);
      }
    } catch (error) {
      console.error("Error fetching single lead:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchfullLead = async () => {
    try {
      const response = await fetch(apiUrl("/leads"));
      if (response.ok) {
        const data = await response.json();
        setFullLead(Array.isArray(data) ? data : []);
      } else {
        setFullLead([]);
      }
    } catch (error) {
      console.error("Error fetching full leads list:", error);
      setFullLead([]);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (leadId, note) => {
    const response = await fetch(apiUrl(`/leads/${leadId}/notes`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    if (!response.ok) throw new Error("Failed to save note");
    const updatedLead = await response.json();
    setLead(updatedLead);
    return updatedLead;
  };

  const deleteNote = async (leadId, noteId) => {
    const response = await fetch(apiUrl(`/leads/${leadId}/notes/${noteId}`), {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete note");
    const updatedLead = await response.json();
    setLead(updatedLead);
    return updatedLead;
  };

  const deleteLead = async (leadId) => {
    const response = await fetch(apiUrl(`/leads/${leadId}`), { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete lead");
    setLead({});
    setFullLead((previous) => previous.filter((item) => item._id !== leadId));
    return data;
  };

  return {
    lead,
    loading,
    fetchLead,
    fetchfullLead,
    fulllead,
    addNote,
    deleteNote,
    deleteLead,
  };
}