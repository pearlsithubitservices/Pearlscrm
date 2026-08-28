import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://pearlscrm.onrender.com/api/whatsapp";
//const API_BASE = "http://localhost:5000/api/whatsapp";

const useWhatsApp = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [liveQueue, setLiveQueue] = useState(null);
  const [connection, setConnection] = useState(null);
  const [broadcastCount, setBroadcastCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (endpoint, options = {}) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Request failed");
    return json.data;
  };

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const data = await request("/campaigns");
      setCampaigns(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await request("/templates");
      setTemplates(data || []);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchBroadcasts = useCallback(async () => {
    try {
      const data = await request("/broadcasts");
      setBroadcasts(data || []);
      const countData = await request("/broadcasts/count");
      setBroadcastCount(countData?.count || 0);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchAnalytics = useCallback(async (period = 30) => {
    try {
      const query = period === "all" ? "all" : period;
      const data = await request(`/analytics/dashboard?period=${query}`);
      setAnalytics(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const refreshAnalytics = useCallback(async (period = 30) => {
    try {
      const query = period === "all" ? "all" : period;
      const data = await request(`/analytics/refresh?period=${query}`, {
        method: "POST",
      });
      setAnalytics(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const fetchLiveQueue = useCallback(async () => {
    try {
      const data = await request("/queue/live");
      setLiveQueue(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchConnection = useCallback(async () => {
    try {
      const data = await request("/connection/status");
      setConnection(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const createCampaign = async (payload) => {
    const data = await request("/campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setCampaigns((prev) => [data, ...prev]);
    return data;
  };

  const updateCampaign = async (id, payload) => {
    const data = await request(`/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setCampaigns((prev) => prev.map((c) => (c._id === id ? data : c)));
    return data;
  };

  const queueCampaign = async (id) => {
    const data = await request(`/campaigns/${id}/queue`, { method: "POST" });
    setCampaigns((prev) => prev.map((c) => (c._id === id ? data : c)));
    return data;
  };

  const previewAudience = async (filters) => {
    return request("/campaigns/audience-preview", {
      method: "POST",
      body: JSON.stringify(filters),
    });
  };

  const fetchBuilderConfig = useCallback(async () => {
    try {
      const data = await request("/campaigns/builder-config");
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const createTemplate = async (payload) => {
    const data = await request("/templates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setTemplates((prev) => [data, ...prev]);
    return data;
  };

  const syncTemplates = async () => {
    const data = await request("/templates/sync", { method: "POST" });
    setTemplates(data?.templates || []);
    return data;
  };

  const createBroadcast = async (payload) => {
    const data = await request("/broadcasts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setBroadcasts((prev) => [data, ...prev]);
    return data;
  };

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  return {
    campaigns,
    templates,
    broadcasts,
    analytics,
    liveQueue,
    connection,
    broadcastCount,
    loading,
    error,
    fetchCampaigns,
    fetchTemplates,
    fetchBroadcasts,
    fetchAnalytics,
    refreshAnalytics,
    fetchLiveQueue,
    fetchConnection,
    createCampaign,
    updateCampaign,
    queueCampaign,
    previewAudience,
    fetchBuilderConfig,
    createTemplate,
    syncTemplates,
    createBroadcast,
  };
};

export default useWhatsApp;
