import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import useLeave from "../../Hooks/useLeave";
import { useAuth } from "../../context/AuthContext";

const AvailabilityCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { holidays, getHolidays, leaves } = useLeave();
  const { user } = useAuth();

  useEffect(() => {
    getHolidays();
  }, [getHolidays]);

  const employeeId = user?.profile?.empId || user?.empId || user?.id || user?.uid || user?._id;

  const myApprovedLeaves = useMemo(() => {
    return (leaves || []).filter(
      (item) =>
        String(item.employeeId) === String(employeeId) &&
        (item.status || "").toLowerCase() === "approved"
    );
  }, [leaves, employeeId]);

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

  // Check if date is weekend (Sunday or Saturday)
  const isWeekend = (index) => {
    return index % 7 === 0 || index % 7 === 6;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-3xl border border-black/10 h-[470px] overflow-hidden shadow-sm flex flex-col"
    >
      <div className="h-full p-5 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-[#0B2B57] flex items-center gap-2">
            <CalendarDays size={20} className="text-[#2F6CC5]" />
            Availability
          </h2>

          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
            {month} {year}
          </span>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>

          <h3 className="font-semibold text-sm text-[#0B2B57]">
            {month} {year}
          </h3>

          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Week Names */}
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div key={i}>{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-8" />;
            }

            const isToday =
              day === today.getDate() &&
              currentDate.getMonth() === today.getMonth() &&
              currentDate.getFullYear() === today.getFullYear();

            const isWeekendDay = isWeekend(index);

            // Check if matches real holiday from database
            const matchingHoliday = holidays?.find((h) => {
              const hd = new Date(h.holidayDate);
              return (
                hd.getFullYear() === currentDate.getFullYear() &&
                hd.getMonth() === currentDate.getMonth() &&
                hd.getDate() === day
              );
            });

            // Check if matches user approved leave
            const matchingLeave = myApprovedLeaves?.find((l) => {
              const from = new Date(l.leaveFrom);
              const to = new Date(l.leaveTo);
              from.setHours(0, 0, 0, 0);
              to.setHours(23, 59, 59, 999);
              const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              return cellDate >= from && cellDate <= to;
            });

            const tooltipText = matchingHoliday
              ? `Holiday: ${matchingHoliday.holidayName}`
              : matchingLeave
              ? `Approved: ${matchingLeave.leaveTitle || matchingLeave.leaveType}`
              : isToday
              ? "Today"
              : isWeekendDay
              ? "Weekend"
              : "";

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.1 }}
                title={tooltipText}
                className={`
                  h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer relative
                  ${
                    isToday
                      ? "bg-[#2F6CC5] text-white font-bold shadow-sm"
                      : matchingHoliday
                      ? "bg-rose-100 text-rose-700 font-bold border border-rose-200"
                      : matchingLeave
                      ? "bg-amber-100 text-amber-800 font-bold border border-amber-300"
                      : isWeekendDay
                      ? "bg-amber-50/60 text-amber-600 font-medium"
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
        <div className="mt-auto pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-1.5">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F6CC5]" />
            Today
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            Holiday
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            My Leave
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-200" />
            Weekend
          </span>
        </div>

      </div>
    </motion.div>
  );
};

export default AvailabilityCalendar;