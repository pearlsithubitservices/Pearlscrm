import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { apiUrl } from "../../config/api";

export default function MilestonesContent({ projects, project, fetchProjects }) {
  const currentProject = project || (projects && projects[0]) || {};
  const milestones = currentProject.milestones || [];

  const [newMilestone, setNewMilestone] = useState("");

  const addMilestone = async () => {
    if (!newMilestone.trim() || !currentProject._id) return;

    const newMsObj = {
      title: newMilestone.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      completed: false,
    };

    const updatedMilestones = [...milestones, newMsObj];

    try {
      const res = await fetch(apiUrl(`/projects/${currentProject._id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestones: updatedMilestones }),
      });

      if (res.ok) {
        setNewMilestone("");
        if (fetchProjects) fetchProjects();
      } else {
        alert("Failed to add milestone");
      }
    } catch (err) {
      console.error("Error adding milestone:", err);
    }
  };

  const toggleMilestone = async (index) => {
    if (!currentProject._id) return;

    const updatedMilestones = milestones.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );

    try {
      const res = await fetch(apiUrl(`/projects/${currentProject._id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestones: updatedMilestones }),
      });

      if (res.ok && fetchProjects) {
        fetchProjects();
      }
    } catch (err) {
      console.error("Error toggling milestone:", err);
    }
  };

  const completedCount = milestones.filter((m) => m.completed).length;

  return (
    <div className="w-full px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[12px] md:text-[18px] font-bold text-gray-500 uppercase tracking-wide">
          Milestones Complete ({completedCount} / {milestones.length})
        </h2>

        <span className="text-[12px] md:text-[18px] font-bold text-gray-500 uppercase tracking-wide">
          Date
        </span>
      </div>

      {/* Milestone List */}
      <div className="flex flex-col gap-4">
        {milestones.length > 0 ? (
          milestones.map((item, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: index * 0.08,
              }}
              whileHover={{
                scale: 1.01,
              }}
              className="bg-[#FAFAFA] border border-gray-100 rounded-xl px-6 py-4 flex items-center justify-between shadow-2xs"
            >
              {/* Left */}
              <div className="flex items-center gap-5">
                {/* Checkbox */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleMilestone(index)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                    item.completed ? "bg-[#2F7D57]" : "bg-[#B5B5B5] hover:bg-gray-400"
                  }`}
                >
                  {item.completed && (
                    <Check size={20} className="text-white stroke-[3]" />
                  )}
                </motion.div>

                {/* Title */}
                <h3
                  className={`text-[14px] md:text-[17px] font-semibold ${
                    item.completed ? "text-gray-400 line-through" : "text-[#0B2D57]"
                  }`}
                >
                  {item.title}
                </h3>
              </div>

              {/* Date */}
              <p className="text-[14px] md:text-[16px] text-gray-400 font-medium">
                {item.date || "Scheduled"}
              </p>
            </motion.div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-xl text-center text-gray-400 font-medium border border-gray-200">
            No milestones added for this project yet.
          </div>
        )}
      </div>

      {/* Add Milestone */}
      <div className="mt-12">
        <h2 className="text-[12px] md:text-[18px] font-bold text-gray-500 uppercase mb-4 tracking-wide">
          Add Milestone
        </h2>

        <div className="bg-[#FAFAFA] border border-gray-200 rounded-2xl p-5 shadow-2xs">
          <textarea
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            placeholder="Add a new milestone title..."
            className="w-full h-[90px] resize-none bg-transparent outline-none text-[16px] md:text-[18px] placeholder:text-gray-400 text-[#0B2D57]"
          />

          {/* Button */}
          <div className="flex justify-end mt-3">
            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={addMilestone}
              disabled={!newMilestone.trim()}
              className="px-7 py-2.5 rounded-full bg-[#2F6BFF] hover:bg-[#1d4ed8] disabled:opacity-40 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              Add Milestone
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}