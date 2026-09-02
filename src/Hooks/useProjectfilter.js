import { useMemo } from "react";
import { getProjectHealthStatus } from "../utils/projectHealth";

export default function useProjectFilter(projects, search, active) {
  return useMemo(() => {
    const q = (search || "").trim().toLowerCase();

    return projects.filter((project) => {
      const searched =
        project.company?.toLowerCase().includes(q) ||
        project.companylocation?.toLowerCase().includes(q) ||
        project.status?.toLowerCase().includes(q) ||
        project.title?.toLowerCase().includes(q);

      const health = getProjectHealthStatus(project);
      let filtered = true;

      if (active === "Pending") {
        const st = (project.status || "").toLowerCase();
        const prog = Number(project.progress) || 0;
        filtered = st !== "completed" && prog < 100;
      } else if (active === "on Track" || active === "On Track") {
        filtered = health === "On Track";
      } else if (active === "At Risk") {
        filtered = health === "At Risk";
      } else if (active === "Completed") {
        filtered = health === "Completed";
      }

      return searched && filtered;
    });
  }, [projects, search, active]);
}