import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function EmployeeDetails({ onClose, empId }) {
  const employee = empId || {};
  console.log(employee);

  const Field = ({ label, value }) => (
    <div className="flex items-center justify-between gap-4 border-b py-2">
      <span className="text-slate-500 text-sm whitespace-nowrap">
        {label}
      </span>

      <span className="font-medium text-[#123861] text-sm text-right break-words max-w-[60%]">
        {value || "-"}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-[420px] max-h-[600px] overflow-y-auto no-scrollbar bg-white rounded-3xl border border-slate-200 shadow-xl"
    >
      {/* CLOSE */}
      <X
        size={20}
        className="absolute top-3 right-3 bg-red-500 text-white rounded-lg p-1 cursor-pointer hover:scale-105 transition"
        onClick={onClose}
      />

      {/* HEADER */}
      <div className="p-6">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-100 rounded-2xl p-5 flex flex-col items-center">

          {/* AVATAR */}
          <span className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-md">
            {(employee?.name || employee?.employeeName || "E").charAt(0).toUpperCase()}
          </span>

          {/* ID */}
          <div className="mt-3 px-3 py-1 rounded-lg bg-white/60 backdrop-blur text-xs font-medium text-[#123861]">
            ID : #{employee?.id?.slice(0, 5) || "N/A"}
          </div>

          {/* NAME */}
          <h2 className="mt-3 text-lg font-bold text-[#123861] text-center break-words">
            {employee?.name || employee?.employeeName || "Unknown Employee"}
          </h2>
        </div>
      </div>

      {/* DETAILS */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4">
          Employee Details
        </h3>

        <div className="space-y-1">
          <Field label="Name" value={employee?.name || employee?.employeeName} />
          <Field label="Department" value={employee?.employeeDepartment} />
          <Field label="Role" value={employee?.role || employee?.employeeRole} />
          <Field label="Location" value={employee?.location} />
          <Field label="Work Mode" value={employee?.workMode || "WFH"} />
          <Field label="Phone" value={employee?.contact} />
          <Field label="Email" value={employee?.email} />
        </div>

        {/* BUTTON */}
        <button className="w-full mt-6 py-3 rounded-xl bg-[#1f5fa8] text-white font-medium hover:bg-[#174b85] transition">
          Send Email
        </button>
      </div>
    </motion.div>
  );
}