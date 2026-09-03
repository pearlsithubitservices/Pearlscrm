

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FolderKanban,
  Settings,
  LogOut,
  Search,
  Filter,
  Bell,
  Plus,
  IndianRupee,
  CheckCircle2,
  ChartNoAxesCombined,
  Users2,
  CheckCircle,
  Briefcase,
  ArrowLeft,
  ArrowLeftCircleIcon,
  ArrowRightFromLine,
  ArrowRightCircleIcon,
  Trash2,
  X,
  RotateCcw,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import Pagination from "../../components/Pagination";
import CreateLead from "../../pages/CreateLead";
import AnimateModals from "../../components/Dashboard/AnimateModals";
import LoadingPage from "../../components/Dashboard/Loading";
import useLeadfilter from "../../Hooks/useLeadfilter";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../Utils/formatNumber";
import { apiUrl } from "../../config/api";
import { socket } from "../../config/socket";

export default function LeadManagement() {
  const [leaddetails, setLeaddetails] = useState([]);
  const [dashboarddata, setDashboardData] = useState();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);

  // Popover States
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Advanced Filters State
  const [extraFilters, setExtraFilters] = useState({
    filterStatus: "all",
    filterPriority: "all",
    filterSource: "all",
    filterDateRange: "all",
  });

  const filterRef = useRef(null);
  const notifRef = useRef(null);

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

  const userUid = user?.uid || user?._id || user?.id;
  const userEmail = user?.email || "";

  const currentLead = (Array.isArray(leaddetails) ? leaddetails : []).filter((item) => {
    if (!item) return false;
    const aTo = item.assignedTo;
    const aEmp = item.assignedEmployee;

    const aToId = typeof aTo === 'object' && aTo !== null ? (aTo._id || aTo.id || aTo.uid || aTo.email) : String(aTo || '');
    const aEmpId = typeof aEmp === 'object' && aEmp !== null ? (aEmp._id || aEmp.id || aEmp.uid || aEmp.email) : String(aEmp || '');

    return (
      (userUid && (aToId === userUid || aEmpId === userUid)) ||
      (userEmail && (aToId.toLowerCase() === userEmail.toLowerCase() || aEmpId.toLowerCase() === userEmail.toLowerCase()))
    );
  });

  useEffect(() => {
    fetchleads();
    fetchDashboard();
  }, [user?.uid]);

  // FETCH DASHBOARD
  const fetchDashboard = async () => {
    try {
      const response = await fetch(apiUrl("/dashboard"));
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Leads
  const fetchleads = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/leads"));
      if (response.ok) {
        const data = await response.json();
        setLeaddetails(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const buttons = ["All", "Hot", "Warm", "Cold"];
  const filteredLeads = useLeadfilter(currentLead, search, buttons[active], extraFilters);

  // Active extra filter count
  const activeExtraFilterCount = Object.values(extraFilters).filter((v) => v !== "all").length;

  // Memoize Lead Notifications for Employee
  const notifications = useMemo(() => {
    const list = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    currentLead.forEach((lead) => {
      const statusLower = (lead.status || "").toLowerCase();
      const priorityLower = (lead.priority || "").toLowerCase();
      const followUpStr = lead.nextActionDate || lead.follow || lead.followUpDate;
      const followUpDate = followUpStr ? new Date(followUpStr) : null;
      const isClosed = statusLower === "converted" || statusLower === "closed" || statusLower === "won" || statusLower === "lost";

      const isOverdue = followUpDate && !isNaN(followUpDate.getTime()) && followUpDate < now && !isClosed;

      if (isOverdue) {
        list.push({
          id: `ov-${lead._id || lead.id}`,
          type: "overdue",
          title: "Overdue Follow Up Warning",
          message: `Follow-up date for "${lead.name || lead.clientName || "Lead"}" is overdue!`,
          time: followUpDate.toLocaleDateString("en-IN"),
          lead,
        });
      } else if (priorityLower === "hot") {
        if (!isClosed) {
          list.push({
            id: `hot-${lead._id || lead.id}`,
            type: "hot",
            title: "Hot Lead Requires Action",
            message: `Your lead "${lead.name || lead.clientName || "Lead"}" (${lead.company || "Company"}) is marked HOT.`,
            time: lead.status || "Hot Priority",
            lead,
          });
        }
      } else if (statusLower === "new") {
        list.push({
          id: `new-${lead._id || lead.id}`,
          type: "new",
          title: "New Lead Assigned",
          message: `New lead "${lead.name || lead.clientName || "Lead"}" assigned to you for initial contact.`,
          time: "New Status",
          lead,
        });
      }
    });

    return list;
  }, [currentLead]);

  const handleResetFilters = () => {
    setExtraFilters({
      filterStatus: "all",
      filterPriority: "all",
      filterSource: "all",
      filterDateRange: "all",
    });
  };

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = filteredLeads.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredLeads.length / filesPerPage) || 1;

  const [openlead, setOpenlead] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const deleteLead = async (leadId) => {
    if (!leadId || !window.confirm("Delete this lead permanently?")) return;
    try {
      const response = await fetch(apiUrl(`/leads/${leadId}`), { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete lead");
      fetchleads();
    } catch (error) {
      alert(error.message);
    }
  };
  const convertedLeads = currentLead.filter((lead) => (lead.status || "").toLowerCase() === "converted").length;
  const convertedPercent = currentLead.length > 0 ? ((convertedLeads / currentLead.length) * 100).toFixed(2) : 0;
  const pipelineValue = currentLead?.reduce((total, lead) => {
    return total + Number(lead.budget || 0);
  }, 0);

  const stats = [
    { icon: Users2, title: "Total Lead", value: currentLead.length },
    { icon: Briefcase, title: "Hot Leads", value: currentLead.filter((leads) => (leads.priority?.toLowerCase() === "hot")).length },
    { icon: ChartNoAxesCombined, title: "Conversion Rate", value: `${convertedPercent}%` },
    { icon: IndianRupee, title: "Pipeline Value", value: formatCurrency(pipelineValue) },
  ];

  return (
    <div className="flex max-h-screen overflow-y-auto no-scrollbar bg-[#f3f0eb]">
      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#023167] p-2">
              Lead Management
            </h1>
            <p className="text-sm text-gray-500">
              Track and manage your leads
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenlead(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white rounded-lg hover:scale-105 transition-transform duration-300 shadow-xs cursor-pointer text-sm font-medium"
            >
              <Plus size={16} />
              Add Lead
            </button>



            {/* NOTIFICATION BUTTON & POPOVER */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:bg-[#1d4ed8] transition-all cursor-pointer relative"
              >
                <Bell size={18} className='text-white' />
                {notifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 bg-[#0b2b57] text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bell size={16} />
                      <h3 className="font-bold text-sm">Lead Notifications</h3>
                    </div>
                    <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {notifications.length} Active
                    </span>
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
                          onClick={() => {
                            setShowNotifications(false);
                            navigate(`/leadDetails/${n.lead._id}`);
                          }}
                          className="p-3.5 hover:bg-blue-50/50 transition-colors cursor-pointer space-y-1.5 text-xs"
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
                            <span className="text-[11px] text-gray-400 font-medium">{n.time}</span>
                          </div>
                          <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{n.title}</h4>
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{n.message}</p>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowNotifications(false);
                                navigate(`/leadDetails/${n.lead._id}`);
                              }}
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
        <div className="p-4 md:p-6 lg:p-8 bg-[#f3f0eb]">

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="bg-white p-6 rounded-xl border"
              >
                <div className='bg-gray-200  rounded w-8 h-8'>
                  <s.icon className="w-8 h-8 text-black p-2" />
                </div>
                <p className="text-sm text-gray-500">{s.title}</p>
                <h2 className="text-2xl font-bold text-[#0b2b57]">
                  {s.value}
                </h2>
              </motion.div>
            ))}

          </div>

          {/* FILTER BAR */}
          <div className="mt-6 bg-white p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className=" font-bold text-xl text-[#0b2b57]"  >
              <p>Lead List</p>
            </div>

            <div className="flex gap-3">
              {buttons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  className={`px-4  rounded-xl font-medium transition-all
            ${active === index
                      ? "bg-[#2563a9] text-white"
                      : "text-gray-400  hover:bg-[#2563a9] hover:text-white"
                    }`}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="flex items-center border bg-gray-200 rounded px-3 py-2 w-full md:w-80">
              <Search size={16} className="text-black" />
              <input
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 w-full outline-none text-sm bg-gray-200"
                placeholder="Search Lead.."
              />
            </div>

          </div>

          {/* TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white rounded-lg overflow-x-auto border">

            <table className="min-w-[900px] w-full text-sm">

              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="p-3">LEAD</th>
                  <th>STATUS</th>
                  <th>TEMP</th>
                  <th>BUDGET</th>
                  <th>SOURCE</th>
                  <th>FOLLOW UP</th>
                  <th>ACTION</th>
                </tr>
              </thead>


              <tbody>

                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10">
                      <LoadingPage />
                    </td>
                  </tr>
                ) : (currentFiles.map((l, i) => (
                  <tr key={l._id || i} className="border-t" onClick={() => navigate(`/leadDetails/${l._id}`)}>

                    <td className="p-3">
                      <p className="font-medium">{l.name || "John Doe"}</p>
                      <p className="text-xs text-gray-400">{l.company || "ABC Corp"}</p>
                    </td>

                    <td>
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                        {l.status || "New"}
                      </span>
                    </td>

                    <td>
                      <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs">
                        {l.priority || "cold"}
                      </span>
                    </td>

                    <td>{l.budget || "1,20,00"}</td>

                    <td>
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {l.source || "LinkedIn"}
                      </span>
                    </td>

                    <td>{l.nextActionDate ? new Date(l.nextActionDate).toLocaleDateString() : l.follow || "Not Set"}</td>

                    <td>
                      <button type="button" onClick={(event) => { event.stopPropagation(); deleteLead(l._id); }} className="text-red-600" aria-label="Delete lead">
                        <Trash2 size={16} />
                      </button>
                    </td>

                  </tr>
                )))}

              </tbody>

            </table>

          </motion.div>

          {/*PAGINATION*/}
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />

        </div>

      </div>
      {/**ADD LEADS */}
      {openlead && (
        <AnimateModals>
          <CreateLead onClose={() => setOpenlead(false)}
            fetchleads={fetchleads} />
        </AnimateModals>
      )}
    </div>
  );
}

