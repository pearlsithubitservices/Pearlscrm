import { useMemo } from "react";

export default function useLeadfilter(leads, search, active) {
  return useMemo(() => {
    const q = search.toLowerCase();

    return leads.filter((lead) => {
      const searched =
        lead.name?.toLowerCase().includes(q) ||
        lead.assignedEmployee?.toLowerCase().includes(q) ||
        lead.assignedTo?.toLowerCase().includes(q) ||
        lead.status?.toLowerCase().includes(q) ||
        lead.priority?.toLowerCase().includes(q) ||
        lead.company?.toLowerCase().includes(q) ||
        lead.source?.toLowerCase().includes(q) ||
        lead.nextAction?.toLowerCase().includes(q);

      const filtered =
        active === "All"
          ? true
          : lead.priority?.toLowerCase() === active.toLowerCase();

      return searched && filtered; // 👈 important
    });
  }, [leads, search, active]);
}