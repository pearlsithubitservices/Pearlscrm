import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, FileText, Megaphone, MessageCircleMore, MessageSquareMore, Users,  } from "lucide-react";


import CompanyAnnouncements from "./Announcements/CompanyAnnouncements.jsx";
import Notification from "./Announcements/Notification.jsx";
import HelpDesk from './HelpDesk/HelpDesk.jsx';
import RaiseTicket from "../../EmployeePages/Communication/RaiseTicket.jsx";
import CompanyDirectory from "./Directory/CompanyDirectory.jsx";
import FeedbackPage from "./Feedback/Feedback.jsx";
import useAnnouncement from "../../Hooks/useAnnouncement.js";


const Communication = () => {
  const [activeTab, setActiveTab] = useState("Announcements");
  const [form, setForm] = useState(false);
  const{announcements}=useAnnouncement();


  const stats = [
    { icon: Megaphone, label: "Announcments", value: announcements.length },
    { icon: MessageCircleMore, label: "Open Tickets", value: "7" },
    { icon: Users, label: "Employees", value: "₹ 84" },
    { icon: MessageSquareMore, label: "Avg Feedback", value: "80%" },
  ];

  const tabs = [
    "Announcements",
    "HelpDesk",
    "Company Directory",
    "Feedback",

  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Announcements":
        return (
          <motion.div
            key="payslip"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className=" rounded-xl flex flex-col gap-6 p-6"
          >


            {/* <PayslipsTable /> */}
            <CompanyAnnouncements/>
            <Notification/>
          </motion.div>
        );

      case "HelpDesk":
        return (
          <motion.div
            key="salary"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className=" rounded-xl  p-1"
          >

            <HelpDesk/>
          </motion.div>
        );

      case "Company Directory":
        return (
          <motion.div
            key="tax"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className=" rounded-xl p-2 "
          >
            <CompanyDirectory/>
          </motion.div>
        );

      case "Feedback":
        return (
          <motion.div
            key="reimbursements"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className=" rounded-xl "
          >
            <div className="">
              <FeedbackPage/>
            </div>
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
            Communication and Support
          </h1>

          <p className="text-gray-500 mt-1">
            Stay Connect with your team & resolve issues instantly.
          </p>
        </div>

        <button className="bg-[#2563eb] p-3 rounded-lg w-fit">
          <Bell className="text-white" size={20} />
        </button>
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

          <button className="inline-flex items-center justify-center gap-2 bg-[#2563eb] text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transition"
            onClick={() => setForm((prev) => (!prev))}
          >
            <FileText size={16} />
           Raise Tickets
          </button>
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

export default Communication;