import React, { useEffect, useState } from "react";
import { Play, Coffee, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import AttendanceClockin from "./AttendanceClockin";

import { useAuth } from "../../context/AuthContext";
import useEmpAttendance from "../../Hooks/useEmpAttendance";
import { calculateAttendanceStatus } from "../../Utils/formatNumber";

const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const AttendanceDashboard = ({
    photoSubmitted,
    clockInTime,
    setClockInTime,
    clockOutTime,
    setClockOutTime,
    setHours,
    setAttendanceRecords,
    attendanceRecords,
    onAttendanceChange,
}) => {

    
    const{clockIn,clockOut,startBreak, endBreak,getAttendanceById}=useEmpAttendance();
    const [working, setWorking] = useState(false);
    const [onBreak, setOnBreak] = useState(false);
    const { user } = useAuth();


    const [seconds, setSeconds] = useState(0);
    const [breakTick, setBreakTick] = useState(0);

    // store timestamps for calculation (IMPORTANT FIX)
    const [clockInStamp, setClockInStamp] = useState(null);
    const [clockOutStamp, setClockOutStamp] = useState(null);
    const [showClockInToast, setShowClockInToast] = useState(false);
    const [pendingClockIn, setPendingClockIn] = useState(null);

    // break timestamp + accumulated break seconds
    const [breakStartStamp, setBreakStartStamp] = useState(null);
    const [completedBreakSeconds, setCompletedBreakSeconds] = useState(0);

    // Restore persisted state on mount
    useEffect(() => {
        const savedClockInStamp = localStorage.getItem("clockInStamp");
        const savedClockInTime = localStorage.getItem("clockInTime");
        const savedBreakStartStamp = localStorage.getItem("breakStartStamp");
        const savedCompletedBreakSeconds = localStorage.getItem("completedBreakSeconds");

        if (savedClockInStamp) {
            const stamp = Number(savedClockInStamp);

            setWorking(true);
            setClockInStamp(stamp);
            setClockInTime(savedClockInTime || "");

            const elapsed = Math.floor(
                (Date.now() - stamp) / 1000
            );

            setSeconds(elapsed);
        }

        if (savedCompletedBreakSeconds) {
            const num = Number(savedCompletedBreakSeconds) || 0;
            setCompletedBreakSeconds(num);
        }

        if (savedBreakStartStamp) {
            setOnBreak(true);
            setBreakStartStamp(Number(savedBreakStartStamp));
        }
    }, []);

    // Dynamic sync with backend on mount or user change
    useEffect(() => {
        const syncCurrentAttendance = async () => {
            const empUid = user?.uid || user?._id || user?.id || "";
            if (!empUid) return;

            try {
                const res = await getAttendanceById(empUid);
                const records = res?.data || [];
                const todayStr = getLocalDateString();

                const todayRecord = records.find((rec) => {
                    if (!rec.date) return false;
                    const recDate = new Date(rec.date).toISOString().split("T")[0];
                    return recDate === todayStr;
                });

                if (todayRecord) {
                    if (todayRecord.clockIn) {
                        const inTime = new Date(todayRecord.clockIn);
                        const stamp = inTime.getTime();
                        setClockInStamp(stamp);
                        setClockInTime(
                            inTime.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                        );

                        if (todayRecord.clockOut && todayRecord.attendanceState === "clocked_out") {
                            setWorking(false);
                            const outTime = new Date(todayRecord.clockOut);
                            setClockOutStamp(outTime.getTime());
                            setClockOutTime(
                                outTime.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })
                            );
                        } else {
                            setWorking(true);
                            setClockOutTime("--:--");
                            setClockOutStamp(null);
                        }
                    }

                    const breaks = todayRecord.breaks || [];
                    let finishedBreakSecs = 0;
                    let activeBreak = null;

                    breaks.forEach((b) => {
                        const startMs = b.start ? new Date(b.start).getTime() : NaN;
                        const endMs = b.end ? new Date(b.end).getTime() : NaN;

                        if (!isNaN(startMs) && startMs > 100000000000) {
                            if (!isNaN(endMs) && endMs >= startMs) {
                                const dur = typeof b.duration === "number" && b.duration > 0 && b.duration < 86400
                                    ? b.duration
                                    : Math.min(86400, Math.floor((endMs - startMs) / 1000));
                                finishedBreakSecs += Math.max(0, dur);
                            } else if (isNaN(endMs) || !b.end) {
                                activeBreak = b;
                            }
                        }
                    });

                    setCompletedBreakSeconds(finishedBreakSecs);

                    if (activeBreak && activeBreak.start) {
                        const activeMs = new Date(activeBreak.start).getTime();
                        if (!isNaN(activeMs) && activeMs > 100000000000) {
                            setOnBreak(true);
                            setBreakStartStamp(activeMs);
                        }
                    }
                }
            } catch (err) {
                console.error("Error syncing attendance state:", err);
            }
        };

        syncCurrentAttendance();
    }, [user]);

    const getCurrentBreakSeconds = () => {
        if (!breakStartStamp) {
            return completedBreakSeconds;
        }

        return (
            completedBreakSeconds +
            Math.floor((Date.now() - breakStartStamp) / 1000)
        );
    };

    const getNetWorkingSeconds = () => {
        if (!working || !clockInStamp) return 0;
        const totalElapsed = Math.floor((Date.now() - clockInStamp) / 1000);
        const breakSeconds = getCurrentBreakSeconds();
        return Math.max(0, totalElapsed - breakSeconds);
    };

    // Update timers when tab becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && working && clockInStamp) {
                setSeconds(getNetWorkingSeconds());
            }

            if (document.visibilityState === "visible" && onBreak && breakStartStamp) {
                setBreakTick((prev) => prev + 1);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [working, clockInStamp, onBreak, breakStartStamp, completedBreakSeconds]);

    // Work timer effect (pauses during break)
    useEffect(() => {
        let interval;

        if (working && clockInStamp) {
            setSeconds(getNetWorkingSeconds());
            interval = setInterval(() => {
                setSeconds(getNetWorkingSeconds());
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [working, clockInStamp, onBreak, breakStartStamp, completedBreakSeconds]);

    // Break timer: compute display from timestamps + accumulated seconds
    useEffect(() => {
        let interval;

        if (onBreak && breakStartStamp) {
            interval = setInterval(() => {
                setBreakTick((prev) => prev + 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [onBreak, breakStartStamp]);

    // Persist completed break seconds
    useEffect(() => {
        localStorage.setItem("completedBreakSeconds", String(completedBreakSeconds));
    }, [completedBreakSeconds]);

    // Persist or clear break start stamp
    useEffect(() => {
        if (breakStartStamp) {
            localStorage.setItem("breakStartStamp", String(breakStartStamp));
        } else {
            localStorage.removeItem("breakStartStamp");
        }
    }, [breakStartStamp]);

    // Format HH:MM:SS
    const formatTime = (totalSeconds) => {
        const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const secs = String(totalSeconds % 60).padStart(2, "0");

        return `${hrs}:${mins}:${secs}`;
    };

    // SAFE calculation using timestamps
    const calculateHours = (start, end) => {
        if (!start || !end) return 0;

        const diff = end - start;

        const hours = diff / (1000 * 60 * 60);

        return Number(hours.toFixed(2)); // decimal hours (8.25 etc)
    };

    //Show Toast
    const handleToastClockIn = () => {
        if (!photoSubmitted) {
            alert("Please capture and submit photo first");
            return;
        }

        setPendingClockIn({
            time: new Date(),
            location: "Office",
        });

        setShowClockInToast(true);
    };

const getUserLocation = () => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve("Office");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await res.json();
                    const loc =
                        data.address?.city ||
                        data.address?.town ||
                        data.address?.suburb ||
                        data.address?.state ||
                        "Office";
                    resolve(loc);
                } catch {
                    resolve("Office");
                }
            },
            () => resolve("Office"),
            { timeout: 5000 }
        );
    });
};

    // CLOCK IN
    const handleClockIn = async () => {
        if (!photoSubmitted) {
            alert("Please capture and submit photo first");
            return;
        }

        try {
            const now = Date.now();

            const formattedTime = new Date(now).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });

            // Update UI
            setWorking(true);
            setClockInStamp(now);
            setShowClockInToast(false);
            setClockInTime(formattedTime);
            setClockOutTime("--:--");
            setClockOutStamp(null);

            // Save to localStorage & clear previous clockOut
            localStorage.setItem("clockInStamp", now);
            localStorage.setItem("clockInTime", formattedTime);
            localStorage.removeItem("clockOutStamp");
            localStorage.removeItem("clockOutTime");

            const empUid = user?.uid || user?._id || user?.id || user?.email || "";
            const empName = user?.name || user?.displayName || user?.employeeName || "Employee";

            // Fetch live location
            const userLocation = await getUserLocation();
            const selfie = localStorage.getItem("userSelfie") || (typeof photoSubmitted === "string" ? photoSubmitted : null);

            // Call API
            const res = await clockIn({
                employee_uid: empUid,
                employee_name: empName,
                department: user?.department || "Developer",
                date: getLocalDateString(),
                photoStatus: "submitted",
                location: userLocation,
                photo: selfie,
            });

            console.log("Clock In Success:", res);
            onAttendanceChange?.();

        } catch (err) {
            console.error("Clock In Failed:", err);
            alert(err.message);

            // Rollback UI changes if API fails
            setWorking(false);
            setClockInStamp(null);
            setClockInTime("");

            localStorage.removeItem("clockInStamp");
            localStorage.removeItem("clockInTime");
        }
    };

    // Toggle Break (start/resume)
    const handleToggleBreak = async () => {
        const today = getLocalDateString();
        const empUid = user?.uid || user?._id || user?.id || user?.email || "";

        try {
            if (!onBreak) {
                // Start Break
                const now = Date.now();

                await startBreak({
                    employee_uid: empUid,
                    date: today,
                });

                setBreakStartStamp(now);
                setOnBreak(true);

            } else {
                // Resume Work
                if (breakStartStamp) {
                    const now = Date.now();

                    const duration = Math.floor(
                        (now - breakStartStamp) / 1000
                    );

                    await endBreak({
                        employee_uid: empUid,
                        date: today,
                    });

                    setCompletedBreakSeconds(
                        prev => prev + duration
                    );

                    setBreakStartStamp(null);
                    setOnBreak(false);
                } else {
                    setOnBreak(false);
                }
            }
            onAttendanceChange?.();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    // CLOCK OUT
    const handleClockOut = async () => {
        const empUid = user?.uid || user?._id || user?.id || user?.email || "";
        try {
            const now = Date.now();

            // If user is on break, end the break first
            if (onBreak && breakStartStamp) {
                const duration = Math.floor(
                    (now - breakStartStamp) / 1000
                );

                setCompletedBreakSeconds(prev =>
                    prev + duration
                );

                await endBreak({
                    employee_uid: empUid,
                    date: getLocalDateString(),
                });
            }

            // Call backend clock out
            const res = await clockOut({
                employee_uid: empUid,
                date: getLocalDateString(),
            });

            console.log("Clock Out Success:", res);

            // UI Updates
            setWorking(false);
            setOnBreak(false);
            setBreakTick(0);
            setCompletedBreakSeconds(0);
            setBreakStartStamp(null);

            setClockOutStamp(now);

            const formattedOut = new Date(now).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });

            setClockOutTime(formattedOut);

            // Clear local storage
            localStorage.removeItem("clockInStamp");
            localStorage.removeItem("clockInTime");
            localStorage.removeItem("breakStartStamp");
            localStorage.removeItem("completedBreakSeconds");
            localStorage.removeItem("breakSeconds");

            onAttendanceChange?.();

            // Optional: update UI records using backend response
            setAttendanceRecords?.((prev) => [
                ...prev,
                {
                    clockIn: res.data.clockIn,
                    clockOut:res.data.clockOut,
                    date: res.data.date,
                    hours: Number((res.data.workingHours / 3600).toFixed(2)),
                    breaks: res.data.breaks,
                    status: res.data.status,
                },
            ]);

            setSeconds(0);

            console.log("Clocked out");

        } catch (err) {
            console.error("Clock Out Failed:", err);
            alert(err.message);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl  p-6"
        >
            {/* HEADER */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-bold text-[#0b2b57]">Attendance Dashboard</h2>

                    <p className="text-gray-500">Track your work hours</p>
                </div>

                <div
                    className={`px-5 py-2 rounded-full text-sm font-semibold ${working
                        ? "bg-green-100 text-green-600 animate-pulse"
                        : "bg-red-100 text-red-500"
                        }`}
                >
                    ● {working ? "Online" : "Offline"}
                </div>
            </div>

            {/* TIMER */}
            <div className="mt-8 bg-gray-50 border rounded-2xl p-10 text-center">
                <h1 className="text-3xl font-bold text-[#0b2b57]">{formatTime(seconds)}</h1>

                <p className="text-gray-400 text-xl mt-4">{new Date().toDateString()}</p>
            </div>

            {/* BREAK */}
            {(onBreak || completedBreakSeconds > 0) && (
                <div className={`mt-4 border rounded-xl p-4 text-center ${onBreak ? "bg-yellow-50 border-yellow-200" : "bg-blue-50 border-blue-200"}`}>
                    <h3 className={`font-bold ${onBreak ? "text-yellow-600" : "text-blue-600"}`}>
                        {onBreak ? "☕ Tea Break Running" : "☕ Total Tea Break Today"}
                    </h3>

                    <p className="text-2xl font-bold mt-2">{formatTime(getCurrentBreakSeconds())}
                    </p>
                </div>
            )}

            {/* BUTTONS */}
            <div className="mt-6 flex gap-3">
                {!working ? (
                    <button
                        onClick={handleToastClockIn}
                        className="flex-1 bg-[#1f66b2] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        <Play size={20} />
                        Clock In
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleToggleBreak}
                            className="flex-1 bg-yellow-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                            <Coffee size={20} />
                            {onBreak ? "Resume Work" : "Tea Break"}
                        </button>

                        <button
                            onClick={handleClockOut}
                            className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                            <LogOut size={20} />
                            Clock Out
                        </button>
                    </>
                )}
            </div>

            {/* INFO */}
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <p className="text-gray-500">Clock In</p>
                    <h3 className="font-bold text-xl">{clockInTime || "--:--"}</h3>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border">
                    <p className="text-gray-500">Clock Out</p>
                    <h3 className="font-bold text-xl">{clockOutTime || "--:--"}</h3>
                </div>
            </div>

            {showClockInToast && (
                <AttendanceClockin
                    open={showClockInToast}
                    pendingClockIn={pendingClockIn}
                    onClose={() => setShowClockInToast(false)}
                    onConfirm={handleClockIn}
                />
            )}
        </motion.div>
    );
};

export default AttendanceDashboard;
