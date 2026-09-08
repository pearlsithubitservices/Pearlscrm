import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    MessageSquare,
    FileText,
    Pencil,
    Phone,
    NotebookTabs,
    Icon,
    X,
} from "lucide-react";


import OverviewTab from '../components/LeadDetails/Leadhome';
import { useNavigate, useParams } from "react-router-dom";
import useLead from "../Hooks/useLead";
import TaskOverview from "../components/TaskDetails/TaskOverview";
import TaskActivity from "../components/TaskDetails/TaskAvctivity";
import TaskNotes from "../components/TaskDetails/TaskNotes";
import TaskDocuments from "../components/TaskDetails/TaskDocumentation";
import { apiUrl } from "../config/api";
import { socket } from "../config/socket";
import useEmployees from "../Hooks/useEmployees";

export default function TaskComponents() {
    const [activeTab, setActiveTab] = useState("Overview");
    const [button, setButton] = useState("call");
    const { id } = useParams();
    const { employees } = useEmployees();
    const navigate = useNavigate();

    const { lead, loading } = useLead();
    const [tasks, setTasks] = useState([]);
    
    const TaskById = tasks.filter((item) =>
        item.id === id || item._id === id
    );

    const employeeMap = useMemo(() => {
        return employees.reduce((map, employee) => {
            const name = employee.name || employee.employeeName || employee.displayName || employee.email;
            if (employee._id) map[employee._id] = name;
            if (employee.uid) map[employee.uid] = name;
            if (employee.id) map[employee.id] = name;
            return map;
        }, {});
    }, [employees]);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: "",
        assignedTo: "",
        status: "Pending",
        priority: "Cold",
        dueDate: "",
        description: "",
        notes: "",
    });

    const fetchTasks = async () => {
        try {
            const res = await fetch(apiUrl('/tasks'));
            if (res.ok) {
                const data = await res.json();
                const taskList = (Array.isArray(data) ? data : []).map((doc) => ({
                    id: doc._id || doc.id,
                    _id: doc._id || doc.id,
                    ...doc,
                }));
                setTasks(taskList);
            }
        } catch (err) {
            console.error("Error fetching tasks in TaskComponents:", err);
        }
    };

    useEffect(() => {
        fetchTasks();

        if (socket) {
            const handleTaskUpdated = () => {
                fetchTasks();
            };
            socket.on("taskUpdated", handleTaskUpdated);
            socket.on("taskActivityAdded", handleTaskUpdated);
            return () => {
                socket.off("taskUpdated", handleTaskUpdated);
                socket.off("taskActivityAdded", handleTaskUpdated);
            };
        }
    }, []);

    const openEditModal = () => {
        const current = TaskById[0] || {};
        let assignVal = "";
        if (typeof current.assignedTo === 'object' && current.assignedTo !== null) {
            assignVal = current.assignedTo._id || current.assignedTo.id || current.assignedTo.uid || "";
        } else {
            assignVal = current.assignedTo || "";
        }

        let formattedDate = "";
        if (current.dueDate) {
            const d = new Date(current.dueDate);
            if (!isNaN(d.getTime())) {
                formattedDate = d.toISOString().split('T')[0];
            } else {
                formattedDate = current.dueDate;
            }
        }

        setEditData({
            title: current.title || "",
            assignedTo: assignVal,
            status: current.status || "Pending",
            priority: current.priority || "Cold",
            dueDate: formattedDate,
            description: current.description || "",
            notes: current.notes || "",
        });
        setIsEditing(true);
    };

    const handleEditChange = (e) => {
        setEditData({
            ...editData,
            [e.target.name]: e.target.value,
        });
    };

    const saveTaskUpdate = async () => {
        try {
            const res = await fetch(apiUrl(`/tasks/${id}`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData),
            });

            if (res.ok) {
                alert("Task updated successfully!");
                setIsEditing(false);
                fetchTasks();
            } else {
                alert("Failed to update task.");
            }
        } catch (err) {
            console.error("Error updating task:", err);
            alert("Failed to update task.");
        }
    };

    const tabs = [
        "Overview",
        "Activity",
        "Notes",
        "Documents",
    ];

    const renderTab = () => {
        switch (activeTab) {
            case "Overview":
                return <TaskOverview
                    tasks={TaskById}
                    isEditing={isEditing}
                    editData={editData}
                    handleChange={handleEditChange}
                />;

            case "Activity":
                return <TaskActivity
                    task={TaskById[0]}
                    tasks={TaskById}
                    onRefresh={fetchTasks}
                />;

            case "Notes":
                return <TaskNotes task={TaskById[0]} tasks={TaskById} onRefresh={fetchTasks} />;

            case "Documents":
                return <TaskDocuments task={TaskById[0]} tasks={TaskById} />;

            default:
                return null;
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

        if (employeeMap[strVal]) {
            const matched = employeeMap[strVal];
            if (typeof matched === 'string' && matched) return matched;
            if (typeof matched === 'object' && matched !== null) {
                return matched.name || matched.employeeName || matched.displayName || matched.email || defaultName;
            }
        }

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

    const taskObj = TaskById[0] || {};
    const assignedToName = getPersonName(taskObj.assignedTo, "Unassigned");
    const assignedByName = getPersonName(taskObj.assignedBy || taskObj.assignedFrom, "Admin");

    return (
        <div className="max-h-screen overflow-y-auto bg-[#f3f0eb] p-2 md:p-6 relative">
            <div className="absolute w-25 h-25 text-red-600 top-2 right-2 hover:bg-red-600 hover:text-white
             hover:scale-100 transition-transform duration-200" onClick={() => navigate(-1)}>
                <X size={22} />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#f3f0eb] rounded-[35px] overflow-hidden">

                {/* HEADER */}

                <div className="border-b bg-[#f3f0eb] p-5">

                    <div className="flex flex-col lg:flex-row justify-between gap-5">

                        <div className="flex gap-4">

                            <div>

                                <h1 className="font-bold text-xl text-[#082f57]">
                                    {taskObj.title || taskObj.taskName || "Task Details"}
                                </h1>

                                <p className="text-xs text-gray-600 mt-1">
                                    Assigned To: <span className="font-bold text-blue-700">{assignedToName}</span> • Assigned By: <span className="font-bold text-purple-700">{assignedByName}</span>
                                </p>

                             </div>

                        </div>

                        <div className="flex flex-col items-end gap-4">

                            <div className="flex gap-3">

                                <span className="bg-green-100 text-green-600 px-4 py-1 rounded-full">
                                    {TaskById[0]?.status || "In Progress"}
                                </span>

                                <span className="bg-red-100 text-red-500 px-4 py-1 rounded-full">
                                    {TaskById[0]?.priority || "Hot"}
                                </span>

                            </div>

                            <button
                                onClick={openEditModal}
                                className="border border-[#2563a9] bg-[#2563a9] text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1d4ed8] hover:scale-105 transition-all shadow-xs font-semibold text-xs cursor-pointer">
                                <Pencil size={16} />
                                Edit Task
                            </button>

                        </div>

                    </div>

                </div>

                {/* TABS */}

                <div className="border-b">

                    <div
                        className="flex overflow-x-auto justify-around gap-8 p-4 ">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap pb-2 transition ${activeTab === tab
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-500"
                                    }
                                          `}
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
                        initial={{
                            opacity: 0,
                            y: 20
                        }}
                        animate={{
                            opacity: 1,
                            y: 0
                        }}
                        exit={{
                            opacity: 0,
                            y: -20
                        }}
                        transition={{
                            duration: .3
                        }}
                    >
                        {renderTab()}
                    </motion.div>

                </AnimatePresence>

            </motion.div>

            {/* EDIT TASK MODAL */}
            {isEditing && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-xl space-y-4"
                    >
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-bold text-[#082f57]">Edit Task Details</h2>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* TASK TITLE */}
                            <div className="md:col-span-2">
                                <label className="font-semibold text-gray-700 block mb-1">Task Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editData.title}
                                    onChange={handleEditChange}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 outline-none text-gray-800 font-medium"
                                />
                            </div>

                            {/* ASSIGNED TO */}
                            <div>
                                <label className="font-semibold text-gray-700 block mb-1">Assigned To</label>
                                <select
                                    name="assignedTo"
                                    value={editData.assignedTo}
                                    onChange={handleEditChange}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 outline-none text-gray-800 font-medium cursor-pointer"
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp._id || emp.id || emp.uid} value={emp._id || emp.id || emp.uid}>
                                            {emp.name || emp.employeeName || emp.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* DUE DATE */}
                            <div>
                                <label className="font-semibold text-gray-700 block mb-1">Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={editData.dueDate}
                                    onChange={handleEditChange}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 outline-none text-gray-800 font-medium cursor-pointer"
                                />
                            </div>

                            {/* STATUS */}
                            <div>
                                <label className="font-semibold text-gray-700 block mb-1">Status</label>
                                <select
                                    name="status"
                                    value={editData.status}
                                    onChange={handleEditChange}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 outline-none text-gray-800 font-medium cursor-pointer"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="New">New</option>
                                </select>
                            </div>

                            {/* PRIORITY */}
                            <div>
                                <label className="font-semibold text-gray-700 block mb-1">Priority</label>
                                <select
                                    name="priority"
                                    value={editData.priority}
                                    onChange={handleEditChange}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 outline-none text-gray-800 font-medium cursor-pointer"
                                >
                                    <option value="Hot">Hot</option>
                                    <option value="Warm">Warm</option>
                                    <option value="Cold">Cold</option>
                                </select>
                            </div>

                             {/* TASK DESCRIPTION */}
                            <div className="md:col-span-2">
                                <label className="font-semibold text-gray-700 block mb-1">Task Description</label>
                                <textarea
                                    name="description"
                                    value={editData.description}
                                    onChange={handleEditChange}
                                    rows="3"
                                    placeholder="Enter task description..."
                                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 outline-none text-gray-800 font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 text-xs cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={saveTaskUpdate}
                                className="px-5 py-2 rounded-lg bg-[#2563a9] hover:bg-[#1d4ed8] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

        </div>
    );
}