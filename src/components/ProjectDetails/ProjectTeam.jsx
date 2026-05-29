import React from "react";
import { Pencil } from "lucide-react";
import { motion } from "framer-motion";

const teamMembers = [
  {
    initials: "RK",
    name: "Rohan M.",
    role: "Sales Lead",
    progress: 33,
    color: "bg-[#4611A7]",
  },
  {
    initials: "VI",
    name: "Aisha K.",
    role: "Project Lead",
    progress: 33,
    color: "bg-[#39B88A]",
  },
  {
    initials: "LT",
    name: "Leo T.",
    role: "BDR",
    progress: 33,
    color: "bg-[#A100D6]",
  },
];

export default function CRMTeamPage() {
  return (
    <>
        <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[1500px] rounded-[30px] overflow-hidden bg-[#F5F3EF]"
      >

        {/* Content */}
        <div className="px-8 py-8">
          {/* Labels */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="uppercase text-[16px] font-semibold tracking-wide text-[#919191]">
              Team Members
            </h3>

            <h3 className="uppercase text-[16px] font-semibold tracking-wide text-[#919191] pr-1">
              Progress
            </h3>
          </div>

          {/* Team Cards */}
          <div className="space-y-4">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="bg-[#FAFAFA] rounded-2xl px-5 py-5 flex items-center"
              >
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-[18px]`}
                >
                  {member.initials}
                </div>

                {/* Name & Role */}
                <div className="ml-5 min-w-[180px]">
                  <h4 className="text-[22px] font-bold text-[#062C5B] leading-none">
                    {member.name}
                  </h4>

                  <p className="mt-2 text-[16px] text-[#8E8E8E]">
                    {member.role}
                  </p>
                </div>

                {/* Progress */}
                <div className="flex-1 flex items-center gap-5 ml-10">
                  <div className="flex-1 h-3 rounded-full bg-[#D8D8D8] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${member.progress * 2}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full rounded-full bg-[#4E82F0]"
                    />
                  </div>

                  <span className="text-[20px] font-bold text-[#062C5B] min-w-[55px] text-right">
                    {member.progress}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Spacer */}
          <div className="h-28" />

          {/* Add Team */}
          <div>
            <h3 className="uppercase text-[16px] font-semibold tracking-wide text-[#919191] mb-4">
              Add Team Members
            </h3>

            <textarea
              placeholder="Add a team members..."
              className="w-full h-[170px] resize-none rounded-2xl border border-[#ECECEC] bg-[#FAFAFC] p-5 text-[18px] outline-none placeholder:text-[#B3B3B3]"
            />

            <div className="flex justify-end mt-5">
              <button className="bg-[#2663FF] hover:bg-[#1E54E5] transition text-white rounded-full px-6 py-3 text-[15px] font-semibold">
                Add to team
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}