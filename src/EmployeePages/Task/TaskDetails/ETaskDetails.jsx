import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import ETasksOverview from "./ETaskOverview";
import ETaskActivity from "./ETaskActivity";
import ETasksNotes from "./ETaskNotes";
import ETaskDocuments from "./ETaskDocument";
import useTasks from "../../../Hooks/useTaskid";

export default function ETaskDetails() {
    const [activeTab, setActiveTab] = useState("Overview");
    const { id } = useParams();
    const navigate = useNavigate();

    const { tasks, loading } = useTasks();

    const task = (tasks || []).find(
        (t) => String(t._id || t.id || t.uid) === String(id)
    ) || {};

    const tabs = [
        "Overview",
        "Update Progress",
        "Notes",
        "Documents",
    ];

    const renderTab = () => {
        switch (activeTab) {
            case "Overview":
                return <ETasksOverview tasks={task} />;

            case "Update Progress":
                return <ETaskActivity task={task} />;

            case "Notes":
                return <ETasksNotes task={task} />;

            case "Documents":
                return <ETaskDocuments task={task} />;

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#f3f0eb]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f0eb] p-2 md:p-6 relative overflow-y-auto no-scrollbar">
            <div
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-sm"
                onClick={() => navigate(-1)}
            >
                <X size={20} />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#f3f0eb] rounded-[35px] overflow-hidden"
            >
                {/* HEADER */}
                <div className="border-b bg-[#f3f0eb] p-5 pr-14">
                    <div className="flex flex-col lg:flex-row justify-between gap-5">
                        <div className="flex gap-4">
                            <div>
                                <h1 className="font-bold text-xl text-[#082f57]">
                                    {task?.title || task?.taskName || "Task Details"}
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    {task?.description || task?.notes || "No description provided."}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-start lg:items-end gap-3">
                            <div className="flex gap-3">
                                <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold">
                                    ● {task?.status || "In Progress"}
                                </span>
                                <span className="bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold">
                                    ● {task?.priority || "High"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="border-b bg-white/50">
                    <div className="flex overflow-x-auto justify-around gap-8 p-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap pb-2 font-semibold text-sm transition cursor-pointer ${
                                    activeTab === tab
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTENT */}
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
        </div>
    );
}