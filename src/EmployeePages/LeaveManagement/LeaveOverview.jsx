import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, FilePenLine } from "lucide-react";
import LeaveForm from "./LeaveForm";

const LeaveOverview = ({ onApplyLeave, setFormDetails, setEditingRequest, editingRequest }) => {
    const today = new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const [leaveform, setLeaveform] = useState(false);

    const handleCloseForm = () => {
        setLeaveform(false);
        setEditingRequest(null);
    };

    // Show form if editing request or if leaveform is true
    const showForm = leaveform || editingRequest;

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-b px-6 md:px-8 py-6 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#0B2B57]">
                        Leave Management
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Oversee your time-off entitlements and team availability.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-11 h-11 rounded-xl bg-[#1F66B2] text-white flex items-center justify-center"
                >
                    <Bell size={20} />
                </motion.button>
            </motion.div>

            {/* Time Off Overview Card */}
            <div className="px-4">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#0B2B57]">
                            Time Off Overview
                        </h2>

                        <p className="text-gray-400 mt-1">
                            Today, {today}
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={()=>setLeaveform(true)}
                        className="bg-[#EEF2F7] hover:bg-[#E4EAF3] transition-colors px-6 py-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-[#4B5563]"
                
                    >
                        <FilePenLine size={18} />
                        Apply for Leave
                    </motion.button>
                </motion.div>
            </div>
            {/**Leave Form */}
            
                {showForm && (
                    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto  no-scrollbar">
                    <LeaveForm
                    onSave={setFormDetails}
                    editingRequest={editingRequest}
                    onEdit={setFormDetails}
                    onClose={handleCloseForm}
                    />
                </div>
                )}
            

        </div>
    );
};

export default LeaveOverview;