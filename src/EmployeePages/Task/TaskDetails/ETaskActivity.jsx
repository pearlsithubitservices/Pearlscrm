import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Clock, Trash2 } from "lucide-react";
import { apiUrl } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";

export default function ETaskActivity({ task, onRefresh }) {
  const { user } = useAuth();
  const taskId = task?._id || task?.id || task?.uid;

  const [activitiesList, setActivitiesList] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTaskActivities = async () => {
    if (!taskId) return;
    try {
      const res = await fetch(apiUrl(`/activity?taskId=${taskId}`));
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json || [];
        setActivitiesList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching task activities:", err);
    }
  };

  useEffect(() => {
    fetchTaskActivities();
  }, [taskId]);

  const handleAddNote = async () => {
    if (!newNoteText.trim()) {
      alert("Please enter a progress update.");
      return;
    }

    if (!taskId) {
      alert("Task ID not found.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/activity"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_uid: user?.uid || user?._id || "employee",
          name: user?.displayName || user?.name || user?.employeeName || user?.email?.split("@")[0] || "Employee",
          text: newNoteText,
          taskId: String(taskId),
        }),
      });

      if (res.ok) {
        setNewNoteText("");
        alert("Progress activity submitted successfully!");
        fetchTaskActivities();
        if (onRefresh) onRefresh();
      } else {
        alert("Failed to submit progress activity.");
      }
    } catch (err) {
      console.error("Error submitting progress activity:", err);
      alert("Failed to submit progress activity.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm("Are you sure you want to delete this activity log?")) return;
    if (!activityId) return;

    try {
      const res = await fetch(apiUrl(`/activity/${activityId}`), {
        method: "DELETE",
      });

      if (res.ok) {
        setActivitiesList((prev) => prev.filter((item) => (item._id || item.id) !== activityId));
        alert("Activity log deleted successfully!");
        fetchTaskActivities();
        if (onRefresh) onRefresh();
      } else {
        alert("Failed to delete activity log.");
      }
    } catch (err) {
      console.error("Error deleting activity:", err);
      alert("Failed to delete activity log.");
    }
  };

  return (
    <div className="bg-[#f5f2ec] p-4 md:p-8 rounded-2xl min-h-[500px]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* INPUT SECTION */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
            <Clock size={18} className="text-[#2563a9]" />
            Post Progress Update Activity
          </h3>

          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Type your activity update here..."
            className="w-full h-28 bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none text-sm text-gray-800 focus:border-[#2563a9] transition-all resize-none"
          />

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
              onClick={handleAddNote}
              className="bg-[#2563a9] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send size={14} />
              {submitting ? "Saving..." : "Submit Progress Note"}
            </motion.button>
          </div>
        </div>

        {/* PROGRESS HISTORY */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
            Task Activity Timeline
          </h2>

          {activitiesList.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
              No progress updates posted yet for this task.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 border-l-2 border-blue-200">
              {activitiesList.map((item, index) => (
                <motion.div
                  key={item._id || index}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-[#2563a9] border-2 border-white" />

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="font-bold text-[#082f57]">{item.name || "Employee"}</span>
                    <div className="flex items-center gap-3">
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : item.time || "Just now"}</span>
                      <button
                        onClick={() => handleDeleteActivity(item._id || item.id)}
                        title="Delete Activity Log"
                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}