import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Edit3, Trash2, Calendar, FileText } from "lucide-react";
import useLeave from "../../Hooks/useLeave";
import { useAuth } from "../../context/AuthContext";

const LeaveRequest = ({ onEdit, onCancel }) => {
    const { leaves = [], deleteLeave } = useLeave();
    const { user } = useAuth();

    const employeeId = user?.profile?.empId || user?.empId || user?.id || user?.uid || user?._id;

    // All pending requests for the current employee
    const pendingRequests = useMemo(() => {
        return (leaves || []).filter(
            (item) =>
                String(item.employeeId) === String(employeeId) &&
                (item.status || "").toLowerCase() === "pending"
        );
    }, [leaves, employeeId]);

    const handleCancel = async (requestId) => {
        if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
        try {
            const result = await deleteLeave(requestId);
            if (result.success && onCancel) {
                onCancel(requestId);
            }
        } catch (err) {
            console.error("Cancel leave error:", err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl border border-black/10 p-6 shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-2xl font-bold text-[#0B2B57]">
                        Pending Requests
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Awaiting management review & decision
                    </p>
                </div>

                <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    {pendingRequests.length} PENDING
                </span>
            </div>

            {/* Requests List */}
            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
                <AnimatePresence mode="popLayout">
                    {pendingRequests.length === 0 ? (
                        <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2F6CC5] flex items-center justify-center mx-auto mb-3">
                                <Clock size={20} />
                            </div>
                            <h3 className="font-bold text-sm text-[#0B2B57]">No Pending Requests</h3>
                            <p className="text-gray-400 text-xs mt-1">
                                You don't have any leave requests awaiting review.
                            </p>
                        </div>
                    ) : (
                        pendingRequests.map((req, index) => {
                            const days = req.leaveDays || Math.max(1, Math.ceil((new Date(req.leaveTo) - new Date(req.leaveFrom)) / (1000 * 60 * 60 * 24)) + 1);

                            return (
                                <motion.div
                                    key={req._id || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    whileHover={{ y: -2 }}
                                    className="border border-gray-100 bg-gray-50/70 hover:bg-white rounded-2xl p-4 transition-all shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-sm text-[#0B2B57] truncate">
                                                    {req.leaveTitle || "Leave Request"}
                                                </h3>
                                                {req.leaveType && (
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#2F6CC5]">
                                                        {req.leaveType}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
                                                <Calendar size={13} className="text-gray-400 flex-shrink-0" />
                                                <span>
                                                    {req.leaveFrom
                                                        ? new Date(req.leaveFrom).toLocaleDateString("en-IN", {
                                                              month: "short",
                                                              day: "numeric",
                                                          })
                                                        : "-"}
                                                    {" - "}
                                                    {req.leaveTo
                                                        ? new Date(req.leaveTo).toLocaleDateString("en-IN", {
                                                              month: "short",
                                                              day: "numeric",
                                                              year: "numeric",
                                                          })
                                                        : "-"}
                                                </span>
                                                <span className="font-semibold text-[#0B2B57] bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[10px]">
                                                    {days} {days === 1 ? "day" : "days"}
                                                </span>
                                            </div>

                                            {req.leaveReason && (
                                                <p className="text-xs text-gray-600 mt-2 line-clamp-2 italic bg-white/70 p-2 rounded-xl border border-gray-100">
                                                    "{req.leaveReason}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-gray-200/60">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(req)}
                                            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-[#2F6CC5] hover:bg-blue-100 transition cursor-pointer"
                                        >
                                            <Edit3 size={13} />
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCancel(req._id)}
                                            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                                        >
                                            <Trash2 size={13} />
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default LeaveRequest;