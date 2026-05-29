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
    <div className="p-6 bg-[#efede8] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-6">

        {/* LEFT SECTION */}
        <div className="flex items-start gap-4  w-full max-w-[700px] p-4 rounded-md ">

          {/* Avatar */}
          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            JD
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">Jamie D.</h1>
            <p className="text-gray-500">Project Lead</p>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {buttons.map((btn, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 border border-black/80 px-4 py-1  ${button.toLowerCase() === btn.label.toLowerCase() ? "bg-blue-700 text-white" : "bg-[#efede8] text-black"}  rounded-md text-sm hover:bg-blue-700 transition`}
                  onClick={() => handleButton(btn.label)}
                >
                  <btn.icon size={16} />
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT STATUS */}
        <div className="relative flex flex-col gap-3  h-[130px]">
          <div className="flex gap-4 items-center">
            <span className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
              Active
            </span>

            <span className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full">
              Top performer
            </span>
            <span>
              <X size={20} className="bg-red-500 rounded text-white hover:bg-white hover:text-red-700" onClick={() => navigate(-1)} />
            </span>
          </div>
          <div>
            <button className=" absolute bottom-6 right-5 flex items-center gap-1 px-3 py-1 border border-black/80 rounded-md text-sm hover:bg-gray-100 transition">
              <Edit3 size={14} /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-8 mt-8 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm capitalize transition-all ${activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
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