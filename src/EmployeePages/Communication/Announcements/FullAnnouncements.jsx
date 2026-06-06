import React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, X } from "lucide-react";

export default function FullAnnouncements({onClose}) {
    return (
        <div className="relative max-h-screen bg-[#f3f0ea] flex justify-center p-6 rounded-xl">
            <div className=" w-full max-w-md  space-y-5">
                <X  size={20} className="absolute top-3 cursor-pointer right-3 bg-red-500 text-white hover:scale-105 transition-transform duration-150 rounded"
                onClick={()=>onClose()}
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
                            src="https://i.pravatar.cc/100?img=12"
                            alt="avatar"
                            className="w-12 h-12 rounded-full object-cover"
                        />

                        <div>
                            <h3 className="font-semibold text-gray-900">
                                Sarah Jenkins
                            </h3>
                            <p className="text-sm text-gray-500">HR Director</p>
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-medium">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        High Priority
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-semibold text-[#0b2f4a]"
                >
                    Town Hall — Q2 2026
                </motion.h1>

                {/* Main Content Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-sm border p-6 text-gray-600 leading-relaxed"
                >
                    <p className="mb-4">Dear Team,</p>

                    <p className="mb-4">
                        We are hosting our quarterly All-Hands Town Hall on June 15, 2026 at
                        3:00 PM IST via Google Meet. The CEO will share company performance,
                        roadmap updates, and open the floor for Q&A.
                    </p>

                    <p>
                        Please block your calendars and submit questions in advance via the
                        Google Form linked below.
                    </p>
                </motion.div>

            </div>
        </div>
    );
}