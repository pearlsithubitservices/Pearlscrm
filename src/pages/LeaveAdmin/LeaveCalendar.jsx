import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const employees = [
    {
        id: 1,
        name: "Suhail",
        role: "Front end developer",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        date: "Aug 12 - Aug 13, 2024",
        days: "1 Day",
    },
    {
        id: 2,
        name: "Abu",
        role: "UI Designer",
        image: "https://randomuser.me/api/portraits/men/45.jpg",
        date: "Aug 12 - Aug 13, 2024",
        days: "1 Day",
    },
    {
        id: 3,
        name: "Zara",
        role: "Marketing",
        image: "https://randomuser.me/api/portraits/women/65.jpg",
        date: "Aug 12 - Aug 13, 2024",
        days: "1 Day",
    },
];

export default function LeaveCalendar({ leaves }) {


    const { user } = useAuth();
    console.log(user.uid)
    const otherLeaves = leaves.filter(
        (item) => item.employeeId !== user.uid
    );
    console.log(otherLeaves)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const otherLeavesFromToday = otherLeaves.filter((item) => {
        const from = new Date(item.leaveFrom);
        from.setHours(0, 0, 0, 0);

        return from >= today;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 w-full max-w-3xl h-[420px]  overflow-y-auto no-scrollbar"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-black">
                    Employee leave calendar
                </h1>

                <button className="text-blue-600 font-semibold hover:underline">
                    View All
                </button>
            </div>

            {/* Employee List */}
            <div className="divide-y divide-gray-200">
                {otherLeavesFromToday.length > 0 ? otherLeavesFromToday?.map((emp, index) => (
                    <motion.div
                        key={emp.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="flex items-center justify-between py-5"
                    >
                        {/* Left */}
                        <div className="flex items-center gap-4">
                            {emp?.employeeName.charAt(0).toUpperCase()}

                            <div>
                                <h2 className="text-2xl font-bold text-[#0B2B57]">
                                    {emp?.employeeName}
                                </h2>

                                <p className="text-gray-400 text-xl">
                                    {emp?.role || "Employee"}
                                </p>
                            </div>
                        </div>

                        {/* Right */}
                        <div className="text-right">
                            <p className="text-gray-700 text-sm">
                                {emp.date}
                            </p>

                            <p className="text-blue-600 font-semibold text-xl mt-2">
                                {emp.days}
                            </p>
                        </div>
                    </motion.div>
                ))
            :
            <div className="flex items-center justify-center py-10">
                <p> No One Leave Today</p>
                    </div>}
            </div>
        </motion.div>
    );
}