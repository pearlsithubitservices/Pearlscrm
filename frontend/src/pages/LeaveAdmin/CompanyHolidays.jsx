import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, SquarePen } from "lucide-react";
import useLeave from "../../Hooks/useLeave";
import HolidayForm from "./HolidayForm";

export default function CompanyHolidays() {
    const { getHolidays, holidays, addHoliday, updateHoliday, deleteHoliday } = useLeave();

    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        getHolidays();
    }, []);
    console.log(holidays)

    const handleEdit = (holiday) => {
        setEditData(holiday);
        setOpen(true);
    };

    const handleDelete = async (id) => {
        const confirm = window.confirm("Are you sure you want to delete this holiday?");
        if (!confirm) return;

        const res = await deleteHoliday(id);

        if (res.success) {
            alert("Holiday deleted");
        } else {
            alert(res.error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-y-auto no-scrollbar"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-[18px] font-bold text-black">
                    Company holidays
                </h1>

                <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#EEF2F7] text-gray-600 hover:bg-[#E5EAF2] transition"
                    onClick={() => setOpen(true)}>
                    <SquarePen size={18} />
                    <span className="font-medium">Add</span>
                </button>
            </div>

            {/* Holiday List */}
            <div className="divide-y">
                {holidays?.map((holiday, index) => (
                    <motion.div
                        key={holiday._id || index}
                        initial={{ opacity: 0, x: -25 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.12 }}
                        className="flex items-center justify-between py-6"
                    >
                        <h2 className="text-[14px] font-bold text-[#0B2B57]">
                            {holiday.holidayName}
                        </h2>

                        <div className="flex items-center gap-6">
                            <p className="text-md text-gray-600">
                                {new Date(holiday.holidayDate).toLocaleDateString("en-US", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(holiday)}
                                    className="w-9 h-9 rounded bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition"
                                >
                                    <Pencil size={16} className="text-blue-600" />
                                </button>

                                <button
                                    onClick={() => handleDelete(holiday._id)}
                                    className="w-9 h-9 rounded bg-red-100 flex items-center justify-center hover:bg-red-200 transition"
                                >
                                    <Trash2 size={16} className="text-red-500" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <HolidayForm
                        onClose={() => {
                            setOpen(false);
                            setEditData(null);
                        }}
                        editData={editData}
                        getholidays={getHolidays}
                        updateHoliday={updateHoliday}
                        addHoliday={addHoliday}
                    />
                </div>
            )}
        </motion.div>
    );
}