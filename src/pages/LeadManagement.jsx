import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Bell,
  Plus,
  IndianRupee,
  ChartNoAxesCombined,
  Users2,
  Briefcase,
  Trash2,
  X,
  RotateCcw,
} from "lucide-react";

import { motion } from "framer-motion";
import Pagination from "../components/Pagination";
import CreateLead from "./CreateLead";
import AnimateModals from "../components/Dashboard/AnimateModals";
import LoadingPage from "../components/Dashboard/Loading";
import useLeadfilter from "../Hooks/useLeadfilter";
import useEmployees from "../Hooks/useEmployees";
import { apiUrl } from "../config/api.js";
import { socket } from "../config/socket.js";

export default function LeadManagement() {
  const [leaddetails, setLeaddetails] = useState([]);
  const [dashboarddata, setDashboardData] = useState();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [openlead, setOpenlead] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Popover States
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Advanced Filters State
  const [extraFilters, setExtraFilters] = useState({
    filterStatus: "all",
    filterPriority: "all",
    filterEmployee: "all",
    filterSource: "all",
    filterDateRange: "all",
  });

  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_dismissed_lead_notifs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("crm_dismissed_lead_notifs", JSON.stringify(dismissedNotifIds));
    } catch (e) {
      console.error("Error saving dismissed lead notifications to localStorage:", e);
    }
  }, [dismissedNotifIds]);

  const filterRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const { employees } = useEmployees();

  // Outside click handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterModal(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Socket.io Real-time sync
  useEffect(() => {
    if (socket) {
      const handleSync = () => {
        fetchleads();
        fetchDashboard();
      };
      socket.on("leadCreated", handleSync);
      socket.on("leadUpdated", handleSync);
      socket.on("leadDeleted", handleSync);
      return () => {
        socket.off("leadCreated", handleSync);
        socket.off("leadUpdated", handleSync);
        socket.off("leadDeleted", handleSync);
      };
    }
  }, []);

  const deleteLead = async (leadId) => {
    if (!window.confirm("Delete this lead permanently?")) return;
    const response = await fetch(apiUrl(`/leads/${leadId}`), { method: "DELETE" });
    if (response.ok) fetchleads();
    else alert("Failed to delete lead.");
  };
  const buttons = ["All", "Hot", "Warm", "Cold"];

  useEffect(() => {
    fetchleads();
    fetchDashboard();
  }, []);

  // FETCH DASHBOARD DATA
  const fetchDashboard = async () => {
    try {
      const response = await fetch(apiUrl("/dashboard"));
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // FETCH LEADS FROM BACKEND API
  const fetchleads = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/leads"));
      if (response.ok) {
        const data = await response.json();
        setLeaddetails(Array.isArray(data) ? data : []);
      } else {
        setLeaddetails([]);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeaddetails([]);
    } finally {
      setLoading(false);
    }
  };

  const safeLeaddetails = Array.isArray(leaddetails) ? leaddetails : [];
  const filteredLeads = useLeadfilter(safeLeaddetails, search, buttons[active], extraFilters, employees);
  const safeFilteredLeads = Array.isArray(filteredLeads) ? filteredLeads : [];

  // Calculate active extra filter count
  const activeExtraFilterCount = Object.values(extraFilters).filter((v) => v !== "all").length;

  // Memoize Lead Notifications
  const notifications = useMemo(() => {
    const list = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    safeLeaddetails.forEach((lead) => {
      const statusLower = (lead.status || "").toLowerCase();
      const priorityLower = (lead.priority || "").toLowerCase();
      const followUpStr = lead.nextActionDate || lead.follow || lead.followUpDate;
      const followUpDate = followUpStr ? new Date(followUpStr) : null;
      const isClosed = statusLower === "converted" || statusLower === "closed" || statusLower === "won" || statusLower === "lost";

      const isOverdue = followUpDate && !isNaN(followUpDate.getTime()) && followUpDate < now && !isClosed;

      const ovId = `ov-${lead._id || lead.id}`;
      const hotId = `hot-${lead._id || lead.id}`;
      const newId = `new-${lead._id || lead.id}`;

      if (isOverdue && !dismissedNotifIds.includes(ovId)) {
        list.push({
          id: ovId,
          type: "overdue",
          title: "Overdue Follow Up Alert",
          message: `Follow-up date for "${lead.name || lead.clientName || "Lead"}" is overdue!`,
          time: followUpDate.toLocaleDateString("en-IN"),
          lead,
        });
      } else if (priorityLower === "hot" && !isClosed && !dismissedNotifIds.includes(hotId)) {
        list.push({
          id: hotId,
          type: "hot",
          title: "Hot Lead Requires Action",
          message: `Lead "${lead.name || lead.clientName || "Lead"}" (${lead.company || "Company"}) is marked HOT.`,
          time: lead.status || "Hot Priority",
          lead,
        });
      } else if (statusLower === "new" && !dismissedNotifIds.includes(newId)) {
        list.push({
          id: newId,
          type: "new",
          title: "New Lead Created",
          message: `New lead "${lead.name || lead.clientName || "Lead"}" is waiting for initial contact.`,
          time: "New Status",
          lead,
        });
      }
    });

    return list;
  }, [safeLeaddetails, dismissedNotifIds]);

  const handleClearAllNotifs = (e) => {
    e.stopPropagation();
    const allNotifIds = notifications.map((n) => n.id);
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, ...allNotifIds])));
  };

  const handleNotifClick = (e, notif) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notif.id])));
    setShowNotifications(false);
    navigate(`/leadsDetails/${notif.lead._id || notif.lead.id}`);
  };

  const handleDismissNotif = (e, notifId) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notifId])));
  };

  const handleResetFilters = () => {
    setExtraFilters({
      filterStatus: "all",
      filterPriority: "all",
      filterEmployee: "all",
      filterSource: "all",
      filterDateRange: "all",
    });
  };

  // PAGINATION
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = safeFilteredLeads.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(safeFilteredLeads.length / filesPerPage) || 1;

  // DYNAMIC STATS CALCULATIONS
  const convertedLeads = safeLeaddetails.filter(
    (lead) => (lead?.status || "").toLowerCase() === "converted" || (lead?.status || "").toLowerCase() === "closed"
  ).length;

  const convertedPercent =
    safeLeaddetails.length > 0
      ? ((convertedLeads / safeLeaddetails.length) * 100).toFixed(1)
      : 0;

  const totalPipelineValue = safeLeaddetails.reduce((acc, lead) => {
    const budgetNum = parseFloat(String(lead?.budget || 0).replace(/[^0-9.]/g, "")) || 0;
    return acc + budgetNum;
  }, 0);

  const formattedPipeline =
    totalPipelineValue >= 10000000
      ? `₹${(totalPipelineValue / 10000000).toFixed(2)}Cr`
      : totalPipelineValue >= 100000
      ? `₹${(totalPipelineValue / 100000).toFixed(2)}L`
      : totalPipelineValue > 0
      ? `₹${totalPipelineValue.toLocaleString("en-IN")}`
      : "₹0";

  const stats = [
    { icon: Users2, title: "Total Leads", value: safeLeaddetails.length },
    {
      icon: Briefcase,
      title: "Hot Leads",
      value: safeLeaddetails.filter((lead) => (lead?.priority || "").toLowerCase() === "hot").length,
    },
    { icon: ChartNoAxesCombined, title: "Conversion Rate", value: `${convertedPercent}%` },
    { icon: IndianRupee, title: "Pipeline Value", value: formattedPipeline },
  ];

  return (
    <div className="flex max-h-screen overflow-y-auto custom-scrollbar bg-[#f3f0eb] flex-col min-h-screen">
      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#023167] p-2">
              Lead Management
            </h1>
            <p className="text-sm text-gray-500">
              Track and manage your company leads in real time
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={() => setOpenlead(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#2563a9] text-white rounded-lg hover:scale-105 transition-transform duration-200 shadow-xs text-sm font-medium cursor-pointer"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Lead</span>
            </button>

            {/* FILTER BUTTON & POPOVER */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilterModal(!showFilterModal)}
                aria-label="Filter leads"
                title="Filter leads"
                className="w-10 h-10 shrink-0 flex items-center justify-center border border-gray-200 rounded-lg bg-[#2563a9] hover:bg-[#1d4ed8] transition-all shadow-xs relative cursor-pointer"
              >
                <Filter size={18} className="text-white" />
                {activeExtraFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {activeExtraFilterCount}
                  </span>
                )}
              </button>

              {/* Filter Popover Modal */}
              {showFilterModal && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2 text-[#082f57] font-bold text-sm">
                      <Filter size={16} />
                      <span>Advanced Lead Filters</span>
                    </div>
                    <button
                      onClick={() => setShowFilterModal(false)}
                      className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Status Filter */}
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Lead Status</label>
                      <select
                        value={extraFilters.filterStatus}
                        onChange={(e) => setExtraFilters({ ...extraFilters, filterStatus: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-800 font-medium outline-none cursor-pointer"
                      >
                        <option value="all">All Statuses</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>

                    {/* Priority Filter */}
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Priority / Temperature</label>
                      <select
                        value={extraFilters.filterPriority}
                        onChange={(e) => setExtraFilters({ ...extraFilters, filterPriority: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-800 font-medium outline-none cursor-pointer"
                      >
                        <option value="all">All Priorities</option>
                        <option value="Hot">Hot (High)</option>
                        <option value="Warm">Warm (Medium)</option>
                        <option value="Cold">Cold (Low)</option>
                      </select>
                    </div>

                    {/* Employee Filter */}
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Assigned Employee</label>
                      <select
                        value={extraFilters.filterEmployee}
                        onChange={(e) => setExtraFilters({ ...extraFilters, filterEmployee: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-800 font-medium outline-none cursor-pointer"
                      >
                        <option value="all">All Assigned Employees</option>
                        {employees.map((emp) => (
                          <option key={emp._id || emp.id || emp.uid || emp.name} value={emp._id || emp.id || emp.uid || emp.name}>
                            {emp.employeeName || emp.name || emp.displayName || emp.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Source Filter */}
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Lead Source</label>
                      <select
                        value={extraFilters.filterSource}
                        onChange={(e) => setExtraFilters({ ...extraFilters, filterSource: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-800 font-medium outline-none cursor-pointer"
                      >
                        <option value="all">All Sources</option>
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Cold Call">Cold Call</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Direct">Direct</option>
                      </select>
                    </div>

                    {/* Follow Up Period */}
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Follow Up Period</label>
                      <select
                        value={extraFilters.filterDateRange}
                        onChange={(e) => setExtraFilters({ ...extraFilters, filterDateRange: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-800 font-medium outline-none cursor-pointer"
                      >
                        <option value="all">All Follow Ups</option>
                        <option value="today">Follow Up Today</option>
                        <option value="this_week">Follow Up This Week</option>
                        <option value="overdue">Overdue Follow Ups</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <button
                      onClick={handleResetFilters}
                      className="text-gray-600 hover:text-red-600 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Reset</span>
                    </button>
                    <button
                      onClick={() => setShowFilterModal(false)}
                      className="bg-[#2563a9] hover:bg-[#1d4ed8] text-white font-semibold px-4 py-1.5 rounded-lg cursor-pointer"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* NOTIFICATION BUTTON & POPOVER */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View lead notifications"
                title="View lead notifications"
                className="w-10 h-10 shrink-0 flex items-center justify-center border border-gray-200 rounded-lg bg-[#2563a9] hover:bg-[#1d4ed8] transition-all shadow-xs relative cursor-pointer"
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
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 bg-[#0b2b57] text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bell size={16} />
                      <h3 className="font-bold text-sm">Lead Notifications</h3>
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
                        🎉 No overdue follow-ups or critical lead alerts!
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={(e) => handleNotifClick(e, n)}
                          className="p-3.5 hover:bg-blue-50/50 transition-colors cursor-pointer space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                n.type === "overdue"
                                  ? "bg-red-100 text-red-700"
                                  : n.type === "hot"
                                  ? "bg-orange-100 text-orange-700"
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
        <div className="p-4 md:p-6 lg:p-8 bg-[#f3f0eb] space-y-6">
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs"
              >
                <div className="bg-gray-100 rounded-lg w-9 h-9 flex items-center justify-center mb-3 border border-gray-200">
                  <s.icon className="w-5 h-5 text-[#2563a9]" />
                </div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  {s.title}
                </p>
                <h2 className="text-2xl font-bold text-[#0b2b57] mt-1">
                  {s.value}
                </h2>
              </motion.div>
            ))}
          </div>

          {/* FILTER BAR */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="font-bold text-xl text-[#0b2b57]">
              <p>Lead List</p>
            </div>

            <div className="flex gap-2">
              {buttons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active === index
                      ? "bg-[#2563a9] text-white shadow-xs"
                      : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="flex items-center border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 w-full md:w-80">
              <Search size={16} className="text-gray-500 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 w-full outline-none text-xs bg-transparent text-gray-800 placeholder-gray-400"
                placeholder="Search by name, company or source..."
              />
            </div>
          </div>

          {/* TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl overflow-x-auto custom-scrollbar border border-gray-200 shadow-xs"
          >
            <table className="min-w-[900px] w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">LEAD</th>
                  <th className="p-3.5">STATUS</th>
                  <th className="p-3.5">PRIORITY</th>
                  <th className="p-3.5">BUDGET</th>
                  <th className="p-3.5">SOURCE</th>
                  <th className="p-3.5">FOLLOW UP</th>
                  <th className="p-3.5">ACTION</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                      <td colSpan="7" className="text-center py-10">
                      <LoadingPage />
                    </td>
                  </tr>
                ) : currentFiles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400 italic">
                      No leads found in database.
                    </td>
                  </tr>
                ) : (
                  currentFiles.map((l, i) => {
                    const leadName = l.name || l.clientName || "Unnamed Lead";
                    const company = l.company || "N/A";
                    const status = l.status || "New";
                    const priority = (l.priority || "cold").toLowerCase();
                    const budget = l.budget
                      ? `₹${Number(String(l.budget).replace(/[^0-9.]/g, "")).toLocaleString("en-IN")}`
                      : "N/A";
                    const source = l.source || "Direct";
                    const followUp = l.nextActionDate
                      ? new Date(l.nextActionDate).toLocaleDateString()
                      : l.follow || l.followUpDate || "Not Set";

                    return (
                      <tr
                        key={l._id || i}
                        className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/leadDetails/${l._id}`)}
                      >
                        <td className="p-3.5">
                          <p className="font-semibold text-gray-800 text-xs">{leadName}</p>
                          <p className="text-[11px] text-gray-400">{company}</p>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              status.toLowerCase() === "converted" || status.toLowerCase() === "closed"
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-blue-100 text-blue-700 border border-blue-300"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              priority === "hot"
                                ? "bg-red-100 text-red-700 border border-red-300"
                                : priority === "warm"
                                ? "bg-orange-100 text-orange-700 border-orange-300"
                                : "bg-gray-100 text-gray-600 border border-gray-300"
                            }`}
                          >
                            {priority.toUpperCase()}
                          </span>
                        </td>

                        <td className="p-3.5 font-medium text-gray-700">{budget}</td>

                        <td className="p-3.5">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px]">
                            {source}
                          </span>
                        </td>

                        <td className="p-3.5 text-gray-500 text-[11px]">{followUp}</td>
                        <td className="p-3.5">
                          <button type="button" onClick={(event) => { event.stopPropagation(); deleteLead(l._id); }} className="text-red-600" aria-label="Delete lead">
                            <Trash2 size={15} />
                          </button>
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

      {/* ADD LEAD MODAL */}
      {openlead && (
        <AnimateModals>
          <CreateLead
            onClose={() => setOpenlead(false)}
            fetchleads={fetchleads}
          />
        </AnimateModals>
      )}
    </div>
  );
}
