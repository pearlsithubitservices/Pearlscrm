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
  Camera,
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

  const [selectedSelfie, setSelectedSelfie] = useState(null);
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

  const [timeFilter, setTimeFilter] = useState("month");
  const [customStartDate, setCustomStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return (employeesdetails || []).filter((emp) => {
      const empDateRaw = emp.clockIn || emp.date;
      if (empDateRaw) {
        const empDate = new Date(empDateRaw);
        if (!isNaN(empDate.getTime())) {
          if (timeFilter === "week") {
            const weekAgo = new Date(startOfToday);
            weekAgo.setDate(weekAgo.getDate() - 6);
            if (empDate < weekAgo) return false;
          } else if (timeFilter === "month") {
            if (empDate.getMonth() !== now.getMonth() || empDate.getFullYear() !== now.getFullYear()) {
              return false;
            }
          } else if (timeFilter === "year") {
            if (empDate.getFullYear() !== now.getFullYear()) return false;
          } else if (timeFilter === "custom") {
            if (customStartDate) {
              const start = new Date(customStartDate);
              start.setHours(0, 0, 0, 0);
              if (empDate < start) return false;
            }
            if (customEndDate) {
              const end = new Date(customEndDate);
              end.setHours(23, 59, 59, 999);
              if (empDate > end) return false;
            }
          }
        }
      }

      if (!query) return true;

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
  }, [employeesdetails, employeeMap, searchQuery, timeFilter, customStartDate, customEndDate]);

  const exportOverallSheet = () => {
    const listToExport = filteredEmployees.length > 0 ? filteredEmployees : employeesdetails;
    if (!listToExport || listToExport.length === 0) {
      alert("No attendance records available to export for the selected filter!");
      return;
    }

    const now = Date.now();
    const headers = ["Employee Name", "Department", "Status", "Clock In Time", "Location", "Working Time"];

    const rows = listToExport.map((emp) => {
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
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSingleEmployeePDF = (employee) => {
    const empUid = employee.employee_uid || employee.uid || employee._id;
    const empName = employee.employee_name || employeeMap[empUid] || "Employee";
    const dept = employee.department || "Operations";

    // Gather all historical records for this employee
    let employeeRecords = (employeesdetails || []).filter((rec) => {
      const matchUid = rec.employee_uid && String(rec.employee_uid) === String(empUid);
      const matchName = rec.employee_name && rec.employee_name.toLowerCase().trim() === empName.toLowerCase().trim();
      return matchUid || matchName;
    });

    if (employeeRecords.length === 0) {
      employeeRecords = [employee];
    }

    // Sort by Date (newest first)
    employeeRecords.sort((a, b) => {
      const dateA = a.clockIn ? new Date(a.clockIn) : new Date(a.date || 0);
      const dateB = b.clockIn ? new Date(b.clockIn) : new Date(b.date || 0);
      return dateB - dateA;
    });

    // Monthly summary calculation
    const totalDaysLogged = employeeRecords.length;
    let totalSecondsSum = 0;
    const nowTs = Date.now();

    const tableRowsHtml = employeeRecords.map((rec) => {
      const dateFormatted = rec.clockIn ? new Date(rec.clockIn).toLocaleDateString('en-GB') : (rec.date ? new Date(rec.date).toLocaleDateString('en-GB') : 'N/A');
      const inTime = rec.clockIn ? new Date(rec.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--';
      const outTime = rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : (rec.attendanceState === 'working' ? 'Active' : '--:--');
      const loc = rec.location || 'Office';

      let secs = Number(rec.workingHours || 0);
      if (rec.attendanceState === "working" && rec.clockIn) {
        const cIn = new Date(rec.clockIn).getTime();
        if (!isNaN(cIn) && cIn <= nowTs) {
          let breakDuration = 0;
          (rec.breaks || []).forEach((b) => {
            if (b.start) {
              const bStart = new Date(b.start).getTime();
              const bEnd = b.end ? new Date(b.end).getTime() : nowTs;
              if (!isNaN(bStart) && !isNaN(bEnd) && bEnd >= bStart) {
                breakDuration += Math.floor((bEnd - bStart) / 1000);
              }
            }
          });
          secs = Math.max(0, Math.floor((nowTs - cIn) / 1000) - breakDuration);
        }
      }
      totalSecondsSum += secs;

      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const rowWorkTime = `${h}h ${m}m`;

      const st = rec.attendanceState === 'working' ? 'Present' : (rec.status || 'Completed');
      const badgeClass = rec.attendanceState === 'working' ? 'badge-online' : (rec.status === 'break' ? 'badge-break' : 'badge-completed');

      return `
        <tr>
          <td><strong>${dateFormatted}</strong></td>
          <td>${inTime}</td>
          <td>${outTime}</td>
          <td>${loc}</td>
          <td>${rowWorkTime}</td>
          <td><span class="badge ${badgeClass}">${st}</span></td>
        </tr>
      `;
    }).join('');

    const totalHrsSum = Math.floor(totalSecondsSum / 3600);
    const totalMinsSum = Math.floor((totalSecondsSum % 3600) / 60);
    const totalWorkFormatted = `${totalHrsSum}h ${totalMinsSum}m`;
    const activeMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const printWin = window.open("", "_blank", "width=950,height=1000");
    if (!printWin) {
      alert("Please allow popups to download the PDF statement!");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Monthly Attendance Statement - ${empName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 900; color: #0b2b57; letter-spacing: -0.5px; }
          .logo span { color: #2563eb; }
          .title { font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 30px; }
          .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .field-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
          .field-value { font-size: 15px; font-weight: 800; color: #0f172a; }
          .kpi-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
          .kpi-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: center; }
          .kpi-val { font-size: 22px; font-weight: 900; color: #1d4ed8; }
          .kpi-lbl { font-size: 11px; font-weight: 700; color: #3b82f6; text-transform: uppercase; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #0b2b57; color: #fff; text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
          td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 500; color: #334155; }
          tr:nth-child(even) { background: #f8fafc; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
          .badge-online { background: #dcfce7; color: #15803d; }
          .badge-completed { background: #f1f5f9; color: #475569; }
          .badge-break { background: #fef3c7; color: #b45309; }
          .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">PEARLS <span>CRM</span></div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Monthly Employee Attendance Statement</div>
          </div>
          <div style="text-align: right;">
            <div class="title">Statement Period</div>
            <div style="font-size: 14px; font-weight: 800; color: #2563eb; margin-top: 4px;">${activeMonthName}</div>
          </div>
        </div>

        <div class="card">
          <div class="card-grid">
            <div>
              <div class="field-label">Employee Name</div>
              <div class="field-value">${empName}</div>
            </div>
            <div>
              <div class="field-label">Employee UID</div>
              <div class="field-value">${empUid}</div>
            </div>
            <div>
              <div class="field-label">Department</div>
              <div class="field-value">${dept}</div>
            </div>
          </div>
        </div>

        <div class="kpi-container">
          <div class="kpi-box">
            <div class="kpi-val">${totalDaysLogged} Days</div>
            <div class="kpi-lbl">Total Days Logged</div>
          </div>
          <div class="kpi-box" style="background: #faf5ff; border-color: #e9d5ff;">
            <div class="kpi-val" style="color: #7e22ce;">${totalWorkFormatted}</div>
            <div class="kpi-lbl" style="color: #9333ea;">Total Monthly Work Hours</div>
          </div>
          <div class="kpi-box" style="background: #f0fdf4; border-color: #bbf7d0;">
            <div class="kpi-val" style="color: #15803d;">${employee.attendanceState === 'working' ? 'Present Today' : 'Clocked Out'}</div>
            <div class="kpi-lbl" style="color: #16a34a;">Current Status</div>
          </div>
        </div>

        <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Monthly Attendance Logs (${employeeRecords.length} Records)</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Location</th>
              <th>Working Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          This is an official computer-generated monthly statement from Pearls CRM Attendance Management System.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  return (

    <div className="max-h-screen overflow-y-auto no-scrollbar bg-[#f1f5f9] p-8">


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

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold text-[#0f172a] outline-none shadow-sm cursor-pointer"
          >
            <option value="month">This Month</option>
            <option value="week">This Week</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>

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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* EMPLOYEE TABLE */}

        <div className="xl:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[800px] overflow-y-auto no-scrollbar">

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

            <div>

              <h2 className="text-3xl font-black text-[#0f172a]">

                Live Attendance

              </h2>

              <p className="text-gray-500 text-xs mt-0.5">

                Realtime employee monitoring & status

              </p>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              {/* SEARCH */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                />
              </div>

              {/* PERIOD FILTER */}
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Records</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="custom">📅 Custom Date Range</option>
              </select>

              {/* CUSTOM DATE RANGE PICKERS */}
              {timeFilter === "custom" && (
                <div className="flex items-center gap-2 bg-blue-50/60 p-1 rounded-xl border border-blue-100">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
                    title="From Date"
                  />
                  <span className="text-xs text-gray-400 font-bold">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
                    title="To Date"
                  />
                </div>
              )}

              {/* EXPORT BUTTON */}
              <button
                onClick={exportOverallSheet}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0b2b57] text-white rounded-xl text-xs font-bold hover:bg-[#081f40] transition shadow-sm"
                title="Export CSV Sheet for selected filter"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>

            </div>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">

            <table className="w-full min-w-[650px]">

              <thead>

                <tr className="border-b border-gray-100 text-left text-gray-400 text-xs font-bold uppercase tracking-wider whitespace-nowrap">

                  <th className="pb-3 px-3 font-bold">

                    Employee

                  </th>

                  <th className="pb-3 px-3 font-bold">

                    Status

                  </th>

                  <th className="pb-3 px-3 font-bold">

                    Login Time

                  </th>

                  <th className="pb-3 px-3 font-bold">

                    Location

                  </th>

                  <th className="pb-3 px-3 font-bold">

                    Photo

                  </th>

                  <th className="pb-3 px-3 font-bold text-center">

                    Report PDF

                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-gray-400">
                      No matching employee records found
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => {
                    const empName = employee.employee_name || employeeMap[employee.employee_uid] || "Employee";
                    return (

                  <tr
                    key={employee._id || employee.employee_uid || `attendance-${index}`}
                    className="border-b border-gray-50 hover:bg-slate-50/70 transition-all"
                  >

                    {/* EMPLOYEE */}

                    <td className="py-3 px-3">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">

                          {
                            empName.charAt(0).toUpperCase()
                          }

                        </div>

                        <div className="min-w-0">

                          <h3 className="font-bold text-[#0f172a] text-sm truncate">

                            {empName}

                          </h3>

                          <p className="text-gray-400 text-xs truncate">

                            {employee.department || "Employee"}

                          </p>

                        </div>

                      </div>

                    </td>

                    {/* STATUS */}

                    <td className="py-3 px-3 whitespace-nowrap">

                      <span className={`
                        px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5
                        ${employee.attendanceState === 'working'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : employee.status === 'break'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-rose-50 text-rose-500 border border-rose-200'
                        }
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          employee.attendanceState === 'working' ? 'bg-emerald-500 animate-pulse' : employee.status === 'break' ? 'bg-amber-500' : 'bg-rose-400'
                        }`}></span>
                        {employee.attendanceState.toLowerCase() == "working" ? "Online" : employee.attendanceState.toLowerCase() == "break" ? "Break" : "Offline"}

                      </span>

                    </td>

                    {/* LOGIN */}

                    <td className="py-3 px-3 font-semibold text-[#0f172a] text-xs whitespace-nowrap">

                      {
                        new Date(
                          employee.clockIn

                        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                      }

                    </td>

                    {/* LOCATION */}

                    <td className="py-3 px-3 whitespace-nowrap">

                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        {employee.location || "Office"}
                      </span>

                    </td>

                    {/* PHOTO */}

                    <td className="py-3 px-3 whitespace-nowrap">

                      <div className="relative group inline-block">
                        <img
                          src={
                            employee.photo ||
                            employee.login_photo ||
                            'https://i.pravatar.cc/100'
                          }
                          alt="Employee Selfie"
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200 cursor-pointer hover:scale-105 transition shadow-sm"
                          title="Click to view full selfie"
                          onClick={() => {
                            const imgSrc = employee.photo || employee.login_photo || 'https://i.pravatar.cc/300';
                            const empInfo = employeeMap[employee.employee_uid] || {};
                            setSelectedSelfie({
                              photo: imgSrc,
                              name: employee.employee_name || empInfo?.name || "Employee",
                              id: employee.employee_uid || "N/A",
                              department: employee.department || empInfo?.department || "Operations",
                              time: employee.clockIn ? new Date(employee.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "--:--",
                              location: employee.location || "Office",
                            });
                          }}
                        />
                        <div
                          onClick={() => {
                            const imgSrc = employee.photo || employee.login_photo || 'https://i.pravatar.cc/300';
                            const empInfo = employeeMap[employee.employee_uid] || {};
                            setSelectedSelfie({
                              photo: imgSrc,
                              name: employee.employee_name || empInfo?.name || "Employee",
                              id: employee.employee_uid || "N/A",
                              department: employee.department || empInfo?.department || "Operations",
                              time: employee.clockIn ? new Date(employee.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "--:--",
                              location: employee.location || "Office",
                            });
                          }}
                          className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full text-[10px] cursor-pointer hover:bg-indigo-700 transition shadow"
                          title="View Selfie"
                        >
                          <Camera className="w-3 h-3" />
                        </div>
                      </div>

                    </td>

                    {/* ACTION PDF */}

                    <td className="py-3 px-3 whitespace-nowrap text-center">

                      <button
                        onClick={() => downloadSingleEmployeePDF(employee)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition border border-blue-100 shadow-sm"
                        title="Download Monthly Attendance Statement PDF"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Report PDF
                      </button>

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

        <div className="xl:col-span-4 space-y-8">

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

          {/* CORRECTION REQUESTS */}

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-h-[480px] overflow-y-auto no-scrollbar">

            <div className="flex items-center justify-between mb-6">

              <div className="flex items-center gap-3">

                <h2 className="text-2xl font-black text-[#0f172a]">

                  Correction Requests

                </h2>

                {(() => {
                  const pendingCount = corrections.filter(c => !c.status || c.status === "Pending").length;
                  if (pendingCount > 0) {
                    return (
                      <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full animate-pulse">

                        {pendingCount} Pending

                      </span>
                    );
                  }
                  return null;
                })()}

              </div>

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

          {/* HOLIDAYS */}

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100  h-[350px] overflow-y-auto no-scrollbar">

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

        </div>

      </div>

      {/* SELFIE PREVIEW MODAL */}
      {selectedSelfie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-[#0f172a] text-lg">Clock-In Selfie</h3>
                  <p className="text-xs text-gray-500 font-medium">{selectedSelfie.name} ({selectedSelfie.id})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSelfie(null)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selfie Image */}
            <div className="my-5 rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 flex items-center justify-center max-h-[360px] relative group">
              <img
                src={selectedSelfie.photo}
                alt="Selfie Preview"
                className="w-full h-auto max-h-[360px] object-contain"
              />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-semibold">
                <Camera className="w-3.5 h-3.5 text-green-400" /> Captured at {selectedSelfie.time}
              </div>
            </div>

            {/* Details Footer */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between text-xs text-gray-600 mb-5 border border-gray-100">
              <div>
                <span className="text-gray-400 block font-medium">Department</span>
                <span className="font-bold text-[#0f172a] text-sm">{selectedSelfie.department}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block font-medium">Location</span>
                <span className="font-bold text-blue-600 flex items-center gap-1 justify-end text-sm">
                  <MapPin className="w-3.5 h-3.5" /> {selectedSelfie.location}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex">
              <button
                onClick={() => setSelectedSelfie(null)}
                className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>

  );

}