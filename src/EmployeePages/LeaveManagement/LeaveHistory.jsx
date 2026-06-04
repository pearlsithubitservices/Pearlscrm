import React from "react";
import { motion } from "framer-motion";
import { exportLeaveHistoryPDF } from "./LeaveExport";
import {
  Plane,
  BriefcaseMedical,
  PartyPopper,
  Download,
} from "lucide-react";


const LeaveHistory = () => {
  const leaveHistoryData = [
    {
      id: 1,
      title: "Summer Vacation",
      date: "Aug 12 - Aug 18, 2024",
      days: "5 Days",
      status: "APPROVED",
      icon: Plane,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      id: 2,
      title: "Medical Checkup",
      date: "Jul 04, 2024",
      days: "1 Day",
      status: "APPROVED",
      icon: BriefcaseMedical,
      bg: "bg-orange-100",
      color: "text-orange-600",
    },
    {
      id: 3,
      title: "Family Wedding",
      date: "Jul 04, 2024",
      days: "1 Day",
      status: "APPROVED",
      icon: PartyPopper,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      id="leave-history-table"
      className="bg-white rounded-3xl border border-black/10 p-6 lg:p-8"
    >
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-3xl font-bold text-[#0B2B57]">
          Leave History
        </h2>

        <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-all px-4 py-2 rounded-full text-sm font-medium text-[#0B2B57]"
          onClick={()=> exportLeaveHistoryPDF(leaveHistoryData)}
        >

          <Download size={16} />

          Export PDF
        </button>
      </div>

      {/* History List */}

      <div className="space-y-5">
        {leaveHistoryData.map((leave, index) => {
          const Icon = leave.icon;

          return (
            <motion.div
              key={leave.id}

              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className="flex items-center justify-between border-b border-gray-100 pb-5 last:border-none"
            >
              {/* Left */}

              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${leave.bg}`}
                >
                  <Icon
                    size={22}
                    className={leave.color}
                  />
                </div>

                <div>
                  <h3 className="font-bold text-xl text-[#0B2B57]">
                    {leave.title}
                  </h3>

                  <p className="text-gray-400 text-sm mt-1">
                    {leave.date}
                  </p>
                </div>
              </div>

              {/* Right */}

              <div className="text-right">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  {leave.status}
                </span>

                <p className="text-gray-700 mt-2 font-medium">
                  {leave.days}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

    </motion.div>
  );
};

export default LeaveHistory;