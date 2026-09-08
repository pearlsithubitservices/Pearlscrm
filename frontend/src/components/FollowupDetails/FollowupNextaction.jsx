import React, { useState } from "react";
import { motion } from "framer-motion";
import { Repeat2, CalendarDays, Clock3, Save } from "lucide-react";
import toast from "react-hot-toast";
import useFollowups from "../../Hooks/useFollowups";
import { useAuth } from "../../context/AuthContext";

export default function FollowupNextAction({ followup, onRefresh }) {
  const { updateFollowup } = useFollowups();
  const { user } = useAuth();

  const authorName =
    user?.displayName ||
    user?.name ||
    user?.employeeName ||
    (user?.email ? user.email.split("@")[0] : "Admin");

  const [followupCount, setFollowupCount] = useState(followup?.followupCount ?? 1);
  const [date, setDate] = useState(followup?.date || "");
  const [followupTime, setFollowupTime] = useState(followup?.followupTime || "");
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const followupId = followup?._id || followup?.id;
    if (!followupId) {
      toast.error("No follow-up selected");
      return;
    }

    setLoading(true);
    try {
      await updateFollowup(followupId, {
        followupCount: Number(followupCount),
        date,
        followupTime,
        status: "Scheduled",
        newNote: noteText.trim()
          ? `Next Action Rescheduled (${date || "Date"} ${followupTime || ""}): ${noteText.trim()}`
          : `Follow-up rescheduled for ${date || "upcoming date"} ${followupTime || ""}`,
        author: authorName,
      });

      toast.success("Next action & schedule saved successfully!");
      setNoteText("");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error saving next action:", err);
      toast.error(err.message || "Failed to save next action");
    } finally {
      setLoading(false);
    }
  };

  const historyLogs = Array.isArray(followup?.history) ? followup.history : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#f3f0eb] p-6 rounded-2xl"
    >
      <h1 className="text-xs font-bold tracking-wide text-[#999] uppercase">
        NEXT ACTION & RESCHEDULE
      </h1>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* FOLLOWUPS COUNT */}
        <div>
          <h1 className="text-[#0b2d59] font-bold text-xs uppercase tracking-wider mb-2">
            Follow-ups Count
          </h1>
          <div className="h-[52px] bg-white rounded-xl border border-[#ebe7df] px-4 flex items-center gap-3 shadow-xs">
            <Repeat2 size={18} className="text-[#b8b8b8]" />
            <input
              type="number"
              value={followupCount}
              onChange={(e) => setFollowupCount(e.target.value)}
              placeholder="1"
              className="w-full bg-transparent outline-none text-[#0b2d59] font-semibold text-sm"
            />
          </div>
        </div>

        {/* RESCHEDULE DATE */}
        <div>
          <h1 className="text-[#0b2d59] font-bold text-xs uppercase tracking-wider mb-2">
            Reschedule Date
          </h1>
          <div className="h-[52px] bg-white rounded-xl border border-[#ebe7df] px-4 flex items-center gap-3 shadow-xs">
            <CalendarDays size={18} className="text-[#b8b8b8]" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent outline-none text-[#0b2d59] font-semibold text-sm"
            />
          </div>
        </div>

        {/* RESCHEDULE TIME */}
        <div>
          <h1 className="text-[#0b2d59] font-bold text-xs uppercase tracking-wider mb-2">
            Reschedule Time
          </h1>
          <div className="h-[52px] bg-white rounded-xl border border-[#ebe7df] px-4 flex items-center gap-3 shadow-xs">
            <Clock3 size={18} className="text-[#b8b8b8]" />
            <input
              type="text"
              value={followupTime}
              onChange={(e) => setFollowupTime(e.target.value)}
              placeholder="e.g. 10:30 AM"
              className="w-full bg-transparent outline-none text-[#0b2d59] font-semibold text-sm"
            />
          </div>
        </div>
      </div>

      {/* NOTE BOX */}
      <div className="mt-6">
        <h1 className="text-[#0b2d59] font-bold text-xs uppercase tracking-wider mb-2">
          Next Action Remarks / Plan
        </h1>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Describe next steps or action items for this client..."
          className="w-full h-[120px] bg-white border border-[#ebe7df] rounded-xl p-4 outline-none resize-none text-[#0b2d59] text-sm shadow-xs focus:border-[#3167dc]"
        />
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end mt-4">
        <button
          disabled={loading}
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#3167dc] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
        >
          <Save size={16} />
          {loading ? "Saving..." : "Save Next Action"}
        </button>
      </div>

      {/* TIMELINE */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xs font-bold tracking-wide text-[#999] uppercase">
          REACTION & RESCHEDULE LOGS ({historyLogs.length})
        </h2>

        {historyLogs.length === 0 ? (
          <p className="text-sm text-gray-500 italic bg-white p-4 rounded-xl border border-gray-200">
            No next action history logged yet.
          </p>
        ) : (
          historyLogs.slice().reverse().map((item, index) => (
            <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex gap-4">
              <div className="w-3 h-3 rounded-full bg-[#3167dc] mt-1.5 shrink-0" />
              <div>
                <h1 className="text-sm font-bold text-[#0b2d59]">
                  {item.note}
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  By {item.author || "User"} · {item.createdAt ? new Date(item.createdAt).toLocaleString() : item.date || "Just now"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}