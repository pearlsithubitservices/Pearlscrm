import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import usePayslip from "../../../Hooks/usePayslip";
import { formatMonthYear, getFinancialYear } from '../../../Utils/formatNumber'


export default function PayrollSummary() {
  const { user } = useAuth();
  const { payslips } = usePayslip();

  const userUid = user?.uid || user?.id || user?._id;
  const userEmpId = user?.profile?.empId || user?.empId;
  const payslipId = (payslips || []).filter((item) =>
    item.employeeId == userUid ||
    item.employeeId == userEmpId ||
    item.employeeId?.toLowerCase() == user?.email?.toLowerCase() ||
    item.employeeName == user?.name ||
    item.employeeName == user?.profile?.name
  );

  const taxSummary = payslipId.reduce((totals, item) => {
    totals.gross += Number(item.gross || 0);
    totals.pf += Number(item.pf || 0);
    totals.esi += Number(item.esi || 0);
    totals.professionalTax += Number(item.professionalTax || 0);
    totals.tds += Number(item.tds || 0);
    return totals;
  }, { gross: 0, pf: 0, esi: 0, professionalTax: 0, tds: 0 });

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <div className="p-6 bg-[#F5F2EC]  space-y-6">

      {/* ================= YEARLY SALARY ================= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Yearly salary summary</h2>
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
            {getFinancialYear()}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b text-gray-500">
                <th className="py-3">MONTH</th>
                <th className="py-3">NET SALARY</th>
                <th className="py-3">STATUS</th>
              </tr>
            </thead>

            <tbody>
              {payslipId?.map((item, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b last:border-none"
                >
                  <td className="py-3 font-medium">{formatMonthYear(item.month)}</td>
                  <td className="py-3 text-blue-600">{formatCurrency(item.net)}</td>
                  <td className="py-3">
                    {String(item.status || "pending").toLowerCase() === "paid" ? (
                      <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit text-xs">
                        <CheckCircle2 size={14} /> Paid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-3 py-1 rounded-full w-fit text-xs">
                        <Clock size={14} /> Pending
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ================= TAX SUMMARY ================= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border p-6 mb-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Tax summary</h2>
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
            {getFinancialYear()}
          </span>
        </div>

        {/* Table */}
        <table className="w-full text-sm ">
          <thead>
            <tr className="text-left border-b text-gray-500">
              <th className="py-3">TAX</th>
              <th className="py-3">AMOUNT</th>
            </tr>
          </thead>

          <tbody>
            {[
              ["Gross salary", taxSummary.gross],
              ["Provident Fund (PF)", -taxSummary.pf],
              ["ESI", -taxSummary.esi],
              ["Professional Tax", -taxSummary.professionalTax],
              ["TDS (Income Tax)", -taxSummary.tds],
            ].map(([label, amount]) => (
              <tr key={label} className="border-b last:border-none">
                <td className="py-3">{label}</td>
                <td className="py-3 font-medium">{formatCurrency(amount)}</td>
              </tr>
            ))}

            <tr className="border-t">
              <td className="py-4 font-bold text-black">
                Total TDS deducted
              </td>
              <td className="py-4 font-bold text-black text-lg">
                {formatCurrency(taxSummary.tds)}
              </td>
            </tr>
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}