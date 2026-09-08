// EnrollmentModal.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    ChevronDown,
    X,
} from "lucide-react";
import useEnrollment from "../../../Hooks/useEnrollment";
import { useAuth } from '../../../context/AuthContext';

export default function EnrollmentModal({
    isOpen,
    onClose,
    data,
}) {
    if (!isOpen) return null;
    const { user } = useAuth();
    const { createEnrollment } = useEnrollment();
    const [loading, setLoading] = useState(false);

    const handleEnroll = async () => {
        if (!user?.uid) {
            alert("User authentication required");
            return;
        }
        setLoading(true);
        try {
            const courseId = data?.id || data?._id;
            const res = await createEnrollment({
                employee_uid: user.uid,
                courseId: courseId,
            });

            console.log("Enrolled successfully:", res);
            alert("Enrolled successfully!");
            if (onClose) onClose();
        } catch (error) {
            console.error(error);
            alert(error.message || "Failed to enroll");
        } finally {
            setLoading(false);
        }
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40  backdrop-blur-sm p-2 "
                    />

                    {/* Modal */}
                    {/* Modal */}
                    <div className="fixed inset-0 z-50 pointer-events-none">
                        <div className="absolute top-24 right-10 pointer-events-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="relative w-[400px] max-h-[450px] overflow-y-auto no-scrollbar rounded-3xl bg-[#F1EEE8] border border-black/5 shadow-2xl"
                            >
                                {/* Close */}
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 rounded-full p-1 hover:bg-black/5 transition"
                                >
                                    <X size={18} className="text-gray-500" />
                                </button>

                                <div className="p-5">
                                    {/* Heading */}
                                    <h2 className="text-xl font-bold text-[#0B2B57] pr-8">
                                        Enroll — {data.title}
                                    </h2>

                                    {/* Banner */}
                                    <div className="mt-4 overflow-hidden rounded-2xl">
                                        <img
                                            src={data.src}
                                            alt="AWS"
                                            className="h-[90px] w-full object-cover"
                                        />
                                    </div>

                                    {/* Form */}
                                    <div className="mt-5 space-y-3">
                                        {/* Course Title */}
                                        <div>
                                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[1.5px] text-[#979797]">
                                                Course Title
                                            </label>

                                            <input
                                                value={data.title}
                                                readOnly
                                                className="h-10 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#173A63] outline-none"
                                            />
                                        </div>

                                        {/* Provider + Duration */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-[1.5px] text-[#979797]">
                                                    Provider
                                                </label>

                                                <input
                                                    value={data.provider}
                                                    readOnly
                                                    className="h-10 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#173A63]"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-[1.5px] text-[#979797]">
                                                    Duration
                                                </label>

                                                <input
                                                    value={data.time}
                                                    readOnly
                                                    className="h-10 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#173A63]"
                                                />
                                            </div>
                                        </div>

                                        {/* Level + Start Date */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-[1.5px] text-[#979797]">
                                                    Level
                                                </label>

                                                <input
                                                    value={data.level}
                                                    readOnly
                                                    className="h-10 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#173A63]"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-[1.5px] text-[#979797]">
                                                    Start Date
                                                </label>

                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        className="h-10 w-full rounded-xl border border-black/10 bg-white px-4 pr-10 text-sm text-[#173A63] outline-none"
                                                    />


                                                </div>
                                            </div>
                                        </div>

                                        {/* Link to Goal */}
                                        <div className="max-w-[180px]">
                                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[1.5px] text-[#979797]">
                                                Link To Goal
                                            </label>

                                            <div className="relative">
                                                <select className="h-10 w-full appearance-none rounded-xl border border-black/10 bg-white px-4 text-sm text-gray-500 outline-none">
                                                    <option>Yes</option>
                                                    <option>No</option>
                                                </select>

                                                <ChevronDown
                                                    size={16}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Alert */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="mt-3 rounded-xl bg-[#F7D3C7] px-4 py-2 text-center text-xs font-medium text-[#E25B3E]"
                                        >
                                            This course will be reimbursed from your L&amp;D budget
                                            (₹6,800 remaining)
                                        </motion.div>

                                        {/* Footer */}
                                        <div className="mt-5 flex gap-3">
                                            <button
                                                onClick={onClose}
                                                className="h-10 w-24 rounded-xl border border-black/20 bg-white text-sm text-gray-500 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>

                                            <button 
                                                className="h-10 flex-1 rounded-xl bg-[#2565A8] text-sm font-semibold text-white hover:bg-[#1F5B99] disabled:opacity-50"
                                                onClick={handleEnroll}
                                                disabled={loading}
                                            >
                                                {loading ? "Enrolling..." : "Confirm Enrollment"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}