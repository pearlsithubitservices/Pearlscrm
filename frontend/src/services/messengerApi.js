import { apiUrl } from "../config/api";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const messengerApi = {
  async getConversations() {
    const response = await fetch(apiUrl("/messenger/conversations"), {
      headers: authHeaders(),
    });
    const result = await response.json();
    return result?.data || [];
  },

  async search(query) {
    const response = await fetch(apiUrl(`/messenger/search?q=${encodeURIComponent(query || "")}`), {
      headers: authHeaders(),
    });
    const result = await response.json();
    return result?.data || { employees: [], clients: [], conversations: [], messages: [], files: [], projects: [], tasks: [] };
  },

  async getDocuments() {
    const response = await fetch(apiUrl("/messenger/documents"), {
      headers: authHeaders(),
    });
    const result = await response.json();
    return result?.data || [];
  },

  async getNotifications() {
    const response = await fetch(apiUrl("/messenger/notifications"), {
      headers: authHeaders(),
    });
    const result = await response.json();
    return result?.data || [];
  },

  async getAnnouncements() {
    const response = await fetch(apiUrl("/messenger/announcements"), {
      headers: authHeaders(),
    });
    const result = await response.json();
    return result?.data || [];
  },
};

export default messengerApi;
