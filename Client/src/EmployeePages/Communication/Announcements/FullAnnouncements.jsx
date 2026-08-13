import React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, X } from "lucide-react";

export default function FullAnnouncements({ onClose, selectedAnnouncements }) {
    if (!selectedAnnouncements) return null;
    console.log(selectedAnnouncements);
    return (
        <div className="relative max-h-screen h-full bg-[#f3f0ea] flex justify-center p-6 rounded-xl w-full max-w-[500px]">
            <div className=" w-full max-w-md  space-y-5">
                <X size={20} className="absolute top-3 cursor-pointer right-3 bg-red-500 text-white hover:scale-105 transition-transform duration-150 rounded"
                    onClick={() => onClose()}
                />
                {/* Top Card - User Info */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border p-4 flex items-center justify-between"
                >

                    {/* Left */}
                    <div className="flex items-center gap-4">
                        <img
                            src={"https://i.pravatar.cc/100?img=12"}
                            alt="avatar"
                            className="w-12 h-12 rounded-full object-cover"
                        />

                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {selectedAnnouncements.author.toUpperCase() || "Deepan"}
                            </h3>
                            <p className="text-sm text-gray-500">{selectedAnnouncements.role}</p>
                        </div>
                    </div>

                    {/* Badge */}
                    <div className={`flex items-center gap-1  ${selectedAnnouncements.priority?.toLowerCase() == "high" ? " bg-red-300 text-red-700" : selectedAnnouncements.priority?.toLowerCase() == "med" ? "bg-yellow-200 text-yellow-700" : "bg-green-300 text-green-700"} px-3 py-1 rounded-full text-xs font-medium`}>
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {selectedAnnouncements.priority}
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-semibold text-[#0b2f4a]"
                >
                    {selectedAnnouncements.title}
                </motion.h1>

                {/* Main Content Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white overflow-y-auto max-h-[300px] h-full rounded-2xl shadow-sm border p-6 text-gray-600 leading-relaxed"
                >
                    <p className="mb-4">Dear Team,</p>

                    <p className="mb-4">
                        {selectedAnnouncements.description}
                    </p>

                    
                </motion.div>

            </div>
        </div>
    );
}