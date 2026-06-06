import React, { useEffect, useState } from "react";
import { Play, Coffee, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { getAttendanceStatus } from "./AttendanceStatus";
import { X, Clock, MapPin, CalendarDays } from "lucide-react";
import AttendanceClockin from "./AttendanceClockin";


const AttendanceDashboard = ({
    photoSubmitted,
    clockInTime,
    setClockInTime,
    clockOutTime,
    setClockOutTime,
    setHours,
    setAttendanceRecords,
    attendanceRecords,
}) => {
    const [working, setWorking] = useState(false);
    const [onBreak, setOnBreak] = useState(false);

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
            setWorking(true);
            setClockInStamp(Number(savedClockInStamp));
            setClockInTime(savedClockInTime || "");
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

    // Update timers when tab becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && working && clockInStamp) {
                const elapsedSeconds = Math.floor((Date.now() - clockInStamp) / 1000);
                setSeconds(elapsedSeconds);
            }

            if (document.visibilityState === "visible" && onBreak && breakStartStamp) {
                setBreakTick((prev) => prev + 1);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [working, clockInStamp, onBreak, breakStartStamp, completedBreakSeconds]);

    // Work timer effect (timestamp-based)
    useEffect(() => {
        let interval;

        if (working && clockInStamp) {
            interval = setInterval(() => {
                const now = Date.now();
                const elapsedSeconds = Math.floor((now - clockInStamp) / 1000);
                setSeconds(elapsedSeconds);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [working, clockInStamp]);

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

    //helper function

    const getCurrentBreakSeconds = () => {
        if (!breakStartStamp) {
            return completedBreakSeconds;
        }

        return (
            completedBreakSeconds +
            Math.floor((Date.now() - breakStartStamp) / 1000)
        );
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

    // CLOCK IN
    const handleClockIn = () => {
        if (!photoSubmitted) {
            alert("Please capture and submit photo first");
            return;
        }

        const now = Date.now();

        const formattedTime =
            new Date(now).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });

        setWorking(true);
        setClockInStamp(now);
        setShowClockInToast(false);

        setClockInTime(formattedTime);

        localStorage.setItem("clockInStamp", now);

        localStorage.setItem("clockInTime", formattedTime);
    };

    // Toggle Break (start/resume)
    const handleToggleBreak = () => {
        if (!onBreak) {
            // start break
            const now = Date.now();
            setBreakStartStamp(now);
            setOnBreak(true);
            // breakStartStamp will be persisted by effect
        } else {
            // resume work
            if (breakStartStamp) {
                const now = Date.now();
                const duration = Math.floor((now - breakStartStamp) / 1000);
                const updated = completedBreakSeconds + duration;
                setCompletedBreakSeconds(updated);
                setBreakStartStamp(null);
                setOnBreak(false);
                setBreakTick((prev) => prev + 1);
            } else {
                setOnBreak(false);
            }
        }
    };

    // CLOCK OUT
    const handleClockOut = () => {
        const now = Date.now();

        // compute total break seconds: accumulated + any running break
        const runningBreak = breakStartStamp ? Math.floor((now - breakStartStamp) / 1000) : 0;
        const totalBreakSeconds = completedBreakSeconds + runningBreak;

        setWorking(false);
        setOnBreak(false);
        setBreakTick(0);
        setCompletedBreakSeconds(0);
        setBreakStartStamp(null);

        setClockOutStamp(now);

        // clear persisted keys
        localStorage.removeItem("clockInStamp");
        localStorage.removeItem("clockInTime");
        localStorage.removeItem("breakStartStamp");
        localStorage.removeItem("completedBreakSeconds");
        localStorage.removeItem("breakSeconds");

        const formattedOut = new Date(now).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        setClockOutTime(formattedOut);

        const statusobj = getAttendanceStatus(clockInStamp, now);

        const totalhours = calculateHours(clockInStamp, now);

        const breakHours = Number((totalBreakSeconds / 3600).toFixed(2));

        const totalWorkingHours = Math.max(0, Number((totalhours - breakHours).toFixed(2)));

        console.log(totalhours);
        setHours(totalhours);
        setSeconds(0);

        // save record (optional but correct structure)
        setAttendanceRecords?.((prev) => [
            ...prev,
            {
                clockIn: new Date(clockInStamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                clockOut: formattedOut,
                date: new Date().toLocaleDateString(),
                hours: totalhours,
                breakHours: breakHours,
                totalWorkingHours: totalWorkingHours,
                color: statusobj.color,
                status: statusobj.status,
            },
        ]);

        console.log({
            clockIn: clockInTime,
            clockOut: new Date(now),
            workSeconds: seconds,
            breakSeconds: getCurrentBreakSeconds(),
            totalhours,
            breakHours,
            totalWorkingHours,
        });
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
            {onBreak && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <h3 className="font-bold text-yellow-600">Tea Break Running</h3>

                    <p className="text-2xl mt-2">{formatTime(getCurrentBreakSeconds())}
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
