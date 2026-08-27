import { useMemo } from "react";

export default function useProjectFilter(projects, search, active) {
  return useMemo(() => {
    const q = (search || "").trim().toLowerCase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return projects.filter((project) => {
      const searched =
        project.company?.toLowerCase().includes(q) ||
        project.companylocation?.toLowerCase().includes(q) ||
        project.status?.toLowerCase().includes(q) ||
        project.title?.toLowerCase().includes(q);

      const dueDate = new Date(project.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      let filtered = true;

      if (active === "Pending") {
        // Projects that are pending or in progress (not completed)
        const st = (project.status || "").toLowerCase();
        filtered = st === "pending" || st === "in progress" || st === "planning" || (st !== "completed" && (Number(project.progress) || 0) < 100);
      } else if (active === "on Track") {
        // Today and future projects not completed
        const st = (project.status || "").toLowerCase();
        filtered = dueDate >= today && st !== "completed";
      } else if (active === "At Risk") {
        // Projects due before today and not completed
        const st = (project.status || "").toLowerCase();
        filtered = dueDate < today && st !== "completed";
      } else if (active === "Completed") {
        const st = (project.status || "").toLowerCase();
        filtered = st === "completed" || (Number(project.progress) || 0) === 100;
      }

      return searched && filtered;
    });
  }, [projects, search, active]);
}