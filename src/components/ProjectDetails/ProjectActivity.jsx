import React from "react";
import { motion } from "framer-motion";
import {
  GitPullRequest,
  CheckCircle,
  MessageSquare,
  FolderPlus,
  UserPlus,
  UserMinus,
  FileText,
  Activity,
  Trash2,
} from "lucide-react";
import { apiUrl } from "../../config/api";

const getIcon = (iconType) => {
  switch (iconType) {
    case "create":
      return { Icon: FolderPlus, color: "text-[#EA580C]" };
    case "note":
      return { Icon: FileText, color: "text-[#9333EA]" };
    case "user_add":
      return { Icon: UserPlus, color: "text-[#2563EB]" };
    case "user_remove":
      return { Icon: UserMinus, color: "text-[#DC2626]" };
    default:
      return { Icon: Activity, color: "text-blue-600" };
  }
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

export default function ActivityTimeline({ projects, project, fetchProjects }) {
  const currentProject = project || (projects && projects[0]) || {};
  const activities = currentProject.activities || [];

  const handleDeleteActivity = async (indexToDelete) => {
    if (!window.confirm("Are you sure you want to delete this activity log?")) return;
    if (!currentProject._id) return;

    const updatedActivities = activities.filter((_, idx) => idx !== indexToDelete);

    try {
      const res = await fetch(apiUrl(`/projects/${currentProject._id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activities: updatedActivities }),
      });

      if (res.ok) {
        if (fetchProjects) fetchProjects();
      } else {
        alert("Failed to delete activity log");
      }
    } catch (err) {
      console.error("Error deleting activity log from project:", err);
    }
  };

  return (
    <div className="w-full rounded-[28px] bg-[#F5F3EF] p-8">
      {/* Heading */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[16px] font-semibold tracking-wide uppercase text-[#919191]">
          Activity Timeline ({activities.length})
        </h2>
      </div>

      {/* Timeline */}
      {activities.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative"
        >
          {/* Vertical Line */}
          <div className="absolute left-[18px] top-2 bottom-2 w-[2px] h-full bg-[#D9D9D9]" />

          <div className="space-y-8">
            {activities.map((item, index) => {
              const { Icon, color } = getIcon(item.iconType);

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative flex gap-5"
                >
                  {/* Timeline Dot */}
                  <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200">
                    <Icon size={18} className={color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1 bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-[16px] font-bold leading-tight text-[#0B2B52]">
                        {item.title}
                      </h3>
                      <button
                        onClick={() => handleDeleteActivity(index)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer shrink-0"
                        title="Delete Activity Log"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {item.desc && (
                      <p className="mt-1 text-[14px] leading-relaxed text-[#666]">
                        {item.desc}
                      </p>
                    )}

                    <span className="inline-block mt-2 text-[12px] text-[#A0A0A0] font-medium">
                      {item.time || item.createdAt ? new Date(item.createdAt || Date.now()).toLocaleString() : "Recently"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <div className="bg-white p-8 rounded-2xl text-center text-gray-500 font-medium border border-gray-200">
          No activity logs recorded for this project yet.
        </div>
      )}
    </div>
  );
}