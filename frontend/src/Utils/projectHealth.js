/**
 * Calculates project health status: 'Completed' | 'At Risk' | 'On Track'
 * 
 * Rules:
 * 1. Completed: status is 'completed' or progress >= 100
 * 2. At Risk:
 *    - Explicit status is 'at risk' or 'delayed'
 *    - OR Due date is reached or passed (dueDate <= today) while project is unfinished
 * 3. On Track:
 *    - All other unfinished projects (future due date or no due date)
 */
export const getProjectHealthStatus = (project) => {
  if (!project) return "On Track";

  const st = (project.status || "").toLowerCase();
  const prog = Number(project.progress) || 0;

  // 1. Completed
  if (st === "completed" || prog >= 100) {
    return "Completed";
  }

  // 2. Explicit At Risk / Delayed
  if (st === "at risk" || st === "delayed") {
    return "At Risk";
  }

  // 3. Due Date Reached or Passed (At Risk)
  if (project.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(project.dueDate);
    if (!isNaN(d.getTime()) && d.getFullYear() > 2000) {
      d.setHours(0, 0, 0, 0);
      if (d <= today) {
        return "At Risk";
      }
    }
  }

  // 4. Otherwise On Track
  return "On Track";
};
