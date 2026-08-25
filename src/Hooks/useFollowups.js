import { useState } from "react";
import { apiUrl } from "../config/api";

export default function useFollowups() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (urlPath = "", method = "GET", body = null) => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const fullUrl = apiUrl(`/followups${urlPath}`);
      const response = await fetch(fullUrl, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create Followup
  const createFollowup = async (followupData) => {
    return request("", "POST", followupData);
  };

  // Get All Followups
  const getFollowups = async () => {
    return request("", "GET");
  };

  // Get Single Followup
  const getFollowupById = async (id) => {
    return request(`/${id}`, "GET");
  };

  // Update Followup
  const updateFollowup = async (id, followupData) => {
    return request(`/${id}`, "PUT", followupData);
  };

  // Delete Followup
  const deleteFollowup = async (id) => {
    return request(`/${id}`, "DELETE");
  };

  return {
    loading,
    error,
    createFollowup,
    getFollowups,
    getFollowupById,
    updateFollowup,
    deleteFollowup,
  };
}