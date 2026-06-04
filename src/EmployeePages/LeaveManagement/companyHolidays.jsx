import React from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Flag,
  Gift,
  Star,
} from "lucide-react";

const CompanyHolidays = () => {
  const holidays = [
    {
      id: 1,
      name: "Independence Day",
      date: "July 4, 2024",
      icon: Flag,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      id: 2,
      name: "Labor Day",
      date: "September 2, 2024",
      icon: Star,
      bg: "bg-orange-100",
      color: "text-orange-600",
    },
    {
      id: 3,
      name: "Thanksgiving",
      date: "November 28, 2024",
      icon: Gift,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-3xl h-[570px] border border-black/10 p-6"
    >
      {/* Header */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0B2B57]">
            Company Holidays
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Official holidays and events
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#EEF4FF] text-[#2F6CC5] text-xs font-semibold">
          This Month
        </span>
      </div>

      {/* Holiday List */}

      <div className="space-y-4">
        {holidays.map((holiday, index) => {
          const Icon = holiday.icon;

          return (
            <motion.div
              key={holiday.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-none"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${holiday.bg}`}
                >
                  <Icon
                    size={20}
                    className={holiday.color}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-[#0B2B57]">
                    {holiday.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Company Holiday
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500 font-medium">
                {holiday.date}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Summary */}

      <div className="mt-6 pt-5 border-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] flex items-center justify-center">
            <CalendarDays
              size={18}
              className="text-[#2F6CC5]"
            />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Upcoming Holidays
            </p>

            <h4 className="font-bold text-[#0B2B57]">
              {holidays.length} Scheduled
            </h4>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CompanyHolidays;