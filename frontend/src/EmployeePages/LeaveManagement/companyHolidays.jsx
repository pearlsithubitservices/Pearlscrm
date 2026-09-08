import React, { useEffect, useState, useMemo } from "react";
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
  const { getHolidays, holidays = [] } = useLeave();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getHolidays();
  }, [getHolidays]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Holidays this month
  const thisMonthHolidays = useMemo(() => {
    return (holidays || []).filter((h) => {
      if (!h.holidayDate) return false;
      const d = new Date(h.holidayDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [holidays, currentMonth, currentYear]);

  // Displayed list
  const displayedHolidays = useMemo(() => {
    if (showAll || thisMonthHolidays.length === 0) {
      return [...(holidays || [])].sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate));
    }
    return thisMonthHolidays;
  }, [showAll, thisMonthHolidays, holidays]);

  const getHolidayStyle = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("public")) {
      return { icon: Gift, bg: "bg-purple-100", color: "text-purple-600" };
    }
    if (t.includes("festival")) {
      return { icon: Star, bg: "bg-orange-100", color: "text-orange-600" };
    }
    if (t.includes("national")) {
      return { icon: Flag, bg: "bg-blue-100", color: "text-blue-600" };
    }
    if (t.includes("optional")) {
      return { icon: Globe, bg: "bg-green-100", color: "text-green-600" };
    }
    return { icon: CalendarDays, bg: "bg-gray-100", color: "text-gray-600" };
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-3xl h-[570px] border border-black/10 p-6 flex flex-col shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#0B2B57]">
            Company Holidays
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Official non-working days
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="px-3 py-1.5 rounded-full bg-[#EEF4FF] text-[#2F6CC5] hover:bg-blue-100 text-xs font-semibold transition cursor-pointer"
        >
          {showAll ? "Show This Month" : `View All (${holidays.length})`}
        </button>
      </div>

      {/* Holiday List */}
      <div className="space-y-3.5 flex-1 overflow-y-auto pr-1 no-scrollbar">
        {displayedHolidays.length > 0 ? (
          displayedHolidays.map((holiday, index) => {
            const iconData = getHolidayStyle(holiday.holidayType);
            const HolidayIcon = iconData.icon;

            return (
              <motion.div
                key={holiday._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                className="flex items-center justify-between border border-gray-100 bg-gray-50/50 hover:bg-white p-3 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconData.bg}`}
                  >
                    <HolidayIcon
                      size={18}
                      className={iconData.color}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-[#0B2B57] truncate">
                      {holiday.holidayName}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {holiday.holidayType || "Public Holiday"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 font-semibold pl-2 flex-shrink-0">
                  {new Date(holiday.holidayDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <CalendarDays size={24} className="mb-2 text-gray-300" />
            <p className="font-medium text-xs text-gray-500">
              No holidays this month
            </p>
            <button
              onClick={() => setShowAll(true)}
              className="text-xs text-[#2F6CC5] font-semibold mt-2 hover:underline"
            >
              View all holidays
            </button>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="mt-4 pt-3.5 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-[#2F6CC5]" />
            <span className="font-medium">
              {showAll ? "Total Listed" : "Showing This Month"}
            </span>
          </div>
          <span className="font-bold text-[#0B2B57]">
            {displayedHolidays.length} {displayedHolidays.length === 1 ? "Holiday" : "Holidays"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default CompanyHolidays;