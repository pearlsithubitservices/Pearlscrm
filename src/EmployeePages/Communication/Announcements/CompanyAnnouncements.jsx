import React, { useState } from "react";
import { motion } from "framer-motion";
import { Pin } from "lucide-react";
import FullAnnouncements from "./FullAnnouncements";

const CompanyAnnouncements = () => {
    const [showForm, setShowForm]=useState(false);
  const announcements = [
    {
      id: 1,
      priority: "High",
      title: "Town Hall — Q2 2026 All-Hands Meeting",
      description:
        "The open enrollment for healthcare benefits will begin next Monday. Please review the updated documentation in the portal.",
      author: "Sarah Jenkins",
      role: "HR Director",
      date: "Oct 24, 02:30 PM",
      badgeColor: "bg-red-100 text-red-600",
      borderColor: "border-l-red-500",
    },
    {
      id: 2,
      priority: "Med",
      title: "Leave Policy Update — Effective July 2026",
      description:
        "The open enrollment for healthcare benefits will begin next Monday. Please review the updated documentation in the portal.",
      author: "Sarah Jenkins",
      role: "HR Director",
      date: "Oct 24, 02:30 PM",
      badgeColor: "bg-yellow-100 text-yellow-700",
      borderColor: "border-l-yellow-500",
    },
    {
      id: 3,
      priority: "Low",
      title: "Annual Benefits Enrollment Period Opening Soon",
      description:
        "The open enrollment for healthcare benefits will begin next Monday. Please review the updated documentation in the portal.",
      author: "Sarah Jenkins",
      role: "HR Director",
      date: "Oct 24, 02:30 PM",
      badgeColor: "bg-purple-100 text-purple-600",
      borderColor: "border-l-purple-500",
    },
  ];

  return (
    <div className="w-full space-y-5">
      {/* Header */}

      <div className="bg-white rounded-2xl  border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0B2B57]">
          Company Announcements
        </h2>

        <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-500">
          02 Unread
        </span>
      </div>

      {/* Announcements */}

      <div className=" rounded-2xl   p-4  space-y-4">
        {announcements.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 * 0.1 }}
            whileHover={{ y: -2 }}
            className={`border border-gray-100 border-l-4 ${item.borderColor} cursor-pointer bg-white rounded-2xl p-5 hover:shadow-md transition-all`}
            onClick={() => setShowForm(true)}
          >
            <div className="flex justify-between items-start">
              <span
                className={`px-4 py-1 rounded-full text-xs font-semibold ${item.badgeColor}`}
              >
                {item.priority}
              </span>

              <Pin
                size={16}
                className="text-gray-500 cursor-pointer"
              />
            </div>

            <h3 className="mt-4 text-xl font-bold text-[#0B2B57]">
              {item.title}
            </h3>

            <p className="text-gray-500 mt-3 leading-relaxed">
              {item.description}
            </p>

            <div className="flex items-center justify-between mt-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0B2B57] text-white flex items-center justify-center font-semibold">
                  S
                </div>

                <div>
                  <p className="font-semibold text-sm">
                    {item.author}
                  </p>

                  <p className="text-xs text-gray-500">
                    {item.role}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-400">
                {item.date}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      {showForm&&
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <FullAnnouncements
        onClose={()=>setShowForm(false)}
        />
      </div>

      }
    </div>
  );
};

export default CompanyAnnouncements;