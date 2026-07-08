import { useState } from "react";

export default function useAttendance() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const API_URL = "https://pearlscrm.onrender.com/api/empattendancenew";



    // CLOCK IN
    const clockIn = async (attendanceData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/clock-in`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(attendanceData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // START BREAK
    const startBreak = async (breakData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/break/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(breakData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // End BREAK
    const endBreak = async (breakData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/break/end`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(breakData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // CLOCK OUT
    const clockOut = async (clockOutData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/clock-out`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(clockOutData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // GET ATTENDANCE HISTORY
    const getAttendance = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(API_URL);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            return data.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    //GET ATTENDANCE BY ID
    const getAttendanceById = async (employee_uid) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${API_URL}/employee/${employee_uid}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            return data.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };


    return {
        loading,
        error,
        clockIn,
        startBreak,
        endBreak,
        clockOut,
        getAttendance,
        getAttendanceById,  
    };
}