import { useMemo } from "react";

export default function useTaskFilter(tasks, search, active) {
  return useMemo(() => {
    const q = search.toLowerCase();

    return tasks.filter((task) => {
      const searched =
        task.company?.toLowerCase().includes(q) ||
        task.assignedEmployee?.toLowerCase().includes(q) ||
        task.assignedTo?.toLowerCase().includes(q) ||
        task.status?.toLowerCase().includes(q) ||
        task.priority?.toLowerCase().includes(q);

      const filtered =
        active === "All"
          ? true
          : task.priority?.toLowerCase() === active.toLowerCase();

      return searched && filtered;
    });

  }, [tasks, search, active]);
}