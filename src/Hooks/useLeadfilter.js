import { useMemo } from "react";

export default function useLeadfilter(leads = [], search = "", active = "All", extraFilters = {}, employees = []) {
  return useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    const safeLeads = Array.isArray(leads) ? leads : [];
    const safeEmployees = Array.isArray(employees) ? employees : [];

    return safeLeads.filter((lead) => {
      if (!lead) return false;

      // 1. Text Search Matching
      const leadName = (lead.name || lead.clientName || "").toLowerCase();
      const company = (lead.company || "").toLowerCase();
      const status = (lead.status || "").toLowerCase();
      const priority = (lead.priority || "").toLowerCase();
      const source = (lead.source || "").toLowerCase();
      const email = (lead.email || "").toLowerCase();
      const phone = (lead.phone || "").toLowerCase();

      const assignedToText = typeof lead.assignedTo === 'object' && lead.assignedTo !== null
        ? (lead.assignedTo.name || lead.assignedTo.employeeName || lead.assignedTo.email || "").toLowerCase()
        : String(lead.assignedTo || "").toLowerCase();

      const assignedEmpText = typeof lead.assignedEmployee === 'object' && lead.assignedEmployee !== null
        ? (lead.assignedEmployee.name || lead.assignedEmployee.employeeName || lead.assignedEmployee.email || "").toLowerCase()
        : String(lead.assignedEmployee || "").toLowerCase();

      const matchesSearch = !q || (
        leadName.includes(q) ||
        company.includes(q) ||
        status.includes(q) ||
        priority.includes(q) ||
        source.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        assignedToText.includes(q) ||
        assignedEmpText.includes(q)
      );

      // 2. Tab Filter (Active Tab: All / Hot / Warm / Cold)
      let matchesTab = true;
      if (active && active !== "All") {
        const actLower = String(active).toLowerCase();
        matchesTab = priority === actLower || status === actLower;
      }

      // 3. Extra Advanced Filters
      const {
        filterStatus = "all",
        filterPriority = "all",
        filterEmployee = "all",
        filterSource = "all",
        filterDateRange = "all",
      } = extraFilters;

      // Filter Status
      let matchesStatus = true;
      if (filterStatus && filterStatus !== "all") {
        matchesStatus = status === filterStatus.toLowerCase();
      }

      // Filter Priority
      let matchesPriority = true;
      if (filterPriority && filterPriority !== "all") {
        matchesPriority = priority === filterPriority.toLowerCase();
      }

      // Filter Employee Assignment
      let matchesEmployee = true;
      if (filterEmployee && filterEmployee !== "all") {
        const empFilterLower = String(filterEmployee).toLowerCase().trim();

        // Find target employee object from employees array if available
        const targetEmp = safeEmployees.find((e) => {
          if (!e) return false;
          return (
            String(e._id || "").toLowerCase() === empFilterLower ||
            String(e.id || "").toLowerCase() === empFilterLower ||
            String(e.uid || "").toLowerCase() === empFilterLower ||
            String(e.name || "").toLowerCase() === empFilterLower ||
            String(e.employeeName || "").toLowerCase() === empFilterLower ||
            String(e.email || "").toLowerCase() === empFilterLower
          );
        });

        const possibleKeys = new Set();
        possibleKeys.add(empFilterLower);

        if (targetEmp) {
          if (targetEmp._id) possibleKeys.add(String(targetEmp._id).toLowerCase());
          if (targetEmp.id) possibleKeys.add(String(targetEmp.id).toLowerCase());
          if (targetEmp.uid) possibleKeys.add(String(targetEmp.uid).toLowerCase());
          if (targetEmp.name) possibleKeys.add(String(targetEmp.name).toLowerCase());
          if (targetEmp.employeeName) possibleKeys.add(String(targetEmp.employeeName).toLowerCase());
          if (targetEmp.email) possibleKeys.add(String(targetEmp.email).toLowerCase());
        }

        const getLeadAssignedKeys = (val) => {
          const keys = [];
          if (!val) return keys;
          if (typeof val === "object" && val !== null) {
            if (val._id) keys.push(String(val._id).toLowerCase());
            if (val.id) keys.push(String(val.id).toLowerCase());
            if (val.uid) keys.push(String(val.uid).toLowerCase());
            if (val.name) keys.push(String(val.name).toLowerCase());
            if (val.employeeName) keys.push(String(val.employeeName).toLowerCase());
            if (val.email) keys.push(String(val.email).toLowerCase());
          } else {
            keys.push(String(val).toLowerCase());
          }
          return keys;
        };

        const leadKeys = [
          ...getLeadAssignedKeys(lead.assignedTo),
          ...getLeadAssignedKeys(lead.assignedEmployee),
        ];

        matchesEmployee = Array.from(possibleKeys).some((pKey) =>
          leadKeys.some((lKey) => lKey === pKey || lKey.includes(pKey) || pKey.includes(lKey))
        );
      }

      // Filter Source
      let matchesSource = true;
      if (filterSource && filterSource !== "all") {
        matchesSource = source === filterSource.toLowerCase();
      }

      // Filter Follow Up Date Range
      let matchesDate = true;
      if (filterDateRange && filterDateRange !== "all") {
        const followUpStr = lead.nextActionDate || lead.follow || lead.followUpDate;
        if (!followUpStr) {
          matchesDate = false;
        } else {
          const followDate = new Date(followUpStr);
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          if (isNaN(followDate.getTime())) {
            matchesDate = false;
          } else if (filterDateRange === "today") {
            const todayEnd = new Date(now);
            todayEnd.setHours(23, 59, 59, 999);
            matchesDate = followDate >= now && followDate <= todayEnd;
          } else if (filterDateRange === "this_week") {
            const endOfWeek = new Date(now);
            endOfWeek.setDate(now.getDate() + 7);
            matchesDate = followDate >= now && followDate <= endOfWeek;
          } else if (filterDateRange === "overdue") {
            const isClosed = status === "converted" || status === "closed" || status === "won" || status === "lost";
            matchesDate = followDate < now && !isClosed;
          }
        }
      }

      return matchesSearch && matchesTab && matchesStatus && matchesPriority && matchesEmployee && matchesSource && matchesDate;
    });
  }, [leads, search, active, extraFilters, employees]);
}