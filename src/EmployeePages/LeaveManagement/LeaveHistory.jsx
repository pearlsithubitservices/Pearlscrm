import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { exportLeaveHistoryPDF } from "./LeaveExport";
import {
  HeartPulse,
  CalendarCheck,
  Clock,
  AlertCircle,
  Download,
  Calendar,
  Search,
  ChevronDown,
  UserCheck,
  Building,
} from "lucide-react";
import useLeave from "../../Hooks/useLeave";
import { useAuth } from "../../context/AuthContext";

const LeaveHistory = () => {
  const { leaves = [] } = useLeave();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'approved' | 'pending' | 'rejected'
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const employeeId = user?.profile?.empId || user?.empId || user?.id || user?.uid || user?._id;

  // Filter all leaves for the logged-in employee
  const userLeaves = useMemo(() => {
    return leaves.filter(
      (item) => String(item.employeeId) === String(employeeId)
    );
  }, [leaves, employeeId]);

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: userLeaves.length,
      approved: userLeaves.filter((l) => (l.status || "").toLowerCase() === "approved").length,
      pending: userLeaves.filter((l) => (l.status || "").toLowerCase() === "pending").length,
      rejected: userLeaves.filter((l) => (l.status || "").toLowerCase() === "rejected").length,
    };
  }, [userLeaves]);

  // Filtered by selected tab and search query
  const displayedHistory = useMemo(() => {
    let filtered = userLeaves;

    if (activeTab === "approved") {
      filtered = filtered.filter((l) => (l.status || "").toLowerCase() === "approved");
    } else if (activeTab === "pending") {
      filtered = filtered.filter((l) => (l.status || "").toLowerCase() === "pending");
    } else if (activeTab === "rejected") {
      filtered = filtered.filter((l) => (l.status || "").toLowerCase() === "rejected");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (l) =>
          (l.leaveTitle || "").toLowerCase().includes(q) ||
          (l.leaveType || "").toLowerCase().includes(q) ||
          (l.leaveReason || "").toLowerCase().includes(q) ||
          (l.managerName || "").toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [userLeaves, activeTab, searchQuery]);

  // Helper for Leave Type Icon & Accent
  const getLeaveTypeStyle = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("sick")) {
      return {
        icon: HeartPulse,
        bg: "bg-rose-100 text-rose-600",
      };
    }
    if (t.includes("annual")) {
      return {
        icon: CalendarCheck,
        bg: "bg-blue-100 text-blue-600",
      };
    }
    if (t.includes("emergency")) {
      return {
        icon: AlertCircle,
        bg: "bg-purple-100 text-purple-600",
      };
    }
    return {
      icon: Clock,
      bg: "bg-amber-100 text-amber-600",
    };
  };

  const handleExportPDF = () => {
    const exportData = displayedHistory.map((item) => {
      const fromDate = item.leaveFrom ? new Date(item.leaveFrom).toLocaleDateString("en-IN") : "-";
      const toDate = item.leaveTo ? new Date(item.leaveTo).toLocaleDateString("en-IN") : "-";
      return {
        id: item._id,
        title: item.leaveTitle || "Leave",
        type: item.leaveType || "Leave",
        date: `${fromDate} - ${toDate}`,
        days: `${item.leaveDays || 1} ${(item.leaveDays || 1) === 1 ? "day" : "days"}`,
        status: (item.status || "Pending").toUpperCase(),
        reason: item.leaveReason || "",
      };
    });

    exportLeaveHistoryPDF(exportData);
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      id="leave-history-table"
      className="bg-white rounded-3xl border border-black/10 min-h-[430px] p-6 lg:p-8 flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0B2B57]">
            Leave History
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Record of your past, pending, and actioned leave applications
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-all px-4 py-2 rounded-xl text-xs font-semibold text-[#0B2B57] self-start sm:self-auto cursor-pointer"
        >
          <Download size={15} />
          Export PDF
        </button>
      </div>

      {/* Filter Tabs & Search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-full sm:w-fit text-xs font-semibold overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Records", count: counts.all },
            { id: "approved", label: "Approved", count: counts.approved },
            { id: "pending", label: "Pending", count: counts.pending },
            { id: "rejected", label: "Rejected", count: counts.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-[#0B2B57] shadow-sm font-bold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? "bg-[#0B2B57] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search leaves..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:border-[#2F6CC5] focus:bg-white transition"
          />
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {displayedHistory.length > 0 ? (
            displayedHistory.map((item, index) => {
              const status = (item.status || "Pending").toLowerCase();
              const style = getLeaveTypeStyle(item.leaveType);
              const TypeIcon = style.icon;
              const isExpanded = expandedId === (item._id || index);

              return (
                <motion.div
                  key={item._id || index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => toggleExpand(item._id || index)}
                  className={`border rounded-2xl p-4 transition-all cursor-pointer ${
                    isExpanded
                      ? "border-[#2F6CC5]/30 bg-blue-50/20 shadow-sm"
                      : "border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left Icon & Title */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}
                      >
                        <TypeIcon size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-[#0B2B57] truncate">
                            {item.leaveTitle || "Leave"}
                          </h3>
                          {item.leaveType && (
                            <span className="text-[10px] bg-slate-200/80 text-slate-700 font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                              {item.leaveType}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                          <span>
                            {item.leaveFrom
                              ? new Date(item.leaveFrom).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "-"}
                            {" - "}
                            {item.leaveTo
                              ? new Date(item.leaveTo).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "-"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Right Status & Expand arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0 pl-2">
                      <div className="text-right">
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                            status === "approved"
                              ? "bg-emerald-100 text-emerald-700"
                              : status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {status}
                        </span>

                        <p className="text-gray-600 text-xs mt-1 font-medium">
                          {item.leaveDays || 1} {(item.leaveDays || 1) === 1 ? "day" : "days"}
                        </p>
                      </div>

                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-400"
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </div>
                  </div>

                  {/* Expandable Details Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pt-3.5 border-t border-gray-200/70 text-xs space-y-2.5 overflow-hidden"
                      >
                        {item.leaveReason && (
                          <div className="bg-white p-3 rounded-xl border border-gray-100">
                            <span className="font-semibold text-gray-500 block mb-1">Reason:</span>
                            <p className="text-gray-700 italic">"{item.leaveReason}"</p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-gray-500 text-[11px]">
                          {item.managerName && (
                            <span className="flex items-center gap-1">
                              <UserCheck size={13} className="text-gray-400" />
                              <span>Manager: <strong className="text-gray-700">{item.managerName}</strong></span>
                            </span>
                          )}
                          {item.department && (
                            <span className="flex items-center gap-1">
                              <Building size={13} className="text-gray-400" />
                              <span>Department: <strong className="text-gray-700">{item.department}</strong></span>
                            </span>
                          )}
                          {item.createdAt && (
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-gray-400" />
                              <span>Applied: {new Date(item.createdAt).toLocaleDateString("en-IN")}</span>
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                <Calendar size={22} />
              </div>
              <p className="font-semibold text-gray-600 text-sm">
                {searchQuery
                  ? "No matching leaves found"
                  : activeTab === "approved"
                  ? "No Approved Leaves Yet"
                  : activeTab === "pending"
                  ? "No Pending Leaves"
                  : activeTab === "rejected"
                  ? "No Rejected Leaves"
                  : "No Leave History Records"}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Your completed and actioned leave applications will appear here."}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LeaveHistory;