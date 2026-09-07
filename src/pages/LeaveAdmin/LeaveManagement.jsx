import React from 'react'
import { motion } from 'framer-motion'
import LeaveApprovals from './LeaveTable';
import LeaveCalendar from './LeaveCalendar';
import CompanyHolidays from './CompanyHolidays';
import useLeave from '../../Hooks/useLeave';
import { Bell, Clock10Icon, UserCheck, UserMinus, Users } from 'lucide-react';

const LeaveManagement = () => {
    const { getLeaves, leaves, updateLeaveStatus } = useLeave();

    const pendingLeave = leaves.filter((item) => item.status?.toLowerCase() === "pending");
    const approvedLeave = leaves.filter((item) => item.status?.toLowerCase() === "approved");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const onLeaveToday = approvedLeave.filter((item) => {
        const from = new Date(item.leaveFrom);
        const to = new Date(item.leaveTo);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        return today >= from && today <= to;
    });
    const stats = [
        { icon: Clock10Icon, title: "Pending Request", value: pendingLeave.length },
        { icon: UserMinus, title: "ON Leave Employees", value: onLeaveToday.length },
        { icon: UserCheck, title: "Approved Leave Request", value: approvedLeave.length },
        { icon: Users, title: "Total Leave Requests", value: leaves.length },
    ];


    return (
        <div className="flex max-h-screen overflow-y-auto no-scrollbar bg-[#f3f0eb]">

            {/* MAIN */}
            <div className="flex-1 flex flex-col ">

                {/* TOPBAR */}
                <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold text-[#023167] p-2">
                            Admin Leave Management
                        </h1>
                        <p className="text-sm text-gray-500">
                            Review Requests and oversee  team-wide leave availability.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
                            <Bell size={18} className='text-white' />
                        </button>

                    </div>

                </div>
                <div className="p-4 md:p-6 lg:p-8 bg-[#f3f0eb]">

                    {/* STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        {stats.map((s, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.03 }}
                                className="bg-white p-6 rounded-xl border"
                            >
                                <div className='bg-gray-200  rounded w-8 h-8'>
                                    <s.icon className="w-8 h-8 text-black p-2" />
                                </div>
                                <p className="text-sm text-gray-500">{s.title}</p>
                                <h2 className="text-2xl font-bold text-[#0b2b57]">
                                    {s.value}
                                </h2>
                            </motion.div>
                        ))}

                    </div>
                </div>
                <div className="px-8 pb-8 space-y-8">

                    {/* Leave Table */}
                    <LeaveApprovals
                        leaves={pendingLeave}
                        updateLeaveStatus={updateLeaveStatus} />

                    {/* Bottom Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Calendar */}
                        <div className="xl:col-span-2">
                            <LeaveCalendar
                                leaves={approvedLeave} />
                        </div>

                        {/* Holidays */}
                        <div>
                            <CompanyHolidays />
                        </div>

                    </div>

                </div>

            </div></div>
    )
}

export default LeaveManagement