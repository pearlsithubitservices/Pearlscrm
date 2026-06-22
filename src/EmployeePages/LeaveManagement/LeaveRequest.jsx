import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useLeave from "../../Hooks/useLeave";
import { useAuth } from "../../context/AuthContext";

const LeaveRequest = ({ formDetails, onEdit, onCancel }) => {
    const { getLeaves, getLeavesByEmployee, leavesbyId, leaves, updateLeaveStatus } = useLeave();

    const { user } = useAuth();
    console.log(user.uid);
    const handleApprove = async (id) => {

        try {
            const res = await updateLeaveStatus(id, "Approved");
            console.log("Leave ID:", id);
            if (res.success) {
                console.log("Leave approved");

                // 🔥 refresh data manually
                getLeaves();
            }
        } catch (err) {
            console.log(err);
        }
    };


    const currentUser = leaves.filter((item) => (item.employeeId == user.uid));
    console.log(currentUser)
    const approvedleaves = currentUser?.filter((item) => (item.status?.toLowerCase() == "pending"));
    console.log(approvedleaves);
    const latestRequest = Array.isArray(approvedleaves) && approvedleaves.length > 0
        ? approvedleaves[0]
        : {
        };

    const pendingCount = approvedleaves.length > 0 ? approvedleaves.length : '1';


    const handleEdit = () => {
        onEdit(latestRequest);

    };

    const handleCancel = () => {
        if (onCancel && latestRequest._id) {
            onCancel(latestRequest._id);
        }
    };

    const calculateLeaveDays = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const diffTime = end - start;

        const diffDays =
            Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return diffDays;
    };
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl border border-black/10 p-6"
        >
            {/* Header */}

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-[#0B2B57]">
                    Requests
                </h2>

                <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {pendingCount} PENDING
                </span>
            </div>

            {/* Request List */}

            <div className="space-y-4">
                <motion.div
                    key={latestRequest._id || latestRequest.empId || 0}
                    whileHover={{ y: -2 }}
                    className="border border-gray-200 rounded-2xl p-5"
                >
                    <div className="flex items-start gap-3">
                        {/* Status Dot */}

                        <div className="w-2.5 h-2.5 rounded-full bg-[#2F6CC5] mt-2" />

                        <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="font-bold text-lg text-[#0B2B57]">
                                    {latestRequest.leaveTitle || "No Leave"}
                                </h3>

                            </div>

                            <p className="text-gray-500 text-sm mt-1">
                                {approvedleaves?.length > 0 ? (
                                    <>
                                        {new Date(latestRequest.leaveFrom).toLocaleDateString("en-GB")} -{" "}
                                        {new Date(latestRequest.leaveTo).toLocaleDateString("en-GB")} (
                                        {calculateLeaveDays(
                                            latestRequest.leaveFrom,
                                            latestRequest.leaveTo
                                        )}{" "}
                                        days)
                                    </>
                                ) : (
                                    "No approved leaves"
                                )}
                            </p>

                            {/* Actions */}

                            <div className="flex gap-3 mt-5">
                                <button
                                    onClick={handleEdit}
                                    className="bg-[#2F6CC5] hover:bg-[#2458a8] text-white px-5 py-2 rounded-full text-sm font-medium transition"
                                    disabled={approvedleaves.length === 0}
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={handleCancel}
                                    className="border border-gray-300 hover:bg-gray-50 px-5 py-2 rounded-full text-sm font-medium text-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleApprove(latestRequest._id)}
                                    className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-700"
                                    disabled={!latestRequest._id}
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LeaveRequest;