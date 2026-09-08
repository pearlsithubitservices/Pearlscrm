import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Search,
  Filter,
  Bell,
  Users2,
  Clock2,
  CheckCheck,
  PhoneMissed,
  Calendar,
  Download,
  CheckCircle,
  Trash2,
  X,
} from "lucide-react";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Pagination from "../../components/Pagination";
import LoadingPage from "../../components/Dashboard/Loading";
import useFollowups from "../../Hooks/useFollowups";
import { useAuth } from "../../context/AuthContext";
import useEmployees from "../../Hooks/useEmployees";
import { socket } from "../../config/socket";
import toast from "react-hot-toast";
import { apiUrl } from "../../config/api";

export default function FollowUps() {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { getFollowups, updateFollowup, deleteFollowup } = useFollowups();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [dateFilter, setDateFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_emp_dismissed_followup_notifs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("crm_emp_dismissed_followup_notifs", JSON.stringify(dismissedNotifIds));
    } catch (e) {
      console.error("Error saving employee dismissed followups to localStorage:", e);
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

  const fetchdata = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const data = await getFollowups();
      setFollowups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching employee followups:", err);
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

  // Filter followups assigned to this logged-in employee
  const userFollowups = useMemo(() => {
    if (!user || user.role === "Admin" || user.role === "admin") return followups;

    const userUid = String(user.uid || user.id || user._id || "").toLowerCase();
    const userEmail = String(user.email || "").toLowerCase();
    const userName = String(user.displayName || user.name || user.employeeName || user.username || "").toLowerCase();

    const filtered = followups.filter((item) => {
      if (!item.assignedTo) return true; // Show unassigned
      const assigned = String(item.assignedTo).toLowerCase();

      return (
        (userUid && (assigned === userUid || assigned.includes(userUid))) ||
        (userEmail && (assigned === userEmail || assigned.includes(userEmail))) ||
        (userName && (assigned === userName || assigned.includes(userName))) ||
        (item.assignedTo === user?.name) ||
        (item.assignedTo === user?.employeeName)
      );
    });

    // Fallback to all followups if filter produces no matches but followups exist
    return (filtered.length > 0 || followups.length === 0) ? filtered : followups;
  }, [user, followups]);

  // Memoize Employee Follow-up Notifications (Matching Tasks & Leads UI)
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

    (Array.isArray(userFollowups) ? userFollowups : []).forEach((item) => {
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
  }, [userFollowups, dismissedNotifIds]);

  const handleClearAllNotifs = (e) => {
    e.stopPropagation();
    const allNotifIds = notifications.map((n) => n.id);
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, ...allNotifIds])));
  };

  const handleNotifClick = (e, notif) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notif.id])));
    setShowNotifications(false);
    navigate(`/employee/empfollowupDetails/${notif.item._id || notif.item.id}`);
  };

  const handleDismissNotif = (e, notifId) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notifId])));
  };

  const buttons = ["All", "Pending", "In Progress", "Completed"];

  const pending = userFollowups.filter(
    (item) => (item.status || "").toLowerCase() === "pending"
  );
  const completed = userFollowups.filter(
    (item) => (item.status || "").toLowerCase() === "completed"
  );

  const stats = [
    { icon: Users2, title: "Total FollowUps", value: userFollowups.length },
    { icon: PhoneMissed, title: "Pending Calls", value: pending.length },
    { icon: Clock2, title: "Scheduled", value: userFollowups.length - completed.length },
    { icon: CheckCheck, title: "Completed", value: completed.length },
  ];

  /* FILTER DATA BY SEARCH, STATUS & DATE FILTER */
  const filteredData = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return userFollowups.filter((item) => {
      const matchesSearch =
        (item.clientName || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.companyName || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        active === 0 ||
        (item.status || "").toLowerCase() === buttons[active].toLowerCase();

      let matchesDate = true;
      if (dateFilter === "Today") {
        matchesDate = item.date === todayStr || (item.leadSchedule || "").toLowerCase().includes("today");
      } else if (dateFilter === "Overdue") {
        matchesDate = item.status !== "Completed" && item.date && item.date < todayStr;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [search, active, dateFilter, userFollowups]);

  /* PAGINATION */
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = filteredData.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredData.length / filesPerPage) || 1;

  /* QUICK MARK AS COMPLETED */
  const handleQuickMarkDone = async (e, item) => {
    e.stopPropagation();
    const itemId = item._id || item.id;
    try {
      await updateFollowup(itemId, {
        status: "Completed",
        isCompleted: true,
        newNote: `Marked as Completed by ${user?.displayName || user?.name || "Employee"}`,
        author: user?.displayName || user?.name || "Employee",
      });
      toast.success(`Follow-up for "${item.clientName}" marked as completed!`);
      fetchdata();
    } catch (err) {
      console.error("Error completing followup:", err);
      toast.error("Failed to mark followup as completed");
    }
  };

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

  /* EXPORT MY FOLLOWUPS CSV */
  const handleExportCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("No follow-up data to export");
      return;
    }

    const headers = ["Client Name", "Company Name", "Phone", "Email", "Type", "Status", "Scheduled Date", "Scheduled Time"];
    const csvRows = [headers.join(",")];

    filteredData.forEach((item) => {
      const row = [
        `"${(item.clientName || "").replace(/"/g, '""')}"`,
        `"${(item.companyName || "").replace(/"/g, '""')}"`,
        `"${(item.phone || "").replace(/"/g, '""')}"`,
        `"${(item.email || "").replace(/"/g, '""')}"`,
        `"${(item.type || "Call").replace(/"/g, '""')}"`,
        `"${(item.status || "Pending").replace(/"/g, '""')}"`,
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
    link.setAttribute("download", `My_Followups_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("My Follow-ups CSV exported successfully!");
  };

  const handleTestNotification = async () => {
    try {
      const res = await fetch(apiUrl("/followups/test-reminder"), { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Test follow-up notification sent!", { icon: "⏰" });
      }
    } catch (e) {
      console.error("Test notification error:", e);
      toast.error("Failed to trigger test notification");
    }
  };

  return (
    <div className="flex max-h-screen overflow-y-auto custom-scrollbar bg-[#f3f0eb] overflow-x-hidden">
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#023167] tracking-tight">
              MY FOLLOWUPS
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Client communication schedule and activity logs
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer shadow-2xs"
            >
              <Download size={16} />
              Export My CSV
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
                      🎉 All follow-ups are up to date!
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

        {/* CONTENT */}
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* STATS */}
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
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{s.title}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#0b2b57] mt-1">{s.value}</h2>
              </motion.div>
            ))}
          </div>

          {/* FILTER BAR WITH DATE RANGE & ALIGNMENT */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200/80 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between gap-4 shadow-2xs">
            {/* LEFT: TITLE & STATUS PILLS */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
              <h1 className="font-bold text-lg md:text-xl text-[#0b2b57] tracking-tight shrink-0">
                MY SCHEDULE
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

            {/* RIGHT: SEARCH */}
            <div className="flex items-center bg-gray-100 rounded-xl px-3.5 py-2 text-xs border border-gray-200/60 min-w-[240px]">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Client or Company..."
                className="ml-2 bg-transparent outline-none w-full text-xs text-gray-800"
              />
            </div>
          </div>

          {/* TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl overflow-x-auto custom-scrollbar border border-gray-200/80 shadow-2xs"
          >
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase tracking-wider border-b border-gray-200">
                <tr>
                  {["LEAD / CLIENT", "TYPE", "ASSIGNED TO", "SCHEDULED TIME", "STATUS", "ACTION"].map((head, i) => (
                    <th key={i} className="p-4 text-left">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center">
                      <LoadingPage />
                    </td>
                  </tr>
                ) : currentFiles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500 text-sm">
                      No follow-up records found matching filter.
                    </td>
                  </tr>
                ) : (
                  currentFiles.map((item) => {
                    const employee = employees.find(
                      (emp) => emp.uid === item.assignedTo || emp._id === item.assignedTo
                    );

                    return (
                      <tr
                        key={item._id || item.id}
                        onClick={() => navigate(`/employee/empfollowupDetails/${item._id || item.id}`)}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-bold text-[#082f57]">{item.clientName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.companyName}</p>
                        </td>

                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full text-xs">
                            {item.type || "Call"}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="bg-amber-50 text-amber-700 font-semibold px-3 py-1 rounded-full text-xs">
                            {employee?.name || employee?.employeeName || "Me"}
                          </span>
                        </td>

                        <td className="p-4 text-xs text-gray-600 font-medium">
                          {item.followupTime || "00:00"} {item.date ? `(${item.date})` : ""}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 font-bold rounded-full text-xs inline-block ${
                              item.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : item.status === "In Progress"
                                ? "bg-cyan-100 text-cyan-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.status || "Pending"}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {item.status !== "Completed" && (
                              <button
                                onClick={(e) => handleQuickMarkDone(e, item)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition shadow-2xs"
                              >
                                <CheckCircle size={12} />
                                Mark Done
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/employee/empfollowupDetails/${item._id || item.id}`);
                              }}
                              className="text-xs font-semibold text-[#2563a9] hover:underline cursor-pointer bg-transparent border-0 p-0 outline-none"
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
    </div>
  );
}