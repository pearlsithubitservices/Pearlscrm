import { useMemo } from "react";
import { getProjectHealthStatus } from "../utils/projectHealth";

export default function useProjectFilter(projects, search, active, selectedMember, priorityFilter, dateFilter) {
  return useMemo(() => {
    const q = (search || "").trim().toLowerCase();

    return (Array.isArray(projects) ? projects : []).filter((project) => {
      // 1. Search Query Match (Title, Company, Location, Status, Description, Tech Stack)
      const searched =
        !q ||
        (project.company || "").toLowerCase().includes(q) ||
        (project.companylocation || "").toLowerCase().includes(q) ||
        (project.status || "").toLowerCase().includes(q) ||
        (project.title || "").toLowerCase().includes(q) ||
        (project.description || "").toLowerCase().includes(q) ||
        (project.priority || "").toLowerCase().includes(q);

      // 2. Status / Health Pill Match
      const health = getProjectHealthStatus(project);
      let matchesStatus = true;

      if (active === "Pending") {
        const st = (project.status || "").toLowerCase();
        const prog = Number(project.progress) || 0;
        matchesStatus = st !== "completed" && prog < 100;
      } else if (active === "on Track" || active === "On Track") {
        matchesStatus = health === "On Track";
      } else if (active === "At Risk") {
        matchesStatus = health === "At Risk";
      } else if (active === "Completed") {
        matchesStatus = health === "Completed";
      }

      // 3. Team Member Match (Flexible ID, Name, Email, or Leader)
      let matchesMember = true;
      if (selectedMember) {
        const sel = String(selectedMember).trim().toLowerCase();

        const leaderStr = project.projectLeader
          ? typeof project.projectLeader === "object"
            ? `${project.projectLeader._id} ${project.projectLeader.uid} ${project.projectLeader.name} ${project.projectLeader.employeeName} ${project.projectLeader.email}`
            : String(project.projectLeader)
          : "";

        const isLeader = leaderStr.toLowerCase().includes(sel);

        const isMember = (Array.isArray(project.members) ? project.members : []).some((m) => {
          if (!m) return false;
          const mStr = (
            typeof m === "object"
              ? `${m._id} ${m.uid} ${m.id} ${m.name} ${m.employeeName} ${m.email}`
              : String(m)
          ).toLowerCase();
          return mStr.includes(sel);
        });

        matchesMember = Boolean(isLeader || isMember);
      }

      // 4. Priority Match
      let matchesPriority = true;
      if (priorityFilter && priorityFilter !== "All") {
        const projPrio = (project.priority || "").trim().toLowerCase();
        const targetPrio = priorityFilter.trim().toLowerCase();
        if (targetPrio === "urgent") {
          matchesPriority = projPrio === "urgent" || projPrio === "hot";
        } else {
          matchesPriority = projPrio === targetPrio;
        }
      }

      // 5. Date Filter Match
      let matchesDate = true;
      if (dateFilter && dateFilter !== "All") {
        const dateVal = project.dueDate || project.assignedDate;
        if (!dateVal) {
          matchesDate = false;
        } else {
          const pDate = new Date(dateVal);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (dateFilter === "Today") {
            matchesDate = pDate.toDateString() === today.toDateString();
          } else if (dateFilter === "This Week") {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            matchesDate = pDate >= startOfWeek && pDate <= endOfWeek;
          } else if (dateFilter === "This Month") {
            matchesDate = pDate.getMonth() === today.getMonth() && pDate.getFullYear() === today.getFullYear();
          } else if (dateFilter === "Overdue") {
            matchesDate = pDate < today && (project.status || "").toLowerCase() !== "completed" && (project.progress || 0) < 100;
          }
        }
      }

      return searched && matchesStatus && matchesMember && matchesPriority && matchesDate;
    });
  }, [projects, search, active, selectedMember, priorityFilter, dateFilter]);
}