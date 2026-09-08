import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Check, Eye, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import useEmployees from "../../Hooks/useEmployees";
import ApprovalForm from "./ApprovalForm";

export default function LeaveApprovals({ leaves = [], updateLeaveStatus, onLeaveUpdated }) {
    const { employees } = useEmployees();
    const [openForm, setOpenForm] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [statusTab, setStatusTab] = useState("Pending");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionToast, setActionToast] = useState(null); // { message, type }
    const itemsPerPage = 7;

    const showToast = (message, type = "success") => {
        setActionToast({ message, type });
        setTimeout(() => setActionToast(null), 3500);
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Are you sure you want to approve this leave request?")) return;
        try {
            setActionLoading(true);
            setOpenForm(false);
            setSelectedLeave(null);

            const res = await updateLeaveStatus(id, "Approved");
            if (res.success) {
                showToast("Leave approved successfully!", "success");
                if (onLeaveUpdated) onLeaveUpdated();
            } else {
                showToast(res.error || "Failed to approve leave", "error");
            }
        } catch (err) {
            showToast(err.message || "Approval failed", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDecline = async (id) => {
        if (!window.confirm("Are you sure you want to reject this leave request?")) return;
        try {
            setActionLoading(true);
            setOpenForm(false);
            setSelectedLeave(null);

            const res = await updateLeaveStatus(id, "Rejected");
            if (res.success) {
                showToast("Leave rejected.", "info");
                if (onLeaveUpdated) onLeaveUpdated();
            } else {
                showToast(res.error || "Failed to reject leave", "error");
            }
        } catch (err) {
            showToast(err.message || "Rejection failed", "error");
        } finally {
            setActionLoading(false);
        }
    };

    // Filtered by Tab & Search
    const filteredLeaves = useMemo(() => {
        return (leaves || []).filter((item) => {
            const status = (item.status || "Pending").toLowerCase();
            const matchesStatus =
                statusTab === "All" ||
                status === statusTab.toLowerCase();

            const name = item.employeeName || "";
            const empId = item.employeeId || "";
            const dept = item.department || "";
            const type = item.leaveType || "";
            const title = item.leaveTitle || "";

            const matchesSearch = [name, empId, dept, type, title]
                .join(" ")
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            return matchesStatus && matchesSearch;
        });
    }, [leaves, statusTab, searchTerm]);

    // Counts for tabs
    const counts = useMemo(() => {
        const list = leaves || [];
        return {
            Pending: list.filter((item) => (item.status || "Pending").toLowerCase() === "pending").length,
            Approved: list.filter((item) => (item.status || "").toLowerCase() === "approved").length,
            Rejected: list.filter((item) => (item.status || "").toLowerCase() === "rejected").length,
            All: list.length,
        };
    }, [leaves]);

    // Pagination
    const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredLeaves.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="bg-[#f4f1ea] rounded-2xl relative">
            {/* Live Feedback Toast */}
            <AnimatePresence>
                {actionToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        className={`mb-4 p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-sm ${
                            actionToast.type === "error"
                                ? "bg-red-50 border-red-200 text-red-700"
                                : actionToast.type === "info"
                                ? "bg-amber-50 border-amber-200 text-amber-800"
                                : "bg-emerald-50 border-emerald-200 text-emerald-800"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                            <span>{actionToast.message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActionToast(null)}
                            className="p-1 hover:opacity-75 cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header & Controls */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
                {/* Title */}
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-[#0B2B57]">
                        Leave Requests & Approvals
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Manage, review, and filter employee time-off requests
                    </p>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                    {/* Status Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                        {["Pending", "Approved", "Rejected", "All"].map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => {
                                    setStatusTab(tab);
                                    setCurrentPage(1);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                    statusTab === tab
                                        ? "bg-white text-[#0B2B57] shadow-sm"
                                        : "text-gray-600 hover:text-black"
                                }`}
                            >
                                {tab}
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                        statusTab === tab
                                            ? "bg-blue-100 text-blue-700 font-bold"
                                            : "bg-gray-200 text-gray-600"
                                    }`}
                                >
                                    {counts[tab]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl w-full sm:w-[220px]">
                        <Search size={15} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name, dept, type..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full text-xs outline-none bg-transparent"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="text-gray-400 hover:text-gray-600">
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left border-collapse">
                        <thead className="bg-[#2563a9] text-white text-xs uppercase tracking-wide">
                            <tr>
                                <th className="py-3.5 px-5 font-semibold">Employee</th>
                                <th className="py-3.5 px-4 font-semibold">Department</th>
                                <th className="py-3.5 px-4 font-semibold">Leave Type</th>
                                <th className="py-3.5 px-4 font-semibold">Date Range</th>
                                <th className="py-3.5 px-4 font-semibold">Duration</th>
                                <th className="py-3.5 px-4 font-semibold">Status</th>
                                <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 text-sm">
                            {currentItems.length > 0 ? (
                                currentItems.map((item) => {
                                    const status = item.status || "Pending";
                                    return (
                                        <tr
                                            key={item._id}
                                            className="hover:bg-blue-50/50 transition-colors"
                                        >
                                            <td className="py-4 px-5">
                                                <div className="font-semibold text-[#0b2b57]">
                                                    {item.employeeName || "No Employee"}
                                                </div>
                                                {item.leaveTitle && (
                                                    <div className="text-xs text-gray-500 truncate max-w-[180px]">
                                                        {item.leaveTitle}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="py-4 px-4 text-gray-700 font-medium text-xs">
                                                {item.department || "General"}
                                            </td>

                                            <td className="py-4 px-4">
                                                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                                                    {item.leaveType || "Leave"}
                                                </span>
                                            </td>

                                            <td className="py-4 px-4 text-xs text-gray-600">
                                                {new Date(item.leaveFrom).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}{" "}
                                                -{" "}
                                                {new Date(item.leaveTo).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </td>

                                            <td className="py-4 px-4 font-medium text-xs text-[#0b2b57]">
                                                {item.leaveDays || 1} day{(item.leaveDays || 1) > 1 ? "s" : ""}
                                            </td>

                                            <td className="py-4 px-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        status.toLowerCase() === "approved"
                                                            ? "bg-green-100 text-green-700"
                                                            : status.toLowerCase() === "rejected"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-amber-100 text-amber-700"
                                                    }`}
                                                >
                                                    {status}
                                                </span>
                                            </td>

                                            <td className="py-4 px-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Quick Approve button if not already approved */}
                                                    {status.toLowerCase() !== "approved" && (
                                                        <button
                                                            type="button"
                                                            disabled={actionLoading}
                                                            onClick={() => handleApprove(item._id)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                                                            title="Quick Approve"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}

                                                    {/* Quick Reject button if not already rejected */}
                                                    {status.toLowerCase() !== "rejected" && (
                                                        <button
                                                            type="button"
                                                            disabled={actionLoading}
                                                            onClick={() => handleDecline(item._id)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                                                            title="Quick Reject"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}

                                                    {/* View Full Details modal */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedLeave(item);
                                                            setOpenForm(true);
                                                        }}
                                                        className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                                                        title="Review Details"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500">
                                        <p className="text-sm font-medium">No leave requests found.</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {statusTab !== "All"
                                                ? `No ${statusTab.toLowerCase()} leaves match your search.`
                                                : "No leave records match the current filters."}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Working Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-xs text-gray-600 bg-gray-50/50">
                        <span>
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLeaves.length)} of {filteredLeaves.length} requests
                        </span>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                            >
                                <ChevronLeft size={14} />
                            </button>

                            <span className="px-2 font-semibold text-gray-800">
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {openForm && selectedLeave && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => {
                                setOpenForm(false);
                                setSelectedLeave(null);
                            }}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar"
                            >
                                <ApprovalForm
                                    leave={selectedLeave}
                                    onApprove={handleApprove}
                                    onDecline={handleDecline}
                                    onClose={() => {
                                        setOpenForm(false);
                                        setSelectedLeave(null);
                                    }}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}