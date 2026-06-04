import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import LeaveHistory from "./LeaveHistory";

const LeaveBalance = () => {
  const balances = [
    {
      title: "Annual Leave",
      used: 14,
      total: 24,
    },
    {
      title: "Sick Leave",
      used: 8,
      total: 10,
    },
    {
      title: "Personal Leave",
      used: 3,
      total: 5,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-black/10 rounded-3xl p-6 lg:p-8"
    >
      {/* Header */}

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[#0B2B57]">
          Leave Balance
        </h2>

        <button className="flex items-center text-sm gap-2 text-[#2F6CC5] font-semibold hover:underline">
          View Policy
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {balances.map((item, index) => (
          <motion.div
            key={item.title}
            whileHover={{
              y: -5,
              scale: 1.02,
            }}
            transition={{
              duration: 0.2,
            }}
            className="bg-[#EAF0FA] border border-[#CBD5E1] rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-[#0B2B57]">
              {item.title}
            </h3>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-3xl font-bold text-[#2F6CC5]">
                {String(item.used).padStart(2, "0")}
              </span>

              <span className="text-gray-500 mb-2">
                / {String(item.total).padStart(2, "0")}
              </span>
            </div>

            {/* Progress */}

            <div className="mt-5">
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(item.used / item.total) * 100}%`,
                  }}
                  transition={{
                    duration: 1,
                    delay: index * 0.2,
                  }}
                  className="h-full bg-[#2F6CC5]"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-12  border-t-black w-full">
      <LeaveHistory/>
      </div>
    </motion.div>
  );
};

export default LeaveBalance;