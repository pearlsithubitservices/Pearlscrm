const normalizeDepartment = (department) => {
  const normalized = String(department || "").trim().toLowerCase();
  if (["hr department", "human resources", "human resource"].includes(normalized)) return "hr";
  if (normalized === "sales department") return "sales";
  return normalized;
};

export const isHRDepartment = (department) => normalizeDepartment(department) === "hr";

export const getUserDepartment = (user) => {
  const departments = [
    user?.department,
    user?.profile?.department,
    user?.employeeDepartment,
    user?.dept,
  ].filter(Boolean);

  if (departments.some(isHRDepartment)) return "HR";
  const rootDepartment = String(user?.department || "").trim();
  const profileDepartment = String(user?.profile?.department || "").trim();
  const rootIsDefault = normalizeDepartment(rootDepartment) === "digital marketing";
  const resolvedDepartment =
    profileDepartment &&
    (!rootDepartment ||
      (rootIsDefault && normalizeDepartment(profileDepartment) !== "digital marketing"))
      ? profileDepartment
      : rootDepartment || departments[0] || "";
  return normalizeDepartment(resolvedDepartment) === "sales"
    ? "Sales"
    : resolvedDepartment || "";
};

const ALL_DEPARTMENTS = [
  "digital marketing",
  "development",
  "hr",
  "management",
  "marketing",
  "sales",
  "designers",
];

export const EMPLOYEE_MODULE_DEPARTMENTS = {
  dashboard: ["hr", "management"],
  employeeManagement: ["hr"],
  leads: ["marketing"],
  quotation: ["sales", "marketing", "digital marketing"],
  tasks: ALL_DEPARTMENTS,
  projects: ALL_DEPARTMENTS,
  followUps: ["management", "marketing"],
  attendance: ALL_DEPARTMENTS,
  leave: ALL_DEPARTMENTS,
  payroll: ["hr", "management", "marketing"],
  reports: ["hr", "management"],
  performance: ["hr", "management"],
  hrManagement: ["hr"],
  esignature: ["development"],
  meeting: ALL_DEPARTMENTS,
};

export const ADMIN_MODULE_DEPARTMENTS = {
  dashboard: ALL_DEPARTMENTS,
  leads: ["marketing", "sales"],
  tasks: ALL_DEPARTMENTS,
  projects: ALL_DEPARTMENTS,
  followUps: ALL_DEPARTMENTS,
  clients: ALL_DEPARTMENTS,
  quotation: ["sales", "marketing", "digital marketing", "admin"],
  attendance: ALL_DEPARTMENTS,
  leave: ALL_DEPARTMENTS,
  payroll: ALL_DEPARTMENTS,
  employees: ALL_DEPARTMENTS,
  reports: ALL_DEPARTMENTS,
  performance: ALL_DEPARTMENTS,
  esignature: ["development"],
  meeting: ALL_DEPARTMENTS,
};

export const ADMIN_LANDING_PATHS = {
  "digital marketing": "/",
  development: "/",
  hr: "/hr-management",
  management: "/",
  marketing: "/leads",
  sales: "/quotations",
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
  "/employee/e-signatures",
  "/employee/attendance",
  "/employee/leave",
];

const EMPLOYEE_PATH_MODULES = {
  "/employee-dashboard": "dashboard",
  "/employee/dashboard": "dashboard",
  "/employee/employees": "employeeManagement",
  "/employee/employeeDetails": "employeeManagement",
  "/employee/leads": "leads",
  "/employee/quotations": "quotation",
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
  "/employee/e-signature": "esignature",
  "/employee/e-signatures": "esignature",
  "/employee/meeting": "meeting",
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
  "/hr-management": "hrManagement",
  "/boards": "boards",
  "/leadDetails": "leads",
  "/taskDetails": "tasks",
  "/edit-task": "tasks",
  "/projectDetails": "projects",
  "/followupDetails": "followUps",
  "/clientDetails": "clients",
  "/employeeDetails": "employees",
  "/payslipadmin": "payroll",
  "/e-signature": "esignature",
  "/e-signatures": "esignature",
  "/meeting": "meeting",
  "/quotations": "quotation",
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
  if (isHRDepartment(department)) return true;

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

export const canAccessAdminModule = (moduleName, department) => {
  if (isHRDepartment(department)) return true;
  return ADMIN_MODULE_DEPARTMENTS[moduleName]?.includes(normalizeDepartment(department)) || false;
};

export const getAdminLandingPath = (department) =>
  ADMIN_LANDING_PATHS[normalizeDepartment(department)] || "/";