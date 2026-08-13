import React from "react";
import { motion } from "framer-motion";
import {
  GitPullRequest,
  CheckCircle,
  MessageSquare,
  FolderPlus,
  Circle,
} from "lucide-react";

const activities = [
  {
    title: "Merged PR #312 – auth module refactor",
    desc: "Discussed requirements for Q3 rollout. Client showed strong interest in enterprise tier features.",
    time: "Today 10:01 am",
    icon: GitPullRequest,
    color: "text-blue-600",
  },
  {
    title: "Approved Alex L. leave request",
    desc: "Discussed requirements for Q3 rollout. Client showed strong interest in enterprise tier features.",
    time: "Today 8:30 am",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    title: "Left a comment on Stripe Integration task",
    desc: "Discussed requirements for Q3 rollout. Client showed strong interest in enterprise tier features.",
    time: "Today 10:01 am",
    icon: MessageSquare,
    color: "text-purple-600",
  },
  {
    title: "Created project: Customer Success Portal",
    desc: "Discussed requirements for Q3 rollout. Client showed strong interest in enterprise tier features.",
    time: "May 8",
    icon: FolderPlus,
    color: "text-orange-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export default function ActivityTimeline() {
  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-gray-500 font-semibold tracking-wide mb-6">
        ACTIVITY TIMELINE
      </h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative border-l border-gray-200 ml-3"
      >
        {activities.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="mb-10 ml-3.5 relative"
            >
              {/* Dot */}
              <span className="absolute -left-[34px] flex items-center justify-center w-10 h-10   rounded-full shadow-sm">
                <div className="w-5  h-5 bg-blue-700 rounded-full"> </div>
              </span>

              {/* Content */}
              <div className="ml-2">
                <h3 className="text-gray-900 font-semibold text-sm">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                  {item.desc}
                </p>
                <span className="text-xs text-gray-400 mt-2 inline-block">
                  {item.time}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}