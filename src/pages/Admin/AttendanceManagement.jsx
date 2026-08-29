import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import axios from 'axios';

import {
  Search,
  Clock3,
  Coffee,
  LogIn,
  LogOut,
  MapPin,
  CalendarDays,
  Users,
  TimerReset,
  Bell,
  Download,
  Check,
  X,
  FileText,
} from 'lucide-react';
import useAttendance from '../../Hooks/useAttendance';
import { useAuth } from '../../context/AuthContext';
import useLeave from '../../Hooks/useLeave';
import useEmployees from '../../Hooks/useEmployees';
import useAttendanceCorrection from '../../Hooks/useAttendanceCorrection';

import socket from '../../config/socket';

export default function AttendanceManagement() {

  const [employeesdetails, setEmployeesdetails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { employees } = useEmployees();

  const { user } = useAuth();

  const { getHolidays, holidays } = useLeave();
  useEffect(() => {
    getHolidays();
  }, []);

  const employeeMap = useMemo(() => {
    return (employees || []).reduce((map, employee) => {
      const id = employee.uid || employee._id || employee.id;
      if (id) map[id] = employee.name || employee.displayName || employee.employeeName;
      return map;
    }, {});
  }, [employees]);

  const { getAttendance } = useAttendance();

  const fetchAttendance = async () => {
    try {
      const res = await getAttendance();
      setEmployeesdetails(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Fetch attendance error:", err);
      setEmployeesdetails([]);
    }
  };

  const { getCorrections, updateStatus: handleUpdateCorrectionStatus } = useAttendanceCorrection();
  const [corrections, setCorrections] = useState([]);

  const fetchCorrections = async () => {
    try {
      const list = await getCorrections();
      setCorrections(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch corrections error:", err);
      setCorrections([]);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchCorrections();

    // Real-time WebSocket listener
    if (socket) {
      socket.on("attendanceUpdated", fetchAttendance);
      socket.on("correctionStatusUpdated", fetchCorrections);
    }

    // Automated background refresh every 10 seconds
    const interval = setInterval(() => {
      fetchAttendance();
      fetchCorrections();
    }, 10000);

    return () => {
      if (socket) {
        socket.off("attendanceUpdated", fetchAttendance);
        socket.off("correctionStatusUpdated", fetchCorrections);
      }
      clearInterval(interval);
    };
  }, []);

  // FETCH EMPLOYEES

  // const fetchEmployees =
  //   async () => {

  //     try {

  //       const response =
  //         await axios.get(
  //           'http://localhost:5000/api/attendance/active'
  //         );

  //       setEmployees(
  //         response.data
  //       );

  //     } catch (error) {

  //       console.log(error);

  //     }

  //   };

  // // AUTO REFRESH

  // useEffect(() => {

  //   fetchEmployees();

  //   const interval =
  //     setInterval(() => {

  //       fetchEmployees();

  //     }, 3000);

  //   return () =>
  //     clearInterval(interval);

  // }, []);

  // STATUS COUNTS

  const onlineEmployees =
    employeesdetails.filter(
      (emp) =>
        emp.attendanceState.toLowerCase() === "working"
    );
  // const onlineEmployee =
  //   employee.filter(
  //     (emp) =>
  //       emp.attendanceState.toLowerCase() === "working"
  //   );
  console.log(onlineEmployees)

  const breakEmployees =
    employeesdetails.filter(
      (emp) =>
        emp.attendanceState.toLowerCase() === "break"
    );

  const offlineEmployees =
    employeesdetails.filter(
      (emp) =>
        emp.attendanceState.toLowerCase() === "clocked_out"
    );

  const nextHoliday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = (holidays || [])
      .filter((h) => h?.holidayDate && new Date(h.holidayDate) >= today)
      .sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate));

    if (upcoming.length === 0) return "None";
    const d = new Date(upcoming[0].holidayDate);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [holidays]);

  const todayWorkStats = useMemo(() => {
    let totalSeconds = 0;
    const now = Date.now();

    (employeesdetails || []).forEach((emp) => {
      let empSecs = Number(emp.workingHours || 0);

      if (emp.attendanceState === "working" && emp.clockIn) {
        const clockInTime = new Date(emp.clockIn).getTime();
        if (!isNaN(clockInTime) && clockInTime <= now) {
          let breakDuration = 0;
          (emp.breaks || []).forEach((b) => {
            if (b.start) {
              const bStart = new Date(b.start).getTime();
              const bEnd = b.end ? new Date(b.end).getTime() : now;
              if (!isNaN(bStart) && bStart > 100000000000 && !isNaN(bEnd) && bEnd >= bStart) {
                breakDuration += Math.min(86400, Math.max(0, Math.floor((bEnd - bStart) / 1000)));
              }
            }
          });
          const elapsed = Math.floor((now - clockInTime) / 1000);
          empSecs = Math.max(0, elapsed - breakDuration);
        }
      }

      totalSeconds += empSecs;
    });

    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);

    const totalEmployeesCount = employees?.length || employeesdetails?.length || 1;
    const targetSeconds = totalEmployeesCount * 8 * 3600;
    const percentage = Math.min(100, Math.round((totalSeconds / Math.max(1, targetSeconds)) * 100));

    return {
      formatted: `${hrs}h ${mins}m`,
      percentage: percentage,
    };
  }, [employeesdetails, employees]);

  const weeklyAttendancePercentage = useMemo(() => {
    const totalEmployeesCount = employees?.length || employeesdetails?.length || 1;
    if (totalEmployeesCount === 0) return 0;

    const presentCount = (employeesdetails || []).filter(
      (emp) => emp.attendanceState === "working" || emp.attendanceState === "break" || emp.status === "present"
    ).length;

    return Math.min(100, Math.round((presentCount / totalEmployeesCount) * 100));
  }, [employeesdetails, employees]);

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return employeesdetails || [];

    return (employeesdetails || []).filter((emp) => {
      const name = (emp.employee_name || employeeMap[emp.employee_uid] || "").toLowerCase();
      const dept = (emp.department || "").toLowerCase();
      const loc = (emp.location || "").toLowerCase();
      const status = (emp.status || emp.attendanceState || "").toLowerCase();
      const uid = (emp.employee_uid || "").toLowerCase();

      return (
        name.includes(query) ||
        dept.includes(query) ||
        loc.includes(query) ||
        status.includes(query) ||
        uid.includes(query)
      );
    });
  }, [employeesdetails, employeeMap, searchQuery]);

  const exportOverallSheet = () => {
    if (!employeesdetails || employeesdetails.length === 0) {
      alert("No attendance records available to export!");
      return;
    }

    const now = Date.now();
    const headers = ["Employee Name", "Department", "Status", "Clock In Time", "Location", "Working Time"];

    const rows = employeesdetails.map((emp) => {
      const name = emp.employee_name || employeeMap[emp.employee_uid] || "Employee";
      const dept = emp.department || "Employee";
      const status = emp.attendanceState || emp.status || "N/A";
      const clockIn = emp.clockIn ? new Date(emp.clockIn).toLocaleTimeString('en-GB') : "N/A";
      const location = emp.location || "N/A";

      let seconds = Number(emp.workingHours || 0);

      // If employee is actively working right now, calculate exact live time
      if (emp.attendanceState === "working" && emp.clockIn) {
        const clockInTime = new Date(emp.clockIn).getTime();
        if (!isNaN(clockInTime) && clockInTime <= now) {
          let breakDuration = 0;
          (emp.breaks || []).forEach((b) => {
            if (b.start) {
              const bStart = new Date(b.start).getTime();
              const bEnd = b.end ? new Date(b.end).getTime() : now;
              if (!isNaN(bStart) && bStart > 100000000000 && !isNaN(bEnd) && bEnd >= bStart) {
                breakDuration += Math.min(86400, Math.max(0, Math.floor((bEnd - bStart) / 1000)));
              }
            }
          });
          const elapsed = Math.floor((now - clockInTime) / 1000);
          seconds = Math.max(0, elapsed - breakDuration);
        }
      }

      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const formattedTime = `${hrs}h ${mins}m`;

      return [
        `"${name.replace(/"/g, '""')}"`,
        `"${dept.replace(/"/g, '""')}"`,
        `"${status.replace(/"/g, '""')}"`,
        `"${clockIn.replace(/"/g, '""')}"`,
        `"${location.replace(/"/g, '""')}"`,
        `"${formattedTime}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Overall_Attendance_Report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (

    <div className="max-h-screen overflow-y-auto no-scrollbar bg-[#f1f5f9] p-8">

      {/* TOP */}

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-4xl font-black text-[#0f172a]">

            Attendance Management

          </h1>

          <p className="text-gray-500 mt-2">

            Monitor employee attendance &
            productivity

          </p>

        </div>

        {/* SEARCH & EXPORT */}

        <div className="flex items-center gap-4">

          <div className="relative w-[300px]">

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 outline-none shadow-sm"
            />

          </div>

          <button
            onClick={exportOverallSheet}
            className="flex items-center gap-2 bg-[#0f172a] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#1e293b] transition shadow-sm"
            title="Export overall attendance records to CSV"
          >
            <Download className="w-5 h-5 text-blue-400" />
            <span>Export Sheet</span>
          </button>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">

        {/* ONLINE */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex justify-between mb-4">

            <LogIn className="w-10 h-10 text-green-500" />

            <span className="text-green-500 font-bold text-sm">

              LIVE

            </span>

          </div>

          <p className="text-gray-500 text-sm">

            Online Employees

          </p>

          <h2 className="text-4xl font-black text-[#0f172a] mt-2">

            {onlineEmployees.length || "0"}

          </h2>

        </div>

        {/* BREAK */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex justify-between mb-4">

            <Coffee className="w-10 h-10 text-yellow-500" />

          </div>

          <p className="text-gray-500 text-sm">

            On Break

          </p>

          <h2 className="text-4xl font-black text-[#0f172a] mt-2">

            {breakEmployees.length}

          </h2>

        </div>

        {/* OFFLINE */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex justify-between mb-4">

            <LogOut className="w-10 h-10 text-red-500" />

          </div>

          <p className="text-gray-500 text-sm">

            Offline Employees

          </p>

          <h2 className="text-4xl font-black text-[#0f172a] mt-2">

            {offlineEmployees.length}

          </h2>

        </div>

        {/* TOTAL */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex justify-between mb-4">

            <Users className="w-10 h-10 text-blue-500" />

          </div>

          <p className="text-gray-500 text-sm">

            Total Employees

          </p>

          <h2 className="text-4xl font-black text-[#0f172a] mt-2">

            {employeesdetails.length}

          </h2>

        </div>

        {/* HOLIDAYS */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex justify-between mb-4">

            <CalendarDays className="w-10 h-10 text-purple-500" />

          </div>

          <p className="text-gray-500 text-sm">

            Upcoming Holidays

          </p>

          <h2 className="text-2xl font-black text-[#0f172a] mt-2">

            {nextHoliday}

          </h2>

        </div>

      </div>

      {/* MAIN GRID */}

      <div className="grid lg:grid-cols-3 gap-8">

        {/* EMPLOYEE TABLE */}

        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-[800px] overflow-y-auto no-scrollbar">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-3xl font-black text-[#0f172a]">

                Live Attendance

              </h2>

              <p className="text-gray-500 mt-1">

                Realtime employee monitoring

              </p>

            </div>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto ">

            <table className="w-full ">

              <thead>

                <tr className="border-b border-gray-100 text-left text-gray-500 text-sm">

                  <th className="pb-4 font-semibold">

                    Employee

                  </th>

                  <th className="pb-4 font-semibold">

                    Status

                  </th>

                  <th className="pb-4 font-semibold">

                    Login Time

                  </th>

                  <th className="pb-4 font-semibold">

                    Location

                  </th>

                  <th className="pb-4 font-semibold">

                    Photo

                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-400">
                      No matching employee records found
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => {
                    const empName = employee.employee_name || employeeMap[employee.employee_uid] || "Employee";
                    return (

                  <tr
                    key={employee._id || employee.employee_uid || `attendance-${index}`}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-all"
                  >

                    {/* EMPLOYEE */}

                    <td className="py-5">

                      <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">

                          {
                            empName.charAt(0).toUpperCase()
                          }

                        </div>

                        <div>

                          <h3 className="font-bold text-[#0f172a]">

                            {empName}

                          </h3>

                          <p className="text-gray-500 text-sm">

                            {employee.department || "Employee"}

                          </p>

                        </div>

                      </div>

                    </td>

                    {/* STATUS */}

                    <td className="py-5">

                      <span className={`
                        px-4 py-2 rounded-2xl text-sm font-semibold
                        ${employee.attendanceState === 'working'
                          ? 'bg-green-100 text-green-600'
                          : employee.status === 'break'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-500'
                        }
                      `}>

                        {employee.attendanceState.toLowerCase() == "working" ? "online" : employee.attendanceState.toLowerCase() == "break" ? "Break" : "Offline"}

                      </span>

                    </td>

                    {/* LOGIN */}

                    <td className="py-5 font-semibold text-[#0f172a]">

                      {
                        new Date(
                          employee.clockIn

                        ).toLocaleTimeString()
                      }

                    </td>

                    {/* LOCATION */}

                    <td className="py-5">

                      <div className="flex items-center gap-2 text-gray-600">

                        <MapPin className="w-4 h-4 text-blue-500" />

                        {employee.location || "Office"}

                      </div>

                    </td>

                    {/* PHOTO */}

                    <td className="py-5">

                      <img
                        src={
                          employee.photo ||
                          employee.login_photo ||
                          'https://i.pravatar.cc/100'
                        }
                        alt="Employee Selfie"
                        className="w-12 h-12 rounded-2xl object-cover border cursor-pointer hover:scale-105 transition"
                        title="Click to view full selfie"
                        onClick={() => {
                          const imgSrc = employee.photo || employee.login_photo;
                          if (imgSrc) {
                            const win = window.open();
                            win.document.write(`<img src="${imgSrc}" style="max-width:100%;height:auto;display:block;margin:auto;" />`);
                          }
                        }}
                      />

                    </td>

                  </tr>
                    );
                  })
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* RIGHT PANEL */}

        <div className="space-y-8">

          {/* TIMESHEET */}

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-black text-[#0f172a]">

                Overall Timesheet

              </h2>

              <TimerReset className="w-6 h-6 text-blue-500" />

            </div>

            <div className="space-y-5">

              <div>

                <div className="flex justify-between mb-2">

                  <p className="text-gray-500">

                    Today's Work

                  </p>

                  <p className="font-bold">

                    {todayWorkStats.formatted}

                  </p>

                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${todayWorkStats.percentage}%` }}
                  ></div>

                </div>

              </div>

              <div>

                <div className="flex justify-between mb-2">

                  <p className="text-gray-500">

                    Weekly Attendance

                  </p>

                  <p className="font-bold">

                    {weeklyAttendancePercentage}%

                  </p>

                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${weeklyAttendancePercentage}%` }}
                  ></div>

                </div>

              </div>

            </div>

          </div>

          {/* HOLIDAYS */}

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100  h-[400px] overflow-y-auto no-scrollbar">

            <div className="flex items-center justify-between mb-6 ">

              <h2 className="text-2xl font-black text-[#0f172a]">

                Upcoming Holidays

              </h2>

              <Bell className="w-6 h-6 text-orange-500" />

            </div>

            <div className="space-y-5">

              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const upcoming = (holidays || [])
                  .filter((item) => item?.holidayDate && new Date(item.holidayDate) >= today)
                  .sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate));

                if (upcoming.length === 0) {
                  return (
                    <div className="text-center text-gray-400 py-8">
                      No upcoming holidays found
                    </div>
                  );
                }

                return upcoming.map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <div>

                      <h3 className="font-bold text-[#0f172a]">

                        {item?.holidayName || "Leave"}

                      </h3>

                      <p className="text-gray-500 text-sm">

                        {new Date(item?.holidayDate).toLocaleDateString('en-GB')}

                      </p>

                    </div>

                    <span className="px-4 py-2 rounded-2xl bg-purple-100 text-purple-600 text-sm font-semibold">

                      {item?.holidayType || "Public"}

                    </span>

                  </div>
                ));
              })()}

            </div>

          </div>

          {/* CORRECTION REQUESTS */}

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-h-[450px] overflow-y-auto no-scrollbar">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-black text-[#0f172a]">

                Correction Requests

              </h2>

              <FileText className="w-6 h-6 text-indigo-500" />

            </div>

            <div className="space-y-4">

              {corrections.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No correction requests submitted
                </div>
              ) : (
                corrections.map((item) => (
                  <div key={item._id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">

                    <div className="flex justify-between items-start">

                      <div>

                        <h4 className="font-bold text-[#0f172a] text-base">{item.fullName}</h4>

                        <p className="text-xs text-gray-500">{item.department} • {item.correctionType}</p>

                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'Approved'
                          ? 'bg-green-100 text-green-600'
                          : item.status === 'Rejected'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>

                        {item.status || 'Pending'}

                      </span>

                    </div>

                    <div className="text-xs text-gray-600 space-y-1">

                      <p>📅 <strong>Date:</strong> {item.date ? new Date(item.date).toLocaleDateString('en-GB') : 'N/A'}</p>

                      <p>⏱️ <strong>Correct Time:</strong> {item.correctCheckIn || '--:--'} to {item.correctCheckOut || '--:--'}</p>

                      {item.reason && <p className="italic text-gray-500 bg-white p-2 rounded-lg border">"{item.reason}"</p>}

                    </div>

                    {(!item.status || item.status === 'Pending') && (
                      <div className="flex gap-2 pt-2 border-t border-gray-200">

                        <button
                          onClick={async () => {
                            await handleUpdateCorrectionStatus(item._id, "Approved");
                            fetchCorrections();
                            fetchAttendance();
                          }}
                          className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-green-600 transition shadow-sm"
                        >

                          <Check className="w-4 h-4" /> Approve

                        </button>

                        <button
                          onClick={async () => {
                            await handleUpdateCorrectionStatus(item._id, "Rejected");
                            fetchCorrections();
                          }}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-red-600 transition shadow-sm"
                        >

                          <X className="w-4 h-4" /> Reject

                        </button>

                      </div>
                    )}

                  </div>
                ))
              )}

          </div>

        </div>

      </div>

    </div>

  </div>

);

}