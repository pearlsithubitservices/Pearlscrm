import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    CalendarDays,
    Clock3,
    Camera,
    CheckCircle2,
} from "lucide-react";

import AttendanceCamera from "./AttendanceCamera";
import AttendanceDashboard from "./AttendanceDashboard";
import AttendanceCalendar from "./AttendanceCalendar";

import useEmpAttendance from "../../Hooks/useEmpAttendance";
import { useAuth } from "../../context/AuthContext";

const Attendance = () => {
    const [photoSubmitted, setPhotoSubmitted] = useState(false);
    const [clockedIn, setClockedIn] = useState(false);

    const [clockInTime, setClockInTime] = useState(null);
    const [clockOutTime, setClockOutTime] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAttendanceChange = () => {
        setRefreshKey(prev => prev + 1);
    };

    const [hours, setHours] = useState("");
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    const { getAttendanceById } = useEmpAttendance();
    const { user } = useAuth();
    const [summary, setSummary] = useState({
        present: 0,
        absent: 0,
        late: 0,
        workingDays: 0,
    });

    React.useEffect(() => {
        const fetchMonthlyStats = async () => {
            const userId = user?.uid || user?._id || user?.id || "";
            if (!userId) return;

            try {
                const res = await getAttendanceById(userId);
                const records = res?.data || [];
                const now = new Date();

                const currentMonthRecords = records.filter((item) => {
                    if (!item.date) return false;
                    const d = new Date(item.date);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                });

                let present = 0;
                let absent = 0;
                let late = 0;

                currentMonthRecords.forEach((rec) => {
                    const st = (rec.status || "").toLowerCase();
                    if (st === "present" || rec.clockIn) present++;
                    if (st === "absent") absent++;
                    if (st === "late" || st === "late comer") late++;
                });

                setSummary({
                    present,
                    absent,
                    late,
                    workingDays: currentMonthRecords.length,
                });
            } catch (err) {
                console.error("Error fetching attendance stats:", err);
            }
        };

        fetchMonthlyStats();
    }, [user, refreshKey]);

    return (
        <div className="max-h-screen overflow-auto no-scrollbar bg-[#f4f1eb]  ">

            {/* HEADER */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded shadow-sm border p-6 mb-6"
            >
                <div className="flex flex-col lg:flex-row justify-between gap-6">

                    <div>
                        <h1 className="text-3xl font-bold text-[#0b2b57]">
                            Attendance Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Track employee attendance, working hours and status.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">

                        <div className="bg-blue-50 px-5 py-3 rounded-2xl flex items-center gap-3">
                            <CalendarDays className="text-blue-600" size={22} />

                            <div>
                                <p className="text-xs text-gray-500">Today</p>
                                <p className="font-semibold">
                                    {new Date().toLocaleDateString("en-GB")}
                                </p>
                            </div>
                        </div>

                        <div className="bg-green-50 px-5 py-3 rounded-2xl flex items-center gap-3">
                            <CheckCircle2 className="text-green-600" size={22} />

                            <div>
                                <p className="text-xs text-gray-500">Photo Status</p>
                                <p className="font-semibold">
                                    {photoSubmitted ? "Submitted" : "Pending"}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </motion.div>

            {/* TOP SECTION */}
            <div className="grid lg:grid-cols-3 gap-6 p-4">

                {/* CAMERA */}
                <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="bg-white rounded-3xl border shadow-sm p-6 h-[500px]">
                        <div className="flex items-center gap-2 mb-5">
                            <Camera size={20} className="text-blue-600" />
                            <h2 className="font-bold text-xl text-[#0b2b57]">
                                Attendance Selfie
                            </h2>
                        </div>

                        <AttendanceCamera
                            photoSubmitted={photoSubmitted}
                            setPhotoSubmitted={setPhotoSubmitted}
                        />
                    </div>
                </motion.div>

                {/* DASHBOARD */}
                <motion.div
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 mr-4"
                >
                    <div className="bg-white rounded-3xl  shadow-sm  h-full ">

                        <AttendanceDashboard
                            photoSubmitted={photoSubmitted}
                            clockedIn={clockedIn}
                            setClockedIn={setClockedIn}
                            clockInTime={clockInTime}
                            setClockInTime={setClockInTime}
                            clockOutTime={clockOutTime}
                            setClockOutTime={setClockOutTime}
                            summary={summary}
                            setHours={setHours}
                            hours={hours}
                            setAttendanceRecords={setAttendanceRecords}
                            attendanceRecords={attendanceRecords}
                            onAttendanceChange={handleAttendanceChange}
                        />

                    </div>
                </motion.div>
            </div>

            {/* ATTENDANCE TABLE */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 mb-8 p-4 bg-[#f4f1eb]"
            >
                <div className="bg-[#f4f1eb] rounded-3xl border shadow-sm p-6">

                    <AttendanceCalendar
                        attendanceData={attendanceRecords}
                        refreshTrigger={refreshKey}
                    />

                </div>
            </motion.div>

        </div>
    );
};

export default Attendance;