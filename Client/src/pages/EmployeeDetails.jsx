import React, { useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Mail, Notebook, Phone, X } from "lucide-react";

import Employeehome from "../components/EmployeeDetails/Employeehome";
import EmployeePerformancePage from "../components/EmployeeDetails/EmployeePerformance";
import EmployeeWork from "../components/EmployeeDetails/EmployeeWork";
import EmployeeActivity from "../components/EmployeeDetails/EmployeeActivity";
import { useNavigate } from "react-router-dom";

const EmployeeDetails = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate= useNavigate();

  const tabs = ["overview", "performance", "assigned work", "activity"];
  const [button, setButton] = useState('');

  const buttons = [
    { label: "Call", icon: Phone },
    { label: "E Mail", icon: Mail },
    { label: "Notes", icon: Notebook },
  ];

  function handleButton(e) {
    setButton(e);
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#efede8] min-h-screen max-h-screen overflow-y-auto page-scroll">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 p-4 sm:p-6 rounded-2xl border border-black/5">

        {/* LEFT SECTION */}
        <div className="flex items-start gap-4 w-full md:max-w-[700px]">

          {/* Avatar */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0 text-base sm:text-lg">
            JD
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0b2b57] truncate">Jamie D.</h1>
            <p className="text-xs sm:text-sm text-gray-500">Project Lead</p>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {buttons.map((btn, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 border border-black/20 px-3 sm:px-4 py-1.5 ${button.toLowerCase() === btn.label.toLowerCase() ? "bg-blue-700 text-white border-blue-700" : "bg-[#efede8] text-gray-800"} rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 hover:text-white transition`}
                  onClick={() => handleButton(btn.label)}
                >
                  <btn.icon size={14} />
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT STATUS */}
        <div className="flex flex-wrap md:flex-col items-start md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-200">
          <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
            <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
              Active
            </span>

            <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-600 rounded-full">
              Top performer
            </span>

            <button 
              onClick={() => navigate(-1)}
              className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition"
              aria-label="Back"
            >
              <X size={18} />
            </button>
          </div>

          <div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-black/20 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-100 transition">
              <Edit3 size={14} /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 sm:gap-8 mt-6 sm:mt-8 border-b overflow-x-auto page-scroll pb-0.5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs sm:text-sm capitalize font-semibold whitespace-nowrap transition-all ${activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-800"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        {activeTab === "overview" && <Employeehome />}

        {activeTab === "performance" && <EmployeePerformancePage />}

        {activeTab === "assigned work" && <EmployeeWork />}

        {activeTab === "activity" && <EmployeeActivity />}
      </motion.div>
    </div>
  );
};

export default EmployeeDetails;