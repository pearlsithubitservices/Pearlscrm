import React from "react";
import { motion } from "framer-motion";

const infoCards = [
  {
    label: "Company Website",
    value: "techflow.io",
    blue: true,
  },
  {
    label: "Headquarter",
    value: "San Francisco, CA",
  },
  {
    label: "Phone",
    value: "+91 9876543210",
  },
  {
    label: "Email",
    value: "sarah.chen@gmail.com",
    blue: true,
  },
  {
    label: "Founded",
    value: "2018",
  },
  {
    label: "Employees",
    value: "320",
  },
  {
    label: "Revenue",
    value: "₹18M",
  },
  {
    label: "Contract",
    value: "₹ 1,20,000",
  },
  {
    label: "Start Date",
    value: "May 02",
  },
  {
    label: "Due Date",
    value: "May 20",
  },
];

export default function CompanyInfoSection() {
  return (
    <section className="w-full min-h-screen bg-[#f3f0eb] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl rounded-[28px] bg-[#F5F3EF] p-8 ">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-[15px] uppercase tracking-[0.12em] font-semibold text-[#9A9A9A]">
            Company Information
          </h2>
        </div>

        {/* Fixed Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {infoCards.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: index * 0.04,
              }}
              whileHover={{
                y: -2,
              }}
              className="rounded-2xl border border-[#ECECEC] bg-[#FAFAFA] px-6 py-5 shadow-sm transition-all"
            >
              {/* Label */}
              <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-[#A0A0A0]">
                {item.label}
              </p>

              {/* Value */}
              <h3
                className={`mt-2 text-[22px] font-semibold break-words ${
                  item.blue
                    ? "text-[#4A6CF7]"
                    : "text-[#0D2E57]"
                }`}
              >
                {item.value}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}