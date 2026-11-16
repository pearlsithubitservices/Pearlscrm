import api from "../lib/api";

export const getHRRecords = (module) =>
  api.get("/hr/records", { params: module ? { module } : {} });
export const getHRAnalytics = () => api.get("/hr/analytics");
export const getHREmployees = () => api.get("/hr/employees");
export const getEmployeeKpi = (employeeId) =>
  api.get(`/hr/performance/${encodeURIComponent(employeeId)}`);

export const createHRRecord = (module, details, file) => {
  const formData = new FormData();
  formData.append("module", module);
  formData.append("employeeId", details.employeeId || "");
  formData.append("employeeName", details.employeeName || "");
  formData.append("status", details.status || "");
  formData.append("title", details.title || "");
  formData.append("details", JSON.stringify(details));
  if (file) formData.append("file", file);
  return api.post("/hr/records", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateHRRecord = (id, changes) =>
  api.put(`/hr/records/${id}`, changes);
export const deleteHRRecord = (id) => api.delete(`/hr/records/${id}`);

export const downloadHRDocument = async (id, name) => {
  const response = await api.get(`/hr/documents/${id}/download`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name || "employee-document";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
