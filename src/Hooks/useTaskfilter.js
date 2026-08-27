import { useMemo } from "react";

export default function useTaskFilter(tasks, search, active) {
  return useMemo(() => {
    const q = search.toLowerCase();

    return tasks.filter((task) => {
      const assignedToText = typeof task.assignedTo === 'object' && task.assignedTo !== null
        ? (task.assignedTo.name || task.assignedTo.employeeName || task.assignedTo.email || "")
        : String(task.assignedTo || "");

      const assignedEmpText = typeof task.assignedEmployee === 'object' && task.assignedEmployee !== null
        ? (task.assignedEmployee.name || task.assignedEmployee.employeeName || task.assignedEmployee.email || "")
        : String(task.assignedEmployee || "");

      const searched =
        (task.title || task.company || "")?.toLowerCase().includes(q) ||
        assignedEmpText.toLowerCase().includes(q) ||
        assignedToText.toLowerCase().includes(q) ||
        (task.status || "")?.toLowerCase().includes(q) ||
        (task.priority || "")?.toLowerCase().includes(q);

      const filtered =
        active === "All"
          ? true
          : active.toLowerCase() === "pending"
          ? (task.status || "").toLowerCase() === "pending"
          : (task.priority || "").toLowerCase() === active.toLowerCase();

      return searched && filtered;
    });

  }, [tasks, search, active]);
}