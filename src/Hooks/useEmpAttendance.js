import { useState } from "react";

const API_URL = "http://localhost:5000/api/empattendancenew";

export default function useEmpAttendance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (endpoint, method = "GET", body = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : null,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Request failed");
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CLOCK IN
  // =========================
  const clockIn = async ({
    employee_uid,
    employee_name,
    department,
    date,
    photoStatus,
  }) => {
    return request("/clock-in", "POST", {
      employee_uid,
      employee_name,
      department,
      date,
      photoStatus,
    });
  };

  // =========================
  // CLOCK OUT
  // =========================
  const clockOut = async ({
    employee_uid,
    date,
  }) => {
    return request("/clock-out", "POST", {
      employee_uid,
      date,
    });
  };

  // =========================
  // START BREAK
  // =========================
  const startBreak = async ({
    employee_uid,
    date,
  }) => {
    return request("/break/start", "POST", {
      employee_uid,
      date,
    });
  };

  // =========================
  // END BREAK
  // =========================
  const endBreak = async ({
    employee_uid,
    date,
  }) => {
    return request("/break/end", "POST", {
      employee_uid,
      date,
    });
  };

  // =========================
  // GET ALL ATTENDANCE
  // =========================
  const getAttendances = async () => {
    return request("/", "GET");
  };
  // =========================
  // UPDATE ATTENDANCE
  // =========================
  const updateAttendance = async (
    attendanceId,
    {
      clockIn,
      clockOut,
      breaks,
      status,
      isOnline,
    }
  ) => {
    return request(`/${attendanceId}`, "PUT", {
      clockIn,
      clockOut,
      breaks,
      status,
      isOnline,
    });
  };

  return {
    loading,
    error,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    getAttendances,
    updateAttendance,
  };
}