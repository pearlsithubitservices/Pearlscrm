import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, FileText, Megaphone, MessageCircleMore, MessageSquareMore, Users, X, CheckCircle2, Clock3 } from "lucide-react";


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
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_dismissed_comm_notifs_emp");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const notifRef = useRef(null);
  const { announcements } = useAnnouncement();
  const { tickets } = useTicket();
  const { employees } = useEmployees();
  const { feedbacks } = useFeedback();
  const { user } = useAuth();

  useEffect(() => {
    try {
      localStorage.setItem("crm_dismissed_comm_notifs_emp", JSON.stringify(dismissedNotifIds));
    } catch (e) {
      console.error("Error saving dismissed communication notifications:", e);
    }
  }, [dismissedNotifIds]);

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Communication Notifications (Unread Announcements, My Ticket Updates)
  const notifications = useMemo(() => {
    const list = [];

    (announcements || []).forEach((a) => {
      const id = `ann-${a._id || a.id}`;
      if (!a.isRead && !dismissedNotifIds.includes(id)) {
        list.push({
          id,
          type: "announcement",
          tab: "Announcements",
          title: "📢 New Announcement",
          message: a.title || "A new company announcement was posted.",
          time: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "New",
        });
      }
    });

    myTickets.forEach((t) => {
      const id = `tkt-${t._id || t.id}`;
      const st = (t.status || "In Progress").toLowerCase();
      if (dismissedNotifIds.includes(id)) return;

      if (st === "resolved" || st === "closed") {
        list.push({
          id,
          type: "ticket_resolved",
          tab: "HelpDesk",
          title: "✅ Ticket Resolved",
          message: `Your ticket "${t.subject || "Support Ticket"}" is now ${t.status}.`,
          time: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : "Updated",
        });
      } else {
        list.push({
          id,
          type: "ticket_open",
          tab: "HelpDesk",
          title: "🕓 Ticket In Progress",
          message: `Your ticket "${t.subject || "Support Ticket"}" is being worked on.`,
          time: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Pending",
        });
      }
    });

    return list;
  }, [announcements, myTickets, dismissedNotifIds]);

  const handleClearAllNotifs = (e) => {
    e.stopPropagation();
    const allNotifIds = notifications.map((n) => n.id);
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, ...allNotifIds])));
  };

  const handleNotifClick = (e, notif) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notif.id])));
    setShowNotifications(false);
    setActiveTab(notif.tab);
  };

  const handleDismissNotif = (e, notifId) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notifId])));
  };

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
            <CompanyAnnouncements />
            <Notification />
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

            <HelpDesk />
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
            <CompanyDirectory />
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
              <FeedbackPage />
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

        {/* Bell + Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Communication Notifications"
            className="bg-[#2563eb] hover:bg-blue-700 transition p-3 rounded-lg w-fit relative cursor-pointer"
          >
            <Bell className="text-white" size={20} />
            {notifications.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs">
              <div className="p-4 bg-[#0b2b57] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bell size={16} />
                  <h3 className="font-bold text-sm">Communication Notifications</h3>
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAllNotifs}
                      className="text-[10px] bg-red-500/80 hover:bg-red-600 text-white px-2 py-0.5 rounded font-semibold transition cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                  <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {notifications.length} Active
                  </span>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-xs font-medium">
                    🎉 No new communication updates!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={(e) => handleNotifClick(e, n)}
                      className={`p-3.5 hover:bg-blue-50/50 transition-colors cursor-pointer space-y-1.5 ${
                        n.type === "ticket_open" ? "bg-amber-50/30" : n.type === "announcement" ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            n.type === "announcement"
                              ? "bg-blue-100 text-blue-700"
                              : n.type === "ticket_open"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {n.type === "announcement" ? "Announcement" : n.type === "ticket_open" ? "Ticket" : "Resolved"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-400 font-medium">{n.time}</span>
                          <button
                            onClick={(e) => handleDismissNotif(e, n.id)}
                            className="text-gray-400 hover:text-red-500 p-0.5 rounded hover:bg-gray-100 transition"
                            title="Dismiss Notification"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{n.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
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