import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Pencil,
    X,
} from "lucide-react";

import ClientOverview from "../components/ClientDetails/ClientOverview.jsx";
import ClientProjects from "../components/ClientDetails/ClientProjects.jsx";
import ClientPayment from "../components/ClientDetails/ClientPayment.jsx";
import ClientNotes from "../components/ProjectDetails/ProjectNotes.jsx";
import { useNavigate, useParams } from "react-router-dom";
import useClients from "../Hooks/useclients.js";
import { div } from "framer-motion/client";

export default function CompanyOverview() {

    const [activeTab, setActiveTab] = useState("Overview");
    const { clients } = useClients();
    console.log(clients);
    const { id } = useParams();
    console.log(id);

    const selectedClient = clients.filter((item) => (
        item._id == id
    ))
    console.log(selectedClient)

    const buttons = [
        "Overview",
        "Projects",
        "Payments",
        "Notes",
    ];
    const [button, setButton] = useState("Call");
    const head = ["Call", "Email", "Notes"];
    const navigate = useNavigate();

    // Render Tabs
    const renderTab = () => {

        switch (activeTab) {

            case "Overview":
                return <ClientOverview
                    clients={selectedClient} />;

            case "Projects":
                return <ClientProjects />;

            case "Payments":
                return <ClientPayment client={selectedClient[0]} />;

            case "Notes":
                return <ClientNotes />;

            default:
                return null;
        }
    };


    return (
        <div className="max-h-screen overflow-y-auto no-scrollbar">

            {/* HEADER */}

            <motion.div
                initial={{
                    opacity: 0,
                    y: 15,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.35,
                }}
                className=" relative border-b border-[#DDD8D1] bg-[#f3f0eb] "
            >


                <div className="px-5 pt-5 pb-4">

                    {/* TOP ROW */}

                    <div className="flex items-start justify-between">

                        {/* LEFT */}

                        <div className="flex items-start gap-3">

                            {/* LOGO */}

                            <div
                                className="
                w-10
                h-10
                rounded-md
                bg-[#E9E6E0]
                flex
                items-center
                justify-center
                text-[#4A6CF7]
                text-[12px]
                font-bold
                "
                            >
                                TF
                            </div>

                            {/* COMPANY INFO */}

                            <div>

                                <h1
                                    className="
                  text-[24px]
                  font-bold
                  leading-none
                  text-[#0A2C58]
                  "
                                >
                                    {selectedClient[0]?.companyName}
                                </h1>

                                <p
                                    className="
                  mt-1
                  text-[13px]
                  text-[#8B8B8B]
                  "
                                >
                                    {selectedClient[0]?.headquarters}
                                </p>

                            </div>

                        </div>

                        {/* STATUS TAGS */}

                        <div className="flex items-center gap-2">

                            <span
                                className="
                px-3
                py-1
                rounded-full
                bg-[#EDF5FF]
                text-[#4B73F8]
                text-[11px]
                font-medium
                "
                            >
                                {selectedClient[0]?.priority}
                            </span>

                            <span
                                className="
                px-3
                py-1
                rounded-full
                bg-[#DDF7D9]
                text-[#3BAA49]
                text-[11px]
                font-medium
                "
                            >
                                {selectedClient[0]?.status}
                            </span>
                            <span>
                                <X size={20} className="bg-red-500 rounded text-white hover:bg-white hover:text-red-700" onClick={() => navigate(-1)} />
                            </span>

                        </div>

                    </div>

                    {/* ACTION BUTTONS + EDIT */}

                    <div className="flex items-center justify-between mt-5">

                        {/* LEFT BUTTONS */}

                        <div className="flex items-center gap-2">

                            {head.map((btn, i) => (

                                <button
                                    key={i}
                                    className={`flex items-center   gap-1 px-4 py-2  rounded-md ${button.toLowerCase() === btn.toLowerCase() ? " bg-[#4A6CF7]    text-white" : "text-black bg-white"}
                                          text-[12px] font-medium hover:bg-[#3E63EE] hover:text-white transition `}
                                    onClick={() => setButton(btn)}
                                >
                                    {btn}
                                </button>

                            ))}

                        </div>

                        {/* EDIT BUTTON */}

                        <button
                            className="
              flex
              items-center
              gap-2
              px-4
              py-2
              rounded-md
              border
              border-[#D8D8D8]
              bg-[#ECEAE5]
              text-[#777]
              text-[12px]
              font-medium
              hover:bg-[#E2DED8]
              transition
              "
                        >
                            <Pencil size={13} />
                            Edit
                        </button>

                    </div>

                </div>

            </motion.div>

            {/* TABS */}

            <div
                className="
        px-6
        border-t
        border-[#ECE7E0]
        bg-[#f3f0eb]
        "
            >

                <div className="flex items-center gap-10 text-[12px]">

                    {buttons.map((tab) => (

                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
              relative
              py-4
              transition-all
              duration-200
              ${activeTab === tab
                                    ? "text-[#4A6CF7] font-semibold"
                                    : "text-[#9B9B9B] hover:text-[#666]"
                                }
              `}
                        >

                            {tab}

                            {activeTab === tab && (

                                <motion.div
                                    layoutId="activeTab"
                                    className="
                  absolute
                  left-0
                  right-0
                  bottom-0
                  h-[2px]
                  bg-[#4A6CF7]
                  "
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

            </div>

            {/* CONTENT */}

            <div className="w-full">

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
                        className="w-full"
                    >

                        {renderTab()}

                    </motion.div>

                </AnimatePresence>

            </div>

        </div>
    );
}