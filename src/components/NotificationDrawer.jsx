import React, { useState, useEffect } from "react";
import { X, Bell, Calendar, Clock, AlertCircle, CheckCircle, Send, User, ChevronRight, RefreshCw, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { socket } from "../config/socket";
import { apiUrl } from "../config/api";
import useNotification from "../Hooks/useNotification";

export default function NotificationDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { notifications, fetchNotification, deleteNotification } = useNotification();
  const [followups, setFollowups] = useState([]);
  const [loadingFollowups, setLoadingFollowups] = useState(false);
  const [activeTab, setActiveTab] = useState("followups"); // "followups" | "notifications"
  const [broadcastingTest, setBroadcastingTest] = useState(false);

  // Fetch followups for reminders list
  const fetchFollowups = async () => {
    try {
      setLoadingFollowups(true);
      const res = await fetch(apiUrl("/followups"));
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || []);
      setFollowups(list);
    } catch (err) {
      console.error("Error fetching followups in drawer:", err);
    } finally {
      setLoadingFollowups(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFollowups();
      fetchNotification();
    }
  }, [isOpen]);

  // Handle trigger test reminder broadcast
  const handleTestBroadcast = async () => {
    try {
      setBroadcastingTest(true);
      const response = await fetch(apiUrl("/followups/test-reminder"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: "Acme Global Solutions",
          type: "Demo Presentation & Pricing",
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Test follow-up reminder broadcasted to all admin & employee sessions!", {
          icon: "⏰",
        });
        fetchFollowups();
        fetchNotification();
      } else {
        toast.error("Failed to broadcast test reminder");
      }
    } catch (err) {
      console.error("Test broadcast error:", err);
      toast.error("Connection error broadcasting test reminder");
    } finally {
      setBroadcastingTest(false);
    }
  };

  // Filter due and upcoming followups
  const dueFollowups = followups.filter((f) => f.status !== "Completed" && f.status !== "Cancelled");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 bg-[#0B2B57] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center relative">
                  <Bell className="w-5 h-5 text-amber-300" />
                  {dueFollowups.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                      {dueFollowups.length}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">Admin Notification Center</h2>
                  <p className="text-xs text-blue-200 font-medium">Follow-up Reminders & Alerts</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200/80 flex items-center justify-between gap-2">
              <button
                onClick={handleTestBroadcast}
                disabled={broadcastingTest}
                className="flex-1 py-2 px-3 bg-[#1D61E7] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {broadcastingTest ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>{broadcastingTest ? "Sending..." : "⚡ Broadcast Test Reminder"}</span>
              </button>

              <button
                onClick={() => {
                  fetchFollowups();
                  fetchNotification();
                }}
                title="Refresh Notifications"
                className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 rounded-xl transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-gray-200 px-5 pt-3 bg-white">
              <button
                onClick={() => setActiveTab("followups")}
                className={`pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === "followups"
                    ? "border-[#1D61E7] text-[#1D61E7]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Clock size={14} />
                Follow-up Reminders ({dueFollowups.length})
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`pb-3 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === "notifications"
                    ? "border-[#1D61E7] text-[#1D61E7]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Bell size={14} />
                System Alerts ({notifications.length})
              </button>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#F8FAFC]">
              {activeTab === "followups" ? (
                loadingFollowups ? (
                  <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                    Loading follow-up reminders...
                  </div>
                ) : dueFollowups.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                    <p className="text-sm font-bold text-gray-700">All caught up!</p>
                    <p className="text-xs">No pending follow-up reminders right now.</p>
                  </div>
                ) : (
                  dueFollowups.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs space-y-2.5 hover:border-blue-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                          <Clock size={11} />
                          {item.type || "Call Followup"}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.priority === "High"
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : item.priority === "Medium"
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.priority || "Medium"} Priority
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-900 leading-snug">
                          {item.clientName || item.companyName || "Follow-up Task"}
                        </h4>
                        {item.companyName && (
                          <p className="text-xs text-gray-500 font-medium">{item.companyName}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar size={12} className="text-gray-400" />
                          {item.date ? new Date(item.date).toLocaleDateString() : "Today"}
                          {item.time ? ` at ${item.time}` : ""}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-gray-600 font-medium">
                          <User size={12} className="text-blue-500" />
                          {item.assignedTo || "Unassigned"}
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-end">
                        <button
                          onClick={() => {
                            onClose();
                            navigate("/followups");
                          }}
                          className="text-xs font-bold text-[#1D61E7] hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Follow-ups</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )
              ) : notifications.length === 0 ? (
                <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
                  <Bell className="w-10 h-10 text-gray-300" />
                  <p className="text-sm font-bold text-gray-700">No system notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <p className="text-xs font-bold text-gray-900">{notif.title}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{notif.sub || notif.message}</p>
                      <span className="text-[10px] text-gray-400 font-medium block pt-1">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteNotification(notif._id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
              <button
                onClick={() => {
                  onClose();
                  navigate("/followups");
                }}
                className="w-full py-2.5 bg-[#0B2B57] hover:bg-[#082042] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>View Full Follow-ups Portal</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
