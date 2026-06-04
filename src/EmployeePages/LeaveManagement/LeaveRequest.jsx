import React from "react";
import { motion } from "framer-motion";

const LeaveRequest = ({ formDetails, onEdit, onCancel }) => {
    const latestRequest = Array.isArray(formDetails) && formDetails.length > 0
        ? formDetails[0]
        : {
            id: 1,
            leaveTitle: "Family Wedding",
            leaveFrom: "Sep 22",
            leaveTo: "Sep 25",
            status: "Pending",
        };

    const pendingCount = formDetails.length > 0 ? formDetails.length : '1';

    const handleEdit = () => {
        onEdit(latestRequest);
    };

    const handleCancel = () => {
        if (onCancel && latestRequest.id) {
            onCancel(latestRequest.id);
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
                    key={latestRequest.id || latestRequest.empId || 0}
                    whileHover={{ y: -2 }}
                    className="border border-gray-200 rounded-2xl p-5"
                >
                    <div className="flex items-start gap-3">
                        {/* Status Dot */}

                        <div className="w-2.5 h-2.5 rounded-full bg-[#2F6CC5] mt-2" />

                        <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="font-bold text-lg text-[#0B2B57]">
                                    {latestRequest.leaveTitle}
                                </h3>
                                
                            </div>

                            <p className="text-gray-500 text-sm mt-1">
                                {latestRequest.leaveFrom} - {latestRequest.leaveTo} ({calculateLeaveDays(
                                    latestRequest.leaveFrom,
                                    latestRequest.leaveTo
                                )} days)
                            </p>

                            {/* Actions */}

                            <div className="flex gap-3 mt-5">
                                <button
                                    onClick={handleEdit}
                                    className="bg-[#2F6CC5] hover:bg-[#2458a8] text-white px-5 py-2 rounded-full text-sm font-medium transition"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={handleCancel}
                                    className="border border-gray-300 hover:bg-gray-50 px-5 py-2 rounded-full text-sm font-medium text-gray-700 transition"
                                >
                                    Cancel
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