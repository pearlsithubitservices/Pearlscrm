import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Pencil,
    Save,
    NotebookTabs,
    CheckCircle2,
    Clock,
    User,
    Calendar,
    Activity,
    CheckSquare
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import ETasksOverview from "./ETaskOverview";
import ETaskActivity from "./ETaskActivity";
import ETasksNotes from "./ETaskNotes";
import ETaskDocuments from "./ETaskDocument";
import useTasks from "../../../Hooks/useTaskid";
import useEmployees from "../../../Hooks/useEmployees";
import { apiUrl } from "../../../config/api";

import { useEffect } from "react";
import { socket } from "../../../config/socket";

export default function ETaskDetails() {
    const [activeTab, setActiveTab] = useState("Overview");
    const [isUpdating, setIsUpdating] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    const { tasks, loading, refetch: fetchTasks } = useTasks();
    const { employees } = useEmployees();

    useEffect(() => {
        if (socket) {
            const handleTaskUpdated = () => {
                if (fetchTasks) fetchTasks();
            };
            socket.on("taskUpdated", handleTaskUpdated);
            socket.on("taskActivityAdded", handleTaskUpdated);
            return () => {
                socket.off("taskUpdated", handleTaskUpdated);
                socket.off("taskActivityAdded", handleTaskUpdated);
            };
        }
    }, [fetchTasks]);

    const task = (tasks || []).find(
        (t) => String(t._id || t.id || t.uid) === String(id)
    ) || {};

    const [updateData, setUpdateData] = useState({
        status: "Pending",
        priority: "Cold",
        notes: "",
    });

    const openUpdateModal = () => {
        setUpdateData({
            status: task?.status || "Pending",
            priority: task?.priority || "Cold",
            notes: task?.notes || task?.description || "",
        });
        setIsUpdating(true);
    };

    const handleUpdateChange = (e) => {
        setUpdateData({
            ...updateData,
            [e.target.name]: e.target.value,
        });
    };

    const saveTaskStatus = async () => {
        try {
            const res = await fetch(apiUrl(`/tasks/${id}`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
            });

            if (res.ok) {
                alert("Task status updated successfully!");
                setIsUpdating(false);
                if (fetchTasks) fetchTasks();
            } else {
                alert("Failed to update task status.");
            }
        } catch (err) {
            console.error("Error updating task status:", err);
            alert("Failed to update task status.");
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

    const assignedToName = getPersonName(task?.assignedTo, "Employee");
    const assignedByName = getPersonName(task?.assignedBy || task?.assignedFrom, "Admin");

    const getInitials = (str) => {
        if (!str) return "TS";
        return str
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const tabs = [
        "Overview",
        "Update Progress",
        "Notes",
        "Documents",
    ];

    const renderTab = () => {
        switch (activeTab) {
            case "Overview":
                return <ETasksOverview tasks={task} onRefresh={fetchTasks} />;

            case "Update Progress":
                return <ETaskActivity task={task} onRefresh={fetchTasks} />;

            case "Notes":
                return <ETasksNotes task={task} onRefresh={fetchTasks} />;

            case "Documents":
                return <ETaskDocuments task={task} />;

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f3f0eb] flex items-center justify-center p-6">
                <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
                    <div className="w-5 h-5 border-2 border-[#2563a9] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold text-gray-700">Loading Task Details...</span>
                </div>
            </div>
        );
    }

    const st = (task?.status || "Pending").toLowerCase();
    const pr = (task?.priority || "Medium").toLowerCase();

    return (
        <div className="w-full min-h-screen overflow-y-auto custom-scrollbar bg-[#f3f0eb] p-2 md:p-6 relative pb-12">
            {/* CLOSE BUTTON */}
            <div
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center cursor-pointer hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-xs"
                onClick={() => navigate(-1)}
            >
                <X size={18} />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-xs"
            >
                {/* HEADER */}
                <div className="border-b border-gray-200 bg-white p-5 md:p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                        {/* LEFT DETAILS */}
                        <div className="flex gap-4 items-center">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-[#2563a9] font-bold text-xl border border-blue-200 shrink-0">
                                {getInitials(task?.title || task?.taskName || "Task")}
                            </div>

                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="font-bold text-xl md:text-2xl text-[#082f57]">
                                        {task?.title || task?.taskName || "Task Details"}
                                    </h1>
                                </div>

                                <p className="text-xs text-gray-500 mt-1">
                                    Assigned To: <span className="font-semibold text-blue-700">{assignedToName}</span> • Assigned By: <span className="font-semibold text-purple-700">{assignedByName}</span>
                                </p>

                                {/* ACTION BUTTONS */}
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button
                                        onClick={openUpdateModal}
                                        className="border border-[#2563a9] bg-[#2563a9] text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1d4ed8] transition-all shadow-xs cursor-pointer"
                                    >
                                        <Pencil size={14} />
                                        <span>Update Status</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab("Update Progress")}
                                        className="border border-indigo-200 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-indigo-600 hover:text-white transition-all shadow-xs cursor-pointer"
                                    >
                                        <Activity size={14} />
                                        <span>Update Progress</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab("Notes")}
                                        className="border border-purple-200 bg-purple-50 text-purple-700 px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-600 hover:text-white transition-all shadow-xs cursor-pointer"
                                    >
                                        <NotebookTabs size={14} />
                                        <span>Notes</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT STATUS & PRIORITY */}
                        <div className="flex items-center lg:items-end gap-3 self-end lg:self-auto">
                            <span
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                                    st === "completed"
                                        ? "bg-green-100 text-green-700 border-green-300"
                                        : st === "in progress"
                                        ? "bg-blue-100 text-blue-700 border-blue-300"
                                        : "bg-yellow-100 text-yellow-800 border-yellow-300"
                                }`}
                            >
                                ● {task?.status || "Pending"}
                            </span>

                            <span
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase border ${
                                    pr === "hot" || pr === "high"
                                        ? "bg-red-100 text-red-700 border-red-300"
                                        : pr === "warm" || pr === "medium"
                                        ? "bg-orange-100 text-orange-700 border-orange-300"
                                        : "bg-sky-100 text-sky-700 border-sky-300"
                                }`}
                            >
                                ● {task?.priority || "COLD"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="border-b border-gray-200 bg-gray-50">
                    <div className="flex overflow-x-auto gap-6 px-6 pt-3 custom-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap pb-3 text-xs font-semibold transition cursor-pointer border-b-2 ${
                                    activeTab === tab
                                        ? "text-[#2563a9] border-[#2563a9]"
                                        : "text-gray-500 border-transparent hover:text-gray-700"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TAB CONTENT */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderTab()}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* UPDATE TASK STATUS MODAL */}
            {isUpdating && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg w-full shadow-xl space-y-4"
                    >
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-bold text-[#082f57]">Update Task Status</h2>
                            <button
                                onClick={() => setIsUpdating(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            {/* STATUS */}
                            <div>
                                <label className="font-semibold text-gray-700 block mb-1">Task Status</label>
                                <select
                                    name="status"
                                    value={updateData.status}
                                    onChange={handleUpdateChange}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 outline-none text-gray-800 font-medium cursor-pointer"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            {/* PRIORITY */}
                            <div>
                                <label className="font-semibold text-gray-700 block mb-1">Priority</label>
                                <select
                                    name="priority"
                                    value={updateData.priority}
                                    onChange={handleUpdateChange}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 outline-none text-gray-800 font-medium cursor-pointer"
                                >
                                    <option value="Hot">Hot</option>
                                    <option value="Warm">Warm</option>
                                    <option value="Cold">Cold</option>
                                </select>
                            </div>

                            {/* NOTES / REMARKS */}
                            <div>
                                <label className="font-semibold text-gray-700 block mb-1">Progress Remarks / Notes</label>
                                <textarea
                                    name="notes"
                                    value={updateData.notes}
                                    onChange={handleUpdateChange}
                                    rows="3"
                                    placeholder="Add any update remarks..."
                                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 outline-none text-gray-800 font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setIsUpdating(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 text-xs cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={saveTaskStatus}
                                className="px-5 py-2 rounded-lg bg-[#2563a9] hover:bg-[#1d4ed8] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                                <Save size={14} />
                                <span>Save Update</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}