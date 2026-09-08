import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import PaySummary from "./PaySummary";
import { exportPayslipPDF } from "./PayslipExport";
import usePayslip from "../../../Hooks/usePayslip";
import PayslipForm from "./PayslipForm";
import Skeleton from "./Skeleton";
import { useAuth } from "../../../context/AuthContext";






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
  const { payslips, loading } = usePayslip();
  const { user } = useAuth();

  const userUid = user?.uid || user?.id || user?._id;
  const userEmpId = user?.profile?.empId || user?.empId;

  const empPayslips = (payslips || []).filter((item) =>
    item.employeeId == userUid ||
    item.employeeId == userEmpId ||
    item.employeeId?.toLowerCase() == user?.email?.toLowerCase() ||
    item.employeeName == user?.name ||
    item.employeeName == user?.profile?.name
  );

  const payslipById = empPayslips;


  const [showForm, setShowForm] = useState(false);
  if (loading) {
    return <Skeleton />
  }
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-2xl p-4 min-h-[300px] max-h-[450px] overflow-auto custom-scrollbar shadow-sm"
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[700px]">
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
              {payslipById && payslipById.length > 0 ? (
                payslipById.map((row, idx) => (

                <motion.tr
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-5 px-4 font-semibold text-[#0b2b57]">
                    {row.month}
                  </td>

                  <td className="py-5 px-4">
                    ₹{Number(row.gross).toLocaleString('en-IN')}
                  </td>

                  <td className="py-5 px-4 text-red-500">
                    ₹{Number(row?.totalDeductions || row?.deductions || 0).toLocaleString('en-IN')}
                  </td>

                  <td className="py-5 px-4 text-blue-600">
                    ₹{Number(row.net).toLocaleString('en-IN')}
                  </td>

                  <td className="py-5 px-4 font-medium text-sm">
                    {row.date ? new Date(row.date).toLocaleDateString('en-GB') : "N/A"}
                  </td>

                  <td className="py-5 px-4">
                    <StatusBadge status={row.status} />
                  </td>

                  <td className="py-5 px-4">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-[#2563eb] transition"
                      onClick={() => exportPayslipPDF(row)}
                    >
                      <Download size={16} />
                      PDF
                    </button>
                  </td>
                </motion.tr>
              ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400 italic">No payslip records available for your account yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <PayslipForm
              onClose={() => setShowForm(false)}
            />
          </div>
        )}

      </motion.div>

    </>
  );
};

export default Payslip;