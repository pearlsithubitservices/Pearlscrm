import { useState } from "react";
import { apiUrl } from "../config/api.js";
import { staticFollowups } from "../Utils/staticData.js";

const API_URL = apiUrl("/followups");

export default function useFollowups() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (url = "", method = "GET", body = null) => {
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

      const response = await fetch(`${API_URL}${url}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (Array.isArray(data) && data.length === 0) {
        return staticFollowups;
      }

      return data;
    } catch (err) {
      setError(err.message);
      if (method === "GET") {
        return staticFollowups;
      }
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
    try {
      const res = await request(`/${id}`, "GET");
      return res;
    } catch (err) {
      return staticFollowups.find((f) => f._id === id) || staticFollowups[0];
    }
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