import { useEffect, useState } from "react";
import { apiUrl } from "../config/api.js";
import { staticLeads } from "../Utils/staticData.js";

export default function useLead(id) {
    const [lead, setLead] = useState({});
    const [fulllead, setFullLead] = useState(staticLeads);
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
            const data = await response.json();
            if (response.ok && data && Object.keys(data).length > 0) {
                setLead(data);
            } else {
                const found = staticLeads.find((l) => l._id === id || l.id === id) || staticLeads[0];
                setLead(found);
            }
        } catch (error) {
            console.log(error);
            const found = staticLeads.find((l) => l._id === id || l.id === id) || staticLeads[0];
            setLead(found);
        } finally {
            setLoading(false);
        }
    };

    const fetchfullLead = async () => {
        try {
            const response = await fetch(apiUrl("/leads"));
            const data = await response.json();
            if (response.ok && Array.isArray(data) && data.length > 0) {
                setFullLead(data);
            } else {
                setFullLead(staticLeads);
            }
        } catch (error) {
            console.log(error);
            setFullLead(staticLeads);
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