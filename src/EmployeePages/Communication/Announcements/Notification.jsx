import React from "react";
import { motion } from "framer-motion";
import { Circle } from "lucide-react";

const notifications = [
  {
    title: "Your leave request for Jun 20 is pending approval",
    sub: "HR Manager",
    time: "Today, 02:30 PM",
  },
  {
    title: "Payslip for May 2026 is now available",
    sub: "HR Manager",
    time: "Yesterday, 02:30 PM",
  },
  {
    title: "IT Declaration deadline: 31 July 2026",
    sub: "HR Manager",
    time: "Oct 24, 02:30 PM",
  },
  {
    title: "Your reimbursement claim of ₹3,200 was approved",
    sub: "HR Manager",
    time: "Oct 24, 02:30 PM",
  },
  {
    title: "Team meeting rescheduled to Thursday 4 PM",
    sub: "HR Manager",
    time: "Oct 24, 02:30 PM",
  },
];

export default function ImportantNotifications() {
  return (
    <div className="w-full max-w-4xl mx-auto ">
      {/* Header */}
      <div className="flex items-center justify-between bg-white shadow-sm border rounded-xl px-5 py-4">
        <h2 className="text-lg font-semibold">Important notifications</h2>

        <span className="text-xs font-medium bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
          02 New
        </span>
      </div>

      {/* Body */}
      <div className="mt-4 bg-white border rounded-xl p-5">
        <div className="relative border-l border-gray-200 pl-6 space-y-6">
          {notifications.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="relative"
            >
              {/* Dot */}
              <div className="absolute -left-[22px] top-1">
                <Circle className="w-3 h-3 fill-blue-600 text-blue-600" />
              </div>

              {/* Content */}
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {item.title}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {item.sub}
                  </p>
                </div>

                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {item.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}