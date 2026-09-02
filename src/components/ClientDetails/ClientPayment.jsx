import React from "react";
import {
  Building2,
  ArrowRight,
  Pencil,
} from "lucide-react";
import { motion } from "framer-motion";

const ClientPayment = () => {
  const payments = [
    {
      title: "Q2 2024 — Enterprise license",
      date: "Jun 1, 2024",
      amount: "₹ 30,000",
    },
    {
      title: "Q2 2024 — Enterprise license",
      date: "Mar 1, 2024",
      amount: "₹ 30,000",
    },
    {
      title: "P1 2024 — Enterprise license",
      date: "Jun 1, 2024",
      amount: "₹ 30,000",
    },
  ];

  return (
    <div className="w-full min-h-screen rounded-2xl bg-[#f5f2ec]  overflow-hidden ">

      {/* CONTENT */}
      <div className="p-5">

        
        

        {/* PAYMENT SUMMARY */}
        <div className="mt-5">
          <p className="text-[10px] font-semibold text-gray-400 mb-3">
            PAYMENT SUMMARY
          </p>

          <div className="grid grid-cols-3 gap-3">
            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-lg bg-[#dfe9ff] p-3"
            >
              <p className="text-[10px] font-bold text-[#16345f]">
                TOTAL
              </p>

              <h3 className="text-lg font-bold text-[#16345f] mt-1">
                ₹ 1,20,000
              </h3>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-lg bg-[#e7f7d8] p-3"
            >
              <p className="text-[10px] font-bold text-[#2f6d2f]">
                PAID
              </p>

              <h3 className="text-lg font-bold text-[#2f6d2f] mt-1">
                ₹ 60,000
              </h3>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-lg bg-[#ffe5df] p-3"
            >
              <p className="text-[10px] font-bold text-[#e05b45]">
                PENDING
              </p>

              <h3 className="text-lg font-bold text-[#e05b45] mt-1">
                ₹ 60,000
              </h3>
            </motion.div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-gray-400">
              PAYMENT HISTORY
            </p>

            <button className="px-2 py-1 rounded-md bg-white border border-black/10 text-[10px] text-gray-500">
              Add Payment
            </button>
          </div>

          <div className="space-y-3">
            {payments.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-xl p-4 border border-black/5 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#16345f]">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-gray-400 mt-1">
                    {item.date}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <h3 className="text-lg font-bold text-green-600">
                    {item.amount}
                  </h3>

                  <div className="flex items-center gap-1 mt-1">
                    <span className="px-2 py-[2px] rounded-full bg-green-100 text-green-600 text-[10px] font-medium">
                      Paid
                    </span>

                    <button className="w-5 h-5 rounded-full border border-black/10 flex items-center justify-center text-gray-400">
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPayment;