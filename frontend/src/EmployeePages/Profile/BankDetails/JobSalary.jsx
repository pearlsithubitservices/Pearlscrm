import { useEffect, useState } from 'react'
import { motion } from "framer-motion";
import { getProfile } from '../../../services/profileApi';

const JobSalary = () => {
  const [salary, setSalary] = useState(null);
  useEffect(() => { getProfile().then(({ data }) => setSalary(data.user?.profile?.salary || null)).catch(() => undefined); }, []);

  const formatAmount = (amount) => amount == null ? "Not available" : `₹${Number(amount).toLocaleString("en-IN")}`;
  const salaryData = salary ? [{ label: "Basic salary", amount: formatAmount(salary.basicSalary) }] : [];
  const allowances = salary?.allowances && typeof salary.allowances === "object" ? Object.entries(salary.allowances).map(([label, amount]) => ({ label, amount: formatAmount(amount) })) : [];
  const deductions = salary?.deductions && typeof salary.deductions === "object" ? Object.entries(salary.deductions).map(([label, amount]) => ({ label, amount: `- ${formatAmount(amount)}` })) : [];

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
      {!salary && <p className="text-gray-500 mt-6">Salary details are managed by Admin / HR.</p>}

      <div className="mt-6 space-y-4">

        {[...salaryData, ...allowances].map((item) => (
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
            {formatAmount(salary?.grossSalary)}
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
            {formatAmount(salary?.netSalary)}
          </span>
        </div>

      </div>
    </motion.div>
  )
}

export default JobSalary