import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { IndianRupee, ReceiptText } from "lucide-react";
import ReimbursementApproval from "./ApprovalForm";
import { useNavigate } from "react-router-dom";
import useReimbursement from "../../../Hooks/useReimbursement";
import useEmployees from "../../../Hooks/useEmployees";

const badgeStyle = {
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    approved: "bg-green-100 text-green-700 border border-green-200",
    rejected: "bg-red-100 text-red-700 border border-red-200",
    declined: "bg-red-100 text-red-700 border border-red-200",
};

export default function ReimbursementClaim({ claims = [], currentpayslip, getClaims, onRefresh }) {
    const [filterStatus, setFilterStatus] = useState("Pending");
    const { employees } = useEmployees();

    const employeeMap = useMemo(() => {
        const map = {};
        employees.forEach((emp) => {
            const info = {
                name: emp.name || emp.employeeName || (emp.email ? emp.email.split('@')[0] : "Employee"),
                empId: emp.profile?.empId || emp.empId || emp.employeeCode || `EMP-${String(emp._id || emp.uid || emp.id || "").slice(-4).toUpperCase()}`,
            };
            if (emp.uid) map[emp.uid] = info;
            if (emp._id) map[emp._id] = info;
            if (emp.id) map[emp.id] = info;
            if (emp.email) map[emp.email.toLowerCase()] = info;
            if (emp.profile?.empId) map[emp.profile.empId] = info;
        });
        return map;
    }, [employees]);

    const currentId = currentpayslip?.[0]?.employeeId;

    const pendingCount = claims?.filter((item) => item?.status?.toLowerCase() === "pending")?.length || 0;

    const displayedClaims = claims?.filter((item) => {
        if (filterStatus === "All") return true;
        return item?.status?.toLowerCase() === filterStatus.toLowerCase();
    });

    const [selectedClaim, setSelectedClaim] = useState(null);
    const [form, setform] = useState(false);

    const handleRefreshData = async () => {
        if (getClaims) await getClaims();
        if (onRefresh) await onRefresh();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full p-4 md:p-4"
        >
            <div className="max-w-7xl mx-auto">

                {/* Header */}

                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-md px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            Reimbursement claims
                        </h2>
                        <p className="text-sm text-gray-500">
                            Review and process employee expense claims
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-xl gap-1 text-sm font-medium">
                            {["Pending", "Approved", "Rejected", "All"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setFilterStatus(tab)}
                                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                                        filterStatus === tab
                                            ? "bg-white text-blue-700 shadow-sm font-semibold"
                                            : "text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 border border-amber-200">
                            {pendingCount} Pending
                        </div>
                    </div>
                </motion.div>

                {/* List */}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: .2 }}
                    className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden"
                >
                    {displayedClaims && displayedClaims.length > 0 ? (
                        displayedClaims.map((claim, index) => (
                            <motion.div
                                key={claim._id || claim.id || index}
                                whileHover={{
                                    backgroundColor: "#fafafa",
                                    x: 3,
                                }}
                                transition={{ duration: .2 }}
                                className={`px-6 py-6 cursor-pointer ${
                                    index !== displayedClaims.length - 1
                                        ? "border-b border-gray-200"
                                        : ""
                                }`}
                                onClick={() => {
                                    setSelectedClaim(claim);
                                    setform(true);
                                }}
                            >
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5">

                                    {/* Left */}

                                    <div>

                                        <div className="flex items-center gap-2 flex-wrap">

                                            <ReceiptText
                                                size={22}
                                                className="text-[#123B6B]"
                                            />

                                            <h3 className="text-xl font-bold text-[#123B6B]">
                                                {claim?.claimType}
                                            </h3>

                                            <span className="text-gray-400">—</span>

                                            <span className="text-gray-800 font-semibold">
                                                {claim?.employee_name || employeeMap[claim?.employee_uid || claim?.employeeId]?.name || "Employee"}
                                            </span>

                                            <span className="text-gray-400">—</span>

                                            <span className="text-gray-600 text-sm">
                                                {claim?.description}
                                            </span>

                                        </div>

                                        <p className="mt-2 text-gray-400 text-sm">
                                            Expense Date: {claim?.expenseDate ? new Date(claim.expenseDate).toLocaleDateString("en-GB") : "N/A"}
                                        </p>

                                        {claim?.remarks && (
                                            <p className="mt-1 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 inline-block">
                                                Remarks: {claim.remarks}
                                            </p>
                                        )}

                                    </div>

                                    {/* Right */}

                                    <div className="flex flex-col items-start md:items-end justify-between">

                                        <div className="flex items-center text-[#1d56b3] font-bold text-2xl">
                                            <IndianRupee
                                                size={22}
                                                strokeWidth={2.4}
                                            />
                                            {Number(claim?.amount || 0).toLocaleString('en-IN')}
                                        </div>

                                        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeStyle[claim?.status?.toLowerCase()] || "bg-gray-100 text-gray-700"}`}>
                                            {claim?.status}
                                        </div>

                                    </div>

                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 font-medium">
                            No claims found for "{filterStatus}" status.
                        </div>
                    )}
                </motion.div>

            </div>
            {form && selectedClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25 }}
                        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl p-4 sm:p-6 overflow-y-auto modal-scrollbar"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setform(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
                        >
                            ✕
                        </button>

                        <ReimbursementApproval
                            selectedClaims={selectedClaim}
                            getClaims={getClaims}
                            onClose={()=>setform(false)} />
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}