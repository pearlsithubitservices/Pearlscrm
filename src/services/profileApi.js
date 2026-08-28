import api from "../lib/api";

export const getProfile = () => api.get("/profile");
export const updateProfile = (data) => api.put("/profile", data);
export const uploadDocument = (documentType, file) => {
  const formData = new FormData();
  formData.append("documentType", documentType);
  formData.append("file", file);
  return api.post("/profile/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteDocument = (documentType) => api.delete(`/profile/documents/${documentType}`);
