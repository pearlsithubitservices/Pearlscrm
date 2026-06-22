import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Flag,
  Gift,
  Star,
  Globe,
} from "lucide-react";
import useLeave from "../../Hooks/useLeave";

const CompanyHolidays = () => {
  const { getHolidays, holidays } = useLeave();

  useEffect(() => {
    getHolidays();
  }, []);

  const holidayIcons = {
    Public: {
      icon: Gift,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
    Festival: {
      icon: Star,
      bg: "bg-orange-100",
      color: "text-orange-600",
    },
    National: {
      icon: Flag,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    Optional: {
      icon: Globe,
      bg: "bg-green-100",
      color: "text-green-600",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-3xl h-[570px] border border-black/10 p-6 overflow-y-auto no-scrollbar"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0B2B57]">
            Company Holidays
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Upcoming company holidays
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#EEF4FF] text-[#2F6CC5]  text-[10px] font-semibold">
          This Month
        </span>
      </div>

      {/* Holiday List */}
      <div className="space-y-4">
        {holidays?.length > 0 ? (
          holidays.map((holiday, index) => {
            const iconData =
              holidayIcons[holiday.holidayType] || {
                icon: CalendarDays,
                bg: "bg-gray-100",
                color: "text-gray-600",
              };

            const HolidayIcon = iconData.icon;

            return (
              <motion.div
                key={holiday._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-none"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconData.bg}`}
                  >
                    <HolidayIcon
                      size={20}
                      className={iconData.color}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#0B2B57]">
                      {holiday.holidayName}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {holiday.holidayType || "Company Holiday"}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-500 font-medium">
                  {new Date(
                    holiday.holidayDate
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </motion.div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 font-medium">
              No holidays found
            </p>
          </div>
        )}
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
              {holidays?.length || 0} Scheduled
            </h4>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CompanyHolidays;