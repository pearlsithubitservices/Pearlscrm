import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function useLeave() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [holidays, setHolidays] = useState([]);

  const [leaves, setLeaves] = useState([]);

  const { user } = useAuth();


  // CREATE LEAVE
  const submitLeave = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date(formData.leaveFrom);
      const endDate = new Date(formData.leaveTo);

      const leaveDays =
        Math.ceil(
          (endDate - startDate) / (1000 * 60 * 60 * 24)
        ) + 1;

      const payload = {
        ...formData,
        leaveDays,
        employeeId: user.uid,
      };

      const response = await fetch(
        "http://localhost:5000/api/leave",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit leave request"
        );
      }

      return {
        success: true,
        data,
      };
    } catch (err) {
      setError(err.message);

      return {
        success: false,
        error: err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  // GET ALL LEAVES

  useEffect(() => {
    if (user?.uid) {
      getLeaves();
    }
  }, [user?.uid]);


  const getLeaves = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "http://localhost:5000/api/leave"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch leaves"
        );
      }

      setLeaves(data);

      return data;
    } catch (err) {
      setError(err.message);
      console.error(err);

      return [];
    } finally {
      setLoading(false);

    }
  };

  const getHolidays = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/holidays"
      );

      const data = await response.json();

      if (response.ok) {
        setHolidays(data.holidays);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // UPDATE LEAVE
  const updateLeave = async (id, formData) => {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date(formData.leaveFrom);
      const endDate = new Date(formData.leaveTo);

      const leaveDays =
        Math.ceil(
          (endDate - startDate) / (1000 * 60 * 60 * 24)
        ) + 1;

      const payload = {
        ...formData,
        leaveDays,
        employeeId: user.uid,
      };

      const response = await fetch(
        `http://localhost:5000/api/leave/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update leave request");
      }

      return {
        success: true,
        data,
      };
    } catch (err) {
      setError(err.message);

      return {
        success: false,
        error: err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  //ADD HOLIDAYS
  const addHoliday = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "http://localhost:5000/api/holidays",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add holiday");
      }

      setHolidays((prev) => [data.holiday, ...prev]);

      return { success: true, data: data.holiday };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  //UPDATE HOLIDAYS

  const updateHoliday = async (id, formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/holidays/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update holiday");
      }

      setHolidays((prev) =>
        prev.map((h) =>
          h._id === id ? data.holiday : h
        )
      );

      return { success: true, data: data.holiday };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  //DELETE HOLIDAYS

  const deleteHoliday = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/holidays/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete holiday");
      }

      setHolidays((prev) =>
        prev.filter((h) => h._id !== id)
      );

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };




  //UPDATE STATUS

  const updateLeaveStatus = async (id, status) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/leave/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      // optional: update local state instantly
      setLeaves((prev) =>
        prev.map((leave) =>
          leave._id === id ? data.leave : leave
        )
      );

      return {
        success: true,
        data: data.leave,
      };
    } catch (err) {
      setError(err.message);

      return {
        success: false,
        error: err.message,
      };
    } finally {
      setLoading(false);
    }
  };



  return {
    submitLeave,
    updateLeave,
    getLeaves,
    leaves,
    loading,
    error,
    getHolidays,
    holidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,

    updateLeaveStatus,
  };
}