import React from "react";
import {
  Building2,
  Mail,
  Phone,
  Plus,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const ClientProjects = () => {
  const projects = [
    {
      title: "CRM Implementation Phase 1",
      status: "Completed",
      progress: 100,
      color: "bg-blue-500",
      text: "text-blue-600",
    },
    {
      title: "Redesign the onboarding experience for enterprise accounts.",
      status: "In progress",
      progress: 68,
      color: "bg-blue-500",
      text: "text-green-600",
    },
    {
      title: "Redesign the onboarding experience for enterprise accounts.",
      status: "accounts.",
      progress: 40,
      color: "bg-blue-500",
      text: "text-gray-600",
    },
  ];

  return (
    <div className="w-full  rounded-2xl bg-[#f6f3ee] p-5 shadow-xl border border-black/5">
      
      {/* TOP INFO */}
      

      {/* SUMMARY */}
      <div className="mt-5">
        <p className="text-[11px] font-semibold text-gray-400 mb-3">
          PROJECTS SUMMARY
        </p>

        <div className="grid grid-cols-3 gap-3">
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-lg bg-[#dfe9ff] p-3"
          >
            <p className="text-[10px] font-bold text-[#1d3557]">TOTAL</p>
            <h3 className="text-2xl font-bold text-[#1d3557] mt-1">03</h3>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-lg bg-[#e8f4d9] p-3"
          >
            <p className="text-[10px] font-bold text-[#3f6b2a]">ACTIVE</p>
            <h3 className="text-2xl font-bold text-[#3f6b2a] mt-1">02</h3>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-lg bg-[#ffe3de] p-3"
          >
            <p className="text-[10px] font-bold text-[#c95040]">FINISH</p>
            <h3 className="text-2xl font-bold text-[#c95040] mt-1">01</h3>
          </motion.div>
        </div>
      </div>

      {/* PROJECT HISTORY */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-gray-400">
            PROJECT HISTORY
          </p>

          <button className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-200 text-[10px] text-gray-600">
            <Plus size={12} />
            Add Project
          </button>
        </div>

        <div className="space-y-3">
          {projects.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-xl p-4 border border-black/5"
            >
              <h3 className="font-bold text-[#1d3557] text-sm">
                {item.title}
              </h3>

              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Redesign the onboarding experience for enterprise accounts.
                Focus on reducing time-to-value and improving activation rates.
                The current flow has a 40% drop-off.
              </p>

              <div className="flex items-center justify-between mt-4">
                <p className="text-[11px]">
                  <span className="text-gray-400">Due Jul 30 - </span>

                  <span className={`font-semibold ${item.text}`}>
                    {item.status}
                  </span>
                </p>

                <p className="text-xs font-bold text-[#1d3557]">
                  {item.progress}%
                </p>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 1 }}
                  className={`h-full ${item.color} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientProjects;