import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  PencilLine,
  ChevronDown,
} from "lucide-react";
import AttendanceCorrection from "./AttendanceCorrection";
import useEmpAttendance from "../../Hooks/useEmpAttendance";

const AttendanceCalendar = ({
  date,
  clockIn,
  clockOut,
  location,
  attendanceData = [],
}) => {
  const [filter, setFilter] =
    useState("week");

  const [search, setSearch] =
    useState("");
  console.log(attendanceData);
  const [attendance, setAttendance] = useState([]);
  console.log(attendance);
  const [showForm, setShowform] = useState(false);
  const { getAttendances } = useEmpAttendance();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await getAttendances();
        setAttendance(res.data);



      } catch (err) {
        console.error(err);
      }
    };

    fetchAttendance();
  }, []);

  const filteredData = useMemo(() => {
    const now = new Date();

    console.log(attendanceData);


    return attendanceData.filter((item) => {
      const date =
        new Date(item.date);

      let matchPeriod = true;

      if (filter === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        matchPeriod = date >= weekAgo;
      }

      if (filter === "month") {
        matchPeriod =
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear();
      }

      if (filter === "year") {
        matchPeriod =
          date.getFullYear() ===
          now.getFullYear();
      }

      const matchSearch = (() => {
        if (!search.trim()) return true;

        const formattedDate = new Date(
          item.date
        ).toLocaleDateString("en-US");

        return formattedDate.includes(
          search.trim()
        );
      })();

      return (
        matchPeriod &&
        matchSearch
      );
    });
  }, [
    attendanceData,
    filter,
    search,
  ]);
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) {
      return "0h 0m";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  };

  const statusStyle = {
    Present:
      "bg-green-100 text-green-600",
    Absent:
      "bg-red-100 text-red-500",
    "Late Comer":
      "bg-yellow-100 text-yellow-600",
    "Early Logout":
      "bg-orange-100 text-orange-600",
    "Half Day":
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

            <div className="mt-2">

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(
                    e.target.value
                  )
                }
                className=" bg-gray-100 rounded-xl px-5 py-3 pr-10 outline-none"
              >
                <option value="week">
                  This Week
                </option>

                <option value="month">
                  This Month
                </option>

                <option value="year">
                  This Year
                </option>
              </select>


            </div>

            <button className="bg-gray-100 p-3 rounded-xl w-[50px] h-[45px] mt-2 " onClick={() => setShowform(true)}>
              <PencilLine size={18} className="hover:scale-125 transition-transform duration-100" />
            </button>

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
                        {new Date(row.date).toLocaleDateString()}
                      </td>

                      {(() => {
                        const clockInDate = row.clockIn ? new Date(row.clockIn) : null;
                        const clockOutDate = row.clockOut ? new Date(row.clockOut) : null;
                        const totalBreakSeconds = row.breaks?.reduce(
                          (sum, breakItem) => sum + (breakItem?.duration || 0),
                          0
                        );
                        const totalDurationSeconds =
                          clockInDate && clockOutDate
                            ? Math.max(0, (clockOutDate - clockInDate) / 1000)
                            : 0;
                        const workingSeconds =
                          typeof row.workingHours === "number"
                            ? row.workingHours
                            : Math.max(0, totalDurationSeconds - totalBreakSeconds);
                        const displayHours = formatDuration(totalDurationSeconds);
                        const displayBreakHours = formatDuration(totalBreakSeconds);
                        const displayWorkingHours = formatDuration(workingSeconds);

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
                              {clockOutDate
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
                              {displayBreakHours}
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
                          {row.location || "office"}
                        </div>
                      </td>

                      <td className="text-center">

                        <span
                          className={`px-5 py-2 rounded-full font-sm ${row.color}`}
                        >
                          ● {row.status || "present"}
                        </span>

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
              onClose={() => setShowform(false)}
            />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AttendanceCalendar;