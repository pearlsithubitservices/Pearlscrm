import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Clock, Activity as ActivityIcon } from "lucide-react";
import { apiUrl } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";

export default function ETaskActivity({ task, tasks, onRefresh }) {
  const { user } = useAuth();
  const currentTask = task || (Array.isArray(tasks) ? tasks[0] : tasks) || {};
  const taskId = currentTask?._id || currentTask?.id;

  const [newActivity, setNewActivity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activityList, setActivityList] = useState([]);

  const authorName =
    user?.displayName ||
    user?.name ||
    user?.employeeName ||
    (user?.email ? user.email.split("@")[0] : "Employee");

  const fetchActivities = async () => {
    if (!taskId) return;
    try {
      const res = await fetch(apiUrl(`/activity?taskId=${taskId}`));
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json || [];
        setActivityList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching activities for employee:", err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [taskId]);

  const handleAddActivity = async () => {
    if (!newActivity.trim()) {
      alert("Please enter a progress update note.");
      return;
    }
    if (!taskId) {
      alert("Task not selected.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/activity"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_uid: user?.uid || user?._id || "employee",
          name: authorName,
          text: newActivity,
          taskId: String(taskId),
        }),
      });

      if (res.ok) {
        setNewActivity("");
        alert("Progress update posted successfully!");
        fetchActivities();
        if (onRefresh) onRefresh();
      } else {
        alert("Failed to post progress update.");
      }
    } catch (err) {
      console.error("Error posting activity:", err);
      alert("Failed to post progress update.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f5f2ec] p-4 md:p-8 min-h-[500px]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* INPUT SECTION */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-[#082f57] text-base flex items-center gap-2">
            <ActivityIcon size={18} className="text-[#2563a9]" />
            Update Task Progress Remarks
          </h3>

          <textarea
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            placeholder="Type progress update or task completion remarks..."
            className="w-full h-28 bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none text-sm text-gray-800 focus:border-[#2563a9] transition-all resize-none"
          />

          <div className="flex justify-end">
            <button
              disabled={submitting}
              onClick={handleAddActivity}
              className="bg-[#2563a9] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send size={14} />
              {submitting ? "Posting..." : "Post Progress Update"}
            </button>
          </div>
        </div>

        {/* TIMELINE SECTION */}
        <div className="space-y-4 pt-2">
          <h2 className="font-bold text-gray-600 text-sm uppercase tracking-wider flex items-center gap-2">
            <Clock size={16} />
            Progress Activity History
          </h2>

          {activityList.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
              No progress updates posted yet for this task.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 border-l-2 border-blue-200 mt-4">
              {activityList.map((item, index) => (
                <motion.div
                  key={item._id || index}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2"
                >
                  <div className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-[#2563a9] border-2 border-white" />

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="font-bold text-[#082f57]">{item.name || "Employee"}</span>
                    <span>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : item.time || "Just now"}
                    </span>
                  </div>

                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}