import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import useFollowups from "../../Hooks/useFollowups";
import { useAuth } from "../../context/AuthContext";

export default function FollowupNotes({ followup, onRefresh }) {
  const { user } = useAuth();
  const { updateFollowup } = useFollowups();

  const authorName =
    user?.displayName ||
    user?.name ||
    user?.employeeName ||
    (user?.email ? user.email.split("@")[0] : "Admin");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const handleNote = async () => {
    if (!formData.description.trim()) {
      toast.error("Please enter a note description");
      return;
    }

    if (!followup?._id && !followup?.id) {
      toast.error("No follow-up selected");
      return;
    }

    setSubmitting(true);
    try {
      const noteText = formData.title
        ? `${formData.title}: ${formData.description}`
        : formData.description;

      const followupId = followup._id || followup.id;
      await updateFollowup(followupId, {
        newNote: noteText,
        author: authorName,
      });

      toast.success("Follow-up note added!");
      setFormData({ title: "", description: "" });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error adding followup note:", err);
      toast.error("Failed to add note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (originalIndex) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    const followupId = followup?._id || followup?.id;
    if (!followupId) return;

    try {
      const updatedHistory = historyLogs.filter((_, idx) => idx !== originalIndex);
      await updateFollowup(followupId, {
        history: updatedHistory,
      });

      toast.success("Note deleted successfully");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error deleting note:", err);
      toast.error("Failed to delete note");
    }
  };

  const historyLogs = Array.isArray(followup?.history) ? followup.history : [];

  return (
    <div className="bg-[#f5f2ec] p-4 md:p-8 min-h-[500px]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* INPUT SECTION */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-[#082f57] text-base">Post Follow-up Note / Activity</h3>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Note Title / Summary (e.g., Call Summary)..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none text-sm text-gray-800 focus:border-[#2563a9] transition-all"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Type detailed follow-up remarks or client conversation details..."
            className="w-full h-28 bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none text-sm text-gray-800 focus:border-[#2563a9] transition-all custom-scrollbar resize-none"
          />

          <div className="flex justify-end">
            <button
              disabled={submitting}
              onClick={handleNote}
              className="bg-[#2563a9] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Add Note"}
            </button>
          </div>
        </div>

        {/* NOTES TIMELINE */}
        <div className="space-y-4 pt-2">
          <h2 className="font-bold text-gray-600 text-xs uppercase tracking-wider">
            Previous Notes & History ({historyLogs.length})
          </h2>

          {historyLogs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
              No follow-up notes recorded yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 border-l-2 border-blue-200 mt-4">
              {historyLogs.slice().reverse().map((item, index) => {
                const originalIndex = historyLogs.length - 1 - index;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2 group"
                  >
                    <div className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-[#2563a9] border-2 border-white" />

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className="font-bold text-[#082f57]">{item.author || "User"}</span>
                      <div className="flex items-center gap-3">
                        <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : item.date || "Just now"}</span>
                        <button
                          onClick={() => handleDeleteNote(originalIndex)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                      {item.note}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}