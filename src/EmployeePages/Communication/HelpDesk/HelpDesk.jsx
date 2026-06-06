import React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Clock } from "lucide-react";

const tickets = [
  {
    title: "Laptop screen flickering intermittently",
    sub: "Assigned to IT Support",
    status: "In progress",
    type: "progress",
    date: "Oct 24, 02:30 PM",
  },
  {
    title: "PF account linking issue",
    sub: "Assigned to Hr manager",
    status: "In progress",
    type: "progress",
    date: "Oct 24, 02:30 PM",
  },
  {
    title: "VPN access not working from home",
    sub: "Resolved by IT Team",
    status: "Resolved",
    type: "resolved",
    date: "Oct 24, 02:30 PM",
  },
  {
    title: "Laptop screen flickering intermittently",
    sub: "Assigned to IT Support",
    status: "Resolved",
    type: "resolved",
    date: "Oct 24, 02:30 PM",
  },
  {
    title: "Laptop screen flickering intermittently",
    sub: "Assigned to IT Support",
    status: "Resolved",
    type: "resolved",
    date: "Oct 24, 02:30 PM",
  },
];

export default function SupportTickets() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            My support tickets
          </h1>

          <button className="px-4 py-1 text-sm bg-gray-200 text-gray-700 rounded-full">
            STATUS
          </button>
        </div>

        {/* Ticket List */}
        <div className="space-y-4">
          {tickets.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between py-3 border-b border-gray-100"
            >
              {/* Left Side */}
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  {item.title}
                </h2>
                <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-6">

                {/* Status Badge */}
                {item.type === "progress" ? (
                  <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-600">
                    <Clock size={14} /> {item.status}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-100 text-green-600">
                    <BadgeCheck size={14} /> {item.status}
                  </span>
                )}

                {/* Date */}
                <span className="text-xs text-gray-400 w-32 text-right">
                  {item.date}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}