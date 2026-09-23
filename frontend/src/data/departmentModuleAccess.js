const normalizeDepartment = (department) => {
  const d = String(department || "").trim().toLowerCase();
  if (d === "designer") return "designers";
  return d;
};

const ALL_DEPARTMENTS = [
  "digital marketing",
  "development",
  "hr",
  "management",
  "marketing",
  "designers",
  "designer",
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
  esignature: ALL_DEPARTMENTS,
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
  esignature: ALL_DEPARTMENTS,
};

export const ADMIN_LANDING_PATHS = {
  "digital marketing": "/",
  development: "/",
  hr: "/",
  management: "/",
  marketing: "/leads",
  designers: "/",
  designer: "/",
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
  "/employee/e-signatures",
  "/employee/e-signatures/sign",
  "/employee/e-signatures/editor",
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
  "/employee/e-signatures": "esignature",
  "/employee/e-signature": "esignature",
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
  "/e-signatures": "esignature",
  "/e-signature": "esignature",
};

const pathMatches = (path, basePath) => path === basePath || path.startsWith(`${basePath}/`);

export const canAccessEmployeePath = (path, department, role) => {
  if (COMMON_EMPLOYEE_PATHS.some((basePath) => pathMatches(path, basePath))) return true;

  const normalized = normalizeDepartment(department);
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "designer" || normalizedRole === "admin") {
    if (
      pathMatches(path, "/employee/e-signatures") ||
      pathMatches(path, "/employee/e-signature") ||
      pathMatches(path, "/employee/projects") ||
      pathMatches(path, "/employee/tasks")
    ) {
      return true;
    }
  }

  const moduleName = Object.entries(EMPLOYEE_PATH_MODULES).find(([basePath]) =>
    pathMatches(path, basePath)
  )?.[1];

  if (!moduleName) return true;
  return (
    EMPLOYEE_MODULE_DEPARTMENTS[moduleName]?.includes(normalized) ||
    EMPLOYEE_MODULE_DEPARTMENTS[moduleName]?.includes(normalizedRole) ||
    false
  );
};

export const canAccessEmployeeModule = (moduleName, department, role) => {
  const normalized = normalizeDepartment(department);
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "designer") {
    if (moduleName === "esignature" || moduleName === "tasks" || moduleName === "projects") {
      return true;
    }
  }

  return (
    EMPLOYEE_MODULE_DEPARTMENTS[moduleName]?.includes(normalized) ||
    EMPLOYEE_MODULE_DEPARTMENTS[moduleName]?.includes(normalizedRole) ||
    false
  );
};

export const canAccessAdminPath = (path, department) => {
  if (
    pathMatches(path, "/boards") ||
    pathMatches(path, "/collaboration") ||
    pathMatches(path, "/communication") ||
    pathMatches(path, "/meeting") ||
    pathMatches(path, "/web-mail") ||
    pathMatches(path, "/e-signature") ||
    pathMatches(path, "/e-signatures")
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