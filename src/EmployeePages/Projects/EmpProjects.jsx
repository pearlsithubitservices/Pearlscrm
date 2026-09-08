import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Calendar,
  Users,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  LoaderCircle,
  Paperclip,
  MessageSquareText,
  Clock,
  CheckCircle2,
  Bell,
  X,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '../../components/Dashboard/Loading';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../context/AuthContext';
import useEmployees from '../../Hooks/useEmployees';
import { getProjectHealthStatus } from '../../Utils/projectHealth';
import { apiUrl } from '../../config/api';
import { socket } from '../../config/socket';

export default function EmpProjects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_emp_dismissed_project_notifs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("crm_emp_dismissed_project_notifs", JSON.stringify(dismissedNotifIds));
    } catch (e) {
      console.error("Error saving employee project notifications to localStorage:", e);
    }
  }, [dismissedNotifIds]);

  const notifRef = useRef(null);

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buttons = ['All', 'Pending', 'On Track', 'At Risk', 'Completed'];

  const fetchProjects = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await fetch(apiUrl('/projects'));
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching projects for employee:', error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    if (socket) {
      const handleSync = () => fetchProjects(true);
      socket.on('projectCreated', handleSync);
      socket.on('projectUpdated', handleSync);
      socket.on('projectDeleted', handleSync);
      socket.on('taskCreated', handleSync);
      socket.on('taskUpdated', handleSync);
      return () => {
        socket.off('projectCreated', handleSync);
        socket.off('projectUpdated', handleSync);
        socket.off('projectDeleted', handleSync);
        socket.off('taskCreated', handleSync);
        socket.off('taskUpdated', handleSync);
      };
    }
  }, []);

  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      const name = employee.name || employee.employeeName || employee.displayName || employee.email;
      if (employee._id) map[employee._id] = name;
      if (employee.uid) map[employee.uid] = name;
      if (employee.id) map[employee.id] = name;
      return map;
    }, {});
  }, [employees]);

  // Filter projects relevant to logged-in employee
  const userProjects = useMemo(() => {
    if (!user) return projects;

    const uId = String(user._id || user.uid || user.id || '').toLowerCase();
    const uEmail = String(user.email || '').toLowerCase();
    const uName = String(user.displayName || user.name || user.employeeName || '').toLowerCase();

    const userSpecific = projects.filter((p) => {
      // Check members list
      const members = Array.isArray(p.members) ? p.members : [];
      const isMember = members.some((m) => {
        if (!m) return false;
        if (typeof m === 'object') {
          const mId = String(m._id || m.id || m.uid || '').toLowerCase();
          const mName = String(m.name || m.employeeName || '').toLowerCase();
          return (uId && mId === uId) || (uName && mName && (mName.includes(uName) || uName.includes(mName)));
        }
        const strM = String(m).toLowerCase();
        return (uId && strM === uId) || (uEmail && strM.includes(uEmail)) || (uName && strM.includes(uName));
      });

      const isAssigned = p.assignedTo && String(p.assignedTo).toLowerCase().includes(uId || uName);
      const isOwner = p.createdBy && String(p.createdBy).toLowerCase().includes(uId || uName);
      const isLeader = p.leader && String(p.leader).toLowerCase().includes(uId || uName);

      return isMember || isAssigned || isOwner || isLeader;
    });

    // If employee is assigned to specific projects return those; fallback to all projects if none specifically matched
    return userSpecific.length > 0 ? userSpecific : projects;
  }, [user, projects]);

  // Employee Project Notifications (At Risk, Urgent, Active Alerts)
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

    userProjects.forEach((item) => {
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
  }, [userProjects, dismissedNotifIds]);

  const handleClearAllNotifs = (e) => {
    e.stopPropagation();
    const allNotifIds = notifications.map((n) => n.id);
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, ...allNotifIds])));
  };

  const handleNotifClick = (e, notif) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notif.id])));
    setShowNotifications(false);
    navigate(`/employee/projectDetails/${notif.item._id || notif.item.id}`);
  };

  const handleDismissNotif = (e, notifId) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notifId])));
  };

  const filteredProjects = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return userProjects.filter((p) => {
      const titleMatch = (p.title || '').toLowerCase().includes(search.toLowerCase());
      const companyMatch = (p.company || '').toLowerCase().includes(search.toLowerCase());
      const matchesSearch = titleMatch || companyMatch;

      const health = getProjectHealthStatus(p);
      const activeTab = buttons[active];
      let matchesStatus = true;

      if (activeTab === 'Pending') {
        const st = (p.status || '').toLowerCase();
        const prog = Number(p.progress || 0);
        matchesStatus = st !== 'completed' && prog < 100;
      } else if (activeTab === 'On Track' || activeTab === 'on Track') {
        matchesStatus = health === 'On Track';
      } else if (activeTab === 'At Risk') {
        matchesStatus = health === 'At Risk';
      } else if (activeTab === 'Completed') {
        matchesStatus = health === 'Completed';
      }

      let matchesPriority = true;
      if (priorityFilter && priorityFilter !== 'All') {
        matchesPriority = (p.priority || '').toLowerCase() === priorityFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [userProjects, search, active, priorityFilter, buttons]);

  /* PAGINATION */
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = filteredProjects.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredProjects.length / filesPerPage) || 1;

  const pendingCount = userProjects.filter((p) => {
    const st = (p.status || '').toLowerCase();
    const prog = Number(p.progress || 0);
    return st !== 'completed' && prog < 100;
  }).length;

  const atRiskCount = userProjects.filter((p) => getProjectHealthStatus(p) === 'At Risk').length;
  const onTrackCount = userProjects.filter((p) => getProjectHealthStatus(p) === 'On Track').length;
  const completedCount = userProjects.filter((p) => getProjectHealthStatus(p) === 'Completed').length;

  const stats = [
    {
      title: 'My Projects',
      value: userProjects.length,
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Pending',
      value: pendingCount,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'On Track',
      value: onTrackCount,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'At Risk',
      value: atRiskCount,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <div className="flex w-full min-h-screen overflow-y-auto custom-scrollbar bg-[#f3f0eb] overflow-x-hidden pb-12">
      <div className="flex-1 flex flex-col min-h-screen">
        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#023167] tracking-tight">
              MY PROJECTS
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Monitor active project milestones, progress, and team deliverables
            </p>
          </div>

          {/* NOTIFICATION BUTTON & POPOVER */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              title="Project Notifications"
              className="p-2.5 border border-gray-200 rounded-xl bg-[#2563a9] hover:bg-blue-700 transition cursor-pointer text-white shadow-xs relative flex items-center justify-center"
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
                      🎉 All your projects are running on track!
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
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6 lg:p-8 space-y-6 flex-1">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200/80 shadow-2xs"
              >
                <div className={`${s.bg} ${s.color} rounded-xl w-10 h-10 flex items-center justify-center mb-3`}>
                  <s.icon size={20} />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{s.title}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#0b2b57] mt-1">{s.value}</h2>
              </motion.div>
            ))}
          </div>

          {/* FILTER BAR */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200/80 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between gap-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h1 className="font-bold text-lg md:text-xl text-[#0b2b57] tracking-tight shrink-0">
                PROJECT PORTFOLIO
              </h1>

              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                {buttons.map((btn, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActive(index);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      active === index
                        ? 'bg-[#2563a9] text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>

            {/* PRIORITY & SEARCH FILTERS */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Priority Filter */}
              <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 text-xs border border-gray-200/60">
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent outline-none text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  <option value="All">All Priorities</option>
                  <option value="Urgent">🔥 Urgent</option>
                  <option value="High">⚡ High</option>
                  <option value="Medium">⚡ Medium</option>
                  <option value="Low">🌱 Low</option>
                </select>
              </div>

              {/* SEARCH */}
              <div className="flex items-center bg-gray-100 rounded-xl px-3.5 py-2 text-xs border border-gray-200/60 min-w-[200px]">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search project or company..."
                  className="ml-2 bg-transparent outline-none w-full text-xs text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* PROJECT LIST CARDS */}
          {loading ? (
            <div className="h-64 flex items-center justify-center bg-white rounded-2xl">
              <LoadingPage />
            </div>
          ) : currentFiles.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl text-center text-gray-500 border border-gray-200/80">
              No projects found matching filter.
            </div>
          ) : (
            <div className="w-full pr-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {currentFiles.map((p) => {
                  const healthLabel = getProjectHealthStatus(p);
                  const progressVal = Number(p?.progress) || 0;

                  return (
                    <div
                      key={p._id || p.id}
                      onClick={() => navigate(`/employee/projectDetails/${p._id || p.id}`)}
                      className="bg-white border border-gray-200/90 p-6 md:p-7 min-h-[190px] rounded-2xl hover:border-blue-300 transition-all cursor-pointer shadow-xs hover:shadow-xl space-y-5"
                    >
                      {/* CARD HEADER */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-gray-100">
                        <div>
                          <h3 className="text-lg font-bold text-[#0b2b57]">
                            {p.title || 'Untitled Project'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Company: <span className="font-semibold text-gray-700">{p.company || 'Pearls Client'}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold ${
                              (p.status || '').toLowerCase() === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : (p.status || '').toLowerCase() === 'in progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            ● {p.status || 'Active'}
                          </span>

                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold ${
                              healthLabel === 'Completed'
                                ? 'bg-purple-100 text-purple-700'
                                : healthLabel === 'At Risk'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {healthLabel}
                          </span>
                        </div>
                      </div>

                      {/* PROGRESS BAR & STATS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                            <span>Overall Progress</span>
                            <span className="text-blue-700 font-bold">{progressVal}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressVal}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-6 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5 font-medium">
                            <MessageSquareText size={16} className="text-gray-400" />
                            <span>Comments: {p.notes?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <Paperclip size={16} className="text-gray-400" />
                            <span>Docs: {p.documents?.length || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* CARD FOOTER (MEMBERS & DUE DATE) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#2563a9]">Team Members:</span>
                          <div className="flex -space-x-2 overflow-hidden">
                            {Array.isArray(p.members) && p.members.length > 0 ? (
                              p.members.slice(0, 5).map((m, idx) => {
                                const nameStr =
                                  typeof m === 'object'
                                    ? m.name || m.employeeName
                                    : employeeMap[m] || String(m);

                                const initial = (nameStr || 'M').charAt(0).toUpperCase();

                                return (
                                  <div
                                    key={idx}
                                    title={nameStr}
                                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-2xs"
                                  >
                                    {initial}
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-xs text-gray-400 italic">No assigned members</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                          <Calendar size={16} className="text-[#0b2b57]" />
                          <span>Due: {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'No Due Date'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          )}

          {/* PAGINATION */}
          {!loading && (
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          )}
        </div>
      </div>
    </div>
  );
}
