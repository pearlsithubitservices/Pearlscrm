import React, {
  useState,
  useEffect,
  useMemo,
  useRef
} from 'react';

import {
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  User2,
  Bell,
  Filter,
  TrendingUp,
  CheckCheck,
  CalendarArrowDown,
  Calendar1,
  MessageSquareText,
  Paperclip,
  X,
  RotateCcw,
  AlertCircle,
  Clock,
  Flame,
  AlertTriangle,
  ChevronDown,
  Check
} from 'lucide-react';
import {
  collection,
  getDocs,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { apiUrl } from '../config/api';
import { socket } from '../config/socket';
import Pagination from '../components/Pagination';
import LoadingPage from '../components/Dashboard/Loading';
import CreateTask from './createTask.jsx';
import { AnimatePresence, motion } from "framer-motion";
import AnimateModals from '../components/Dashboard/AnimateModals.jsx';
import useTaskfilter from '../Hooks/useTaskfilter.js';

export default function Tasks() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState("All");

  // Advanced Filter Modal & State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");

  // Notification Dropdown State
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_dismissed_task_notifs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("crm_dismissed_task_notifs", JSON.stringify(dismissedNotifIds));
    } catch (e) {
      console.error("Error saving dismissed task notifications to localStorage:", e);
    }
  }, [dismissedNotifIds]);

  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const filterRef = useRef(null);
  const notificationRef = useRef(null);

  const buttons = ["All", "Pending", "In Progress", "Completed", "Hot", "Warm", "Cold", "Overdue"];

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterModal(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const extraFilters = useMemo(() => ({
    filterStatus,
    filterPriority,
    filterEmployee,
    filterDateRange
  }), [filterStatus, filterPriority, filterEmployee, filterDateRange]);

  const filterdata = useTaskfilter(tasks, search, active, extraFilters);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterStatus !== "all") count++;
    if (filterPriority !== "all") count++;
    if (filterEmployee !== "all") count++;
    if (filterDateRange !== "all") count++;
    return count;
  }, [filterStatus, filterPriority, filterEmployee, filterDateRange]);

  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      const name = employee.name || employee.employeeName || employee.displayName || employee.email;
      if (employee._id) map[employee._id] = name;
      if (employee.uid) map[employee.uid] = name;
      if (employee.id) map[employee.id] = name;
      return map;
    }, {});
  }, [employees]);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;

  const getDisplayName = (val, fallback = "Unassigned") => {
    if (!val) return fallback;
    if (typeof val === 'object' && val !== null) {
      return val.name || val.employeeName || val.displayName || val.email || fallback;
    }
    const strVal = String(val).trim();
    if (!strVal) return fallback;
    if (strVal.toLowerCase() === "admin") return "Admin";

    if (employeeMap[strVal]) {
      const matched = employeeMap[strVal];
      if (typeof matched === 'string' && matched) return matched;
      if (typeof matched === 'object' && matched !== null) {
        return matched.name || matched.employeeName || matched.displayName || matched.email || fallback;
      }
    }

    const lowerVal = strVal.toLowerCase();
    const found = (employees || []).find((emp) => {
      if (!emp) return false;
      const eId = String(emp._id || emp.id || emp.uid || "").toLowerCase();
      const eEmail = String(emp.email || "").toLowerCase();
      const eName = String(emp.employeeName || emp.name || emp.displayName || "").toLowerCase();
      return (
        (eId && eId === lowerVal) ||
        (eEmail && eEmail === lowerVal) ||
        (eEmail && lowerVal.includes(eEmail)) ||
        (eName && eName === lowerVal) ||
        (eName && lowerVal.includes(eName))
      );
    });

    if (found) {
      return found.employeeName || found.name || found.displayName || (found.email ? found.email.split("@")[0] : strVal);
    }

    if (strVal.includes("@")) {
      const prefix = strVal.split("@")[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    const isRawId = /^[0-9a-fA-F]{24}$/.test(strVal) || /^[A-Za-z0-9_-]{20,}$/.test(strVal);
    if (isRawId) {
      return fallback;
    }

    return strVal;
  };

  // Notifications generator from tasks
  const notifications = useMemo(() => {
    const list = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    (Array.isArray(tasks) ? tasks : []).forEach((t) => {
      const statusLower = (t.status || "").toLowerCase();
      const priorityLower = (t.priority || "").toLowerCase();
      const dueDate = t.dueDate ? new Date(t.dueDate) : null;
      const isOverdue = dueDate && !isNaN(dueDate.getTime()) && dueDate < now && statusLower !== "completed";
      const assignedToName = getDisplayName(t.assignedTo, "Unassigned");

      const ovId = `ov-${t.id || t._id}`;
      const hotId = `hot-${t.id || t._id}`;
      const pdId = `pd-${t.id || t._id}`;

      if (isOverdue && !dismissedNotifIds.includes(ovId)) {
        list.push({
          id: ovId,
          type: "overdue",
          title: "Overdue Task Alert",
          message: `Task "${t.title || "Untitled"}" assigned to ${assignedToName} is overdue!`,
          time: dueDate ? `Due: ${dueDate.toLocaleDateString("en-IN")}` : "Overdue",
          task: t,
        });
      } else if ((priorityLower === "hot" || priorityLower === "urgent" || priorityLower === "high") && !dismissedNotifIds.includes(hotId)) {
        if (statusLower !== "completed") {
          list.push({
            id: hotId,
            type: "hot",
            title: "High Priority Task",
            message: `Hot task "${t.title || "Untitled"}" requires action (${assignedToName}).`,
            time: statusLower === "in progress" ? "In Progress" : "Pending",
            task: t,
          });
        }
      } else if (statusLower === "pending" && !dismissedNotifIds.includes(pdId)) {
        list.push({
          id: pdId,
          type: "pending",
          title: "Pending Task",
          message: `Task "${t.title || "Untitled"}" is pending assignment or updates.`,
          time: dueDate ? `Due: ${dueDate.toLocaleDateString("en-IN")}` : "Pending",
          task: t,
        });
      }
    });

    return list;
  }, [tasks, employeeMap, dismissedNotifIds]);

  const handleClearAllNotifs = (e) => {
    e.stopPropagation();
    const allNotifIds = notifications.map((n) => n.id);
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, ...allNotifIds])));
  };

  const handleNotifClick = (e, notif) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notif.id])));
    setShowNotificationMenu(false);
    navigate(`/tasksDetails/${notif.task._id || notif.task.id}`);
  };

  const handleDismissNotif = (e, notifId) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notifId])));
  };

  const currentFiles = filterdata.slice(firstIndex, lastIndex);
  const totalPages = Math.max(1, Math.ceil(filterdata.length / filesPerPage));

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const fetchTasksData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch(apiUrl('/tasks'));
      if (res.ok) {
        const data = await res.json();
        const taskList = (Array.isArray(data) ? data : []).map((t) => ({
          ...t,
          id: t._id || t.id,
        }));
        setTasks(taskList);
      }
    } catch (err) {
      console.error('Error fetching tasks from MongoDB API:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const fetchEmployeesData = async () => {
    let mongoUsers = [];
    let apiEmployees = [];
    let firestoreEmployees = [];

    // 1. Fetch from /auth/users (MongoDB users DB collection)
    try {
      const resUsers = await fetch(apiUrl('/auth/users'));
      if (resUsers.ok) {
        const userData = await resUsers.json();
        const rawUsers = Array.isArray(userData) ? userData : (userData?.data || []);
        mongoUsers = rawUsers.map((u) => {
          const uName = u.name || u.employeeName || u.displayName || (u.email ? u.email.split('@')[0] : "User");
          return {
            id: u._id || u.id,
            _id: u._id || u.id,
            uid: u.uid || u._id,
            name: uName,
            employeeName: uName,
            email: u.email || "",
            role: u.role || "Employee",
            ...u,
          };
        });
      }
    } catch (err) {
      console.log("Error fetching users from /auth/users:", err);
    }

    // 2. Fetch from /employees endpoint
    try {
      const res = await fetch(apiUrl('/employees'));
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : (data?.data || data?.employees || []);
        apiEmployees = rawList.map((emp) => {
          const empName = emp.employeeName || emp.name || emp.displayName || (emp.email ? emp.email.split('@')[0] : "Employee");
          return {
            id: emp._id || emp.id,
            _id: emp._id || emp.id,
            uid: emp.uid || emp._id,
            name: empName,
            employeeName: empName,
            email: emp.email || "",
            role: emp.employeeRole || emp.role || "Employee",
            ...emp,
          };
        });
      }
    } catch (err) {
      console.log("Error fetching employees from /employees:", err);
    }

    // 3. Fetch from Firestore fallback
    try {
      const snapshot = await getDocs(collection(db, 'employees'));
      snapshot.forEach((doc) => {
        firestoreEmployees.push({
          id: doc.id,
          _id: doc.id,
          uid: doc.data().uid || doc.id,
          name: doc.data().name || doc.data().employeeName || doc.data().email || "Employee",
          ...doc.data(),
        });
      });
    } catch (error) {
      console.log("Error fetching employees from Firestore:", error);
    }

    // Merge avoiding duplicates (Map by email or _id)
    const map = new Map();
    mongoUsers.forEach((u) => {
      const key = String(u.email || u._id || u.id).toLowerCase();
      if (key) map.set(key, u);
    });
    apiEmployees.forEach((emp) => {
      const key = String(emp.email || emp._id || emp.id).toLowerCase();
      if (key && !map.has(key)) map.set(key, emp);
    });
    firestoreEmployees.forEach((fEmp) => {
      const key = String(fEmp.email || fEmp._id || fEmp.id).toLowerCase();
      if (key && !map.has(key)) map.set(key, fEmp);
    });

    setEmployees(Array.from(map.values()));
  };

  useEffect(() => {
    fetchTasksData();
    fetchEmployeesData();

    if (socket) {
      const handleTaskUpdated = () => {
        fetchTasksData(true);
      };
      socket.on("taskUpdated", handleTaskUpdated);
      socket.on("taskCreated", handleTaskUpdated);
      return () => {
        socket.off("taskUpdated", handleTaskUpdated);
        socket.off("taskCreated", handleTaskUpdated);
      };
    }
  }, []);

  const handleQuickStatusChange = async (task, newStatus) => {
    try {
      setUpdatingTaskId(task.id || task._id);
      const res = await fetch(apiUrl(`/tasks/${task.id || task._id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, status: newStatus }),
      });
      if (res.ok) {
        fetchTasksData(true);
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const resetAllFilters = () => {
    setFilterStatus("all");
    setFilterPriority("all");
    setFilterEmployee("all");
    setFilterDateRange("all");
    setSearch("");
    setActive("All");
    setCurrentPage(1);
  };

  // STATS
  const inprogress = tasks.filter((task) =>
    (task.status || "").toLowerCase() === "in progress"
  );
  const completed = tasks.filter((task) =>
    (task.status || "").toLowerCase() === "completed"
  );

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const overdue = tasks.filter((task) => {
    const d = task.dueDate ? new Date(task.dueDate) : null;
    return d && !isNaN(d.getTime()) && d < now && (task.status || "").toLowerCase() !== "completed";
  });

  const stats = [
    { icon: User2, label: "Total Tasks", value: tasks.length, filterKey: "All" },
    { icon: TrendingUp, label: "In Progress", value: inprogress.length, filterKey: "In Progress" },
    { icon: CheckCheck, label: "Completed", value: completed.length, filterKey: "Completed" },
    { icon: CalendarArrowDown, label: "Overdue", value: overdue.length, filterKey: "Overdue" },
  ];

  function handleactiveindex(activeindex) {
    setActive(activeindex);
    setCurrentPage(1);
  }

  return (
    <div className="w-full min-h-screen overflow-y-auto custom-scrollbar bg-gray-100 pb-12">
      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="flex items-center justify-between bg-white p-4 shadow-sm relative z-30">
          <div>
            <h2 className="text-xl font-bold text-[#023167]">Tasks Management</h2>
            <p className="text-[10px] ml-6 text-gray-500">
              Track and manage your Tasks with live notifications and dynamic filters
            </p>
          </div>
          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white text-sm font-medium rounded hover:scale-105 transition-transform duration-300 shadow-sm"
            >
              <Plus size={16} />
              Add Tasks
            </button>

            {/* FILTER BUTTON & DROPDOWN */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => {
                  setShowFilterModal(!showFilterModal);
                  setShowNotificationMenu(false);
                }}
                className={`p-2 border rounded-lg transition-all duration-300 relative flex items-center justify-center ${
                  activeFilterCount > 0
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-[#2563a9] border-gray-200 text-white hover:scale-110"
                }`}
                title="Advanced Task Filters"
              >
                <Filter size={18} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-blue-900 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* ADVANCED FILTER POPUP */}
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
                        Filter Tasks
                      </h3>
                      <button
                        onClick={() => setShowFilterModal(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* STATUS SELECT */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Task Status
                        </label>
                        <select
                          value={filterStatus}
                          onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:border-blue-500"
                        >
                          <option value="all">All Statuses</option>
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </div>

                      {/* PRIORITY SELECT */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Priority / Temperature
                        </label>
                        <select
                          value={filterPriority}
                          onChange={(e) => {
                            setFilterPriority(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:border-blue-500"
                        >
                          <option value="all">All Priorities</option>
                          <option value="Hot">Hot (High)</option>
                          <option value="Warm">Warm (Medium)</option>
                          <option value="Cold">Cold (Low)</option>
                        </select>
                      </div>

                      {/* ASSIGNED EMPLOYEE SELECT */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Assigned Employee
                        </label>
                        <select
                          value={filterEmployee}
                          onChange={(e) => {
                            setFilterEmployee(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:border-blue-500"
                        >
                          <option value="all">All Team Members</option>
                          {employees.map((emp) => {
                            const name = emp.employeeName || emp.name || emp.displayName || emp.email;
                            const val = emp._id || emp.id || emp.uid || name;
                            return (
                              <option key={val} value={name}>
                                {name}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* DUE DATE RANGE */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Due Date Period
                        </label>
                        <select
                          value={filterDateRange}
                          onChange={(e) => {
                            setFilterDateRange(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:border-blue-500"
                        >
                          <option value="all">All Time</option>
                          <option value="today">Due Today</option>
                          <option value="this_week">Due This Week</option>
                          <option value="overdue">Overdue Tasks</option>
                        </select>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-3">
                        <button
                          onClick={resetAllFilters}
                          className="text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1 text-[11px]"
                        >
                          <RotateCcw size={12} />
                          Reset Filters
                        </button>

                        <button
                          onClick={() => setShowFilterModal(false)}
                          className="px-3.5 py-1.5 bg-[#2563a9] text-white rounded-xl font-semibold text-[11px] shadow-sm hover:bg-blue-700 transition"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* NOTIFICATION BUTTON & DROPDOWN */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotificationMenu(!showNotificationMenu);
                  setShowFilterModal(false);
                }}
                className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] text-white hover:scale-110 transition-transform duration-300 relative"
                title="Task Notifications"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* NOTIFICATION MENU POPUP */}
              <AnimatePresence>
                {showNotificationMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-88 md:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 text-xs overflow-hidden"
                  >
                    <div className="bg-[#0b2b57] text-white px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell size={16} />
                        <h3 className="font-bold text-sm">Task Notifications</h3>
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
                        <div className="p-8 text-center text-gray-400">
                          <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500 opacity-80" />
                          <p className="font-bold text-gray-700">All tasks on track!</p>
                          <p className="text-xs text-gray-400 mt-0.5">No overdue or high priority task alerts.</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={(e) => handleNotifClick(e, n)}
                            className={`p-3.5 hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer ${
                              n.type === "overdue" ? "bg-red-50/40" : n.type === "hot" ? "bg-amber-50/30" : ""
                            }`}
                          >
                            <div
                              className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                                n.type === "overdue"
                                  ? "bg-rose-100 text-rose-700"
                                  : n.type === "hot"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {n.type === "overdue" ? <AlertCircle size={16} /> : n.type === "hot" ? <Flame size={16} /> : <Clock size={16} />}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-900 text-xs">{n.title}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-gray-400 font-medium">{n.time}</span>
                                  <button
                                    onClick={(e) => handleDismissNotif(e, n.id)}
                                    className="text-gray-400 hover:text-red-500 p-0.5 rounded hover:bg-gray-100 transition"
                                    title="Dismiss Notification"
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5 leading-snug">{n.message}</p>

                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickStatusChange(n.task, "Completed");
                                    setShowNotificationMenu(false);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition shadow-sm cursor-pointer"
                                >
                                  Mark Complete
                                </button>
                                <button
                                  onClick={(e) => handleNotifClick(e, n)}
                                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-[10px] transition cursor-pointer"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6 bg-[#f3f0eb]">

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => {
              const isSelected = active === s.filterKey;
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => handleactiveindex(s.filterKey)}
                  className={`bg-white p-6 rounded-xl border cursor-pointer transition-all ${
                    isSelected ? "border-blue-500 ring-2 ring-blue-200 shadow-md" : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="bg-gray-200 rounded w-8 h-8 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-black" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{s.label}</p>
                  <h2 className="text-2xl font-bold text-[#0b2b57]">
                    {s.value}
                  </h2>
                </motion.div>
              );
            })}
          </div>

          {/* TASK HEADER & TABS */}
          <div className="mt-6 bg-white p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
            <div className="font-bold text-xl text-[#0b2b57] flex items-center gap-2">
              <p>Tasks List</p>
              {filterdata.length !== tasks.length && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  Showing {filterdata.length} of {tasks.length}
                </span>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {buttons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => handleactiveindex(btn)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    active === btn
                      ? "bg-[#2563a9] text-white shadow-sm"
                      : "text-gray-500 hover:bg-[#2563a9] hover:text-white"
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="flex items-center border bg-gray-100 rounded-xl px-3 py-2 w-full md:w-80">
              <Search size={16} className="text-gray-500 shrink-0" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="ml-2 w-full outline-none text-xs bg-transparent text-gray-800"
                placeholder="Search Task title, employee, or priority..."
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* TASK LIST */}
          <div className="space-y-4 mt-5">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <LoadingPage />
              </div>
            ) : currentFiles.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200">
                <CheckCircle2 size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="text-base font-bold text-gray-700">No tasks found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your active filter or search terms.</p>
                <button
                  onClick={resetAllFilters}
                  className="mt-4 px-4 py-2 bg-[#2563a9] text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              currentFiles.map((task, index) => {
                const assignedName = getDisplayName(task.assignedTo, "Unassigned");
                const assignedByName = getDisplayName(task.assignedBy, "Admin");

                const statusLower = (task.status || "pending").toLowerCase();
                const priorityLower = (task.priority || "medium").toLowerCase();

                return (
                  <motion.div
                    key={task.id || task._id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 hover:shadow-md transition-shadow cursor-pointer relative"
                    onClick={() => navigate(`/taskDetails/${task.id || task._id}`)}
                  >
                    {/* TOP */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* LEFT */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="text-base md:text-lg font-bold text-[#082f57]">
                            {assignedName}
                          </h1>
                        </div>
                        <p className="mt-1 text-sm md:text-base font-semibold text-gray-800">
                          {task.title || "Untitled Task"}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-2xl">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* RIGHT STATUS & PRIORITY */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* QUICK STATUS UPDATE DROPDOWN */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            disabled={updatingTaskId === (task.id || task._id)}
                            value={task.status || "Pending"}
                            onChange={(e) => handleQuickStatusChange(task, e.target.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border outline-none transition-colors ${
                              statusLower === "completed"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : statusLower === "in progress"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : "bg-red-100 text-red-700 border-red-300"
                            }`}
                          >
                            <option value="Pending">● Pending</option>
                            <option value="In Progress">● In Progress</option>
                            <option value="Completed">● Completed</option>
                          </select>
                        </div>

                        <div
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
                            priorityLower === "hot" || priorityLower === "high" || priorityLower === "urgent"
                              ? "bg-red-100 text-red-600 border border-red-200"
                              : priorityLower === "warm" || priorityLower === "medium"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          ● {task.priority || "Medium"}
                        </div>

                        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border">
                          Assigned by: <span className="font-semibold text-gray-700">{assignedByName}</span>
                        </div>
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                          Progress
                        </span>
                        <div className="w-full max-w-md h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: statusLower === "completed" ? "100%" : statusLower === "in progress" ? "55%" : "15%",
                            }}
                            transition={{ duration: 0.8 }}
                            className={`h-full rounded-full ${
                              statusLower === "completed"
                                ? "bg-emerald-500"
                                : statusLower === "in progress"
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-600">
                          {statusLower === "completed" ? "100%" : statusLower === "in progress" ? "55%" : "15%"}
                        </span>
                      </div>

                      {/* BOTTOM DETAILS */}
                      <div className="flex items-center gap-4 text-gray-500 shrink-0 text-xs">
                        {(() => {
                          const hasDate = Boolean(task.dueDate);
                          const d = hasDate ? new Date(task.dueDate) : null;
                          const formattedDate = d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-IN") : (task.dueDate || "No Due Date");
                          const todayNow = new Date();
                          todayNow.setHours(0,0,0,0);
                          const overdueFlag = d && !isNaN(d.getTime()) && d < todayNow && statusLower !== 'completed';

                          return (
                            <div className="flex items-center gap-2">
                              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-medium ${overdueFlag ? "bg-red-50 border-red-300 text-red-600 font-bold" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                                <Calendar1 size={14} />
                                <span>{formattedDate}</span>
                              </div>
                              {overdueFlag && (
                                <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wider animate-pulse">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        <div className="flex items-center gap-1 text-gray-600">
                          <MessageSquareText size={15} />
                          <span>Chat</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* PAGINATION */}
          {!loading && filterdata.length > filesPerPage && (
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          )}
        </div>
      </div>

      {/* ADD TASKS MODAL */}
      {open && (
        <AnimateModals>
          <CreateTask onClose={() => setOpen(false)} onSuccess={() => { setOpen(false); fetchTasksData(); }} />
        </AnimateModals>
      )}
    </div>
  );
}