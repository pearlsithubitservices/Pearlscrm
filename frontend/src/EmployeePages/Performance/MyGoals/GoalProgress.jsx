import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  TrendingUp,
  FolderOpen,
  Plus,
  Trash2,
} from "lucide-react";
import useGoals from "../../../Hooks/useGoals";
import { useAuth } from "../../../context/AuthContext";

export default function GoalProgress({ goals, setGoals, fetchGoals }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(goals?.progress ?? 0);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { updateProgress, deleteProgress } = useGoals();

  useEffect(() => {
    if (goals?.progress !== undefined && goals?.progress !== null) {
      setProgress(Number(goals.progress) || 0);
    }
  }, [goals?.progress]);

  const authorName =
    user?.displayName ||
    user?.name ||
    user?.employeeName ||
    (user?.email ? user.email.split("@")[0] : "Employee");

  const handleAddProgress = async () => {
    if (!description.trim()) {
      alert("Please enter a progress note / description.");
      return;
    }

    const goalId = goals?._id || goals?.id;
    if (!goalId) {
      alert("Goal ID not found.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await updateProgress(
        goalId,
        {
          progress: Number(progress),
          description: description.trim(),
          user: authorName,
        }
      );

      if (response?.goals) {
        setGoals(response.goals);
      } else if (response?.goal) {
        setGoals(response.goal);
      }

      setDescription("");
      if (fetchGoals) fetchGoals();
      alert("Progress updated successfully!");
    } catch (err) {
      console.error("Error updating progress:", err);
      alert(err.message || "Failed to update progress");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProgress = async (logItem, index) => {
    if (!window.confirm("Are you sure you want to delete this progress note?")) return;

    const goalId = goals?._id || goals?.id;
    if (!goalId) return;

    const logId = logItem?._id || logItem?.id || index;

    try {
      setSubmitting(true);
      const response = await deleteProgress(goalId, logId);
      if (response?.goals) {
        setGoals(response.goals);
      } else if (response?.goal) {
        setGoals(response.goal);
      }
      if (fetchGoals) fetchGoals();
      alert("Progress note deleted successfully!");
    } catch (err) {
      console.error("Error deleting progress note:", err);
      alert(err.message || "Failed to delete progress note");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F4F2EC]">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-[#F4F2EC] rounded-[30px] overflow-hidden shadow-sm"
      >
        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              {/* Title */}
              <h2 className="uppercase text-gray-500 font-bold text-xl">
                Update Progress
              </h2>

              {/* Progress Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <p className="text-[28px] font-semibold text-[#244161] mb-8">
                  Update Your Goals progress {progress} %
                </p>

                <div className="relative">
                  <div className="h-4 rounded-full bg-gray-200" />

                  <motion.div
                    animate={{
                      width: `${progress}%`,
                    }}
                    className="absolute top-0 left-0 h-4 rounded-full bg-[#35BE88]"
                  />

                  <motion.div
                    animate={{
                      left: `calc(${progress}% - 12px)`,
                    }}
                    className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#35BE88]"
                  />

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={progress}
                    onChange={(e) =>
                      setProgress(Number(e.target.value))
                    }
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Add a new progress note / description..."
                  className="w-full bg-white rounded-2xl border border-gray-200 p-6 text-xl outline-none resize-none placeholder:text-gray-400"
                />

                <div className="flex justify-end mt-5">
                  <button
                    disabled={submitting}
                    className="bg-[#3F7BEF] hover:bg-[#356fe0] text-white rounded-full px-6 py-2.5 text-sm font-medium flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                    onClick={handleAddProgress}
                  >
                    <Plus size={15} />
                    {submitting ? "Saving..." : "Add to progress"}
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-8">
                <div className="absolute left-3 top-4 bottom-4 w-[2px] bg-[#D2D7E5]" />

                <div className="space-y-6 max-h-[450px] overflow-y-auto no-scrollbar">
                  {(!goals?.progressLogs || goals.progressLogs.length === 0) ? (
                    <div className="bg-white rounded-2xl p-6 text-center text-gray-400 border border-gray-200">
                      No progress notes added yet. Use the slider and form above to record an update.
                    </div>
                  ) : (
                    (goals.progressLogs || [])
                      .slice()
                      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                      .map((item, index) => (
                        <div
                          key={item._id || index}
                          className="relative bg-white rounded-2xl p-5 border border-gray-200 shadow-xs"
                        >
                          <div className="absolute -left-10 top-6 w-5 h-5 rounded-full bg-[#3577F5] border-4 border-[#F4F2EC]" />

                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-[18px] font-medium text-[#244161] leading-relaxed break-words">
                                {item.description}
                              </p>
                              <div className="mt-2 flex items-center gap-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  {item.progress}% Completed
                                </span>
                                <span className="text-xs text-gray-400">
                                  {item.date ? new Date(item.date).toLocaleDateString('en-GB') : "Recently"}
                                  {" • "}by {item.user || "Employee"}
                                </span>
                              </div>
                            </div>

                            {/* Delete Button for Note */}
                            <button
                              type="button"
                              onClick={() => handleDeleteProgress(item, index)}
                              title="Delete this progress note"
                              disabled={submitting}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer disabled:opacity-50 shrink-0"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}