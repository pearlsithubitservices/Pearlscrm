import { apiUrl } from "../config/api.js";

const STORAGE_KEY = "pearls_quotations";

const getToken = () => localStorage.getItem("token");

const readLocalQuotations = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
};

const writeLocalQuotations = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const buildHeaders = (extra = {}) => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const quotationApi = {
  list: async () => {
    try {
      const response = await fetch(apiUrl("/quotations"), {
        headers: buildHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to load quotations");
      }

      const result = await response.json();
      if (Array.isArray(result)) {
        writeLocalQuotations(result);
      }
      return result;
    } catch (error) {
      const fallback = readLocalQuotations();
      return fallback;
    }
  },

  create: async (payload) => {
    try {
      const response = await fetch(apiUrl("/quotations"), {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || "Unable to create quotation");
      }

      const result = await response.json();
      const existing = readLocalQuotations();
      writeLocalQuotations([result, ...existing]);
      return result;
    } catch (error) {
      const existing = readLocalQuotations();
      const localQuotation = {
        ...payload,
        _id: `local-${Date.now()}`,
        quotationNumber: payload.quotationNumber || `QT-${Date.now()}`,
        status: payload.status || "Draft",
        approvalStatus: payload.approvalStatus || "Pending",
        createdAt: new Date().toISOString(),
      };
      writeLocalQuotations([localQuotation, ...existing]);
      return localQuotation;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await fetch(apiUrl(`/quotations/${id}`), {
        method: "PUT",
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || "Unable to update quotation");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      const existing = readLocalQuotations();
      const updated = existing.map((item) => (item._id === id ? { ...item, ...payload, _id: id } : item));
      writeLocalQuotations(updated);
      return { ...payload, _id: id };
    }
  },

  remove: async (id) => {
    try {
      const response = await fetch(apiUrl(`/quotations/${id}`), {
        method: "DELETE",
        headers: buildHeaders(),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || "Unable to delete quotation");
      }

      return true;
    } catch (error) {
      const existing = readLocalQuotations();
      writeLocalQuotations(existing.filter((item) => item._id !== id));
      return true;
    }
  },

  duplicate: async (id) => {
    try {
      const response = await fetch(apiUrl(`/quotations/${id}/duplicate`), {
        method: "POST",
        headers: buildHeaders(),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || "Unable to duplicate quotation");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      const existing = readLocalQuotations();
      const source = existing.find((item) => item._id === id) || { quotationNumber: "QT-DRAFT" };
      const duplicated = {
        ...source,
        _id: `local-copy-${Date.now()}`,
        quotationNumber: `${source.quotationNumber || "QT-DRAFT"}-COPY`,
        status: "Draft",
        approvalStatus: "Pending",
        createdAt: new Date().toISOString(),
      };
      writeLocalQuotations([duplicated, ...existing]);
      return duplicated;
    }
  },
};

export default quotationApi;
