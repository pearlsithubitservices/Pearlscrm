import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Clock, AlertCircle, Paperclip, PlusCircle, RefreshCw } from "lucide-react";
import useTicket from "../../../Hooks/useTicket";
import { useAuth } from "../../../context/AuthContext";
import RaiseTicket from "../RaiseTicket";
import apiUrl from "../../../config/api";

export default function SupportTickets() {
  const { tickets, fetchTickets, loading } = useTicket();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const currentUserId = user?.uid || user?.id;
  const currentUserName = user?.displayName || user?.name || (user?.email ? user.email.split("@")[0] : "");

  const myTickets = (tickets || []).filter((item) => {
    if (!currentUserId && !currentUserName) return true;
    return (
      (currentUserId && item.employeeId === currentUserId) ||
      (currentUserName && item.employeeName?.toLowerCase() === currentUserName.toLowerCase())
    );
  });

  const openCount = myTickets.filter((t) => (t.status || "open").toLowerCase() === "open").length;
  const inProgressCount = myTickets.filter((t) => (t.status || "open").toLowerCase() === "in progress").length;
  const resolvedCount = myTickets.filter((t) => (t.status || "open").toLowerCase() === "resolved" || (t.status || "open").toLowerCase() === "closed").length;

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Poll every 3 seconds and listen for live status updates
  useEffect(() => {
    const handleStatusUpdate = () => {
      fetchTickets();
    };

    window.addEventListener("ticketStatusUpdated", handleStatusUpdate);
    const interval = setInterval(() => {
      fetchTickets();
    }, 3000);

    return () => {
      window.removeEventListener("ticketStatusUpdated", handleStatusUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[500px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-[#0b2b57]">
            My Support Tickets
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track real-time status updates for tickets submitted to Support
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Dynamic Counters */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold border border-blue-100">
              Open: {openCount}
            </span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg font-bold border border-amber-100">
              In Progress: {inProgressCount}
            </span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-100">
              Resolved: {resolvedCount}
            </span>
          </div>

          <button
            onClick={handleManualRefresh}
            title="Refresh ticket status"
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-blue-600" : ""} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#2563eb] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            <PlusCircle size={15} /> Raise New Ticket
          </button>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {myTickets.length > 0 ? (
          myTickets.map((item) => {
            const st = (item.status || "Open").toLowerCase();
            const attachmentUrl = item.attachment ? apiUrl(`/uploads/${item.attachment}`) : null;

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-50/60 border border-gray-100 hover:bg-gray-50 transition"
              >
                {/* Left Side */}
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                      {item.issuedcategory || "General"}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      • {new Date(item.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  <h2 className="text-sm font-bold text-gray-800">
                    {item.subject || item.description}
                  </h2>

                  {item.subject && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {attachmentUrl && (
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline pt-1"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      View Attachment
                    </a>
                  )}
                </div>

                {/* Right Side Status */}
                <div className="flex items-center gap-4">
                  {st === "resolved" || st === "closed" ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <BadgeCheck size={16} /> Resolved
                    </span>
                  ) : st === "in progress" ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                      <Clock size={16} /> In Progress
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                      <Clock size={16} /> Open
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-16 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <AlertCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">No tickets raised yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-100 transition"
            >
              <PlusCircle size={15} /> Raise your first ticket
            </button>
          </div>
        )}
      </div>

      {/* RAISE TICKET MODAL */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <RaiseTicket onClose={() => { setShowModal(false); fetchTickets(); }} />
          </div>
        </motion.div>
      )}
    </div>
  );
}