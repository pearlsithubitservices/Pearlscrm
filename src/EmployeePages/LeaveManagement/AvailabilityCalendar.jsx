import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

const AvailabilityCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Government holidays (date in month)
  const governmentHolidays = [15, 26]; // Example: Jan 26 (Republic Day), etc.

  const month = currentDate.toLocaleString("default", {
    month: "long",
  });

  const year = currentDate.getFullYear();

  const firstDay = new Date(
    year,
    currentDate.getMonth(),
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const prevMonth = () => {
    setCurrentDate(
      new Date(year, currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(year, currentDate.getMonth() + 1, 1)
    );
  };

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  while (days.length < 42) {
    days.push(null);
  }

  const today = new Date();

  // Check if date is weekend
  const isWeekend = (index) => {
    return index % 7 === 0 || index % 7 === 6; // Sunday or Saturday
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-3xl border border-black/10 h-[455px] overflow-hidden"
    >
      <div className="h-full p-5 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#0B2B57]">
            Availability
          </h2>

          <CalendarDays
            size={20}
            className="text-[#2F6CC5]"
          />
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <ChevronLeft size={16} />
          </button>

          <h3 className="font-semibold text-[#0B2B57]">
            {month} {year}
          </h3>

          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Week Names */}
        <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((day,i) => (
            <div key={i}>{day}</div>
          ))}
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isToday =
              day === today.getDate() &&
              currentDate.getMonth() ===
                today.getMonth() &&
              currentDate.getFullYear() ===
                today.getFullYear();

            const isWeekendDay = isWeekend(index);

            const isGovernmentHoliday =
              day && governmentHolidays.includes(day);

            return (
              <motion.div
                key={index}
                whileHover={day ? { scale: 1.08 } : {}}
                className={`
                  h-8
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  text-xs
                  font-medium
                  transition-all
                  ${
                    !day
                      ? ""
                      : isToday
                      ? "bg-[#2F6CC5] text-white "
                      : isGovernmentHoliday
                      ? "bg-red-200 text-red-700 font-bold"
                      : isWeekendDay
                      ? "bg-yellow-200 text-yellow-700 font-bold"
                      : "hover:bg-gray-100 text-gray-700"
                  }
                `}
              >
                {day}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        

        {/* Availability Status */}
        <div className="mt-auto pt-4">
          <div className="bg-[#FFF4E6] rounded-xl p-3">
            <h4 className="font-semibold text-[#0B2B57] text-sm">
              Calendar Overview
            </h4>

            <p className="text-xs text-gray-600 mt-1">
              <span className="text-yellow-600 font-semibold">Weekends</span> and <span className="text-red-600 font-semibold">Government Holidays</span> are marked in the calendar.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default AvailabilityCalendar;