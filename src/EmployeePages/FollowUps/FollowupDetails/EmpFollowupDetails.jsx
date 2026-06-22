import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Pencil,
    Phone,
    Mail,
    MessageCircle,
    StickyNote,
    X,
} from "lucide-react";

import FollowupOverview from "./EmpFollowupOverview";
import FollowupNotes from "./EmpFollowupNotes";
import FollowupNextAction from "./EmpFollowupNextaction";
import { useNavigate, useParams } from "react-router-dom";
import useFollowups from "../../../Hooks/useFollowups";

export default function EmpFollowupDetails() {

    const { getFollowups } = useFollowups();
    const [followups, setFollowups] = useState();

    const { id } = useParams();
    console.log(id);
    const followupbyId = followups?.find((item) => (
        item._id == id
    ))
    console.log(followupbyId)

    useEffect(() => {

        fetchdata();
    }, []);

    const fetchdata = async () => {
        try {
            const data = await getFollowups();
            setFollowups(data);
            console.log(data);
        }
        catch (err) {
            console.log(err);
        }
    }
    const [activeTab, setActivetab] = useState("Overview");
    const navigate = useNavigate();

    const buttons = [
        "Overview",
        "Notes",
        "Next Action",
    ];

    const actions = [
        {
            label: "Call",
            icon: Phone,
            active: true,
        },
        {
            label: "Email",
            icon: Mail,
        },
        {
            label: "Whatsapp",
            icon: MessageCircle,
        },
        {
            label: "Note",
            icon: StickyNote,
        },
    ];

    /* TAB RENDER */

    const renderTab = () => {

        switch (activeTab) {

            case "Overview":
                return <FollowupOverview
                    followups={followupbyId}
                    fetchfollowups={getFollowups} />;

            case "Notes":
                return <FollowupNotes />;

            case "Next Action":
                return <FollowupNextAction />;

            default:
                return null;
        }
    };

    return (
        <div className="max-h-screen overflow-hidden no-scrollbar   bg-[#f5f3ee] flex items-center justify-center p-4">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-h-screen overflow-y-auto no-scrollbar bg-[#f5f3ee] rounded-[26px]  "
            >
                <X size={16} className=" absolute bg-red-600 top-3 right-2 text-white rounded hover:scale-105 transition-transform duration-150"
                    onClick={() => navigate(-1)}
                />

                {/* HEADER */}

                <div className="p-6">

                    <div className="flex items-start justify-between">

                        {/* LEFT */}

                        <div className="relative flex gap-4">


                            <div className="w-10 h-10 rounded-md bg-[#e7edf8] flex items-center justify-center text-[#3167dc] font-bold text-lg">
                                {followupbyId?.clientName?.charAt(0)?.toUpperCase()}
                            </div>

                            <div>

                                <h1 className="text-4xl font-bold text-[#0b2d59]">
                                    {followupbyId?.clientName || "Deepan"}
                                </h1>

                                <p className="text-[#8e8e8e] mt-1">
                                    {followupbyId?.companyName || "Techflow Solutions"}
                                </p>

                            </div>

                        </div>

                        {/* STATUS */}

                        <div className="flex gap-3">

                            <span className="px-4 py-1 rounded-full bg-green-100 text-green-600 text-sm">
                                {followupbyId?.type}
                            </span>

                            <span className={`px-4 py-1 rounded-full ${followupbyId?.status == "Completed" ? "bg-green-300 text-green-600":followupbyId?.status == "Pending" ? "bg-red-300 text-red-600": "bg-blue-300 text-blue-600"} text-sm`}>
                                {followupbyId?.status}
                            </span>

                        </div>

                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="flex items-center justify-between mt-6">

                        <div className="flex gap-3">

                            {actions.map((btn, i) => {

                                const Icon = btn.icon;

                                return (

                                    <button
                                        key={i}
                                        className={`
                    flex items-center gap-2 px-5 py-2 rounded-md text-sm transition
                    ${btn.active
                                                ? "bg-[#3167dc] text-white"
                                                : "bg-white border border-[#d8d8d8] text-[#777]"
                                            }
                    `}
                                    >

                                        <Icon size={14} />

                                        {btn.label}

                                    </button>

                                );
                            })}

                        </div>

                        {/* EDIT */}



                    </div>

                </div>

                {/* TABS */}

                <div className="border-t border-[#e6e0d8] flex items-center ml-6 gap-20">

                    {buttons.map((tab, i) => (

                        <button
                            key={i}
                            onClick={() => setActivetab(tab)}
                            className={`
              relative py-5 text-sm transition
              ${activeTab === tab
                                    ? "text-[#3167dc] font-medium"
                                    : "text-[#999]"
                                }
              `}
                        >

                            {tab}

                            {activeTab === tab && (

                                <motion.div
                                    layoutId="tab"
                                    className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#3167dc]"
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                    }}
                                />

                            )}

                        </button>

                    ))}

                </div>

                {/* CONTENT */}

                <AnimatePresence mode="wait">

                    <motion.div
                        key={activeTab}
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: -20,
                        }}
                        transition={{
                            duration: 0.3,
                        }}
                    >

                        {renderTab()}

                    </motion.div>

                </AnimatePresence>

            </motion.div>

        </div>
    );
}