import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Phone,
  Mail,
  MessageCircle,
  StickyNote,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import FollowupOverview from "./EmpFollowupOverview";
import FollowupNotes from "./EmpFollowupNotes";
import FollowupNextAction from "./EmpFollowupNextaction";
import TaskChat from "../../../components/TaskDetails/TaskChat";
import { useNavigate, useParams } from "react-router-dom";
import useFollowups from "../../../Hooks/useFollowups";
import { useAuth } from "../../../context/AuthContext";
import { socket } from "../../../config/socket";

export default function EmpFollowupDetails() {
  const { getFollowups, updateFollowup } = useFollowups();
  const { user } = useAuth();
  const [followups, setFollowups] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();

  const followupbyId = followups?.find(
    (item) => String(item._id || item.id) === String(id)
  );

  const fetchdata = async () => {
    try {
      const data = await getFollowups();
      let list = Array.isArray(data) ? data : [];

      if (id && !list.some((item) => String(item._id || item.id) === String(id))) {
        const single = await getFollowupById(id).catch(() => null);
        if (single) list.push(single);
      }

      setFollowups(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchdata();

    if (socket) {
      const handleSync = () => fetchdata();
      socket.on("followupUpdated", handleSync);
      return () => {
        socket.off("followupUpdated", handleSync);
      };
    }
  }, [id]);

  const [activeTab, setActivetab] = useState("Overview");

  const buttons = ["Overview", "Notes", "Next Action", "Team Chat"];

  const actions = [
    { label: "Call", icon: Phone, type: "Call" },
    { label: "Email", icon: Mail, type: "Email" },
    { label: "Whatsapp", icon: MessageCircle, type: "Whatsapp" },
    { label: "Note", icon: StickyNote, type: "Note" },
  ];

  const handleActionClick = async (actionType) => {
    if (!followupbyId) return;
    const followupId = followupbyId._id || followupbyId.id;
    const authorName = user?.displayName || user?.name || user?.employeeName || "Employee";

    if (actionType === "Call") {
      if (followupbyId.phone) {
        window.location.href = `tel:${followupbyId.phone}`;
        toast.success(`Calling ${followupbyId.phone}...`);
      } else {
        toast.error("No phone number available for this client");
      }
      try {
        await updateFollowup(followupId, {
          type: "Call",
          newNote: `Initiated Phone Call with ${followupbyId.clientName || 'Client'} (${followupbyId.phone || 'No phone'})`,
          author: authorName,
        });
        fetchdata();
      } catch (e) {
        console.error(e);
      }
    } else if (actionType === "Email") {
      if (followupbyId.email) {
        const subject = encodeURIComponent(`Follow-up: ${followupbyId.companyName || 'Services'}`);
        const body = encodeURIComponent(`Hi ${followupbyId.clientName || 'Client'},\n\nFollowing up regarding our discussion.\n\nBest regards,`);
        window.open(`mailto:${followupbyId.email}?subject=${subject}&body=${body}`, '_blank');
        toast.success(`Opening email client for ${followupbyId.email}...`);
      } else {
        toast.error("No email address available for this client");
      }
      try {
        await updateFollowup(followupId, {
          type: "Email",
          newNote: `Sent Email to ${followupbyId.clientName || 'Client'} (${followupbyId.email || 'No email'})`,
          author: authorName,
        });
        fetchdata();
      } catch (e) {
        console.error(e);
      }
    } else if (actionType === "Whatsapp") {
      const rawPhone = followupbyId.phone ? followupbyId.phone.replace(/\D/g, '') : '';
      if (rawPhone) {
        const message = encodeURIComponent(`Hi ${followupbyId.clientName || ''}, following up regarding ${followupbyId.companyName || 'our services'}.`);
        window.open(`https://wa.me/${rawPhone}?text=${message}`, '_blank');
        toast.success("Opening WhatsApp chat...");
      } else {
        toast.error("No valid phone number for WhatsApp");
      }
      try {
        await updateFollowup(followupId, {
          newNote: `Opened WhatsApp Chat with ${followupbyId.clientName || 'Client'}`,
          author: authorName,
        });
        fetchdata();
      } catch (e) {
        console.error(e);
      }
    } else if (actionType === "Note") {
      setActivetab("Notes");
      toast.success("Switched to Notes section");
    }
  };

  /* TAB RENDER */
  const renderTab = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <FollowupOverview
            followups={followupbyId}
            fetchfollowups={fetchdata}
          />
        );

      case "Notes":
        return (
          <FollowupNotes followup={followupbyId} onRefresh={fetchdata} />
        );

      case "Next Action":
        return <FollowupNextAction followup={followupbyId} onRefresh={fetchdata} />;

      case "Team Chat":
        return (
          <div className="p-4">
            <TaskChat
              propTaskId={`followup_${followupbyId?._id || followupbyId?.id || id}`}
              propTaskTitle={`Follow-up Chat: ${followupbyId?.clientName || "Client"} (${followupbyId?.companyName || "Follow-up"})`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-h-screen overflow-hidden custom-scrollbar bg-[#f5f3ee] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-h-screen overflow-y-auto custom-scrollbar bg-[#f5f3ee] rounded-[26px]"
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 right-6 z-10 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-transform hover:scale-105 cursor-pointer shadow-md"
        >
          <X size={16} />
        </button>

        {/* HEADER */}
        <div className="p-6 border-b border-[#e6e0d8]">
          <div className="flex items-start justify-between">
            {/* LEFT */}
            <div className="relative flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#e7edf8] flex items-center justify-center text-[#3167dc] font-bold text-xl shadow-xs">
                {followupbyId?.clientName?.charAt(0)?.toUpperCase() || "F"}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-[#0b2d59]">
                  {followupbyId?.clientName || "Client Name"}
                </h1>
                <p className="text-sm text-[#8e8e8e] mt-0.5">
                  {followupbyId?.companyName || "Company Name"}
                </p>
              </div>
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-3 pr-10">
              <span className="px-4 py-1 rounded-full bg-green-100 text-green-600 text-xs font-bold uppercase tracking-wider">
                {followupbyId?.type || "Call"}
              </span>

              <span
                className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  followupbyId?.status === "Completed"
                    ? "bg-green-100 text-green-600"
                    : followupbyId?.status === "Pending"
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {followupbyId?.status || "Pending"}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2.5 flex-wrap">
              {actions.map((btn, i) => {
                const Icon = btn.icon;
                const isSelected =
                  (btn.type === "Call" && followupbyId?.type === "Call") ||
                  (btn.type === "Email" && followupbyId?.type === "Email") ||
                  (btn.type === "Note" && activeTab === "Notes");

                return (
                  <button
                    key={i}
                    onClick={() => handleActionClick(btn.type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#3167dc] text-white shadow-xs"
                        : "bg-white border border-[#d8d8d8] text-gray-700 hover:bg-blue-50 hover:text-[#3167dc]"
                    }`}
                  >
                    <Icon size={14} />
                    {btn.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setActivetab("Team Chat")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold shadow-xs cursor-pointer ${
                activeTab === "Team Chat"
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <MessageCircle size={14} />
              Team Chat
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="border-b border-[#e6e0d8] flex items-center px-6 gap-12 bg-white/50">
          {buttons.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActivetab(tab)}
              className={`relative py-4 text-sm font-semibold transition cursor-pointer ${
                activeTab === tab ? "text-[#3167dc]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab"
                  className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#3167dc] rounded-full"
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}