import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, User } from "lucide-react";

export default function LeaveCalendar({ leaves = [] }) {
    const [viewAll, setViewAll] = useState(false);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const displayedLeaves = useMemo(() => {
        const approved = (leaves || []).filter(
            (item) => (item.status || "").toLowerCase() === "approved"
        );

        if (viewAll) {
            return approved;
        }

        // Active today or upcoming
        return approved.filter((item) => {
            const to = new Date(item.leaveTo);
            to.setHours(23, 59, 59, 999);
            return to >= today;
        });
    }, [leaves, viewAll, today]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 w-full h-[420px] overflow-y-auto no-scrollbar flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-[#0B2B57] flex items-center gap-2">
                        <CalendarDays className="text-blue-600" size={20} />
                        Team Leave Schedules
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {viewAll ? "All approved leave records" : "Active & upcoming approved leaves"}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setViewAll((prev) => !prev)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                    {viewAll ? "Show Active Only" : "View All"}
                </button>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100 flex-1">
                {displayedLeaves.length > 0 ? (
                    displayedLeaves.map((emp, index) => {
                        const fromDate = new Date(emp.leaveFrom);
                        const toDate = new Date(emp.leaveTo);
                        fromDate.setHours(0, 0, 0, 0);
                        toDate.setHours(23, 59, 59, 999);

                        const isCurrentlyActive = today >= fromDate && today <= toDate;

                        const dateRange = `${new Date(emp.leaveFrom).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })} - ${new Date(emp.leaveTo).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}`;

                        const duration = `${emp.leaveDays || 1} day${(emp.leaveDays || 1) > 1 ? "s" : ""}`;
                        const employeeName = emp.employeeName || "Employee";
                        const initial = employeeName.charAt(0).toUpperCase();

                        return (
                            <motion.div
                                key={emp._id || index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between py-3.5 hover:bg-gray-50/70 px-2 rounded-xl transition"
                            >
                                {/* Left */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                                        {initial}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold text-[#0B2B57]">
                                                {employeeName}
                                            </h3>
                                            {isCurrentlyActive && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                                                    On Leave Today
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {emp.department || emp.role || "General"} • {emp.leaveType || "Leave"}
                                        </p>
                                    </div>
                                </div>

                                {/* Right */}
                                <div className="text-right">
                                    <p className="text-xs text-gray-600 font-medium">
                                        {dateRange}
                                    </p>

                                    <p className="text-xs font-semibold text-blue-600 mt-1">
                                        {duration}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-400">
                        <CalendarDays size={32} className="text-gray-300 mb-2" />
                        <p className="text-sm font-medium text-gray-600">No active or upcoming leaves scheduled.</p>
                        <p className="text-xs text-gray-400 mt-0.5">All team members are currently available.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}