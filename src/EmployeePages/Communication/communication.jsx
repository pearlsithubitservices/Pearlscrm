import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, FileText, Megaphone, MessageCircleMore, MessageSquareMore, Users,  } from "lucide-react";


import CompanyAnnouncements from "./Announcements/CompanyAnnouncements";
import Notification from "./Announcements/Notification"
import HelpDesk from './HelpDesk/HelpDesk.jsx'
import RaiseTicket from "./RaiseTicket.jsx";
import CompanyDirectory from "./Directory/CompanyDirectory.jsx";
import FeedbackPage from "./Feedback/Feedback.jsx";
import useAnnouncement from "../../Hooks/useAnnouncement.js";
import useTicket from "../../Hooks/useTicket.js";
import useEmployees from "../../Hooks/useEmployees.js";
import useFeedback from "../../Hooks/useFeedback.js";
import { useAuth } from "../../context/AuthContext";


const Communication = () => {
  const [activeTab, setActiveTab] = useState("Announcements");
  const [form, setForm] = useState(false);
  const { announcements } = useAnnouncement();
  const { tickets } = useTicket();
  const { employees } = useEmployees();
  const { feedbacks } = useFeedback();
  const { user } = useAuth();

  const currentUserId = user?.uid || user?.id;
  const currentUserName = user?.displayName || user?.name || (user?.email ? user.email.split("@")[0] : "");

  const totalAnnouncements = (announcements || []).length;
  const unreadAnnouncements = (announcements || []).filter((a) => !a.isRead).length;

  const myTickets = (tickets || []).filter((t) => {
    if (!currentUserId && !currentUserName) return true;
    return (
      (currentUserId && t.employeeId === currentUserId) ||
      (currentUserName && t.employeeName?.toLowerCase() === currentUserName.toLowerCase())
    );
  });

  const myOpenTicketsCount = myTickets.filter(
    (t) => (t.status || "open").toLowerCase() !== "resolved" && (t.status || "open").toLowerCase() !== "closed"
  ).length;

  const myResolvedTicketsCount = myTickets.length - myOpenTicketsCount;

  const myFeedbacks = (feedbacks || []).filter((item) => {
    if (!currentUserId && !currentUserName) return true;
    return (
      (currentUserId && item.employeeId === currentUserId) ||
      (currentUserName && item.employeeName?.toLowerCase() === currentUserName.toLowerCase())
    );
  });

  const avgMyRating = myFeedbacks.length > 0
    ? (myFeedbacks.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0) / myFeedbacks.length).toFixed(1)
    : (feedbacks || []).length > 0
    ? ((feedbacks.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0) / feedbacks.length)).toFixed(1)
    : "0.0";

  const stats = [
    {
      icon: Megaphone,
      label: "Announcements",
      value: totalAnnouncements,
      subtext: unreadAnnouncements > 0 ? `${unreadAnnouncements} Unread Updates` : "All Read",
      badge: "Updates",
      badgeBg: "bg-blue-50 text-blue-600 border-blue-200/60",
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      icon: MessageCircleMore,
      label: "My Open Tickets",
      value: myOpenTicketsCount,
      subtext: `${myResolvedTicketsCount} Resolved / ${myTickets.length} Total`,
      badge: "Support",
      badgeBg: "bg-amber-50 text-amber-600 border-amber-200/60",
      iconBg: "bg-amber-100 text-amber-600",
    },
    {
      icon: Users,
      label: "Team Directory",
      value: (employees || []).length,
      subtext: "Colleagues & Staff",
      badge: "Members",
      badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: MessageSquareMore,
      label: "My Feedback Rating",
      value: `${avgMyRating} ★`,
      subtext: `${myFeedbacks.length} Submissions`,
      badge: "Feedback",
      badgeBg: "bg-purple-50 text-purple-600 border-purple-200/60",
      iconBg: "bg-purple-100 text-purple-600",
    },
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

      {/* Stats Cards - Fully Dynamic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 px-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm transition-all flex flex-col justify-between"
          >
            <div className="rounded w-full h-8 flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${s.iconBg}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className={`rounded-xl px-2.5 py-0.5 border font-bold text-[10px] uppercase tracking-wide ${s.badgeBg}`}>
                {s.badge}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500">{s.label}</p>
              <h2 className="text-2xl font-bold text-[#0b2b57] mt-1">
                {s.value}
              </h2>
              <p className="text-[11px] font-medium text-gray-400 mt-1">
                {s.subtext}
              </p>
            </div>
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