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

  return {
    lead,
    loading,
    fetchLead,
    fetchfullLead,
    fulllead,
  };
}