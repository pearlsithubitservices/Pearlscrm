const normalizeDepartment = (department) => String(department || "").trim().toLowerCase();

const ALL_DEPARTMENTS = [
  "digital marketing",
  "development",
  "hr",
  "management",
  "marketing",
  "designers",
];

export const EMPLOYEE_MODULE_DEPARTMENTS = {
  dashboard: ["hr", "management"],
  leads: ["marketing"],
  tasks: ALL_DEPARTMENTS,
  projects: ALL_DEPARTMENTS,
  followUps: ["management", "marketing"],
  attendance: ALL_DEPARTMENTS,
  leave: ALL_DEPARTMENTS,
  payroll: ["hr", "management", "marketing"],
  reports: ["hr", "management"],
  performance: ["hr", "management"],
};

export const ADMIN_MODULE_DEPARTMENTS = {
  dashboard: ALL_DEPARTMENTS,
  leads: ["marketing"],
  tasks: ALL_DEPARTMENTS,
  projects: ALL_DEPARTMENTS,
  followUps: ALL_DEPARTMENTS,
  clients: ALL_DEPARTMENTS,
  attendance: ALL_DEPARTMENTS,
  leave: ALL_DEPARTMENTS,
  payroll: ALL_DEPARTMENTS,
  employees: ALL_DEPARTMENTS,
  reports: ALL_DEPARTMENTS,
  performance: ALL_DEPARTMENTS,
};

export const ADMIN_LANDING_PATHS = {
  "digital marketing": "/",
  development: "/",
  hr: "/",
  management: "/",
  marketing: "/leads",
  designers: "/",
};

export const COMMON_EMPLOYEE_PATHS = [
  "/employee/overview",
  "/employee/myprofile",
  "/employee/settings",
  "/employee/boards",
  "/employee/collaboration",
  "/employee/communication",
  "/employee/meeting",
  "/employee/web-mail",
  "/employee/e-signature",
  "/employee/attendance",
  "/employee/leave",
];

const EMPLOYEE_PATH_MODULES = {
  "/employee-dashboard": "dashboard",
  "/employee/dashboard": "dashboard",
  "/employee/leads": "leads",
  "/employee/tasks": "tasks",
  "/employee/task": "tasks",
  "/employee/taskDetails": "tasks",
  "/employee/projects": "projects",
  "/employee/followups": "followUps",
  "/employee/follow-ups": "followUps",
  "/employee/followupDetails": "followUps",
  "/employee/empfollowupDetails": "followUps",
  "/employee/attendance": "attendance",
  "/employee/leave": "leave",
  "/employee/payroll": "payroll",
  "/employee/reports": "reports",
  "/employee/performance": "performance",
};

const ADMIN_PATH_MODULES = {
  "/": "dashboard",
  "/leads": "leads",
  "/tasks": "tasks",
  "/follow-ups": "followUps",
  "/projects": "projects",
  "/clients": "clients",
  "/clientmanagement": "clients",
  "/payments": "payroll",
  "/employees": "employees",
  "/reports": "reports",
  "/attendance-management": "attendance",
  "/leave": "leave",
  "/admin-payroll": "payroll",
  "/admin-performance": "performance",
  "/boards": "boards",
  "/leadDetails": "leads",
  "/taskDetails": "tasks",
  "/edit-task": "tasks",
  "/projectDetails": "projects",
  "/followupDetails": "followUps",
  "/clientDetails": "clients",
  "/employeeDetails": "employees",
  "/payslipadmin": "payroll",
};

const pathMatches = (path, basePath) => path === basePath || path.startsWith(`${basePath}/`);

export const canAccessEmployeePath = (path, department) => {
  if (COMMON_EMPLOYEE_PATHS.some((basePath) => pathMatches(path, basePath))) return true;

  const moduleName = Object.entries(EMPLOYEE_PATH_MODULES).find(([basePath]) =>
    pathMatches(path, basePath)
  )?.[1];

  if (!moduleName) return true;
  return EMPLOYEE_MODULE_DEPARTMENTS[moduleName].includes(normalizeDepartment(department));
};

export const canAccessEmployeeModule = (moduleName, department) =>
  EMPLOYEE_MODULE_DEPARTMENTS[moduleName]?.includes(normalizeDepartment(department)) || false;

export const canAccessAdminPath = (path, department) => {
  if (
    pathMatches(path, "/boards") ||
    pathMatches(path, "/collaboration") ||
    pathMatches(path, "/communication") ||
    pathMatches(path, "/meeting") ||
    pathMatches(path, "/web-mail") ||
    pathMatches(path, "/e-signature")
  ) {
    return true;
  }

  const moduleName = Object.entries(ADMIN_PATH_MODULES).find(([basePath]) =>
    pathMatches(path, basePath)
  )?.[1];

  if (!moduleName) return true;
  return ADMIN_MODULE_DEPARTMENTS[moduleName].includes(normalizeDepartment(department));
};

export const canAccessAdminModule = (moduleName, department) =>
  ADMIN_MODULE_DEPARTMENTS[moduleName]?.includes(normalizeDepartment(department)) || false;

export const getAdminLandingPath = (department) =>
  ADMIN_LANDING_PATHS[normalizeDepartment(department)] || "/";