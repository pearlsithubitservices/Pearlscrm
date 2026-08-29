import React from "react";
import { motion } from "framer-motion";
import { X, Mail, Phone, MapPin, Briefcase, Building2, Calendar, ShieldCheck, UserCheck } from "lucide-react";

export default function EmployeeDetails({ onClose, empId }) {
  const employee = empId || {};

  // Extract clean required field values
  const name = employee.name || employee.employeeName || employee.displayName || "N/A";
  const empIdCode = employee._id ? String(employee._id).slice(-6).toUpperCase() : (employee.id || "N/A");
  const department = employee.dept || employee.department || employee.employeeDepartment || "General";
  const role = employee.role || employee.employeeRole || employee.designation || "Employee";
  const email = employee.email || "N/A";
  const phone = employee.phone || employee.contact || employee.mobileNumber || null;
  const location = employee.location || employee.city || null;
  const workMode = employee.workMode || employee.workType || "On-Site";
  const joiningDate = employee.joiningDate || employee.createdAt ? new Date(employee.joiningDate || employee.createdAt).toLocaleDateString("en-GB") : null;
  const status = employee.status || employee.employeeStatus || "Active";

  // List of required fields to show if present
  const fields = [
    { label: "Full Name", value: name, icon: UserCheck },
    { label: "Employee ID", value: `#${empIdCode}`, icon: ShieldCheck },
    { label: "Department", value: department, icon: Building2 },
    { label: "Role / Designation", value: role, icon: Briefcase },
    { label: "Email Address", value: email, icon: Mail },
    ...(phone ? [{ label: "Contact Phone", value: phone, icon: Phone }] : []),
    ...(location ? [{ label: "Location", value: location, icon: MapPin }] : []),
    { label: "Work Mode", value: workMode, icon: Briefcase },
    ...(joiningDate ? [{ label: "Joined Date", value: joiningDate, icon: Calendar }] : []),
    { label: "Account Status", value: status, icon: ShieldCheck },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative w-full max-w-md max-h-[85vh] overflow-y-auto no-scrollbar bg-white rounded-3xl border border-slate-200 shadow-2xl p-6"
    >
      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl transition"
      >
        <X size={18} />
      </button>

      {/* HEADER AVATAR & NAME */}
      <div className="bg-gradient-to-tr from-blue-50 via-slate-50 to-indigo-50 rounded-2xl p-6 flex flex-col items-center text-center border border-slate-100">
        <span className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl shadow-lg mb-3">
          {name.charAt(0).toUpperCase()}
        </span>

        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold font-mono tracking-wider mb-1">
          ID: #{empIdCode}
        </span>

        <h2 className="text-xl font-bold text-[#0b2b57]">{name}</h2>
        <p className="text-xs font-semibold text-blue-600 mt-0.5">{role}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium">{department}</p>
      </div>

      {/* REQUIRED DATA FIELDS */}
      <div className="mt-6 space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Profile Information
        </h3>

        {fields.map((f, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100"
          >
            <div className="flex items-center gap-2.5">
              <f.icon size={15} className="text-blue-600" />
              <span className="text-xs font-medium text-gray-600">{f.label}</span>
            </div>

            <span className="text-xs font-bold text-[#0b2b57] text-right truncate max-w-[55%]">
              {f.value}
            </span>
          </div>
        ))}
      </div>

      {/* EMAIL ACTION */}
      {email && email !== "N/A" && (
        <a
          href={`mailto:${email}`}
          className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#2563eb] text-white font-semibold text-xs hover:bg-blue-700 transition shadow-md"
        >
          <Mail size={16} /> Send Email
        </a>
      )}
    </motion.div>
  );
}