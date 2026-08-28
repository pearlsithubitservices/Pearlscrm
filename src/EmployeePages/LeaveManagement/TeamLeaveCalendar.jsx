import React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import useLeave from "../../Hooks/useLeave";
import { useAuth } from "../../context/AuthContext";

const TeamLeaveCalendar = () => {

  const { user } = useAuth();

  const { getLeaves, leaves } = useLeave();


  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const employeeId = user?.profile?.empId || user?.empId || user?.id || user?.uid || user?._id;

  const teamLeavesToday = leaves.filter((item) => {
    const leaveFrom = new Date(item.leaveFrom);
    const leaveTo = new Date(item.leaveTo);

    leaveFrom.setHours(0, 0, 0, 0);
    leaveTo.setHours(0, 0, 0, 0);

    return (
      String(item.employeeId) !== String(employeeId) &&
      item.status?.toLowerCase() === "approved" &&
      today >= leaveFrom &&
      today <= leaveTo
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white rounded-3xl border border-black/10 h-[570px] overflow-y-auto no-scrollbar p-6"
    >
      {/* Header */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#0B2B57]">
            Team Leave Calendar
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Upcoming team leave schedules
          </p>
        </div>

        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live
        </div>
      </div>

      {/* Team Leave List */}

      <div className="space-y-4">
        {teamLeavesToday.length > 0 ? teamLeavesToday.map((employee, index) => (
          <motion.div
            key={employee.employeeId}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className=" border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              {/* Left */}

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#2F6CC5] text-white flex items-center justify-center font-bold">
                  {employee.employeeName
                    ?.split(" ")
                    .map((name) => name[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>

                <div>
                  <h3 className="font-semibold text-[#0B2B57]">
                    {employee.employeeName}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {employee.department}
                  </p>
                </div>
              </div>

              {/* Right */}

              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date(employee.leaveFrom).toLocaleDateString("en-IN")} - {new Date(employee.leaveTo).toLocaleDateString("en-IN")},
                </p>

                <p className="text-[#2F6CC5] font-semibold mt-1">
                  {employee.leaveDays} {employee.leaveDays === 1 ? "day" : "days"}
                </p>
              </div>
            </div>
          </motion.div>
        )) :
          <p className="flex items-center justify-center mt-40 font-medium text-2xl  text-black">No One Leave Today</p>
        }
      </div>

      {/* Footer */}

      <div className=" absolute bottom-2 mt-6 ml-12 pt-4 border-t flex gap-80 items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500">
          <Users size={18} />
          <span className="text-sm">
            {teamLeavesToday.length} Employees
          </span>
        </div>

        <button className="text-[#2F6CC5] font-medium text-sm hover:underline">
          View All
        </button>
      </div>
    </motion.div>
  );
};

export default TeamLeaveCalendar;