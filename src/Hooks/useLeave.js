import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../config/api";
import { socket } from "../config/socket";

export default function useLeave() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [holidays, setHolidays] = useState([]);

  const [leaves, setLeaves] = useState([]);

  const { user } = useAuth();
  const employeeId = user?.profile?.empId || user?.empId || user?.id || user?.uid || user?._id;

  // FETCH ALL LEAVES
  const getLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(apiUrl("/leave"));
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch leaves");
      }

      const list = Array.isArray(data) ? data : (data?.data || []);
      setLeaves(list);
      return list;
    } catch (err) {
      setError(err.message);
      console.error("Fetch leaves error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // FETCH ALL HOLIDAYS
  const getHolidays = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(apiUrl("/holidays"));
      const data = await response.json();

      if (response.ok) {
        const list = Array.isArray(data?.holidays) ? data.holidays : (Array.isArray(data) ? data : []);
        setHolidays(list);
        return list;
      } else {
        throw new Error(data?.message || "Failed to fetch holidays");
      }
    } catch (error) {
      console.error("Get holidays error:", error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    getLeaves();
    getHolidays();
  }, [getLeaves, getHolidays]);

  // REAL-TIME SOCKET.IO LISTENER
  useEffect(() => {
    if (!socket) return;

    const handleLeaveStatusUpdated = (updatedLeave) => {
      if (!updatedLeave || !updatedLeave._id) return;
      setLeaves((prev) => {
        const exists = prev.some((item) => String(item._id) === String(updatedLeave._id));
        if (exists) {
          return prev.map((item) =>
            String(item._id) === String(updatedLeave._id) ? { ...item, ...updatedLeave } : item
          );
        }
        return [updatedLeave, ...prev];
      });
    };

    const handleLeaveCreated = (newLeave) => {
      if (!newLeave || !newLeave._id) return;
      setLeaves((prev) => {
        const exists = prev.some((item) => String(item._id) === String(newLeave._id));
        if (exists) return prev;
        return [newLeave, ...prev];
      });
    };

    const handleLeaveDeleted = (data) => {
      const deletedId = data?.id || data?._id;
      if (!deletedId) return;
      setLeaves((prev) => prev.filter((item) => String(item._id) !== String(deletedId)));
    };

    // HOLIDAY REAL-TIME EVENT HANDLERS
    const handleHolidayCreated = (newHoliday) => {
      if (!newHoliday || !newHoliday._id) return;
      setHolidays((prev) => {
        const exists = prev.some((h) => String(h._id) === String(newHoliday._id));
        if (exists) return prev;
        const updated = [newHoliday, ...prev];
        return updated.sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate));
      });
    };

    const handleHolidayUpdated = (updatedHoliday) => {
      if (!updatedHoliday || !updatedHoliday._id) return;
      setHolidays((prev) => {
        const updated = prev.map((h) =>
          String(h._id) === String(updatedHoliday._id) ? { ...h, ...updatedHoliday } : h
        );
        return updated.sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate));
      });
    };

    const handleHolidayDeleted = (data) => {
      const deletedId = data?.id || data?._id;
      if (!deletedId) return;
      setHolidays((prev) => prev.filter((h) => String(h._id) !== String(deletedId)));
    };

    const handleHolidaysBulk = () => {
      getHolidays();
    };

    socket.on("leaveStatusUpdated", handleLeaveStatusUpdated);
    socket.on("leaveUpdated", handleLeaveStatusUpdated);
    socket.on("leaveCreated", handleLeaveCreated);
    socket.on("leaveDeleted", handleLeaveDeleted);

    socket.on("holidayCreated", handleHolidayCreated);
    socket.on("holidayUpdated", handleHolidayUpdated);
    socket.on("holidayDeleted", handleHolidayDeleted);
    socket.on("holidaysBulkUploaded", handleHolidaysBulk);

    return () => {
      socket.off("leaveStatusUpdated", handleLeaveStatusUpdated);
      socket.off("leaveUpdated", handleLeaveStatusUpdated);
      socket.off("leaveCreated", handleLeaveCreated);
      socket.off("leaveDeleted", handleLeaveDeleted);

      socket.off("holidayCreated", handleHolidayCreated);
      socket.off("holidayUpdated", handleHolidayUpdated);
      socket.off("holidayDeleted", handleHolidayDeleted);
      socket.off("holidaysBulkUploaded", handleHolidaysBulk);
    };
  }, [getHolidays]);

  // CREATE LEAVE
  const submitLeave = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date(formData.leaveFrom);
      const endDate = new Date(formData.leaveTo);

      if (!formData.leaveTitle || !formData.leaveType || !formData.leaveReason || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
        throw new Error("Please complete all leave fields and select a valid date range");
      }

      const leaveDays =
        Math.ceil(
          (endDate - startDate) / (1000 * 60 * 60 * 24)
        ) + 1;

      const payload = {
        ...formData,
        leaveDays,
        employeeId,
        employeeName: formData.employeeName || user?.name || "",
        department: formData.department || user?.industry || "General",
        managerName: formData.managerName || "",
        managerId: formData.managerId || "",
      };

      const response = await fetch(
        apiUrl("/leave"),
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

      // Optimistically add to local state if socket hasn't delivered yet
      if (data.leave) {
        setLeaves((prev) => {
          const exists = prev.some((item) => String(item._id) === String(data.leave._id));
          return exists ? prev : [data.leave, ...prev];
        });
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


  // UPDATE LEAVE
  const updateLeave = async (id, formData) => {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date(formData.leaveFrom);
      const endDate = new Date(formData.leaveTo);

      if (!formData.leaveTitle || !formData.leaveType || !formData.leaveReason || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
        throw new Error("Please complete all leave fields and select a valid date range");
      }

      const leaveDays =
        Math.ceil(
          (endDate - startDate) / (1000 * 60 * 60 * 24)
        ) + 1;

      const payload = {
        ...formData,
        leaveDays,
        employeeId,
        employeeName: formData.employeeName || user?.name || "",
        department: formData.department || user?.industry || "General",
        managerName: formData.managerName || "",
        managerId: formData.managerId || "",
      };

      const response = await fetch(
        apiUrl(`/leave/${id}`),
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
        apiUrl("/holidays"),
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

      const newHol = data.holiday || data;
      setHolidays((prev) => [newHol, ...prev]);

      return { success: true, data: newHol };
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
        apiUrl(`/holidays/${id}`),
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

      const updatedHol = data.holiday || data;
      setHolidays((prev) =>
        prev.map((h) =>
          h._id === id ? updatedHol : h
        )
      );

      return { success: true, data: updatedHol };
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
        apiUrl(`/holidays/${id}`),
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




  // UPDATE STATUS
  const updateLeaveStatus = async (id, status) => {
    try {
      setLoading(true);
      setError(null);

      // Optimistic instant UI update
      setLeaves((prev) =>
        prev.map((leave) =>
          String(leave._id) === String(id) ? { ...leave, status } : leave
        )
      );

      const response = await fetch(
        apiUrl(`/leave/${id}/status`),
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
        // Rollback state by re-fetching
        getLeaves();
        throw new Error(data.message || "Failed to update status");
      }

      const updated = data.leave || { status };
      setLeaves((prev) =>
        prev.map((leave) =>
          String(leave._id) === String(id) ? { ...leave, ...updated, status } : leave
        )
      );

      return {
        success: true,
        data: updated,
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

  const deleteLeave = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(apiUrl(`/leave/${id}`), { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to cancel leave request");
      setLeaves((prev) => prev.filter((leave) => leave._id !== id));
      return { success: true, data: data.leave };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
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
    deleteLeave,
  };
}