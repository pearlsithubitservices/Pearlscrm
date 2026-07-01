import React from "react";
import { motion } from "framer-motion";
import {
  Pencil,
  Trash2,
  SquarePen,
} from "lucide-react";

const policies = [
  {
    id: 1,
    name: "Travel (local)",
    amount: "₹5,000-month",
  },
  {
    id: 2,
    name: "Medical",
    amount: "₹5,000-year",
  },
  {
    id: 3,
    name: "Training / Courses",
    amount: "₹10,000-year",
  },
  {
    id: 4,
    name: "Equipment (WFH)",
    amount: "₹5,000-year",
  },
];

export default function ReimbursementPolicies() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#f7f5f0] p-6"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl shadow-md border border-gray-200 px-5 py-4 flex items-center justify-between"
        >
          <h1 className="text-4xl font-bold text-black">
            Reimbursement policies
          </h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: .95 }}
            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-gray-700 px-5 py-3 rounded-xl font-medium transition"
          >
            <SquarePen size={18} />
            Add New
          </motion.button>
        </motion.div>

        {/* Table Card */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .2 }}
          className="mt-6 bg-white rounded-2xl shadow-md border border-gray-200 p-5 overflow-x-auto"
        >
          <table className="w-full border border-gray-300">

            <thead>
              <tr className="border-b border-gray-300">

                <th className="text-left px-5 py-4 text-2xl font-bold text-[#123B6B] border-r border-gray-300">
                  Employee Policies
                </th>

                <th className="text-center px-5 py-4 text-2xl font-bold text-[#123B6B] border-r border-gray-300">
                  Month/Year
                </th>

                <th className="text-center px-5 py-4 text-2xl font-bold text-[#123B6B]">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {policies.map((policy) => (

                <motion.tr
                  key={policy.id}
                  whileHover={{
                    backgroundColor: "#fafafa",
                  }}
                  className="border-b border-gray-300 last:border-none"
                >

                  <td className="px-5 py-5 text-2xl border-r border-gray-300">
                    {policy.name}
                  </td>

                  <td className="px-5 py-5 text-center text-xl text-gray-700 border-r border-gray-300">
                    {policy.amount}
                  </td>

                  <td className="px-5 py-5">

                    <div className="flex justify-center gap-4">

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: .9 }}
                        className="bg-green-100 p-2 rounded-lg"
                      >
                        <Pencil
                          size={20}
                          className="text-green-700"
                        />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: .9 }}
                        className="bg-red-100 p-2 rounded-lg"
                      >
                        <Trash2
                          size={20}
                          className="text-red-600"
                        />
                      </motion.button>

                    </div>

                  </td>

                </motion.tr>

              ))}

            </tbody>

          </table>
        </motion.div>

      </div>
    </motion.div>
  );
}