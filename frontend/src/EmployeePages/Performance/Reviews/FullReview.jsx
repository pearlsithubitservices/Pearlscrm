import React from "react";
import { motion } from "framer-motion";
import {
    Star,
    X,
} from "lucide-react";
const colors = [
    "bg-fuchsia-600",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-orange-500",
    "bg-blue-500",
];

export default function FullReview({ onClose, selectedreview }) {
    console.log(selectedreview);
    const percentage = Math.round((selectedreview.overallRating / 5) * 100);
    console.log(percentage);


    return (
        <div className="relative max-h-screen overflow-y-auto no-scrollbar
     bg-[#F4F1EB] p-8 flex ">
            <X size={20} className="absolute top-4 right-3 rounded-xl bg-red-500 text-white" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className=" w-full max-w-[760px] space-y-6"
            >
                {/* Employee Card */}
                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-2xl border border-gray-300 shadow-sm px-5 py-5"
                >
                    <div className="flex items-center justify-between">
                        {/* Left */}
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-blue-400 w-16 h-16 flex items-center justify-center text-white text-2xl font-bold">
                                {selectedreview.employeeName?.charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <h2 className="text-[24px] font-bold text-[#14365D] leading-none  ">
                                    {selectedreview.employeeName}
                                </h2>

                                <p className="text-[13px] text-gray-400 mt-1">
                                    {selectedreview.employeeDesignation}
                                </p>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2  ">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={28}
                                        className="text-[#5B8DEF]"
                                        fill={
                                            star <= Math.floor(selectedreview.overallRating)
                                                ? "#5B8DEF"
                                                : "transparent"
                                        }
                                    />
                                ))}
                            </div>

                            <span className="text-[18px] font-semibold text-[#5B86E5]">
                                {selectedreview.overallRating}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Review Title */}
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[24px] font-medium text-[#12385E]">
                        Meets Expectations — Annual Review
                    </h3>

                    <span className="text-[18px] text-gray-400">
                        {new Date(selectedreview.reviewDate).toLocaleDateString('en-GB')}
                    </span>
                </div>

                {/* Performance Metrics */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-gray-300 shadow-sm p-5"
                >
                    <h2 className="text-[22px] font-semibold text-black mb-7">
                        Performance metrics
                    </h2>

                    <div className="space-y-7">
                        {selectedreview.metrics.map((metric, index) => (
                            <div key={metric.title}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[18px] text-[#12385E] font-medium">
                                        {metric.title}
                                    </span>

                                    <span className="text-[18px] text-gray-800 font-semibold mr-4">
                                        {metric.score}
                                    </span>
                                </div>

                                <div className="w-full h-3 bg-[#E2E8F3] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.round((Number(metric.score) / 5) * 100)}%`, }}
                                        transition={{
                                            duration: 0.8,
                                            delay: index * 0.15,
                                        }}
                                        className={`h-full rounded-full ${colors[index % colors.length]}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Feedback */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl border border-gray-300 shadow-sm p-5 mb-4"
                >
                    <h2 className="text-[22px] font-medium text-black mb-4 ">
                        Feedback
                    </h2>

                    <p className="text-[18px] leading-8 text-[#173A5E] ">
                        {selectedreview.feedback}
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}