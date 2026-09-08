import React, { useEffect } from "react";
import { motion } from "framer-motion";

import LeaveApprovals from "./LeaveTable";
import LeaveCalendar from "./LeaveCalendar";
import CompanyHolidays from "./CompanyHolidays";

import useLeave from "../../Hooks/useLeave";
import { socket } from "../../config/socket.js";

import {
  Clock10Icon,
  UserCheck,
  UserMinus,
  Users,
  Download,
} from "lucide-react";

const LeaveManagement = () => {
  const {
    leaves,
    updateLeaveStatus,
    getLeaves,
    loading,
  } = useLeave();

  // Socket.io Real-time synchronization
  useEffect(() => {
    if (!socket) return;

    const handleSync = () => {
      getLeaves();
    };

    socket.on("leaveStatusUpdated", handleSync);
    socket.on("leaveCreated", handleSync);
    socket.on("leaveDeleted", handleSync);
    socket.on("leaveUpdated", handleSync);

    return () => {
      socket.off("leaveStatusUpdated", handleSync);
      socket.off("leaveCreated", handleSync);
      socket.off("leaveDeleted", handleSync);
      socket.off("leaveUpdated", handleSync);
    };
  }, [getLeaves]);

  // Pending leave requests
  const pendingLeave = leaves.filter(
    (item) =>
      item.status?.toLowerCase() === "pending"
  );

  // Approved leave requests
  const approvedLeave = leaves.filter(
    (item) =>
      item.status?.toLowerCase() === "approved"
  );

  // Today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Employees who are on leave today
  const onLeaveToday = approvedLeave.filter(
    (item) => {
      const from = new Date(item.leaveFrom);
      const to = new Date(item.leaveTo);

      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);

      return (
        today >= from &&
        today <= to
      );
    }
  );

  // Statistics
  const stats = [
    {
      icon: Clock10Icon,
      title: "Pending Requests",
      value: pendingLeave.length,
      badge: "Needs Action",
      badgeColor: "bg-amber-100 text-amber-700",
    },
    {
      icon: UserMinus,
      title: "On Leave Today",
      value: onLeaveToday.length,
      badge: onLeaveToday.length > 0 ? "Away" : "All In",
      badgeColor: onLeaveToday.length > 0 ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700",
    },
    {
      icon: UserCheck,
      title: "Approved Leaves",
      value: approvedLeave.length,
      badge: "Active Records",
      badgeColor: "bg-green-100 text-green-700",
    },
    {
      icon: Users,
      title: "Total Leave Requests",
      value: leaves.length,
      badge: "All Time",
      badgeColor: "bg-blue-100 text-blue-700",
    },
  ];

  // EXPORT CSV
  const exportToCSV = () => {
    if (!leaves.length) {
      alert("No leave records to export.");
      return;
    }

    const headers = ["Employee Name", "Employee ID", "Department", "Leave Title", "Leave Type", "Start Date", "End Date", "Days", "Status", "Reason"];
    const rows = leaves.map((item) => {
      const name = `"${(item.employeeName || "").replace(/"/g, '""')}"`;
      const id = item.employeeId || "";
      const dept = item.department || "";
      const title = `"${(item.leaveTitle || "").replace(/"/g, '""')}"`;
      const type = item.leaveType || "";
      const from = item.leaveFrom ? new Date(item.leaveFrom).toLocaleDateString() : "";
      const to = item.leaveTo ? new Date(item.leaveTo).toLocaleDateString() : "";
      const days = item.leaveDays || 1;
      const status = item.status || "Pending";
      const reason = `"${(item.leaveReason || "").replace(/"/g, '""')}"`;

      return [name, id, dept, title, type, from, to, days, status, reason].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leave_records_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex max-h-screen overflow-y-auto no-scrollbar bg-[#f3f0eb]">

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          <div>
            <h1 className="text-2xl font-bold text-[#023167]">
              Admin Leave Management
            </h1>

            <p className="text-sm text-gray-500 mt-0.5">
              Review requests, track team availability, and manage company holidays
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* EXPORT CSV */}
            <button
              type="button"
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-gray-700 hover:text-blue-700 bg-gray-100 hover:bg-blue-50 border border-gray-200 rounded-lg transition font-medium text-xs cursor-pointer"
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>

        </div>

        {/* STATS */}
        <div className="p-4 md:p-6 lg:p-8 bg-[#f3f0eb]">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{
                  scale: 1.02,
                }}
                className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm"
              >

                <div className="flex items-center justify-between mb-3">
                  <div className="bg-gray-100 rounded-xl w-10 h-10 flex items-center justify-center">
                    <s.icon
                      className="w-5 h-5 text-[#0b2b57]"
                    />
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>

                <p className="text-sm text-gray-500 font-medium">
                  {s.title}
                </p>

                <h2 className="text-3xl font-bold text-[#0b2b57] mt-1">
                  {s.value}
                </h2>

              </motion.div>
            ))}

          </div>

        </div>

        {/* CONTENT */}
        <div className="px-4 md:px-8 pb-8 space-y-8">

          {/* LEAVE TABLE */}
          <LeaveApprovals
            leaves={leaves}
            updateLeaveStatus={updateLeaveStatus}
            onLeaveUpdated={getLeaves}
          />

          {/* BOTTOM SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* CALENDAR */}
            <div className="xl:col-span-2">

              <LeaveCalendar
                leaves={approvedLeave}
              />

            </div>

            {/* COMPANY HOLIDAYS */}
            <div>

              <CompanyHolidays />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default LeaveManagement;