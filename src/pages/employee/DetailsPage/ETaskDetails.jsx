import React, { useState } from "react";
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



import { useNavigate, useParams } from "react-router-dom";
//import useLead from "../Hooks/useLead";
import ETasksOverview from "../../../components/EmployeeSide/TaskDetails/ETasksOverview";
import ETaskActivity from "../../../components/EmployeeSide/TaskDetails/ETaskActivity";
import ETasksNotes from "../../../components/EmployeeSide/TaskDetails/ETasksNotes";
import ETaskDocuments from "../../../components/EmployeeSide/TaskDetails/ETaskDocument";
import useTaskid from "../../../Hooks/useTaskid";
export default function ETaskDetails() {
    const [activeTab, setActiveTab] = useState("Overview");
    const [button, setButton] = useState("call");
    const { id } = useParams();
    const navigate = useNavigate();

    //const { lead, loading } = useLead(id);
    //const[tasks, setTasks]=useState('');
    const { task, loading } = useTaskid(id);

    console.log(task);
    const tabs = [
        "Overview",
        "Activity",
        "Notes",
        "Documents",

    ];
    const buttons = [

        {
            label: "E-Mail",
            Icon: Mail
        },

        {
            label: "Notes",
            Icon: NotebookTabs
        },

    ]

    const renderTab = () => {
        switch (activeTab) {
            case "Overview":
                return <ETasksOverview tasks={task} />;

            case "Activity":
                return <ETaskActivity task={task} />;

            case "Notes":
                return <ETasksNotes task={task} />;

            case "Documents":
                return <ETaskDocuments task={task} />;

            default:
                return null;
        }
    };

    return (
        <div className="max-h-screen bg-[#f3f0eb] p-2 md:p-6 relative overflow-y-auto no-scrollbar">
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
                                    {task.title || "Vishnu"}
                                </h1>

                                <p className="text-gray-400 tracking-tighter">
                                    Redesign onboarding flow for enterprise clients
                                </p>

                                <div className="flex flex-wrap gap-2 mt-4  ">

                                    {buttons.map((btn, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => setButton(i)}
                                            className={`border px-5 py-2 rounded-lg flex items-center gap-2  hover:scale-110 hover:bg-blue-600 transition-transform duration-300
                                            ${button === i ? "bg-blue-600 text-white" : ""}`}

                                        >

                                            < btn.Icon size={16} />
                                            {btn.label}

                                        </button>
                                    ))}
                                </div>

                            </div>

                        </div>

                        <div className="flex flex-col items-end gap-4">

                            <div className="flex gap-3">

                                <span className="bg-green-100 text-green-600 px-4 py-1 rounded-full">
                                    {task.status || "In Progress"}
                                </span>

                                <span className="bg-red-100 text-red-500 px-4 py-1 rounded-full">
                                    {task.priority || "High"}
                                </span>

                            </div>



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

        </div>
    );
}