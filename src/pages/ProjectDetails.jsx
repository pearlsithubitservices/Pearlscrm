import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Pencil,
    CheckCircle2,
    Flame,
    X
} from "lucide-react";
import ClientOverview from '../components/ProjectDetails/ProjectOverview.jsx'
import ClientMilestone from '../components/ProjectDetails/ProjectMilestone.jsx'
import ClientNotes from '../components/ProjectDetails/ProjectNotes.jsx'
import ClientTeam from '../components/ProjectDetails/ProjectTeam.jsx'
import ClientActivity from '../components/ProjectDetails/ProjectActivity.jsx'
import ProjectTasks from '../components/ProjectDetails/ProjectTasks.jsx'
import ProjectDocuments from '../components/ProjectDetails/ProjectDocuments.jsx'
import { useNavigate, useParams } from "react-router-dom";
import useEmployees from "../Hooks/useEmployees.js";

import { apiUrl } from "../config/api.js";
import { socket } from "../config/socket.js";

export default function ClientDetails({ tasks }) {
    const [activeTab, setActiveTab] = useState("Overview");
    const navigate = useNavigate();
    const { id } = useParams();
    const { employees } = useEmployees();
    const [projects, setProjects] = useState([]);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editData, setEditData] = useState({
        title: "",
        company: "",
        companylocation: "",
        status: "",
        priority: "",
        progress: 0,
        description: "",
        dueDate: "",
        budget: "",
    });

    const fetchProjects = async () => {
        try {
            const res = await fetch(apiUrl('/projects'));
            if (!res.ok) throw new Error("Failed to fetch projects");
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching project details:", error);
        }
    };

    useEffect(() => {
        fetchProjects();

        if (socket) {
            const handleSync = () => fetchProjects();
            socket.on("projectUpdated", handleSync);
            socket.on("taskUpdated", handleSync);
            socket.on("taskCreated", handleSync);
            return () => {
                socket.off("projectUpdated", handleSync);
                socket.off("taskUpdated", handleSync);
                socket.off("taskCreated", handleSync);
            };
        }
    }, [id]);

    const projectById = useMemo(() => {
        return projects.filter((item) => String(item._id || item.id) === String(id));
    }, [projects, id]);

    const currentProject = projectById[0] || {};

    const handleOpenEdit = () => {
        if (!currentProject) return;
        setEditData({
            title: currentProject.title || "",
            company: currentProject.company || "",
            companylocation: currentProject.companylocation || "",
            status: currentProject.status || "In Progress",
            priority: currentProject.priority || "Medium",
            progress: currentProject.progress || 0,
            description: currentProject.description || "",
            dueDate: currentProject.dueDate ? currentProject.dueDate.split("T")[0] : "",
            budget: currentProject.budget || "",
        });
        setIsEditOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            const res = await fetch(apiUrl(`/projects/${id}`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData),
            });

            if (res.ok) {
                alert("Project updated successfully!");
                setIsEditOpen(false);
                fetchProjects();
            } else {
                alert("Failed to update project");
            }
        } catch (error) {
            console.error("Error updating project:", error);
            alert("Error saving project changes");
        }
    };

    const handlePriorityUpdate = async (newPriority) => {
        if (!id) return;
        try {
            const res = await fetch(apiUrl(`/projects/${id}`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priority: newPriority }),
            });
            if (res.ok) {
                fetchProjects();
            }
        } catch (error) {
            console.error("Error updating priority:", error);
        }
    };

    //GETTING EMPLOYEES NAME
    const employeeMap = useMemo(() => {
        return employees.reduce((map, employee) => {
            map[employee.uid] = employee.name;
            return map;
        }, {});
    }, [employees]);

    const tabs = [
        "Overview",
        "Milestones",
        "Notes",
        "Tasks",
        "Documents",
        "Team",
        "Activity",
    ];
    const renderTab = () => {
        switch (activeTab) {
            case "Overview":
                return <ClientOverview
                    projects={projectById} />;

            case "Milestones":
                return <ClientMilestone
                    projects={projectById}
                    fetchProjects={fetchProjects} />;

            case "Notes":
                return <ClientNotes projects={projectById} fetchProjects={fetchProjects} />;

            case "Tasks":
                return <ProjectTasks project={currentProject} projects={projectById} fetchProjects={fetchProjects} />;

            case "Documents":
                return <ProjectDocuments project={currentProject} projects={projectById} fetchProjects={fetchProjects} />;

            case "Team":
                return <ClientTeam
                    projects={projectById}
                    fetchProjects={fetchProjects} />;
            case "Activity":
                return <ClientActivity projects={projectById} />;

            default:
                return null;
        }
    };

    return (
        <div className="w-full min-h-screen overflow-y-auto custom-scrollbar bg-[#f5f3ef] p-4 md:p-8 flex justify-center">
            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-6xl bg-[#f3f0eb] rounded-[28px] shadow-2xl pb-12"
            >

                {/* Header */}
                <div className="p-8 border-b border-gray-300">

                    {/* Top Row */}
                    <div className="flex items-start justify-between flex-wrap gap-6">

                        {/* Left */}
                        <div className=" relative flex items-center gap-5  p-2">

                            {/* Avatars */}


                            {/* Company */}
                            <div className=" w-[450px]">
                                <h3 className="text-[20px] font-bold text-black">
                                    Company:
                                    <span className="font-medium text-gray-500 ml-2">
                                        {projectById[0]?.company || "TechFlow Solutions"}
                                    </span>
                                </h3>

                                <h1 className="mt-5 text-[20px] leading-tight font-bold text-[#0B2D57]">
                                    company Location: {projectById[0]?.companylocation || "Chennai"}
                                </h1>
                            </div>
                            <div className="absolute right-6 top-0 flex -space-x-4">
                                {projectById[0]?.members.map((item, i) =>
                                    <div
                                        key={i}
                                        className="w-14 h-14 rounded-full bg-[#4313A4] border-4 border-[#F4F1EC] flex items-center justify-center text-white font-bold text-xl">
                                        {item?.name?.charAt(0).toUpperCase()}
                                    </div>)}


                            </div>
                        </div>

                        {/* Right */}
                        <div className="flex flex-col items-end gap-5">

                            {/* Tags */}
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-2 rounded-full bg-[#B7F0BF] text-[#2E8B45] text-sm font-semibold">
                                    {projectById[0]?.status || "Qualified"}
                                </div>

                                <select
                                    value={projectById[0]?.priority || "Medium"}
                                    onChange={(e) => handlePriorityUpdate(e.target.value)}
                                    className="px-4 py-2 rounded-full bg-[#FFD3C8] text-[#FF5B2E] text-sm font-semibold outline-none border-none cursor-pointer hover:scale-105 transition"
                                >
                                    <option value="Urgent">🔥 Urgent</option>
                                    <option value="Hot">🔥 Hot</option>
                                    <option value="High">⚡ High</option>
                                    <option value="Medium">⚡ Medium</option>
                                    <option value="Warm">⚡ Warm</option>
                                    <option value="Low">🌱 Low</option>
                                    <option value="Cold">❄️ Cold</option>
                                </select>
                                <div>
                                    <X size={20} className="bg-red-500 rounded text-white hover:bg-white hover:text-red-700" onClick={() => navigate(-1)} />
                                </div>
                            </div>

                            {/* Edit Button */}
                            <button
                                onClick={handleOpenEdit}
                                className="flex items-center gap-2 px-5 py-3 rounded-lg border border-gray-400 hover:bg-gray-100 transition cursor-pointer"
                            >
                                <Pencil size={16} />
                                <span className="text-sm font-medium">
                                    Edit
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-300 px-10">
                    <div className="flex items-center justify-start gap-20">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative py-5 text-[18px] transition-all duration-300 ${activeTab === tab
                                    ? "text-[#246BFF] font-semibold"
                                    : "text-gray-400 font-medium"
                                    }`}
                            >
                                {tab}

                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 w-full h-[2px] bg-[#246BFF]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
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

            {/* EDIT PROJECT MODAL */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                        <div className="flex justify-between items-center border-b pb-3">
                            <h2 className="text-xl font-bold text-[#0b2b57]">Edit Project</h2>
                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="text-gray-400 hover:text-red-500 p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                            <div>
                                <label className="block mb-1">Project Title</label>
                                <input
                                    type="text"
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    className="w-full border rounded-lg p-2.5 outline-none font-normal"
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Company / Client</label>
                                <input
                                    type="text"
                                    value={editData.company}
                                    onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                                    className="w-full border rounded-lg p-2.5 outline-none font-normal"
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Company Location</label>
                                <input
                                    type="text"
                                    value={editData.companylocation}
                                    onChange={(e) => setEditData({ ...editData, companylocation: e.target.value })}
                                    className="w-full border rounded-lg p-2.5 outline-none font-normal"
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Status</label>
                                <select
                                    value={editData.status}
                                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                    className="w-full border rounded-lg p-2.5 outline-none font-normal bg-white"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1">Priority</label>
                                <select
                                    value={editData.priority}
                                    onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                                    className="w-full border rounded-lg p-2.5 outline-none font-normal bg-white"
                                >
                                    <option value="Hot">Hot (High)</option>
                                    <option value="Warm">Warm (Medium)</option>
                                    <option value="Cold">Cold (Low)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1">Progress (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editData.progress}
                                    onChange={(e) => setEditData({ ...editData, progress: Number(e.target.value) })}
                                    className="w-full border rounded-lg p-2.5 outline-none font-normal"
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={editData.dueDate}
                                    onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                                    className="w-full border rounded-lg p-2.5 outline-none font-normal"
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Budget</label>
                                <input
                                    type="text"
                                    value={editData.budget}
                                    onChange={(e) => setEditData({ ...editData, budget: e.target.value })}
                                    className="w-full border rounded-lg p-2.5 outline-none font-normal"
                                    placeholder="e.g. ₹50,000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                            <textarea
                                rows={3}
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                className="w-full border rounded-lg p-2.5 outline-none text-xs"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t">
                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="px-5 py-2.5 rounded-lg border text-gray-600 hover:bg-gray-100 text-xs font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-6 py-2.5 rounded-lg bg-[#2563a9] text-white hover:bg-blue-700 text-xs font-semibold shadow-md"
                            >
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}