export const DEPARTMENTS = [
  "Digital marketing",
  "Development",
  "HR",
  "Management",
  "Marketing",
  "Sales",
  "Designers",
];

export const DEFAULT_DEPARTMENT = DEPARTMENTS[0];

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((department) => ({
  value: department,
  label: department,
}));
