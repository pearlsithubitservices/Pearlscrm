
import React, {
  useState,
  useEffect,
  useMemo,
  useRef
} from 'react';
import { getProjectHealthStatus } from '../utils/projectHealth';


import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Phone,
  Mail,
  X,
  User2,
  BadgeDollarSign,
  Globe,
  Upload,
  Users,
  Briefcase,
  AlertCircle,
  Activity,
  Filter,
  Bell,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  LoaderCircle,
  Paperclip,
  MessageSquareText,
  Trash2,
  Clock
} from 'lucide-react';

import { useIndustry } from '../context/IndustryContext';

import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '../lib/utils';

import { useNavigate } from 'react-router-dom';

import * as XLSX from 'xlsx';
import CreateProjects from './CreateProjects.jsx'
import AnimateModals from '../components/Dashboard/AnimateModals.jsx';
import LoadingPage from '../components/Dashboard/Loading.jsx';
import useProjectFilter from '../Hooks/useProjectfilter.js';
import Pagination from '../components/Pagination.jsx';

import { apiUrl } from '../config/api.js';
import { socket } from '../config/socket.js';

export default function ProjectManagement() {
  const [project, setProject] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [selectedMember, setSelectedMember] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_dismissed_project_notifs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("crm_dismissed_project_notifs", JSON.stringify(dismissedNotifIds));
    } catch (e) {
      console.error("Error saving dismissed project notifications to localStorage:", e);
    }
  }, [dismissedNotifIds]);
  const notifRef = useRef(null);
  const filterRef = useRef(null);
  const navigate = useNavigate();

  const fetchProjects = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const response = await fetch(apiUrl("/projects"));
      if (response.ok) {
        const data = await response.json();
        setProject(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching admin projects:", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      let empList = [];

      // 1. Fetch Users collection from MongoDB via /auth/users
      try {
        const resUsers = await fetch(apiUrl("/auth/users"));
        if (resUsers.ok) {
          const userData = await resUsers.json();
          const rawUsers = Array.isArray(userData) ? userData : (userData?.data || []);
          rawUsers.forEach((u) => {
            const uId = u._id || u.id || u.uid;
            const uName = u.name || u.employeeName || u.displayName || (u.email ? u.email.split("@")[0] : "User");
            empList.push({
              _id: uId,
              id: uId,
              uid: uId,
              name: uName,
              employeeName: uName,
              email: u.email || "",
              role: u.role || "Employee",
              ...u,
            });
          });
        }
      } catch (uErr) {
        console.error("Error fetching MongoDB users for projects:", uErr);
      }

      // 2. Fetch Employees collection from MongoDB via /employees
      try {
        const resEmp = await fetch(apiUrl("/employees"));
        if (resEmp.ok) {
          const empData = await resEmp.json();
          const rawEmps = Array.isArray(empData) ? empData : (empData?.data || []);
          rawEmps.forEach((e) => {
            const eId = e._id || e.id || e.uid;
            const eName = e.employeeName || e.name || e.displayName || (e.email ? e.email.split("@")[0] : "Employee");
            const key = String(eId || e.email).toLowerCase();
            if (!empList.some((existing) => String(existing._id || existing.id || existing.email).toLowerCase() === key)) {
              empList.push({
                _id: eId,
                id: eId,
                uid: eId,
                name: eName,
                employeeName: eName,
                email: e.email || "",
                role: e.employeeRole || e.role || "Employee",
                ...e,
              });
            }
          });
        }
      } catch (eErr) {
        console.error("Error fetching MongoDB employees for projects:", eErr);
      }

      setEmployees(empList);
    } catch (error) {
      console.error("Error fetching employees for projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchEmployees();

    if (socket) {
      const handleSync = () => fetchProjects(true);
      socket.on("projectCreated", handleSync);
      socket.on("projectUpdated", handleSync);
      socket.on("projectDeleted", handleSync);

      return () => {
        socket.off("projectCreated", handleSync);
        socket.off("projectUpdated", handleSync);
        socket.off("projectDeleted", handleSync);
      };
    }
  }, []);

  // Close notifications & filter modal on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Project Notifications (At Risk, Urgent, Active Alerts)
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

    (Array.isArray(project) ? project : []).forEach((item) => {
      const health = getProjectHealthStatus(item);
      const statusLower = (item.status || "").toLowerCase();
      const priorityLower = (item.priority || "").toLowerCase();
      const isCompleted = statusLower === "completed" || Number(item.progress) >= 100;
      if (isCompleted) return;

      const itemDueDateStr = parseToYYYYMMDD(item.dueDate || item.date);
      const isOverdue = Boolean(itemDueDateStr && itemDueDateStr < todayStr);

      const riskId = `risk-${item._id || item.id}`;
      const prioId = `prio-${item._id || item.id}`;
      const progId = `prog-${item._id || item.id}`;

      if ((health === "At Risk" || isOverdue || statusLower === "at risk" || statusLower === "delayed") && !dismissedNotifIds.includes(riskId)) {
        list.push({
          id: riskId,
          type: "at_risk",
          title: "🚨 At Risk Project Alert",
          message: `Project "${item.title || "Untitled"}" (${item.company || "Pearls Client"}) is At Risk or Overdue! Progress: ${item.progress || 0}%`,
          time: itemDueDateStr || "Overdue",
          item,
        });
      } else if (
        (priorityLower === "urgent" || priorityLower === "high" || priorityLower === "hot") &&
        !dismissedNotifIds.includes(prioId)
      ) {
        list.push({
          id: prioId,
          type: "urgent",
          title: "🔥 High Priority Project",
          message: `High priority project "${item.title || "Untitled"}" (${item.company || "Pearls Client"}) requires active tracking.`,
          time: itemDueDateStr || "High Priority",
          item,
        });
      } else if (!dismissedNotifIds.includes(progId)) {
        list.push({
          id: progId,
          type: "pending",
          title: "⏳ Active Project In Progress",
          message: `Project "${item.title || "Untitled"}" (${item.company || "Pearls Client"}) is active (${item.progress || 0}% complete).`,
          time: itemDueDateStr || "In Progress",
          item,
        });
      }
    });

    return list;
  }, [project, dismissedNotifIds]);

  const handleClearAllNotifs = (e) => {
    e.stopPropagation();
    const allNotifIds = notifications.map((n) => n.id);
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, ...allNotifIds])));
  };

  const handleNotifClick = (e, notif) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notif.id])));
    setShowNotifications(false);
    navigate(`/projectDetails/${notif.item._id || notif.item.id}`);
  };

  const handleDismissNotif = (e, notifId) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notifId])));
  };

  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      const eKey = emp._id || emp.id || emp.uid;
      if (eKey) map[eKey] = emp.name || emp.employeeName || emp.email;
    });
    return map;
  }, [employees]);

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(apiUrl(`/projects/${projectId}`), {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProjects(true);
      } else {
        alert("Failed to delete project");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handlePriorityChange = async (e, projectId, newPriority) => {
    e.stopPropagation();
    try {
      const res = await fetch(apiUrl(`/projects/${projectId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.ok) {
        fetchProjects(true);
      }
    } catch (err) {
      console.error("Error updating project priority:", err);
    }
  };

  const buttons = ["All", "Pending", "On Track", "At Risk", "Completed"];

  const projectfilter = useProjectFilter(project, search, buttons[active], selectedMember, priorityFilter, dateFilter);

  const activeFilterCount = (active !== 0 ? 1 : 0) + (selectedMember ? 1 : 0) + (priorityFilter !== "All" ? 1 : 0) + (dateFilter !== "All" ? 1 : 0) + (search ? 1 : 0);

  //PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = projectfilter?.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(projectfilter?.length / filesPerPage) || 1;

  const pendingCount = project.filter((p) => {
    const st = (p.status || "").toLowerCase();
    const prog = Number(p.progress) || 0;
    return st !== "completed" && prog < 100;
  }).length;

  const atRiskCount = project.filter((p) => getProjectHealthStatus(p) === "At Risk").length;
  const onTrackCount = project.filter((p) => getProjectHealthStatus(p) === "On Track").length;

  const stats = [
    {
      title: "Total projects",
      value: project.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Pending Projects",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "onTrack",
      value: onTrackCount,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "At Risk",
      value: atRiskCount,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50"
    }
  ];






  return (
    <div className="w-full min-h-screen overflow-y-auto custom-scrollbar bg-[#f5f3ef] text-black pb-12">

      {/* TOPBAR */}
      <div className="w-full bg-white border-b border-black/10 px-8 py-6 flex items-center justify-between">

        {/* LEFT */}
        <div>
          <h1 className="text-2xl text-[#023167] font-bold">
            Project Management
          </h1>

          <p className="text-gray-400 mt-1 text-sm">
            Track and manage your Projects
          </p>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white rounded-xl font-semibold hover:bg-blue-700 hover:scale-102 active:scale-98 transition shadow-xs cursor-pointer text-sm"
          >
            <Plus size={16} />
            New Project
          </button>

          {/* FILTER BUTTON & ADVANCED POPUP MODAL (MATCHING TASKS UI) */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => {
                setShowFilterModal(!showFilterModal);
                setShowNotifications(false);
              }}
              className={`p-2.5 border border-gray-200 rounded-xl transition-all cursor-pointer text-white shadow-xs relative flex items-center gap-1.5 ${
                activeFilterCount > 0
                  ? "bg-blue-600 border-blue-600"
                  : "bg-[#2563a9] hover:bg-blue-700"
              }`}
              title="Advanced Project Filters"
            >
              <Filter size={18} />
              {activeFilterCount > 0 && (
                <span className="bg-amber-400 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* ADVANCED FILTER POPUP MODAL */}
            <AnimatePresence>
              {showFilterModal && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <Filter size={15} className="text-[#2563a9]" />
                      Filter Projects
                    </h3>
                    <button
                      onClick={() => setShowFilterModal(false)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* STATUS SELECT */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Project Health / Status
                      </label>
                      <select
                        value={buttons[active] || "All"}
                        onChange={(e) => {
                          const idx = buttons.indexOf(e.target.value);
                          if (idx !== -1) setActive(idx);
                          setCurrentPage(1);
                        }}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {buttons.map((btn) => (
                          <option key={btn} value={btn}>
                            {btn}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* PRIORITY SELECT */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Priority Level
                      </label>
                      <select
                        value={priorityFilter}
                        onChange={(e) => {
                          setPriorityFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="All">All Priorities</option>
                        <option value="Urgent">Urgent / Hot</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    {/* ASSIGNED TEAM MEMBER */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Team Member / Leader
                      </label>
                      <select
                        value={selectedMember}
                        onChange={(e) => {
                          setSelectedMember(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="">All Team Members</option>
                        {employees.map((emp) => {
                          const val = emp.name || emp.employeeName || emp._id || emp.uid;
                          return (
                            <option key={emp._id || emp.uid || val} value={val}>
                              {emp.name || emp.employeeName}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* DATE PERIOD */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Due Date Period
                      </label>
                      <select
                        value={dateFilter}
                        onChange={(e) => {
                          setDateFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="All">All Time</option>
                        <option value="Today">Due Today</option>
                        <option value="This Week">Due This Week</option>
                        <option value="This Month">Due This Month</option>
                        <option value="Overdue">Overdue Projects</option>
                      </select>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-3">
                      <button
                        onClick={() => {
                          setActive(0);
                          setSelectedMember("");
                          setPriorityFilter("All");
                          setDateFilter("All");
                          setSearch("");
                          setCurrentPage(1);
                        }}
                        className="text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <RotateCcw size={12} />
                        Reset All Filters
                      </button>
                      <button
                        onClick={() => setShowFilterModal(false)}
                        className="px-3 py-1.5 bg-[#2563a9] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* NOTIFICATION BUTTON & POPOVER */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              title="Project Notifications"
              className="p-2.5 border border-gray-200 rounded-xl bg-[#2563a9] hover:bg-blue-700 transition cursor-pointer text-white shadow-xs relative"
            >
              <Bell size={18} />
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
                    <h3 className="font-bold text-sm">Project Notifications</h3>
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
                      🎉 All projects are running on track!
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={(e) => handleNotifClick(e, n)}
                        className={`p-3.5 hover:bg-blue-50/50 transition-colors cursor-pointer space-y-1.5 ${
                          n.type === "at_risk" ? "bg-red-50/40" : n.type === "urgent" ? "bg-amber-50/30" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              n.type === "at_risk"
                                ? "bg-red-100 text-red-700"
                                : n.type === "urgent"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {n.type === "at_risk" ? "At Risk" : n.type === "urgent" ? "High Priority" : "Progress"}
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

      {/* BODY */}
      <div className="p-8 bg-[#f3f0eb] ">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {stats.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white border border-gray-200/80 p-6 min-h-[125px] rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gray-100/80 rounded-xl w-10 h-10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#0b2b57]" />
                </div>
                <span className="text-green-600 bg-green-50 border border-green-200/60 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  ↑ 8.4%
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {item.title}
                </p>
                <h2 className="text-3xl font-extrabold text-[#0b2b57] mt-0.5">
                  {item.value}
                </h2>
              </div>
            </motion.div>
          ))}

        </div>

        {/* PROJECT SECTION HEADER & SINGLE ROW FILTERS */}
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mt-8 mb-4 border border-gray-200 bg-white p-3 rounded-2xl gap-3 shadow-2xs overflow-x-auto custom-scrollbar flex-nowrap"
          >
            {/* STATUS PILLS */}
            <div className="flex items-center gap-1.5 shrink-0">
              {buttons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActive(index);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    active === index
                      ? "bg-[#2563a9] text-white shadow-2xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>

            {/* SEARCH INPUT */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 text-xs border border-gray-200/60 w-44 sm:w-56 shrink-0">
                <Search size={15} className="text-gray-400 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search project..."
                  className="ml-1.5 bg-transparent outline-none w-full text-xs text-gray-800"
                />
              </div>
            </div>

          </motion.div>
        )}

        {/* PROJECT CARDS */}
        {loading ? <div className='h-screen w-full'>
          <LoadingPage />
        </div> : <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4">

          {currentFiles.length > 0 ? (currentFiles.map((p) => {
            const healthLabel = getProjectHealthStatus(p);

            return (
              <div
                key={p._id || p.id}
                className="bg-white border border-gray-200/90 p-6 md:p-7 min-h-[190px] rounded-2xl shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between space-y-5 cursor-pointer"
                onClick={() => navigate(`/projectDetails/${p._id || p.id}`)}
              >

                {/* HEADER */}
                <div className="flex justify-between items-center">

                  <div>
                    <h3 className="text-lg font-bold text-[#0b2b57]">
                      {p.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Company: {p.company || "Pearls Client"}
                    </p>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className="flex items-center gap-2">
                      <select
                        value={p.priority || "Medium"}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handlePriorityChange(e, p._id || p.id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-full font-bold border-none outline-none cursor-pointer ${
                          (p.priority || "").toLowerCase() === "urgent" || (p.priority || "").toLowerCase() === "hot"
                            ? "bg-rose-100 text-rose-700"
                            : (p.priority || "").toLowerCase() === "high" || (p.priority || "").toLowerCase() === "warm"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        <option value="Urgent">🔥 Urgent</option>
                        <option value="Hot">🔥 Hot</option>
                        <option value="High">⚡ High</option>
                        <option value="Medium">⚡ Medium</option>
                        <option value="Warm">⚡ Warm</option>
                        <option value="Low">🌱 Low</option>
                        <option value="Cold">❄️ Cold</option>
                      </select>

                      <span className={`text-xs px-3 py-1 rounded font-semibold ${p.status?.toLowerCase() === "completed" ? "bg-green-100 text-green-700" : p.status?.toLowerCase() === "in progress" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {p.status || "Active"}
                      </span>

                      <span className={`text-xs px-3 py-1 rounded font-semibold ${
                        healthLabel === "Completed" ? "bg-purple-100 text-purple-700" :
                        healthLabel === "At Risk" ? "text-red-600 bg-red-100" : "text-green-600 bg-green-100"
                      }`}>
                        {healthLabel}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteProject(e, p._id || p.id)}
                      className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition"
                      title="Delete Project"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>

                {/* DETAILS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4 text-sm">

                  <div className="flex items-center gap-5 flex-1 max-w-xl">

                    <h1 className="text-sm font-bold text-yellow-600 min-w-fit">
                      Progress: {p.progress || 0}%
                    </h1>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">

                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${p.progress || 0}%`,
                        }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-blue-500 rounded-full"
                      />

                    </div>

                  </div>

                  <div className='flex items-center gap-4 text-xs text-gray-400'>
                    <div className='flex items-center gap-1'>
                      <MessageSquareText size={16} /><p>{p.notes?.length || 0}</p>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Paperclip size={16} /><p>{p.documents?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/** Bottom */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mt-4">

                  <div className="flex items-center flex-wrap gap-2">

                    <h1 className="text-sm font-bold text-[#2563a9]">
                      Project Members:
                    </h1>

                    <div className="flex -space-x-3">

                      {Array.isArray(p.members) && p.members.length > 0 ? (
                        p.members.map((item, index) => {
                          const mUid = typeof item === 'object' ? (item.uid || item._id || item.id) : item;
                          const mName = typeof item === 'object' ? (item.name || item.employeeName) : (employeeMap[mUid] || String(item));
                          const initial = (mName || 'M').charAt(0).toUpperCase();

                          return (
                            <div
                              key={index}
                              className={`relative group w-9 h-9 rounded-full flex items-center justify-center text-xs text-white font-bold border-2 border-white cursor-pointer ${
                                index % 3 === 0 ? "bg-purple-800" : index % 3 === 1 ? "bg-green-600" : "bg-blue-600"
                              }`}
                            >
                              {initial}

                              <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                                {mName || "Member"}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-400 italic">No assigned members</span>
                      )}

                    </div>

                  </div>

                  <div className="text-xs font-bold">
                    <div className={`flex items-center gap-1.5 ${healthLabel === "At Risk" ? "text-red-600" : "text-[#2563a9]"}`}>
                      <Calendar size={16} className='text-[#0b2b57]' />
                      <p>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "No Due Date"}</p>
                    </div>
                  </div>

                </div>

              </div>
            )
          })) : (<div className="bg-white p-10 rounded text-center text-gray-500">
            No Projects Found
          </div>)}

        </motion.div>}
        {/**PAGINATION */}
        {loading ? " " :
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        }

      </div>
      {/**ADD PROJECTS */}
      {open && (

        <AnimateModals>

          <CreateProjects onClose={() => setOpen(false)}
            fetchProjects={fetchProjects} />
        </AnimateModals>
      )}
    </div>
  );


}
