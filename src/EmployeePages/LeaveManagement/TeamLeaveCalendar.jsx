import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Calendar, Clock, AlertCircle } from "lucide-react";
import useLeave from "../../Hooks/useLeave";
import { useAuth } from "../../context/AuthContext";

const TeamLeaveCalendar = () => {
  const { user } = useAuth();
  const { leaves = [] } = useLeave();
  const [filterType, setFilterType] = useState("all"); // 'all' | 'today' | 'upcoming'

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const employeeId = user?.profile?.empId || user?.empId || user?.id || user?.uid || user?._id;

  // Filter approved leaves for teammates (or all if empId not matched)
  const teamLeaves = useMemo(() => {
    return leaves
      .filter((item) => {
        const leaveFrom = new Date(item.leaveFrom);
        const leaveTo = new Date(item.leaveTo);
        leaveFrom.setHours(0, 0, 0, 0);
        leaveTo.setHours(0, 0, 0, 0);

        const isTeammate = employeeId ? String(item.employeeId) !== String(employeeId) : true;
        const isApproved = item.status?.toLowerCase() === "approved";
        const isNotExpired = leaveTo >= today;

        return isTeammate && isApproved && isNotExpired;
      })
      .sort((a, b) => new Date(a.leaveFrom) - new Date(b.leaveFrom));
  }, [leaves, employeeId, today]);

  // Specific counts
  const leavesToday = useMemo(() => {
    return teamLeaves.filter((item) => {
      const leaveFrom = new Date(item.leaveFrom);
      const leaveTo = new Date(item.leaveTo);
      leaveFrom.setHours(0, 0, 0, 0);
      leaveTo.setHours(0, 0, 0, 0);
      return today >= leaveFrom && today <= leaveTo;
    });
  }, [teamLeaves, today]);

  const leavesUpcoming = useMemo(() => {
    return teamLeaves.filter((item) => {
      const leaveFrom = new Date(item.leaveFrom);
      leaveFrom.setHours(0, 0, 0, 0);
      return leaveFrom > today;
    });
  }, [teamLeaves, today]);

  // Current list based on filter
  const displayedLeaves = useMemo(() => {
    if (filterType === "today") return leavesToday;
    if (filterType === "upcoming") return leavesUpcoming;
    return teamLeaves;
  }, [filterType, teamLeaves, leavesToday, leavesUpcoming]);

  // Helper to calculate days until start
  const getLeaveTimingBadge = (item) => {
    const leaveFrom = new Date(item.leaveFrom);
    const leaveTo = new Date(item.leaveTo);
    leaveFrom.setHours(0, 0, 0, 0);
    leaveTo.setHours(0, 0, 0, 0);

    if (today >= leaveFrom && today <= leaveTo) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          On Leave Today
        </span>
      );
    }

    const diffTime = leaveFrom.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
          Starts Tomorrow
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-[#2F6CC5]">
        In {diffDays} days
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white rounded-3xl border border-black/10 h-[570px] flex flex-col p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B2B57]">
            Team Leave Calendar
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">
            Active and upcoming teammate leave schedules
          </p>
        </div>

        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium self-start sm:self-auto">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Sync
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl mb-4 text-xs font-medium">
        <button
          onClick={() => setFilterType("all")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            filterType === "all"
              ? "bg-white text-[#0B2B57] font-bold shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>All Upcoming</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterType === "all" ? "bg-[#0B2B57] text-white" : "bg-gray-200 text-gray-700"}`}>
            {teamLeaves.length}
          </span>
        </button>

        <button
          onClick={() => setFilterType("today")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            filterType === "today"
              ? "bg-white text-[#0B2B57] font-bold shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>On Leave Today</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterType === "today" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            {leavesToday.length}
          </span>
        </button>

        <button
          onClick={() => setFilterType("upcoming")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            filterType === "upcoming"
              ? "bg-white text-[#0B2B57] font-bold shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>Future</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterType === "upcoming" ? "bg-[#2F6CC5] text-white" : "bg-gray-200 text-gray-700"}`}>
            {leavesUpcoming.length}
          </span>
        </button>
      </div>

      {/* Team Leave List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0">
        <AnimatePresence mode="popLayout">
          {displayedLeaves.length > 0 ? (
            displayedLeaves.map((employee, index) => (
              <motion.div
                key={employee._id || `${employee.employeeId}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                whileHover={{ y: -2 }}
                className="border border-gray-100 bg-gray-50/50 hover:bg-white rounded-2xl p-3.5 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6CC5] to-[#0B2B57] text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-sm">
                      {employee.employeeName
                        ?.split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "EM"}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#0B2B57] text-sm truncate">
                          {employee.employeeName || "Employee"}
                        </h3>
                        {employee.leaveType && (
                          <span className="text-[10px] bg-slate-200/80 text-slate-700 font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                            {employee.leaveType}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 truncate">
                        {employee.department || "General"}
                      </p>
                    </div>
                  </div>

                  {/* Right: Dates & Badge */}
                  <div className="text-right flex-shrink-0">
                    <div>{getLeaveTimingBadge(employee)}</div>
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      {new Date(employee.leaveFrom).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(employee.leaveTo).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-[#2F6CC5] text-xs font-semibold">
                      {employee.leaveDays || 1}{" "}
                      {employee.leaveDays === 1 ? "day" : "days"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 text-gray-400">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                <Calendar size={28} />
              </div>
              <p className="font-semibold text-gray-700 text-base">
                {filterType === "today"
                  ? "No Team Members On Leave Today"
                  : filterType === "upcoming"
                  ? "No Upcoming Team Leaves"
                  : "No Scheduled Team Leaves"}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                {filterType === "today"
                  ? "Everyone is present and working today."
                  : "Approved team leaves will automatically show up here."}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-gray-600">
          <Users size={16} className="text-[#2F6CC5]" />
          <span className="font-medium">
            {displayedLeaves.length} {displayedLeaves.length === 1 ? "Teammate" : "Teammates"} on record
          </span>
        </div>

        {filterType !== "all" ? (
          <button
            onClick={() => setFilterType("all")}
            className="text-[#2F6CC5] font-semibold hover:underline"
          >
            Show All
          </button>
        ) : (
          <span className="text-gray-400">Auto-updated</span>
        )}
      </div>
    </motion.div>
  );
};

export default TeamLeaveCalendar;