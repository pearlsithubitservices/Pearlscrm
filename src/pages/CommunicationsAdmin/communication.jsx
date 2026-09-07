import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, FileText, Megaphone, MessageCircleMore, MessageSquareMore, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import socket from "../../config/socket.js";

import CompanyAnnouncements from "./Announcements/CompanyAnnouncements.jsx";
import Notification from "./Announcements/Notification.jsx";
import HelpDesk from './HelpDesk/HelpDesk.jsx';
import RaiseTicket from "../../EmployeePages/Communication/RaiseTicket.jsx";
import CompanyDirectory from "./Directory/CompanyDirectory.jsx";

import useAnnouncement from "../../Hooks/useAnnouncement.js";
import Feedbackadmin from "./Feedback/Feedbackadmin.jsx";
import EmployeeFeedback from "./Feedback/EmployeeFeedback.jsx";
import useTicket from "../../Hooks/useTicket.js";
import useEmployees from "../../Hooks/useEmployees.js";
import useFeedback from "../../Hooks/useFeedback.js";

const Communication = () => {
  const [activeTab, setActiveTab] = useState("Announcements");
  const [form, setForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_dismissed_comm_notifs_admin");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track live real-time communication events
  const [liveNotifs, setLiveNotifs] = useState([]);

  const notifRef = useRef(null);
  const { announcements, fetchAnnouncements } = useAnnouncement();
  const { employees } = useEmployees();
  const { tickets, fetchTickets } = useTicket();
  const { feedbacks, fetchFeedbacks } = useFeedback();

  useEffect(() => {
    try {
      localStorage.setItem("crm_dismissed_comm_notifs_admin", JSON.stringify(dismissedNotifIds));
    } catch (e) {
      console.error("Error saving dismissed communication notifications:", e);
    }
  }, [dismissedNotifIds]);

  // Real-time socket updates for ANY change in the communication module
  useEffect(() => {
    if (!socket) return;
    if (!socket.connected) socket.connect();

    // 1. When an employee raises a new ticket
    const handleTicketCreated = (data) => {
      if (!data) return;
      if (fetchTickets) fetchTickets();
      const notifId = `live-tkt-create-${data._id || Date.now()}`;
      setLiveNotifs((prev) => [
        {
          id: notifId,
          type: "ticket_new",
          tab: "HelpDesk",
          title: "🎫 New Ticket Raised",
          message: `"${data.subject || "Support Ticket"}" submitted by ${data.employeeName || "Employee"}.`,
          time: "Just now",
        },
        ...prev,
      ]);
      toast(`New Ticket: "${data.subject || "Support Ticket"}"`, { icon: "🎫" });
    };

    // 2. When ticket status or assignment changes
    const handleTicketUpdated = (data) => {
      if (!data) return;
      if (fetchTickets) fetchTickets();
      const notifId = `live-tkt-update-${data._id || Date.now()}`;
      setLiveNotifs((prev) => [
        {
          id: notifId,
          type: (data.status || "").toLowerCase() === "resolved" ? "ticket_resolved" : "ticket_open",
          tab: "HelpDesk",
          title: "🔄 Ticket Status Changed",
          message: `Ticket "${data.subject || "Ticket"}" is now ${data.status || "Updated"}.`,
          time: "Just now",
        },
        ...prev,
      ]);
      toast(`Ticket Updated: "${data.subject || ""}" (${data.status || ""})`, { icon: "🔄" });
    };

    // 3. When an employee submits new feedback
    const handleFeedbackCreated = (data) => {
      if (!data) return;
      if (fetchFeedbacks) fetchFeedbacks();
      const isLow = Number(data.rating) <= 2;
      const notifId = `live-fb-create-${data._id || Date.now()}`;
      setLiveNotifs((prev) => [
        {
          id: notifId,
          type: isLow ? "feedback_low" : "feedback_new",
          tab: "Feedback",
          title: isLow ? "⚠️ Low Rating Feedback" : "💬 New Feedback Received",
          message: `Feedback on "${data.subject || "General"}" (${data.rating || 5}★) from ${data.anonymous ? "Anonymous" : (data.employeeName || "Employee")}.`,
          time: "Just now",
        },
        ...prev,
      ]);
      toast(isLow ? "⚠️ Alert: Low rating feedback received!" : "💬 New Feedback received!", {
        icon: isLow ? "⚠️" : "💬",
      });
    };

    // 4. When feedback is updated or replied to
    const handleFeedbackUpdated = (data) => {
      if (!data) return;
      if (fetchFeedbacks) fetchFeedbacks();
      const notifId = `live-fb-update-${data._id || Date.now()}`;
      setLiveNotifs((prev) => [
        {
          id: notifId,
          type: "feedback_new",
          tab: "Feedback",
          title: "💬 Feedback Updated",
          message: `Feedback on "${data.subject || "General"}" status is now ${data.status || "Reviewed"}.`,
          time: "Just now",
        },
        ...prev,
      ]);
    };

    // 5. When a new announcement is created
    const handleAnnouncementCreated = (data) => {
      if (!data) return;
      if (fetchAnnouncements) fetchAnnouncements();
      const notifId = `live-ann-create-${data._id || Date.now()}`;
      setLiveNotifs((prev) => [
        {
          id: notifId,
          type: "announcement",
          tab: "Announcements",
          title: "📢 New Announcement",
          message: data.title || "A new company announcement was posted.",
          time: "Just now",
        },
        ...prev,
      ]);
      toast(`📢 New Announcement: "${data.title || "Updates"}"`, { icon: "📢" });
    };

    // 6. When announcement is updated or pinned
    const handleAnnouncementUpdated = (data) => {
      if (!data) return;
      if (fetchAnnouncements) fetchAnnouncements();
      const notifId = `live-ann-update-${data._id || Date.now()}`;
      setLiveNotifs((prev) => [
        {
          id: notifId,
          type: "announcement",
          tab: "Announcements",
          title: data.pinned ? "📌 Announcement Pinned" : "📢 Announcement Updated",
          message: data.title || "Announcement was updated.",
          time: "Just now",
        },
        ...prev,
      ]);
    };

    socket.on("ticketCreated", handleTicketCreated);
    socket.on("ticketUpdated", handleTicketUpdated);
    socket.on("feedbackCreated", handleFeedbackCreated);
    socket.on("feedbackUpdated", handleFeedbackUpdated);
    socket.on("announcementCreated", handleAnnouncementCreated);
    socket.on("announcementUpdated", handleAnnouncementUpdated);

    return () => {
      socket.off("ticketCreated", handleTicketCreated);
      socket.off("ticketUpdated", handleTicketUpdated);
      socket.off("feedbackCreated", handleFeedbackCreated);
      socket.off("feedbackUpdated", handleFeedbackUpdated);
      socket.off("announcementCreated", handleAnnouncementCreated);
      socket.off("announcementUpdated", handleAnnouncementUpdated);
    };
  }, []);

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

  const totalAnnouncements = (announcements || []).length;
  const pinnedAnnouncements = (announcements || []).filter((a) => a.pinned).length;

  const openTicketsCount = (tickets || []).filter(
    (t) => (t.status || "open").toLowerCase() === "open" || (t.status || "").toLowerCase() === "in progress"
  ).length;
  const totalTicketsCount = (tickets || []).length;
  const resolvedTicketsCount = totalTicketsCount - openTicketsCount;

  const totalEmployeesCount = (employees || []).length;

  const avgFeedbackScore = (feedbacks || []).length > 0
    ? ((feedbacks.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0) / feedbacks.length)).toFixed(1)
    : "0.0";
  const totalFeedbacksCount = (feedbacks || []).length;

  // Communication Notifications (Live Socket Events, Open Tickets, Low / New Feedbacks, Announcements)
  const notifications = useMemo(() => {
    const list = [];
    const seenIds = new Set();

    // 1. Live real-time incoming changes (Tickets, Feedbacks, Announcements)
    liveNotifs.forEach((n) => {
      if (!dismissedNotifIds.includes(n.id) && !seenIds.has(n.id)) {
        seenIds.add(n.id);
        list.push(n);
      }
    });

    // 2. Announcements changes (Pinned / Unread announcements)
    (announcements || []).forEach((a) => {
      const id = `ann-${a._id || a.id}`;
      if (dismissedNotifIds.includes(id) || seenIds.has(id)) return;
      if (a.pinned || !a.isRead) {
        seenIds.add(id);
        list.push({
          id,
          type: "announcement",
          tab: "Announcements",
          title: a.pinned ? "📌 Pinned Announcement" : "📢 Company Announcement",
          message: a.title || "Announcement update.",
          time: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "Recent",
        });
      }
    });

    // 3. Ticket changes (Tickets needing action)
    (tickets || []).forEach((t) => {
      const id = `tkt-${t._id || t.id}`;
      const st = (t.status || "In Progress").toLowerCase();
      if (dismissedNotifIds.includes(id) || seenIds.has(id)) return;

      if (st !== "resolved" && st !== "closed") {
        seenIds.add(id);
        list.push({
          id,
          type: st === "open" ? "ticket_new" : "ticket_open",
          tab: "HelpDesk",
          title: st === "open" ? "🎫 Ticket Needs Action" : "🕓 Ticket In Progress",
          message: `"${t.subject || "Support Ticket"}" from ${t.employeeName || "an employee"} is ${t.status || "In Progress"}.`,
          time: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "New",
        });
      }
    });

    // 4. Feedback changes (Low rating & newly submitted feedback)
    (feedbacks || []).forEach((f) => {
      const id = `fb-${f._id || f.id}`;
      if (dismissedNotifIds.includes(id) || seenIds.has(id)) return;

      if (Number(f.rating) <= 2) {
        seenIds.add(id);
        list.push({
          id,
          type: "feedback_low",
          tab: "Feedback",
          title: "⚠️ Low Feedback Rating",
          message: `${f.anonymous ? "Anonymous feedback" : (f.employeeName || "Employee")} on "${f.subject || "General"}" received a ${f.rating}★ rating.`,
          time: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "New",
        });
      } else if (!f.status || f.status === "pending") {
        seenIds.add(id);
        list.push({
          id,
          type: "feedback_new",
          tab: "Feedback",
          title: "💬 New Feedback Received",
          message: `Feedback on "${f.subject || "General"}" (${f.rating || 5}★) from ${f.anonymous ? "Anonymous" : (f.employeeName || "Employee")}.`,
          time: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "New",
        });
      }
    });

    return list;
  }, [liveNotifs, announcements, tickets, feedbacks, dismissedNotifIds]);

  const handleClearAllNotifs = (e) => {
    e.stopPropagation();
    const allNotifIds = notifications.map((n) => n.id);
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, ...allNotifIds])));
    setLiveNotifs([]);
  };

  const handleNotifClick = (e, notif) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notif.id])));
    setLiveNotifs((prev) => prev.filter((n) => n.id !== notif.id));
    setShowNotifications(false);
    setActiveTab(notif.tab);
  };

  const handleDismissNotif = (e, notifId) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notifId])));
    setLiveNotifs((prev) => prev.filter((n) => n.id !== notifId));
  };

  const stats = [
    {
      icon: Megaphone,
      label: "Announcements",
      value: totalAnnouncements,
      subtext: `${pinnedAnnouncements} Pinned • Company Wide`,
      badge: "Announcements",
      badgeBg: "bg-blue-50 text-blue-600 border-blue-200/60",
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      icon: MessageCircleMore,
      label: "Open Tickets",
      value: openTicketsCount,
      subtext: `${resolvedTicketsCount} Resolved / ${totalTicketsCount} Total`,
      badge: "HelpDesk",
      badgeBg: "bg-amber-50 text-amber-600 border-amber-200/60",
      iconBg: "bg-amber-100 text-amber-600",
    },
    {
      icon: Users,
      label: "Total Employees",
      value: totalEmployeesCount,
      subtext: "Active Staff Directory",
      badge: "Directory",
      badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: MessageSquareMore,
      label: "Avg Feedback",
      value: totalFeedbacksCount > 0 ? `${avgFeedbackScore} ★` : "0.0 ★",
      subtext: `${totalFeedbacksCount} Submissions`,
      badge: "Satisfaction",
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
            key="announcements"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl flex flex-col gap-6 p-6"
          >
            <CompanyAnnouncements />
            <Notification />
          </motion.div>
        );

      case "HelpDesk":
        return (
          <motion.div
            key="helpdesk"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-1"
          >
            <HelpDesk />
          </motion.div>
        );

      case "Company Directory":
        return (
          <motion.div
            key="directory"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-2"
          >
            <CompanyDirectory />
          </motion.div>
        );

      case "Feedback":
        return (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl space-y-6"
          >
            <Feedbackadmin />
            <EmployeeFeedback />
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
      className="max-h-screen overflow-y-auto no-scrollbar bg-[#f3f0eb]"
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-xl px-6 py-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[#082d5b]">
            Communication & Support (Admin)
          </h1>

          <p className="text-gray-500 mt-1">
            Manage company announcements, support tickets, employee directory & feedback analytics.
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
                    🎉 No pending communication actions!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={(e) => handleNotifClick(e, n)}
                      className={`p-3.5 hover:bg-blue-50/50 transition-colors cursor-pointer space-y-1.5 ${
                        n.type === "feedback_low"
                          ? "bg-red-50/40"
                          : n.type === "feedback_new"
                          ? "bg-purple-50/40"
                          : n.type === "ticket_new" || n.type === "ticket_open"
                          ? "bg-amber-50/30"
                          : n.type === "ticket_resolved"
                          ? "bg-emerald-50/30"
                          : n.type === "announcement"
                          ? "bg-blue-50/30"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            n.type === "feedback_low"
                              ? "bg-red-100 text-red-700"
                              : n.type === "feedback_new"
                              ? "bg-purple-100 text-purple-700"
                              : n.type === "ticket_new"
                              ? "bg-orange-100 text-orange-700"
                              : n.type === "ticket_open"
                              ? "bg-amber-100 text-amber-700"
                              : n.type === "ticket_resolved"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {n.type === "feedback_low"
                            ? "Low Rating"
                            : n.type === "feedback_new"
                            ? "New Feedback"
                            : n.type === "ticket_new"
                            ? "New Ticket"
                            : n.type === "ticket_resolved"
                            ? "Resolved"
                            : n.type === "announcement"
                            ? "Announcement"
                            : "Ticket"}
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

      {/* Tabs Selector */}
      <div className="mt-6 bg-white border border-gray-200/80 rounded-xl p-4 mx-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-4 sm:gap-8 tracking-tight">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-base font-bold transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-[#2563eb] text-white shadow"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
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
            <RaiseTicket onClose={() => setForm(false)} />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Communication;