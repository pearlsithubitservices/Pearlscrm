import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  FileText,
  Pencil,
  User,
  CheckCircle2,
} from "lucide-react";

export default function EmployeePerformancePage() {
  const scores = [
    { label: "Quality", value: 95, color: "bg-green-500" },
    { label: "Delivery", value: 78, color: "bg-violet-500" },
    { label: "Collaboration", value: 55, color: "bg-yellow-400" },
    { label: "Initiative", value: 65, color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-[#efede8] flex  p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-[#efedeb] rounded-3xl shadow-xl overflow-hidden"
      >
        {/* BODY */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-4">
            SCORE BREAKDOWN
          </h2>

          <div className="space-y-6">
            {scores.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium text-[#0b2b57]">
                    {item.label}
                  </h3>
                  <span className="text-[#0b2b57] font-medium">
                    {item.value} %
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}