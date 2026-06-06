import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  UserRoundSearch,
  IndianRupee,
  Clock3,
  Bell,
  FileEdit,
} from "lucide-react";

export default function Reimbursement() {
 
    const claims = [
    {
      title: "Travel — Client visit Chennai",
      date: "Aug 12, 2024",
      amount: "₹2,400",
      status: "Pending",
    },
    {
      title: "Equipment — USB hub & keyboard",
      date: "Jul 04, 2024",
      amount: "₹2,400",
      status: "Paid",
    },
    {
      title: "Training — Udemy course",
      date: "Jul 04, 2024",
      amount: "₹2,400",
      status: "Paid",
    },
  ];

  const policies = [
    {
      category: "Travel (local)",
      amount: "₹5,000-month",
    },
    {
      category: "Medical",
      amount: "₹5,000-year",
    },
    {
      category: "Training / Courses",
      amount: "₹10,000-year",
    },
    {
      category: "Equipment (WFH)",
      amount: "₹5,000-year",
    },
  ];

  return (
    <div className="min-h-screen bg-[#efede8]">
      <div className="p-8">

        {/* Claims */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className=" bg-white rounded-2xl border p-6 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">
              My reimbursement claims
            </h2>

            <span className="bg-slate-100 text-xs px-4 py-2 rounded-full font-semibold">
              STATUS
            </span>
          </div>

          <div className="mt-8 space-y-7">
            {claims.map((claim) => (
              <div
                key={claim.title}
                className="flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-xl text-[#0f2f58]">
                    {claim.title}
                  </h3>

                  <p className="text-gray-400 mt-1">{claim.date}</p>
                </div>

                <div className="text-right">
                  <p className="font-bold">{claim.amount}</p>

                  <span
                    className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold ${claim.status === "Paid"
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-500"
                      }`}
                  >
                    {claim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Policies */}

        <div className="mt-10">
          <div className="bg-white border rounded-2xl p-5 flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Reimbursement policies
            </h2>

            <span className="text-2xl font-semibold text-gray-500">
              2025–26
            </span>
          </div>

          <div className="bg-white border rounded-2xl p-5 mt-4">
            <table className="w-full border-collapse">
              <tbody>
                {policies.map((item) => (
                  <tr
                    key={item.category}
                    className="border"
                  >
                    <td className="p-5 text-2xl font-semibold text-[#0f2f58] border">
                      {item.category}
                    </td>

                    <td className="p-5 text-center font-bold border">
                      {item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}