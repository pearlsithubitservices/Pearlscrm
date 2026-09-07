import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmployees from "../../Hooks/useEmployees";
import ApprovalForm from "./ApprovalForm";
// import LeavePagination from "../components/LeavePagination";

export default function LeaveApprovals({ leaves, updateLeaveStatus }) {

    const { employees } = useEmployees();
    const [openForm, setOpenForm] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);



    const handleApprove = async (id) => {
        const res = await updateLeaveStatus(id, "Approved");

        if (res.success) {
            alert("Leave Approved");
            setOpenForm(false)
        } else {
            alert(res.error);
        }
    };


    const handleDecline = async (id) => {
        const res = await updateLeaveStatus(id, "Rejected");

        if (res.success) {
            alert("Leave Rejected");
            setOpenForm(false)
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f1ea] p-2">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow border border-gray-200 px-6 py-5 flex items-center justify-between"
            >
                <h1 className="text-[28px] font-bold text-black">
                    Employee Pending Approvals
                </h1>

                <div className="bg-gray-100 rounded-full px-5 py-2 text-gray-500 font-semibold">
                    {leaves.length} Pending
                </div>
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-8 bg-white rounded-2xl shadow border border-gray-200 p-6 mb-8"
            >
                <div className="overflow-x-auto rounded-xl border border-gray-300 ">
                    <table className="w-full border-collapse">
                        <thead className="bg-[#fafafa]">
                            <tr>
                                {[
                                    "EMP NAME",
                                    "EMP ID",
                                    "DEPARTMENT",
                                    "LEAVE TYPE",
                                    "DATE",
                                    "ACTION",
                                ].map((head) => (
                                    <th
                                        key={head}
                                        className="border border-gray-300 py-5 px-4 text-[#173B63] font-bold text-lg text-center"
                                    >
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {leaves?.map((item) => (
                                <motion.tr
                                    key={item._id}
                                    whileHover={{ backgroundColor: "#fafafa" }}
                                    className="border border-gray-300 mb-8"
                                >
                                    <td className="border border-gray-300 py-6 px-4 font-bold text-lg text-center">
                                        {item?.employeeName || "No Employee"}
                                    </td>

                                    <td className="border border-gray-300 py-6 px-4 text-center">
                                        {item?.employeeId || "Not available"}
                                    </td>

                                    <td className="border border-gray-300 py-6 px-4 text-center">
                                        {item?.department || employees.find((emp) => String(emp.uid || emp.id || emp._id) === String(item.employeeId))?.role || "General"}
                                    </td>

                                    <td className="border border-gray-300 py-6 px-4 text-center">
                                        {item?.leaveType || "Leave"}
                                    </td>

                                    <td className="border border-gray-300 py-6 px-4 text-center">
                                        {new Date(item.leaveFrom).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}{" "}
                                        -{" "}
                                        {new Date(item.leaveTo).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </td>

                                    <td className="border border-gray-300 py-6 px-2">
                                        <div className="flex justify-center gap-5">
                                            <button
                                                onClick={() => {
                                                    setSelectedLeave(item);
                                                    setOpenForm(true);
                                                }}
                                                className="w-28 h-10 rounded-xl border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
                                            >
                                                Decline
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSelectedLeave(item);
                                                    setOpenForm(true);
                                                }}
                                                className="w-28 h-10 rounded-xl bg-green-100 text-green-600 hover:bg-green-500 hover:text-white transition"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Uncomment after creating/importing */}
                {/* <LeavePagination /> */}
            </motion.div>


            <AnimatePresence>
                {openForm && selectedLeave && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => {
                                setOpenForm(false);
                                setSelectedLeave(null);
                            }}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        />

                        {/* Popup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 30 }}
                            transition={{
                                duration: 0.3,
                                ease: "easeOut",
                            }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-6"
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-2xl h-[500px] "
                            >
                                <ApprovalForm
                                    leave={selectedLeave}
                                    onApprove={handleApprove}
                                    onDecline={handleDecline}
                                    onClose={() => {
                                        setOpenForm(false);
                                        setSelectedLeave(null);
                                    }}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}