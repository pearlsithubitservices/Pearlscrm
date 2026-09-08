import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Search,
  Filter,
  Bell,
  Plus,
  Users2,
  Clock2,
  CheckCheck,
  PhoneMissed,
  User,
  Calendar,
  Download,
  Trash2,
  X,
} from "lucide-react";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Pagination from "../components/Pagination";
import AnimateModals from "../components/Dashboard/AnimateModals";
import LoadingPage from "../components/Dashboard/Loading";
import CreateFollowups from "./CreateFollowups";
import useFollowups from "../Hooks/useFollowups";
import useEmployees from "../Hooks/useEmployees";
import { socket } from "../config/socket";
import toast from "react-hot-toast";

export default function FollowUps() {
  const { getFollowups, deleteFollowup } = useFollowups();
  const [followups, setFollowups] = useState([]);
  const { employees } = useEmployees();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateFilter, setDateFilter] = useState("All");

  const fetchdata = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const data = await getFollowups();
      setFollowups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching followups:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchdata();

    if (socket) {
      const handleSync = () => fetchdata(true);

      socket.on("followupUpdated", handleSync);
      socket.on("followupCreated", handleSync);

      return () => {
        socket.off("followupUpdated", handleSync);
        socket.off("followupCreated", handleSync);
      };
    }
  }, []);

  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      const name = employee.name || employee.employeeName;
      if (employee.uid) map[employee.uid] = name;
      if (employee._id) map[employee._id] = name;
      return map;
    }, {});
  }, [employees]);

  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [openFollowup, setOpenfollowup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_dismissed_followup_notifs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("crm_dismissed_followup_notifs", JSON.stringify(dismissedNotifIds));
    } catch (e) {
      console.error("Error saving dismissed followups to localStorage:", e);
    }
  }, [dismissedNotifIds]);

  const notifRef = useRef(null);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Follow-up Notifications (Matching Projects.jsx exact pattern)
  const notifications = useMemo(() => {
    const list = [];
    const todayObj = new Date();
    const y = todayObj.getFullYear();
    const m = String(todayObj.getMonth() + 1).padStart(2, "0");
    const d = String(todayObj.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;

    const parseToYYYYMMDD = (dVal) => {
      if (!dVal) return "";
      if (dVal instanceof Date) {
        if (isNaN(dVal.getTime())) return "";
        return dVal.toISOString().split("T")[0];
      }
      const str = String(dVal).trim();
      if (!str) return "";

      if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        return str.substring(0, 10);
      }

      if (str.includes("/")) {
        const parts = str.split("/");
        if (parts.length === 3 && parts[2].length === 4) {
          const p0 = parts[0].padStart(2, "0");
          const p1 = parts[1].padStart(2, "0");
          const year = parts[2];
          return parseInt(p0, 10) > 12 ? `${year}-${p1}-${p0}` : `${year}-${p0}-${p1}`;
        }
      }

      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        const py = parsed.getFullYear();
        const pm = String(parsed.getMonth() + 1).padStart(2, "0");
        const pd = String(parsed.getDate()).padStart(2, "0");
        return `${py}-${pm}-${pd}`;
      }
      return "";
    };

    const seenClientKeys = new Set();

    (Array.isArray(followups) ? followups : []).forEach((item) => {
      const statusLower = (item.status || "").toLowerCase();
      const isCompleted = statusLower === "completed" || item.isCompleted === true;
      if (isCompleted) return;

      const clientName = item.clientName || item.leadName || "Client";
      const companyName = item.companyName || item.company || "";
      const clientKey = `${clientName.trim().toLowerCase()}_${companyName.trim().toLowerCase()}`;

      if (seenClientKeys.has(clientKey)) return;

      const itemDateStr = parseToYYYYMMDD(item.date || item.nextFollowupDate || item.createdAt);
      const priorityLower = (item.priority || "").toLowerCase();

      const riskId = `risk-${item._id || item.id}`;
      const prioId = `prio-${item._id || item.id}`;
      const progId = `prog-${item._id || item.id}`;

      const isOverdue = Boolean(itemDateStr && itemDateStr < todayStr);
      const isToday = Boolean(
        itemDateStr === todayStr ||
        (item.leadSchedule && String(item.leadSchedule).toLowerCase().includes("today"))
      );

      if (isOverdue && !dismissedNotifIds.includes(riskId)) {
        seenClientKeys.add(clientKey);
        list.push({
          id: riskId,
          type: "overdue",
          title: "🚨 Overdue Follow-up Alert",
          message: `Follow-up for "${clientName}" ${companyName ? `(${companyName})` : ""} is overdue!`,
          time: itemDateStr || item.date || "Overdue",
          item,
        });
      } else if (
        (priorityLower === "urgent" || priorityLower === "high" || priorityLower === "hot") &&
        !dismissedNotifIds.includes(prioId)
      ) {
        seenClientKeys.add(clientKey);
        list.push({
          id: prioId,
          type: "urgent",
          title: "🔥 High Priority Follow-up",
          message: `High priority follow-up with "${clientName}" requires immediate attention.`,
          time: item.followupTime || itemDateStr || "Urgent",
          item,
        });
      } else if (isToday && !dismissedNotifIds.includes(progId)) {
        seenClientKeys.add(clientKey);
        list.push({
          id: progId,
          type: "hot",
          title: "⏰ Scheduled For Today",
          message: `Follow-up call with "${clientName}" is scheduled for today at ${item.followupTime || "scheduled time"}.`,
          time: item.followupTime || "Today",
          item,
        });
      }
    });

    return list;
  }, [followups, dismissedNotifIds]);

  const handleClearAllNotifs = (e) => {
    e.stopPropagation();
    const allNotifIds = notifications.map((n) => n.id);
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, ...allNotifIds])));
  };

  const handleNotifClick = (e, notif) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notif.id])));
    setShowNotifications(false);
    navigate(`/followupDetails/${notif.item._id || notif.item.id}`);
  };

  const handleDismissNotif = (e, notifId) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notifId])));
  };

  const buttons = ["All", "Pending", "In Progress", "Completed"];

  const pending = followups.filter(
    (item) => (item.status || "").toLowerCase() === "pending"
  );
  const completed = followups.filter(
    (item) => (item.status || "").toLowerCase() === "completed"
  );

  const stats = [
    { icon: Users2, title: "Total FollowUps", value: followups.length },
    { icon: PhoneMissed, title: "Pending Calls", value: pending.length },
    { icon: Clock2, title: "Scheduled", value: followups.length - completed.length },
    { icon: CheckCheck, title: "Completed", value: completed.length },
  ];

  /* FILTER DATA BY STATUS, SEARCH, EMPLOYEE & DATE */
  const filteredData = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return followups.filter((item) => {
      const matchesSearch =
        (item.clientName || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.companyName || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        active === 0 ||
        (item.status || "").toLowerCase() === buttons[active].toLowerCase();

      const matchesEmployee =
        !selectedEmployee ||
        (() => {
          const sel = String(selectedEmployee).trim().toLowerCase();
          const targetStr = (
            typeof item.assignedTo === "object"
              ? `${item.assignedTo?._id} ${item.assignedTo?.uid} ${item.assignedTo?.name} ${item.assignedTo?.employeeName} ${item.assignedTo?.email}`
              : `${item.assignedTo} ${employeeMap[item.assignedTo] || ""}`
          ).toLowerCase();
          return targetStr.includes(sel);
        })();

      let matchesDate = true;
      if (dateFilter === "Today") {
        matchesDate = item.date === todayStr || (item.leadSchedule || "").toLowerCase().includes("today");
      } else if (dateFilter === "Overdue") {
        matchesDate = item.status !== "Completed" && item.date && item.date < todayStr;
      }

      return matchesSearch && matchesStatus && matchesEmployee && matchesDate;
    });
  }, [search, active, selectedEmployee, dateFilter, followups, employeeMap]);

  /* DELETE FOLLOWUP */
  const handleDeleteFollowup = async (e, item) => {
    e.stopPropagation();
    const clientName = item.clientName || item.leadName || "Client";
    if (!window.confirm(`Are you sure you want to delete follow-up for "${clientName}"?`)) return;

    const itemId = item._id || item.id;
    try {
      await deleteFollowup(itemId);
      toast.success(`Follow-up for "${clientName}" deleted successfully!`);
      fetchdata();
    } catch (err) {
      console.error("Error deleting followup:", err);
      toast.error("Failed to delete follow-up");
    }
  };

  /* PAGINATION */
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = filteredData.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredData.length / filesPerPage) || 1;

  const handleExportCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("No follow-up data to export");
      return;
    }

    const headers = ["Client Name", "Company Name", "Phone", "Email", "Type", "Status", "Assigned Employee", "Scheduled Date", "Scheduled Time"];
    const csvRows = [headers.join(",")];

    filteredData.forEach((item) => {
      const assignedName = employeeMap[item.assignedTo] || item.assignedTo || "Unassigned";
      const row = [
        `"${(item.clientName || "").replace(/"/g, '""')}"`,
        `"${(item.companyName || "").replace(/"/g, '""')}"`,
        `"${(item.phone || "").replace(/"/g, '""')}"`,
        `"${(item.email || "").replace(/"/g, '""')}"`,
        `"${(item.type || "Call").replace(/"/g, '""')}"`,
        `"${(item.status || "Pending").replace(/"/g, '""')}"`,
        `"${(assignedName || "").replace(/"/g, '""')}"`,
        `"${(item.date || "").replace(/"/g, '""')}"`,
        `"${(item.followupTime || "").replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Followups_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Follow-up CSV exported successfully!");
  };

  const handleTestNotification = async () => {
    try {
      const res = await fetch(apiUrl("/followups/test-reminder"), { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Test reminder triggered!", { icon: "⏰" });
        fetchdata(true);
      }
    } catch (e) {
      console.error("Test notification error:", e);
      toast.error("Failed to send test notification");
    }
  };

  return (
    <div className="h-screen w-full bg-[#f3f0eb] overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
      <div className="flex-1 flex flex-col w-full min-h-screen">
        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#023167] tracking-tight">
              FOLLOWUPS
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Track client FollowUps, reminders, and lead conversion
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer shadow-2xs"
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
              onClick={() => setOpenfollowup(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[#2563a9] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer shadow-2xs"
            >
              <Plus size={16} />
              Add Followup
            </button>

            {/* NOTIFICATION BUTTON & POPOVER (MATCHING TASKS & LEADS UI) */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View follow-up notifications"
                title="View follow-up notifications"
                className="w-10 h-10 shrink-0 flex items-center justify-center border border-gray-200 rounded-xl bg-[#2563a9] hover:bg-[#1d4ed8] transition-all shadow-xs relative cursor-pointer"
              >
                <Bell size={18} className="text-white" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Popover Modal */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs">
                  <div className="p-4 bg-[#0b2b57] text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bell size={16} />
                      <h3 className="font-bold text-sm">Follow-up Notifications</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearAllNotifs}
                          className="text-[10px] bg-red-500/80 hover:bg-red-600 text-white px-2 py-0.5 rounded font-semibold transition cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                      <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {notifications.length} Active
                      </span>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-xs font-medium">
                      🎉 No new follow-up alerts right now!
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={(e) => handleNotifClick(e, n)}
                        className={`p-3.5 hover:bg-blue-50/50 transition-colors cursor-pointer space-y-1.5 ${
                          n.type === "overdue" ? "bg-red-50/40" : n.type === "hot" ? "bg-amber-50/30" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              n.type === "overdue"
                                ? "bg-red-100 text-red-700"
                                : n.type === "hot"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {n.type}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-400 font-medium">{n.time}</span>
                            <button
                              onClick={(e) => handleDismissNotif(e, n.id)}
                              className="text-gray-400 hover:text-red-500 p-0.5 rounded hover:bg-gray-100 transition"
                              title="Dismiss Notification"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{n.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{n.message}</p>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={(e) => handleNotifClick(e, n)}
                            className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="p-4 md:p-6 lg:p-8 flex-1 space-y-6">

          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200/80 shadow-2xs"
              >
                <div className="bg-blue-50 text-[#2563a9] rounded-xl w-10 h-10 flex items-center justify-center mb-3">
                  <s.icon size={20} />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {s.title}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#0b2b57] mt-1">
                  {s.value}
                </h2>
              </motion.div>
            ))}
          </div>

          {/* FILTER BAR WITH ELEGANT ALIGNMENT */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200/80 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between gap-4 shadow-2xs">
            {/* LEFT: TITLE & STATUS PILLS */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
              <h1 className="font-bold text-lg md:text-xl text-[#0b2b57] tracking-tight shrink-0">
                FOLLOW-UP SCHEDULE
              </h1>

              <div className="flex items-center gap-2 flex-wrap">
                {buttons.map((btn, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActive(index);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      active === index
                        ? "bg-[#2563a9] text-white shadow-2xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: FILTERS & SEARCH */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Employee Filter */}
              <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 text-xs border border-gray-200/60">
                <User size={14} className="text-gray-400 mr-2 shrink-0" />
                <select
                  value={selectedEmployee}
                  onChange={(e) => {
                    setSelectedEmployee(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent outline-none text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp._id || emp.uid} value={emp.uid || emp._id}>
                      {emp.name || emp.employeeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 text-xs border border-gray-200/60">
                <Calendar size={14} className="text-gray-400 mr-2 shrink-0" />
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent outline-none text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  <option value="All">All Dates</option>
                  <option value="Today">Scheduled Today</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              {/* Search */}
              <div className="flex items-center bg-gray-100 rounded-xl px-3.5 py-2 text-xs border border-gray-200/60 min-w-[200px]">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search Lead or Client..."
                  className="ml-2 bg-transparent outline-none w-full text-xs text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER WITH CUSTOM SCROLLBAR */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl overflow-x-auto custom-scrollbar border border-gray-200/80 shadow-2xs"
          >
            <table className="min-w-[800px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase tracking-wider border-b border-gray-200">
                <tr>
                  {["LEAD / CLIENT", "TYPE", "ASSIGNED TO", "SCHEDULED TIME", "STATUS", "ACTION"].map(
                    (head, i) => (
                      <th key={i} className="p-4 text-left">
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12">
                      <LoadingPage />
                    </td>
                  </tr>
                ) : currentFiles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500 text-sm">
                      No follow-up records found matching filter.
                    </td>
                  </tr>
                ) : (
                  currentFiles.map((item) => {
                    const assignedName =
                      employeeMap[item?.assignedTo] ||
                      item?.assignedTo ||
                      "Unassigned";

                    return (
                      <tr
                        key={item?._id}
                        onClick={() => navigate(`/followupDetails/${item._id}`)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-bold text-[#082f57]">
                            {item?.clientName || "Unknown Client"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item?.companyName || "No Company"}
                          </p>
                        </td>

                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full text-xs">
                            {item?.type || "Call"}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="bg-amber-50 text-amber-700 font-semibold px-3 py-1 rounded-full text-xs">
                            {assignedName}
                          </span>
                        </td>

                        <td className="p-4 text-xs font-medium text-gray-600">
                          {item?.followupTime || "00:00"}{" "}
                          {item?.date ? `(${item.date})` : ""}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 font-bold rounded-full text-xs inline-block ${
                              item?.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : item?.status === "In Progress"
                                ? "bg-cyan-100 text-cyan-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item?.status || "Pending"}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/followupDetails/${item?._id || item?.id}`);
                              }}
                              className="text-xs font-bold text-[#2563a9] hover:underline cursor-pointer bg-transparent border-0 p-0 outline-none"
                            >
                              View Details
                            </button>
                            <button
                              onClick={(e) => handleDeleteFollowup(e, item)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Delete Follow-up"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </motion.div>

          {/* PAGINATION */}
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </div>

      {/* CREATE MODAL */}
      {openFollowup && (
        <AnimateModals>
          <CreateFollowups
            onClose={() => setOpenfollowup(false)}
            fetchdata={fetchdata}
          />
        </AnimateModals>
      )}
    </div>
  );
}