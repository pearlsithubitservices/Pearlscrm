import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, User, Building2, FileText, X } from "lucide-react";
import useEmployees from "../../Hooks/useEmployees";

export default function ApprovalForm({
    leave,
    onApprove,
    onDecline,
    onClose,
}) {

    const { employees } = useEmployees();
    //GETTING EMPLOYEES NAME
    const employeeMap = useMemo(() => {
        return employees.reduce((map, employee) => {
            map[employee.uid] = employee.name;
            return map;
        }, {});
    }, [employees]);
    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className=" relative max-w-xl h-[500px] overflow-y-auto no-scrollbar  rounded-3xl border border-gray-300 bg-[#F4F1EA] shadow-xl p-10"
        >
            {/* Heading */}
            <h1 className="text-3xl font-bold text-[#0B2B57] mb-5">
                Pending Approvals
            </h1>
            <X className="absolute  top-2 right-2 text-red-600 cursor-pointer" onClick={onClose} />

            {/* Form */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">

                {/* Employee Name */}
                <div>
                    <label className="text-gray-500 uppercase tracking-widest font-bold text-sm mb-2 block">
                        Employee Name
                    </label>

                    <div className="flex items-center gap-3 h-14 rounded-2xl bg-white border border-gray-200 px-5">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-[#12345B] text-md font-medium">
                            {leave?.employeeName}
                        </span>
                    </div>
                </div>

                {/* Employee ID */}
                <div>
                    <label className="text-gray-500 uppercase tracking-widest font-bold text-sm mb-2 block">
                        Employee ID
                    </label>

                    <div className="h-14 rounded-2xl bg-white border border-gray-200 flex items-center px-5">
                        <span className="text-[#12345B] text-md">
                            {leave.employeeId}
                        </span>
                    </div>
                </div>

                {/* Department */}
                <div>
                    <label className="text-gray-500 uppercase tracking-widest font-bold text-sm mb-2 block">
                        Department
                    </label>

                    <div className="flex items-center gap-3 h-14 rounded-2xl bg-white border border-gray-200 px-5">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <span className="text-[#12345B] text-xl">
                            {leave.department}
                        </span>
                    </div>
                </div>

                {/* Leave Type */}
                <div>
                    <label className="text-gray-500 uppercase tracking-widest font-bold text-sm mb-2 block">
                        Leave Type
                    </label>

                    <div className="h-14 rounded-2xl bg-white border border-gray-200 flex items-center px-5">
                        <span className="text-[#12345B] text-xl">
                            {leave.leaveType}
                        </span>
                    </div>
                </div>

                {/* Start Date */}
                <div>
                    <label className="text-gray-500 uppercase tracking-widest font-bold text-sm mb-2 block">
                        Start Date
                    </label>

                    <div className="flex items-center gap-3 h-14 rounded-2xl bg-white border border-gray-200 px-5">
                        <CalendarDays className="w-5 h-5 text-gray-400" />
                        <span className="text-[#12345B] text-xl">
                            {leave.leaveFrom}
                        </span>
                    </div>
                </div>

                {/* End Date */}
                <div>
                    <label className="text-gray-500 uppercase tracking-widest font-bold text-sm mb-2 block">
                        End Date
                    </label>

                    <div className="flex items-center gap-3 h-14 rounded-2xl bg-white border border-gray-200 px-5">
                        <CalendarDays className="w-5 h-5 text-gray-400" />
                        <span className="text-[#12345B] text-xl">
                            {leave.leaveTo}
                        </span>
                    </div>
                </div>

            </div>

            {/* Leave Summary */}
            <div className="mt-8">
                <label className="text-gray-500 uppercase tracking-widest font-bold text-sm mb-2 block">
                    Leave Summary
                </label>

                <div className="bg-white  border border-gray-200 rounded-2xl p-5 min-h-[140px]">
                    <div className="flex gap-3 ">
                        <FileText className="mt-1 text-gray-400" />
                        <p className="text-[#12345B] text-xl leading-8">
                            {leave.leaveReason}
                        </p>
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-10 mt-10">

                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onDecline(leave._id)}
                    className="h-16 rounded-2xl border border-red-500 text-red-500 text-xl font-semibold hover:bg-red-500 hover:text-white transition"
                >
                    Decline
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onApprove(leave._id)}
                    className="h-16 rounded-2xl bg-green-200 text-green-800 text-xl font-semibold hover:bg-green-500 hover:text-white transition"
                >
                    Approve
                </motion.button>

            </div>
        </motion.div>
    );
}