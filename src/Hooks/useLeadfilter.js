import { useMemo } from "react";

export default function useLeadfilter(leads, search, active) {
  return useMemo(() => {
    const q = search.toLowerCase();

    return leads.filter((lead) => {
      const assignedToText = typeof lead.assignedTo === 'object' && lead.assignedTo !== null
        ? (lead.assignedTo.name || lead.assignedTo.employeeName || lead.assignedTo.email || "")
        : String(lead.assignedTo || "");

      const assignedEmpText = typeof lead.assignedEmployee === 'object' && lead.assignedEmployee !== null
        ? (lead.assignedEmployee.name || lead.assignedEmployee.employeeName || lead.assignedEmployee.email || "")
        : String(lead.assignedEmployee || "");

      const searched =
        lead.name?.toLowerCase().includes(q) ||
        lead.assignedEmployee?.toLowerCase().includes(q) ||
        lead.assignedTo?.toLowerCase().includes(q) ||
        lead.status?.toLowerCase().includes(q) ||
        lead.priority?.toLowerCase().includes(q) ||
        lead.company?.toLowerCase().includes(q) ||
        lead.source?.toLowerCase().includes(q) ||
        lead.nextAction?.toLowerCase().includes(q);
        (lead.name || "")?.toLowerCase().includes(q) ||
        assignedEmpText.toLowerCase().includes(q) ||
        assignedToText.toLowerCase().includes(q) ||
        (lead.status || "")?.toLowerCase().includes(q) ||
        (lead.priority || "")?.toLowerCase().includes(q) ||
        (lead.company || "")?.toLowerCase().includes(q);

      const filtered =
        active === "All"
          ? true
          : (lead.priority || "")?.toLowerCase() === active.toLowerCase();

      return searched && filtered; // 👈 important
    });
  }, [leads, search, active]);
}