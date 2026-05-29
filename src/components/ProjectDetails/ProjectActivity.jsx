import React from "react";
import { motion } from "framer-motion";
import {
  GitPullRequest,
  CheckCircle,
  MessageSquare,
  FolderPlus,
} from "lucide-react";

const activities = [
  {
    title: "Merged PR #312 – auth module refactor",
    desc: "Discussed requirements for Q3 rollout. Client showed strong interest in enterprise tier features.",
    time: "Today 10:01 am",
    icon: GitPullRequest,
    iconColor: "text-[#2563EB]",
  },
  {
    title: "Approved Alex L. leave request",
    desc: "Discussed requirements for Q3 rollout. Client showed strong interest in enterprise tier features.",
    time: "Today 8:30 am",
    icon: CheckCircle,
    iconColor: "text-[#16A34A]",
  },
  {
    title: "Left a comment on Stripe Integration task",
    desc: "Discussed requirements for Q3 rollout. Client showed strong interest in enterprise tier features.",
    time: "Today 10:01 am",
    icon: MessageSquare,
    iconColor: "text-[#9333EA]",
  },
  {
    title: "Created project: Customer Success Portal",
    desc: "Discussed requirements for Q3 rollout. Client showed strong interest in enterprise tier features.",
    time: "May 8",
    icon: FolderPlus,
    iconColor: "text-[#EA580C]",
  },
];

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

export default function ActivityTimeline() {
  return (
    <div className="w-full rounded-[28px] bg-[#F5F3EF] p-8">
      {/* Heading */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[16px] font-semibold tracking-wide uppercase text-[#919191]">
          Activity Timeline
        </h2>
      </div>

      {/* Timeline */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative"
      >
        {/* Vertical Line */}
        <div className="absolute left-[18px] top-2 bottom-2 w-[2px] h-full bg-[#D9D9D9]" />

        <div className="space-y-10">
          {activities.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative flex gap-5"
              >
                {/* Timeline Dot */}
                <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white ">
                 <div className="w-5 h-5 rounded-full bg-blue-600"></div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h3 className="text-[18px] font-semibold leading-none text-[#0B2B52]">
                    {item.title}
                  </h3>

                  <p className="mt-2 max-w-3xl text-[15px] leading-[1.6] text-[#8B8B8B]">
                    {item.desc}
                  </p>

                  <span className="inline-block mt-3 text-[13px] text-[#B0B0B0]">
                    {item.time}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}