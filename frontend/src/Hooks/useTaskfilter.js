import { useMemo } from "react";

export default function useTaskfilter(tasks, search, active, extraFilters = {}) {
  return useMemo(() => {
    const q = (search || "").toLowerCase().trim();

    return (Array.isArray(tasks) ? tasks : []).filter((task) => {
      const assignedToText = typeof task.assignedTo === 'object' && task.assignedTo !== null
        ? (task.assignedTo.name || task.assignedTo.employeeName || task.assignedTo.email || "")
        : String(task.assignedTo || "");

      const assignedByText = typeof task.assignedBy === 'object' && task.assignedBy !== null
        ? (task.assignedBy.name || task.assignedBy.employeeName || task.assignedBy.email || "")
        : String(task.assignedBy || "");

      const titleText = String(task.title || task.company || "");
      const statusText = String(task.status || "");
      const priorityText = String(task.priority || "");

      // Search Query Filter
      const matchesSearch = !q || (
        titleText.toLowerCase().includes(q) ||
        assignedToText.toLowerCase().includes(q) ||
        assignedByText.toLowerCase().includes(q) ||
        statusText.toLowerCase().includes(q) ||
        priorityText.toLowerCase().includes(q)
      );

      // Status & Priority normalization
      const taskStatusLower = statusText.toLowerCase();
      const taskPriorityLower = priorityText.toLowerCase();

      // Check Overdue
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
      const isOverdue = taskDueDate && !isNaN(taskDueDate.getTime()) && taskDueDate < now && taskStatusLower !== 'completed';

      // Tab / Active Filter
      let matchesTab = true;
      if (active && active !== "All") {
        const actLower = String(active).toLowerCase();
        if (actLower === "pending") {
          matchesTab = taskStatusLower === "pending";
        } else if (actLower === "in progress") {
          matchesTab = taskStatusLower === "in progress";
        } else if (actLower === "completed") {
          matchesTab = taskStatusLower === "completed";
        } else if (actLower === "overdue") {
          matchesTab = isOverdue;
        } else if (actLower === "hot" || actLower === "warm" || actLower === "cold") {
          matchesTab = taskPriorityLower === actLower;
        } else {
          matchesTab = taskPriorityLower === actLower || taskStatusLower === actLower;
        }
      }

      // Advanced Filters
      const { filterStatus, filterPriority, filterEmployee, filterDateRange } = extraFilters;

      // Filter Status
      let matchesStatus = true;
      if (filterStatus && filterStatus !== "all") {
        if (filterStatus.toLowerCase() === "overdue") {
          matchesStatus = isOverdue;
        } else {
          matchesStatus = taskStatusLower === filterStatus.toLowerCase();
        }
      }

      // Filter Priority
      let matchesPriority = true;
      if (filterPriority && filterPriority !== "all") {
        matchesPriority = taskPriorityLower === filterPriority.toLowerCase();
      }

      // Filter Employee
      let matchesEmployee = true;
      if (filterEmployee && filterEmployee !== "all") {
        const empSearch = String(filterEmployee).toLowerCase();
        matchesEmployee = assignedToText.toLowerCase().includes(empSearch) ||
          String(task.assignedTo?._id || task.assignedTo?.id || task.assignedTo || "").toLowerCase() === empSearch;
      }

      // Filter Date Range
      let matchesDate = true;
      if (filterDateRange && filterDateRange !== "all") {
        if (!taskDueDate || isNaN(taskDueDate.getTime())) {
          matchesDate = false;
        } else {
          const todayStr = new Date().toISOString().split('T')[0];
          const taskDateStr = taskDueDate.toISOString().split('T')[0];

          if (filterDateRange === "today") {
            matchesDate = taskDateStr === todayStr;
          } else if (filterDateRange === "overdue") {
            matchesDate = isOverdue;
          } else if (filterDateRange === "this_week") {
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            matchesDate = taskDueDate >= startOfWeek && taskDueDate <= endOfWeek;
          }
        }
      }

      return matchesSearch && matchesTab && matchesStatus && matchesPriority && matchesEmployee && matchesDate;
    });

  }, [tasks, search, active, extraFilters]);
}