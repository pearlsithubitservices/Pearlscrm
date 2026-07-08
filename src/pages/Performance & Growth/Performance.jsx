import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, FileText, Megaphone, MessageCircleMore, MessageSquareMore, Users, X, } from "lucide-react";


import { div } from "framer-motion/client";
import GoalsPage from "./GoalsPage";
import PerformanceReviews from "./performanceReviews";
import { useNavigate, useParams } from "react-router-dom";
import CourseLibrary from "./Training&Learning/CourseLibrary";
import TrainingHistory from "./Training&Learning/TrainingHistory";
import Skills from "./Skills&Certifications/Skills";
import Certifications from "./Skills&Certifications/Certifications";


const Performance = () => {
    const [activeTab, setActiveTab] = useState("Goals");
    const [form, setForm] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    console.log(id);



    const stats = [
        { icon: Megaphone, label: "Goals on Track", value: '12' },
        { icon: MessageCircleMore, label: "Last Review Score", value: "7" },
        { icon: Users, label: "Course Completed", value: "₹ 84" },
        { icon: MessageSquareMore, label: "Certifications", value: "80%" },
    ];

    const tabs = [
        "Goals",
        "Training & Learning",
        "Performance Reviews",
        "Skills & Certifications",

    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "Goals":
                return (
                    <motion.div
                        key="payslip"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className=" rounded-xl flex flex-col gap-6 p-6"
                    >


                        <GoalsPage />

                    </motion.div>
                );

            case "Training & Learning":
                return (
                    <motion.div
                        key="salary"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className=" rounded-xl  p-1"
                    >

                        <CourseLibrary />
                        <TrainingHistory />
                    </motion.div>
                );

            case "Performance Reviews":
                return (
                    <motion.div
                        key="tax"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className=" rounded-xl p-2 "
                    >
                        <PerformanceReviews
                            currentUserid={id} />
                    </motion.div>
                );

            case "Skills & Certifications":
                return (
                    <motion.div
                        key="reimbursements"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className=" rounded-xl "
                    >
                        <Skills />
                        <Certifications />
                    </motion.div>
                );



            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-h-screen overflow-y-auto no-scrollbar  bg-[#f3f0eb] "
        >
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-xl px-6 py-6 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-[#082d5b]">
                        Performance & Growth
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage and track all employees performances, goals, training, reveiws
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="bg-[#2563eb] p-3 rounded-lg w-fit">
                        <Bell className="text-white" size={20} />
                    </button>
                    <button className="bg-red-700 p-3 rounded-lg w-fit">
                        <X className="text-white hover:scale-150 transition-all duration-300" size={20}
                            onClick={() => navigate(-1)} />
                    </button>
                </div>
            </header>

            {/**Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 px-4 ">

                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.03 }}
                        className="bg-white p-6 rounded-xl border"
                    >
                        <div className='  rounded w-full h-8 flex items-center justify-between'>
                            <s.icon className="w-8 h-8 bg-gray-200 rounded-lg text-black p-2" />
                            <p className="rounded-xl px-2 py-1 bg-green-100 text-green-500 font-medium text-[10px]">Month</p>
                        </div>

                        <p className="text-sm text-gray-500">{s.label}</p>
                        <h2 className={`text-2xl font-medium  text-[#0b2b57] ${s.label.toLowerCase() == "deductions" ? "text-orange-400" : s.label.toLowerCase() == "pending claims" ? "text-orange-400" : "text-blue-700"}`}>
                            {s.value}
                        </h2>
                    </motion.div>
                ))}

            </div>

            {/* Tabs */}
            <div className="mt-6 bg-white border rounded-xl p-4 mx-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-wrap gap-12 tracking-tight">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-lg  font-bold transition-all duration-300 ${activeTab === tab
                                    ? "bg-[#2563eb] text-white shadow"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* <button className="inline-flex items-center justify-center gap-2 bg-[#2563eb] text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transition"
            onClick={() => setForm((prev) => (!prev))}
          >
            <FileText size={16} />
           Raise Tickets
          </button> */}
                </div>
            </div>

            {/* Render Active Tab */}
            <div className="my-6 mx-4">{renderTabContent()}</div>
            {form && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar"
                    >
                        <RaiseTicket
                            onClose={() => setForm(false)} />
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Performance;