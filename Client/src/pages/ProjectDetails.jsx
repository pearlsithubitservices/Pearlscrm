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
import { useNavigate, useParams } from "react-router-dom";
import useEmployees from "../Hooks/useEmployees.js";

export default function ClientDetails({ tasks }) {
    const [activeTab, setActiveTab] = useState("Overview");
    const navigate = useNavigate();
    const { id } = useParams();
    const { employees } = useEmployees();
    const [projects, setProjects] = useState([]);
    console.log(projects);
    const projectById = projects.filter((item) =>
        item._id == id);
    console.log(projectById);
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/projects");

                if (!res.ok) {
                    throw new Error("Failed to fetch projects");
                }

                const data = await res.json();
                setProjects(data);

                console.log(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchProjects();
    }, []);

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
                    tasks={tasks} />

            case "Notes":
                return <ClientNotes />;

            case "Team":
                return <ClientTeam 
                projects={projectById}/>;
            case "Activity":
                return <ClientActivity />;



            default:
                return null;
        }
    };

    return (

        <>
            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-6xl bg-[#f3f0eb] rounded-[28px] overflow-hidden shadow-2xl max-h-screen overflow-y-auto no-scrollbar"
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

                                <div className="px-4 py-2 rounded-full bg-[#FFD3C8] text-[#FF5B2E] text-sm font-semibold flex items-center gap-1">
                                    {projectById[0]?.priority || "cold"}
                                </div>
                                <div>
                                    <X size={20} className="bg-red-500 rounded text-white hover:bg-white hover:text-red-700" onClick={() => navigate(-1)} />
                                </div>
                            </div>

                            {/* Edit Button */}
                            <button className="flex items-center gap-2 px-5 py-3 rounded-lg border border-gray-400 hover:bg-gray-100 transition">
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
        </>
    );
}