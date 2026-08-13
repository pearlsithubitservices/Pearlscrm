import React from 'react'
import { motion } from "framer-motion";

const JobSalary = () => {

  const salaryData = [
    { label: "Basic salary", amount: "₹50,000" },
    { label: "HRA", amount: "₹20,000" },
    { label: "Special allowance", amount: "₹20,000" },
    { label: "Travel allowance", amount: "₹15,000" },
    { label: "Medical allowance", amount: "₹5,000" },
    { label: "Performance bonus", amount: "₹2,500" },
  ];

  const deductions = [
    { label: "PF deduction", amount: "- ₹6,000" },
    { label: "Professional tax", amount: "- ₹200" },
    { label: "TDS (income tax)", amount: "- ₹8,500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl border shadow-sm p-6"
    >
      <h2 className="text-3xl font-bold text-[#0b2b57]">
        Salary Structure
      </h2>

      <p className="text-gray-500 mt-1">
        Monthly compensation breakdown and components
      </p>

      <div className="mt-6 space-y-4">

        {salaryData.map((item) => (
          <div
            key={item.label}
            className="flex justify-between border-b pb-4"
          >
            <span className="text-lg">{item.label}</span>

            <span className="font-bold text-xl text-[#0b2b57]">
              {item.amount}
            </span>
          </div>
        ))}

        <div className="flex justify-between border-b pb-4">
          <span className="font-bold text-xl">
            Gross CTC
          </span>

          <span className="font-bold text-2xl text-green-600">
            ₹1,00,000
          </span>
        </div>

        {deductions.map((item) => (
          <div
            key={item.label}
            className="flex justify-between border-b pb-4"
          >
            <span className="text-lg">
              {item.label}
            </span>

            <span className="font-bold text-xl text-red-600">
              {item.amount}
            </span>
          </div>
        ))}

        <div className="flex justify-between pt-4">
          <span className="font-bold text-3xl text-[#0b2b57]">
            Net Take-home
          </span>

          <span className="font-bold text-3xl text-green-600">
            ₹85,300
          </span>
        </div>

      </div>
    </motion.div>
  )
}

export default JobSalary