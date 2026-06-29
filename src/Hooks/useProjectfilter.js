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

      if (active === "on Track") {
        // Today and future projects
        filtered = dueDate >= today;
      } else if (active === "At Risk") {
        // Projects due today or earlier
        filtered = dueDate <= today;
      }

      return searched && filtered;
    });
  }, [projects, search, active]);
}