import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  User,
  CalendarDays,
} from "lucide-react";

export default function LeadDetails({ employees }) {
  const profile = employees?.profile || {};
  const bankDetails = profile.bankDetails || employees?.bankDetails || {};
  const salary = profile.salary || employees?.salary || {};
  const description = employees?.description || employees?.notes || profile.description || profile.notes || "No description available.";

  const contactInfo = [
    {
      title: "EMAIL",
      value: employees?.email || "Not Available",
      icon: Mail,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    {
      title: "PHONE",
      value: profile.phone || employees?.phone || employees?.contact || "Not Available",
      icon: Phone,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      title: "LOCATION",
      value: profile.workLocation || employees?.location || employees?.assignedTo || "Not Available",
      icon: User,
      color: "text-orange-500",
      bg: "bg-orange-100",
    },
    {
      title: "JOINING DATE",
      value: profile.joiningDate || employees?.joiningDate || employees?.joinDate || "Not Available",
      icon: CalendarDays,
      color: "text-pink-500",
      bg: "bg-pink-100",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#efede8] p-5"
    >
      <div className="max-w-7xl mx-auto">

        {/* Employee Description */}
        <div className="mt-8">
          <h3 className="font-bold text-gray-400 mb-4">
            EMPLOYEE DESCRIPTION
          </h3>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-[#efede8] rounded-3xl p-6 shadow-sm border border-black/40"
          >
            <div className="min-h-[100px]">
              <h1 className="text-xl text-[#082f57] leading-relaxed">
                {description}
              </h1>
            </div>
          </motion.div>
        </div>

        <div className="mt-10 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <DetailSection title="PERSONAL DETAILS" items={{ "Employee ID": profile.empId || employees?.empId, "Date of Birth": profile.dob, Gender: profile.gender, "Emergency Contact": profile.emergencyNo, Address: profile.address }} />
          <DetailSection title="BANK DETAILS" items={{ "Account Holder": bankDetails.accountHolderName, "Bank Name": bankDetails.bankName, "Branch Name": bankDetails.branchName, "Account Number": bankDetails.accountNumber, "IFSC Code": bankDetails.ifscCode, "Account Type": bankDetails.accountType }} />
          <DetailSection title="SALARY DETAILS" items={{ "Basic Salary": salary.basicSalary, "Gross Salary": salary.grossSalary, "Net Salary": salary.netSalary, Allowances: formatSalaryMap(salary.allowances), Deductions: formatSalaryMap(salary.deductions) }} />
        </div>

        {/* Employee Information */}
        <div className="mt-10">
          <h3 className="font-bold text-gray-400 mb-5">
            EMPLOYEE INFORMATION
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={index}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                  className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center gap-4"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      {item.title}
                    </p>

                    <p className="text-base font-medium text-[#082f57] mt-1 break-all">
                      {item.value}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Performance */}
        <div className="mt-10">
          <h3 className="font-semibold text-gray-700">
            PERFORMANCE
          </h3>

          <div className="bg-white p-5 rounded-xl shadow-sm mt-4">
            <div className="flex justify-between mb-3">
              <span className="text-sm text-gray-500">
                Performance Progress
              </span>

              <span className="text-sm font-semibold text-blue-600">
                65%
              </span>
            </div>

            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ duration: 1 }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function formatSalaryMap(value) {
  if (!value || typeof value !== "object") return value || "Not Available";
  return Object.entries(value).map(([key, amount]) => `${key}: ${amount}`).join(", ") || "Not Available";
}

function DetailSection({ title, items }) {
  return <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"><h3 className="font-bold text-gray-400 mb-4">{title}</h3><dl className="space-y-3">{Object.entries(items).map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-gray-100 pb-2 text-sm"><dt className="text-gray-500">{label}</dt><dd className="text-right font-medium text-[#082f57] break-all">{value || "Not Available"}</dd></div>)}</dl></section>;
}