import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useEmployees from "../../../Hooks/useEmployees";
import { apiUrl } from "../../../config/api";

const ETasksOverview = ({ tasks, onRefresh }) => {
    const { employees } = useEmployees();
    const taskId = tasks?._id || tasks?.id || tasks?.uid;

    const [currentStatus, setCurrentStatus] = useState(tasks?.status || "Pending");
    const [currentPriority, setCurrentPriority] = useState(tasks?.priority || "Cold");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (tasks) {
            setCurrentStatus(tasks.status || "Pending");
            setCurrentPriority(tasks.priority || "Cold");
        }
    }, [tasks]);

    const handleQuickSave = async () => {
        if (!taskId) return;
        setSaving(true);
        try {
            const res = await fetch(apiUrl(`/tasks/${taskId}`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: currentStatus,
                    priority: currentPriority,
                }),
            });

            if (res.ok) {
                alert("Task status & priority updated successfully!");
                if (onRefresh) onRefresh();
            } else {
                alert("Failed to update task status.");
            }
        } catch (err) {
            console.error("Error updating task status:", err);
            alert("Failed to update task status.");
        } finally {
            setSaving(false);
        }
    };

    const getPersonName = (val, defaultName = "Unassigned") => {
        if (!val) return defaultName;
        if (typeof val === 'object' && val !== null) {
            return val.name || val.employeeName || val.displayName || val.email || defaultName;
        }
        const strVal = String(val).trim();
        if (!strVal) return defaultName;
        if (strVal.toLowerCase() === "admin") return "Admin";

        const lowerVal = strVal.toLowerCase();
        const found = (employees || []).find((emp) => {
            if (!emp) return false;
            const eId = String(emp._id || emp.id || emp.uid || "").toLowerCase();
            const eEmail = String(emp.email || "").toLowerCase();
            const eName = String(emp.employeeName || emp.name || emp.displayName || "").toLowerCase();
            return (
                (eId && eId === lowerVal) ||
                (eEmail && eEmail === lowerVal) ||
                (eEmail && lowerVal.includes(eEmail)) ||
                (eName && eName === lowerVal) ||
                (eName && lowerVal.includes(eName))
            );
        });

        if (found) {
            return found.employeeName || found.name || found.displayName || (found.email ? found.email.split("@")[0] : strVal);
        }

        if (strVal.includes("@")) {
            const prefix = strVal.split("@")[0];
            return prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }

        const isRawId = /^[0-9a-fA-F]{24}$/.test(strVal) || /^[A-Za-z0-9_-]{20,}$/.test(strVal);
        if (isRawId) {
            return defaultName;
        }

        return strVal;
    };

    const assignerName = getPersonName(tasks?.assignedBy || tasks?.assignedFrom || tasks?.createdBy, "Admin");
    const assignedToName = getPersonName(tasks?.assignedTo, "Unassigned");

    const formattedDate = (() => {
        if (!tasks?.dueDate) return "No Due Date";
        const d = new Date(tasks.dueDate);
        return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : tasks.dueDate;
    })();

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className=" rounded-xl p-4 "
        >

            <div className="flex flex-col gap-4 ml-4 mt-4">
                <h1 className="font-semibold text-gray-600">TASK TITLE</h1>
                <div className="bg-white rounded-lg w-full p-4 border border-gray-100 shadow-sm">
                    <p className="font-bold text-gray-800 text-lg">{tasks?.title || tasks?.taskName || "No Title"}</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 ml-4 mt-4">
                <h1 className="font-semibold text-gray-600">TASK DESCRIPTION</h1>
                <div className="bg-white rounded-lg w-full p-4 border border-gray-100 shadow-sm">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{tasks?.description || "No description provided."}</p>
                </div>
            </div>

            <div className="mt-6 w-full ml-4">
                <h1 className="text-lg mb-4 font-bold text-[#082f57]">
                    TASK INFORMATION
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

                    {/* Due Date */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-gray-500">
                            DUE DATE
                        </h3>

                        <p className="text-base font-semibold text-gray-800">
                            {formattedDate}
                        </p>
                    </div>

                    {/* Assigned To */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-gray-500">
                            ASSIGNED TO
                        </h3>

                        <p className="text-base font-semibold text-blue-700">
                            {assignedToName}
                        </p>
                    </div>

                    {/* Assigned By */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-gray-500">
                            ASSIGNED BY
                        </h3>

                        <p className="text-base font-semibold text-purple-700">
                            {assignerName}
                        </p>
                    </div>

                </div>

                {/* Quick Update Status & Priority Card */}
                <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-200 mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-wrap gap-6 items-center">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">UPDATE STATUS</label>
                            <select
                                value={currentStatus}
                                onChange={(e) => setCurrentStatus(e.target.value)}
                                className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">UPDATE PRIORITY</label>
                            <select
                                value={currentPriority}
                                onChange={(e) => setCurrentPriority(e.target.value)}
                                className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                            >
                                <option value="Hot">Hot</option>
                                <option value="Warm">Warm</option>
                                <option value="Cold">Cold</option>
                            </select>
                        </div>
                    </div>

                    <button
                        disabled={saving}
                        onClick={handleQuickSave}
                        className="bg-[#2563a9] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Status & Priority"}
                    </button>
                </div>
            </div>
            <div className="mt-4 w-full ml-4">
                <h1>TASK PROCESS</h1>
                <div className="flex flex-col items-start justify-center gap-4 bg-white p-4 rounded-lg">
                    <div>
                        <h3>Task progress 65% complete</h3>
                    </div>
                    <div className="w-[500px] h-2 bg-gray-300 rounded-lg">
                        <div
                            className="h-full bg-blue-500 rounded-lg" style={{ width: '65%' }}></div>
                    </div>
                </div>

            </div>

        </motion.div>
    );
};

export default ETasksOverview;