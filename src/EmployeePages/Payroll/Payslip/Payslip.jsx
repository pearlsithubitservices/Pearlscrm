import React from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import PaySummary from "./PaySummary";

const sampleRow = {
  month: "JUL-2026",
  gross: "₹10,200",
  deductions: "₹1,750",
  net: "₹8,450",
  date: "MON-25-MAY",
  status: "Pending",
};

const data = Array.from({ length: 7 }).map((_, i) => {
  const statuses = ["Pending", "Paid", "Present"];

  return {
    ...sampleRow,
    month: [
      "JUL-2026",
      "JUN-2026",
      "MAY-2026",
      "APR-2026",
      "MAR-2026",
      "FEB-2026",
      "JAN-2026",
    ][i],
    status: statuses[i % statuses.length],
  };
});

const StatusBadge = ({ status }) => {
  const isPending = status === "Pending";

  return (

    <div
      className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-medium ${isPending
        ? "bg-purple-100 text-purple-600"
        : "bg-green-100 text-green-600"
        }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${isPending ? "bg-purple-500" : "bg-green-500"
          }`}
      />
      {status}
    </div>
  );
};

const Payslip = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border rounded-xl p-4 h-[300px] overflow-auto no-scrollbar"
      >
        <div className=" ">
          <table className="w-full min-w-[900px] ">
            <thead className="sticky top-0 z-20 bg-white ">
              <tr className=" border-b text-[#0b2b57] font-semibold ">
                <th className="py-4 px-4 text-left">MONTH</th>
                <th className="py-4 px-4 text-left">GROSS</th>
                <th className="py-4 px-4 text-left">DEDUCTIONS</th>
                <th className="py-4 px-4 text-left">NET SALARY</th>
                <th className="py-4 px-4 text-left">DATE</th>
                <th className="py-4 px-4 text-left">STATUS</th>
                <th className="py-4 px-4 text-left">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, idx) => (
                <motion.tr
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-5 px-4 font-semibold text-[#0b2b57]">
                    {row.month}
                  </td>

                  <td className="py-5 px-4">
                    {row.gross}
                  </td>

                  <td className="py-5 px-4 text-red-500">
                    {row.deductions}
                  </td>

                  <td className="py-5 px-4 text-blue-600">
                    {row.net}
                  </td>

                  <td className="py-5 px-4 font-medium text-sm">
                    {row.date}
                  </td>

                  <td className="py-5 px-4">
                    <StatusBadge status={row.status} />
                  </td>

                  <td className="py-5 px-4">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-[#2563eb] transition">
                      <Download size={16} />
                      PDF
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

      </motion.div>
      
    </>
  );
};

export default Payslip;