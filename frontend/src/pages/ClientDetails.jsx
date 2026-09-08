import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Pencil,
    X,
    Trash2,
} from "lucide-react";

import ClientOverview from "../components/ClientDetails/ClientOverview.jsx";
import ClientProjects from "../components/ClientDetails/ClientProjects.jsx";
import ClientPayment from "../components/ClientDetails/ClientPayment.jsx";
import ClientNotes from "../components/ClientDetails/ClientNotes.jsx";
import AnimateModals from "../components/Dashboard/AnimateModals.jsx";
import CreateClients from "./CreateClients.jsx";
import { useNavigate, useParams } from "react-router-dom";
import useClients from "../Hooks/useclients.js";

export default function CompanyOverview() {

    const [activeTab, setActiveTab] = useState("Overview");
    const [isEditing, setIsEditing] = useState(false);
    const { clients, loading, fetchClients, deleteClient } = useClients();
    const { id } = useParams();

    const selectedClient = clients.filter((item) => item._id === id);

    const buttons = [
        "Overview",
        "Projects",
        "Payments",
        "Notes",
    ];
    const [button, setButton] = useState("Call");
    const head = ["Call", "Email", "Notes"];
    const navigate = useNavigate();

    const getInitials = (name) => {
        if (!name) return "CL";
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const handleDelete = async () => {
        const client = selectedClient[0];
        if (!client) return;

        const name = client.companyName || "this client";
        const confirmed = window.confirm(`Are you sure you want to delete ${name}?`);
        if (!confirmed) return;

        try {
            await deleteClient(client._id || client.id);
            navigate("/clientmanagement");
        } catch (error) {
            console.error("Error deleting client:", error);
            alert("Failed to delete client: " + (error.message || "Unknown error"));
        }
    };

    const handleQuickAction = (action) => {
        const client = selectedClient[0];
        setButton(action);

        if (!client) return;

        if (action === "Call") {
            if (client.contactNumber) {
                window.location.href = `tel:${client.contactNumber}`;
            } else {
                alert("No phone number available for this client.");
            }
            return;
        }

        if (action === "Email") {
            if (client.email) {
                window.location.href = `mailto:${client.email}`;
            } else {
                alert("No email address available for this client.");
            }
            return;
        }

        if (action === "Notes") {
            setActiveTab("Notes");
        }
    };

    // Render Tabs
    const renderTab = () => {

        switch (activeTab) {

            case "Overview":
                return <ClientOverview
                    clients={selectedClient} />;

            case "Projects":
                return <ClientProjects
                    clientId={selectedClient[0]?._id}
                    clientName={selectedClient[0]?.companyName}
                    companyName={selectedClient[0]?.companyName}
                />;

            case "Payments":
                return <ClientPayment client={selectedClient[0]} />;

            case "Notes":
                return <ClientNotes client={selectedClient[0]} />;

            default:
                return null;
        }
    };


    if (loading && !selectedClient[0]) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium">Loading client details...</p>
            </div>
        );
    }

    if (!loading && !selectedClient[0]) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
                <p className="text-lg font-bold text-gray-700 mb-2">Client Not Found</p>
                <p className="text-sm mb-4">The requested client could not be located.</p>
                <button
                    onClick={() => navigate("/clientmanagement")}
                    className="px-4 py-2 bg-[#2563a9] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                >
                    Back to Client Management
                </button>
            </div>
        );
    }

    return (
        <>
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
                                {getInitials(selectedClient[0]?.companyName)}
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
                                <X size={20} className="bg-red-500 rounded text-white hover:bg-white hover:text-red-700 cursor-pointer" onClick={() => navigate(-1)} />
                            </span>

                        </div>

                    </div>

                    {/* ACTION BUTTONS + EDIT + DELETE */}

                    <div className="flex items-center justify-between mt-5 gap-4">

                        {/* LEFT BUTTONS */}

                        <div className="flex items-center gap-2">

                            {head.map((btn, i) => (

                                <button
                                    key={i}
                                    type="button"
                                    aria-pressed={button.toLowerCase() === btn.toLowerCase()}
                                    className={`flex min-w-[96px] items-center justify-center gap-1 rounded-md px-4 py-2 text-[12px] font-medium transition-all duration-200 ${button.toLowerCase() === btn.toLowerCase()
                                        ? "bg-[#4A6CF7] text-white shadow-sm"
                                        : "bg-white text-[#3A3A3A] hover:bg-[#eef2ff] hover:text-[#1d3a7c]"
                                    }`}
                                    onClick={() => handleQuickAction(btn)}
                                >
                                    {btn}
                                </button>

                            ))}

                        </div>

                        {/* EDIT & DELETE BUTTONS */}

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
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
                  text-[#555]
                  text-[12px]
                  font-medium
                  hover:bg-[#E2DED8]
                  transition
                  cursor-pointer
                  "
                            >
                                <Pencil size={13} />
                                Edit
                            </button>

                            <button
                                onClick={handleDelete}
                                className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-md
                  border
                  border-red-200
                  bg-red-50
                  text-red-600
                  text-[12px]
                  font-medium
                  hover:bg-red-100
                  transition
                  cursor-pointer
                  "
                            >
                                <Trash2 size={13} />
                                Delete
                            </button>
                        </div>

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

            {isEditing && selectedClient[0] && (
                <AnimateModals>
                    <CreateClients
                        initialClient={selectedClient[0]}
                        fetchClients={fetchClients}
                        onClose={() => setIsEditing(false)}
                    />
                </AnimateModals>
            )}
        </>
    );
}