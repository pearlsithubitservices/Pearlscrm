import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Pencil,
  CheckCircle2,
  Flame,
} from "lucide-react";

export default function ProjectDetailsPage() {
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = [
    "Overview",
    "Milestones",
    "Notes",
    "Team",
    "Activity",
  ];

  return (
     <>
      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl bg-[#F4F1EC] rounded-[28px] overflow-hidden "
      >
        
    

        {/* Content */}
        <div className="p-8">
          
          {/* Project Description */}
          <div>
            <h2 className="text-gray-400 font-bold text-[10px] md:text-[20px] uppercase">
              PROJECT DESCRIPTION
            </h2>

            <div className="mt-5 border border-gray-300 rounded-2xl bg-[#F4F1EC] p-8">
              <p className="text-[#0B2D57] text-[10px] md:text-[18px] leading-relaxed font-medium">
                Full CRM rollout for 200-seat enterprise account.
                Phase 1: data migration. Phase 2: training.
                Phase 3: go-live.
              </p>
            </div>
          </div>

          {/* Project Information */}
          <div className="mt-10">
            <h2 className="text-gray-400 font-bold text-[10px] md:text-[20px] uppercase">
              PROJECT INFORMATION
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              
              {[
                {
                  label: "CLIENT",
                  value: "TechFlow Solutions",
                },
                {
                  label: "STATUS",
                  value: "On Track",
                },
                {
                  label: "ASSIGNED DATE",
                  value: "May 02",
                },
                {
                  label: "DUE DATE",
                  value: "May 12",
                },
                {
                  label: "BUDGET",
                  value: "₹120,000",
                },
                {
                  label: "ASSIGNED BY",
                  value: "Ragavi",
                },
              ].map((item, index) => (
                <motion.div
                  whileHover={{ y: -4 }}
                  key={index}
                  className="bg-[#F8F7FB] rounded-2xl p-6 text-[10px] md:text-[14px]"
                >
                  <h4 className="text-gray-400 font-bold  text-xl uppercase">
                    {item.label}
                  </h4>

                  <p className="mt-3 text-[#0B2D57]  font-semibold">
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Project Progress */}
          <div className="mt-10">
            <h2 className="text-gray-400 font-bold text-[10px] md:text-[20px] uppercase">
              PROJECT PROGRESS
            </h2>

            <div className="mt-5 bg-[#F8F7FB] rounded-2xl p-6">
              
              <div className="flex items-center justify-between mb-6">
                <p className="text-[#0B2D57] text-[10pxpx] md:text-[18px] font-medium">
                  Project Progress 65% complete
                </p>

                <CheckCircle2
                  size={28}
                  className="text-blue-500"
                />
              </div>

              {/* Progress Bar */}
              <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 1 }}
                  className="h-full bg-[#4B82FF] rounded-full"
                />
              </div>
            </div>
          </div>

        </div>
      </motion.div>
</>
  );
}