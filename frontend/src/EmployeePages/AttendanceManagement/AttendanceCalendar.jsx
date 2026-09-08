import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  PencilLine,
  Edit,
  Edit2,

} from "lucide-react";
import AttendanceCorrection from "./AttendanceCorrection";
import useEmpAttendance from "../../Hooks/useEmpAttendance";
import AttendanceEdit from "./AttendanceEdit";
import { calculateAttendanceStatus } from "../../Utils/formatNumber";
import { useAuth } from "../../context/AuthContext";
import socket from "../../config/socket";

const AttendanceCalendar = ({ refreshTrigger }) => {
  const [filter, setFilter] = useState("month");
  const [customStartDate, setCustomStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [search, setSearch] = useState("");

  const [attendance, setAttendances] = useState([]);
  const [selectedattendance, setSelectedAttendances] = useState();
  const [showForm, setShowform] = useState(false);
  const { getAttendanceById } = useEmpAttendance();
  const [showEdit, setShowEdit] = useState(false);
  const { user } = useAuth();
  const userId = user?.uid || user?._id || user?.id || "";

  useEffect(() => {
    if (userId) {
      fetchAttendancebyId();

      if (socket) {
        socket.on("attendanceUpdated", fetchAttendancebyId);
      }

      // Auto-refresh every 10 seconds in background
      const interval = setInterval(() => {
        fetchAttendancebyId();
      }, 10000);

      return () => {
        if (socket) {
          socket.off("attendanceUpdated", fetchAttendancebyId);
        }
        clearInterval(interval);
      };
    }
  }, [userId, refreshTrigger]);

  const fetchAttendancebyId = async () => {
    if (!userId) return;
    try {
      const res = await getAttendanceById(userId);
      setAttendances(res?.data || []);
      console.log(res);
    } catch (err) {
      console.error("Error fetching attendances:", err.message);
    }
  };



  const filteredData = useMemo(() => {
    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const sorted = [...(attendance || [])].sort((a, b) => {
      const dateA = a.clockIn ? new Date(a.clockIn) : new Date(a.date);
      const dateB = b.clockIn ? new Date(b.clockIn) : new Date(b.date);
      return dateB - dateA;
    });

    return sorted.filter((item) => {
      const itemDateRaw = item.clockIn || item.date;
      if (!itemDateRaw) return false;
      const attendanceDate = new Date(itemDateRaw);

      let matchPeriod = true;

      if (filter === "week") {
        const weekAgo = new Date(startOfToday);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchPeriod = attendanceDate >= weekAgo && attendanceDate <= endOfToday;
      } else if (filter === "month") {
        matchPeriod =
          attendanceDate.getMonth() === now.getMonth() &&
          attendanceDate.getFullYear() === now.getFullYear();
      } else if (filter === "year") {
        matchPeriod = attendanceDate.getFullYear() === now.getFullYear();
      } else if (filter === "custom") {
        let afterStart = true;
        let beforeEnd = true;
        if (customStartDate) {
          const s = new Date(customStartDate);
          s.setHours(0, 0, 0, 0);
          afterStart = attendanceDate >= s;
        }
        if (customEndDate) {
          const e = new Date(customEndDate);
          e.setHours(23, 59, 59, 999);
          beforeEnd = attendanceDate <= e;
        }
        matchPeriod = afterStart && beforeEnd;
      } else if (filter === "all") {
        matchPeriod = true;
      }

      const formattedDate = attendanceDate
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");

      const matchSearch =
        !search.trim() ||
        formattedDate.includes(search.trim()) ||
        (item.status && item.status.toLowerCase().includes(search.trim().toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(search.trim().toLowerCase()));

      return matchPeriod && matchSearch;
    });
  }, [attendance, filter, search]);

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds <= 0) {
      return "0m";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const statusStyle = {
    present:
      "bg-green-100 text-green-600",
    absent:
      "bg-red-100 text-red-500",
    "late comer":
      "bg-yellow-100 text-yellow-600",
    "early logout":
      "bg-orange-100 text-orange-600",
    "half day":
      "bg-purple-100 text-purple-600",
  };


  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="space-y-6 bg-[#f4f1eb]"
    >
      {/* HEADER */}

      <div className="bg-white rounded-2xl border p-4">

        <div className="flex flex-col lg:flex-row gap-4 justify-between">

          <div>
            <h2 className="text-3xl font-bold text-[#0b2b57]">
              Attendance calendar
            </h2>

            <p className="text-gray-400">
              Recent attendance logs
            </p>
          </div>

          <div className="flex gap-3">

            <div className="flex items-center relative">
              <Search
                size={18}
                className=" text-gray-400 absolute left-5"
              />

              <input
                type="text"
                placeholder="Search date..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="pl-11 pr-4 py-3 w-[280px] bg-gray-100 rounded-xl outline-none"
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(
                    e.target.value
                  )
                }
                className=" bg-gray-100 rounded-xl px-5 py-3 pr-10 outline-none cursor-pointer text-sm font-semibold"
              >
                <option value="all">
                  All Time
                </option>

                <option value="week">
                  This Week
                </option>

                <option value="month">
                  This Month
                </option>

                <option value="year">
                  This Year
                </option>

                <option value="custom">
                  📅 Custom Date Range
                </option>
              </select>

              {filter === "custom" && (
                <div className="flex items-center gap-2 bg-blue-50/60 p-1.5 rounded-xl border border-blue-100">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 outline-none"
                    title="From Date"
                  />
                  <span className="text-xs text-gray-400 font-bold">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 outline-none"
                    title="To Date"
                  />
                </div>
              )}

            </div>

          </div>

        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-2xl border overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-white border-b">

                <th className="py-5 text-[#0b2b57] font-bold text-sm">
                  DATE
                </th>

                <th className="py-5 text-[#0b2b57] font-bold text-sm">
                  CHECK-IN
                </th>

                <th className="py-5 text-[#0b2b57] font-bold text-sm">
                  CHECK-OUT
                </th>

                <th className="py-5 text-[#0b2b57] font-bold text-sm">
                  HOURS
                </th>

                <th className="py-5 text-[#0b2b57] font-bold text-sm">
                  BREAK HOURS
                </th>

                <th className="py-5 text-[#0b2b57] font-bold text-sm">
                  TOTAL WORKING HOURS
                </th>

                <th className="py-5 text-[#0b2b57] font-bold text-sm">
                  LOCATION
                </th>

                <th className="py-5 text-[#0b2b57] font-bold text-sm">
                  STATUS
                </th>
                <th className="py-5 text-[#0b2b57] font-bold text-sm">

                </th>

              </tr>

            </thead>

            <tbody>

              {filteredData.length === 0 ? <tr>
                <td
                  colSpan={8}
                  className="py-10 text-center text-gray-500 font-medium"
                >
                  No attendance records found
                </td>
              </tr>
                : filteredData.map(
                  (row, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="text-center py-6 font-bold">
                        {new Date(row.clockIn || row.date).toLocaleDateString("en-GB")}
                      </td>

                      {(() => {
                        const clockInDate = row.clockIn ? new Date(row.clockIn) : null;
                        const clockOutDate = row.clockOut ? new Date(row.clockOut) : null;
                        const totalBreakSeconds = (row.breaks || []).reduce((sum, breakItem) => {
                          if (typeof breakItem?.duration === "number" && breakItem.duration > 0 && breakItem.duration < 86400) {
                            return sum + breakItem.duration;
                          }
                          const startMs = breakItem?.start ? new Date(breakItem.start).getTime() : NaN;
                          const endMs = breakItem?.end ? new Date(breakItem.end).getTime() : Date.now();

                          if (!isNaN(startMs) && startMs > 100000000000 && !isNaN(endMs) && endMs >= startMs) {
                            const diffSecs = Math.floor((endMs - startMs) / 1000);
                            return sum + Math.min(86400, Math.max(0, diffSecs));
                          }
                          return sum;
                        }, 0);
                        const nowMs = Date.now();
                        const clockInMs = clockInDate ? clockInDate.getTime() : null;
                        const clockOutMs = clockOutDate
                          ? clockOutDate.getTime()
                          : (row.attendanceState === "working" || row.attendanceState === "break" ? nowMs : null);

                        const totalDurationSeconds =
                          clockInMs && clockOutMs && clockOutMs >= clockInMs
                            ? Math.min(86400, Math.max(0, Math.floor((clockOutMs - clockInMs) / 1000)))
                            : 0;

                        const workingSeconds = Math.max(0, totalDurationSeconds - totalBreakSeconds);

                        const displayHours = formatDuration(totalDurationSeconds);
                        const displayBreakHours = formatDuration(totalBreakSeconds);
                        const displayWorkingHours = formatDuration(workingSeconds);

                        const actualDate = row.clockIn ? new Date(row.clockIn) : (row.date ? new Date(row.date) : null);
                        const isToday =
                          actualDate &&
                          actualDate.toDateString() === new Date().toDateString();

                        return (
                          <>
                            <td className="text-center">
                              {clockInDate
                                ? clockInDate.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                : "--:--"}
                            </td>

                            <td className="text-center">
                              {clockOutDate && (!isToday || row.attendanceState === "clocked_out")
                                ? clockOutDate.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                : "--:--"}
                            </td>

                            <td className="text-center text-black">
                              {displayHours}
                            </td>

                            <td className="text-center text-black">
                              {displayBreakHours || "0"}
                            </td>

                            <td className="text-center text-black ">
                              {displayWorkingHours}
                            </td>

                          </>
                        );
                      })()}

                      <td className="text-center">
                        <div className="flex justify-center items-center gap-2">
                          <MapPin
                            size={16}
                          />
                          {row.location || "WFH"}
                        </div>
                      </td>

                      <td className="text-center py-5">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`px-5 py-2 rounded-full font-sm ${statusStyle[row.status ? row.status : calculateAttendanceStatus(row.clockIn, row.clockOut, row.workingHours)?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}
                          >
                            ● {row.status ? row.status : calculateAttendanceStatus(row.clockIn, row.clockOut, row.workingHours) || "present"}
                          </span>

                          <button
                            onClick={() => {
                              setSelectedAttendances(row);
                              setShowform(true);
                            }}
                            className="p-2 hover:bg-gray-200 rounded-xl text-[#0b2b57] transition border border-gray-200 bg-white shadow-sm"
                            title="Request Attendance Correction"
                          >
                            <PencilLine size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}


            </tbody>

          </table>

        </div>

      </div>
      {showForm && (
        <div className=" fixed ml-0 inset-0 z-50 flex items-center justify-center w-full max-h-screen   no-scrollbar  backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-6xl max-h-[90vh]  overflow-y-auto overflow-x-hidden no-scrollbar"
          >
            <AttendanceCorrection
              selectedRecord={selectedattendance}
              onClose={() => {
                setShowform(false);
                setSelectedAttendances(null);
              }}
            />
          </motion.div>
        </div>
      )}
      {showEdit && (
        <div className=" fixed ml-0 inset-0 z-50 flex items-center justify-center w-full max-h-screen   no-scrollbar  backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-6xl max-h-[90vh]  overflow-y-auto overflow-x-hidden no-scrollbar"
          >
            <AttendanceEdit
              attendance={selectedattendance}
              onSuccess={fetchAttendancebyId}
              onClose={() => setShowEdit(false)}
            />
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default AttendanceCalendar;