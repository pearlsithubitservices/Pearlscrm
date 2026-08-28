import React, { useEffect, useState } from "react";
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


import ActivityTab from "../components/LeadDetails/LeadActivity";
import NotesTab from "../components/LeadDetails/Leadnotes";
import DocumentsTab from "../components/LeadDetails/Leaddocuments";
import NextActionTab from "../components/LeadDetails/Leadnextaction";
import OverviewTab from '../components/LeadDetails/Leadhome';
import { useNavigate, useParams } from "react-router-dom";
import useLead from "../Hooks/useLead";


export default function LeadDetails() {
    const [activeTab, setActiveTab] = useState("Overview");
    const [button, setButton] = useState("call");
    const { id } = useParams();
    const navigate = useNavigate();

    const { lead, loading, updateLead } = useLead(id);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    useEffect(() => {
        if (lead) {
            setEditData(lead);
        }
    }, [lead]);
    const handleChange = (e) => {
        setEditData({
            ...editData,
            [e.target.name]: e.target.value,
        });
    };
    const handleUpdate = async () => {
        try {
            await updateLead(id, editData);
            setIsEditing(false);
        } catch (error) {
            console.log(error);
        }
    };
    console.log(lead);
    const tabs = [
        "Overview",
        "Activity",
        "Notes",
        "Documents",
        "Next Action",
    ];
    const buttons = [
        {
            label: "Call",
            Icon: Phone
        },
        {
            label: "E-Mail",
            Icon: Mail
        },
        {
            label: "whats Up",
            Icon: MessageSquare
        },
        {
            label: "Notes",
            Icon: NotebookTabs
        },

    ]

    const renderTab = () => {
        switch (activeTab) {
            case "Overview":
                return <OverviewTab
                    lead={lead}
                    isEditing={isEditing}
                    editData={editData}
                    handleChange={handleChange} />;

            case "Activity":
                return <ActivityTab
                    lead={lead} />

            case "Notes":
                return <NotesTab />;

            case "Documents":
                return <DocumentsTab />;

            case "Next Action":
                return <NextActionTab />;

            default:
                return null;
        }
    };

    return (
        <div className="max-h-screen overflow-y-auto no-scrollbar bg-[#f3f0eb] p-2 md:p-6 relative">
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

                            <div
                                className="w-14 h-14 rounded-xl bg-[#dfe5ee] flex items-center
                                             justify-center text-blue-600 font-bold text-xl border border-black/40 ">
                                {lead?.name?.charAt(0).toUpperCase()}
                            </div>

                            <div>

                                <h1 className="font-bold text-xl text-[#082f57]">
                                    {lead?.name}
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
                                    {lead?.status}
                                </span>

                                <span className="bg-red-100 text-red-500 px-4 py-1 rounded-full">
                                    {lead?.priority}
                                </span>


                            </div>
                            <div className="flex items-center justify-between">

                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="border px-5 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <Pencil size={16} />
                                    Edit
                                </button>
                                {isEditing && (
                                    <div className="flex gap-3 mt-3">
                                        <button
                                            onClick={handleUpdate}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg"
                                        >
                                            Save
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditData(lead); // reset changes
                                            }}
                                            className="bg-gray-300 px-4 py-2 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
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