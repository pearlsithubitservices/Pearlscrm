import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  User,
  CalendarDays,
  Edit3,
} from "lucide-react";

export default function Employeehome({
  employees,
  editableDescription = false,
  descriptionValue,
  onDescriptionChange,
  onDescriptionSave,
  savingDescription,
  onDescriptionEdit,
  onEditProfile,
  onEditSalary,
}) {
  const profile = employees?.profile || {};
  const bankDetails = profile.bankDetails || employees?.bankDetails || {};

  const extractSal = (o) => {
    if (!o) return {};
    const s1 = o.salary && typeof o.salary === "object" ? o.salary : {};
    const s2 = o.profile?.salary && typeof o.profile?.salary === "object" ? o.profile.salary : {};
    return {
      ...s1,
      ...s2,
      basicSalary: s2.basicSalary ?? s1.basicSalary ?? o.basicSalary,
      grossSalary: s2.grossSalary ?? s1.grossSalary ?? o.grossSalary,
      netSalary: s2.netSalary ?? s1.netSalary ?? o.netSalary,
      allowances: (s2.allowances && Object.keys(s2.allowances).length > 0 ? s2.allowances : null) ??
                  (s1.allowances && Object.keys(s1.allowances).length > 0 ? s1.allowances : null) ??
                  s2.allowances ?? s1.allowances ?? o.profile?.allowances ?? o.allowances,
      deductions: (s2.deductions && Object.keys(s2.deductions).length > 0 ? s2.deductions : null) ??
                  (s1.deductions && Object.keys(s1.deductions).length > 0 ? s1.deductions : null) ??
                  s2.deductions ?? s1.deductions ?? o.profile?.deductions ?? o.deductions,
    };
  };

  const salary = extractSal(employees);
  const storedDescription = employees?.description || employees?.notes || profile.description || profile.notes || "";
  const description = descriptionValue !== undefined ? descriptionValue : storedDescription;

  const formatDescription = (text) => {
    if (!text) return "No description available.";
    if (typeof text === "string" && text.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((n) => `${n.title ? n.title + ': ' : ''}${n.description || ''}`).join("\n\n");
        }
      } catch (_) {}
    }
    return text;
  };

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
      value: profile.joiningDate
        ? new Date(profile.joiningDate).toLocaleDateString()
        : employees?.joiningDate || employees?.joinDate || "Not Available",
      icon: CalendarDays,
      color: "text-pink-500",
      bg: "bg-pink-100",
    },
  ];

  const dobDisplay = profile.dob
    ? new Date(profile.dob).toLocaleDateString()
    : employees?.dob || "Not Available";

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || amount === "") {
      return null;
    }
    const cleanStr = String(amount).replace(/[^0-9.]/g, "");
    const num = Number(cleanStr);
    if (isNaN(num) || cleanStr.length === 0) return String(amount);
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const formatSalaryMap = (map) => {
    if (!map) return null;
    if (typeof map === "number") return map > 0 ? `₹${map.toLocaleString("en-IN")}` : null;
    if (typeof map === "string") {
      const trimmed = map.trim();
      if (!trimmed || trimmed === "{}" || trimmed === "[]") return null;
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          return formatSalaryMap(JSON.parse(trimmed));
        } catch (_) {}
      }
      const cleanNum = trimmed.replace(/[^0-9.]/g, "");
      if (cleanNum && !trimmed.includes(":") && !trimmed.includes("-") && !trimmed.includes("=")) {
        const n = Number(cleanNum);
        return !isNaN(n) && n > 0 ? `₹${n.toLocaleString("en-IN")}` : null;
      }
      return trimmed;
    }

    let entries = [];
    if (Array.isArray(map)) {
      entries = map
        .map((item) => {
          if (!item) return null;
          if (typeof item === "string") {
            const parts = item.split(":");
            return [parts[0]?.trim(), parts.slice(1).join(":")?.trim()];
          }
          if (typeof item === "object") {
            const k = item.name || item.label || item.title || item.type || item.key;
            const v = item.amount ?? item.value ?? item.val ?? item.amt;
            return [k, v];
          }
          return null;
        })
        .filter(Boolean);
    } else if (map instanceof Map) {
      entries = Array.from(map.entries());
    } else if (typeof map === "object") {
      entries = Object.entries(map);
    }

    const valid = entries.filter(([key, val]) =>
      Boolean(key && String(key).trim() && val !== undefined && val !== null && val !== "")
    );
    if (valid.length === 0) return null;

    return valid
      .map(([key, val]) => {
        const cleanValStr = String(val).replace(/[^0-9.]/g, "");
        const num = Number(cleanValStr);
        const formatted = !isNaN(num) && cleanValStr.length > 0 ? `₹${num.toLocaleString("en-IN")}` : val;
        return `${key}: ${formatted}`;
      })
      .join(", ");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#efede8] p-5"
    >
      <div className="max-w-7xl mx-auto">

        {/* Employee Description */}
        <div className="mt-2">
          <h3 className="font-bold text-gray-400 mb-4">
            EMPLOYEE DESCRIPTION
          </h3>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            {editableDescription ? (
              <>
                <textarea
                  value={descriptionValue}
                  onChange={onDescriptionChange}
                  rows={4}
                  placeholder="Add an employee description..."
                  className="w-full resize-y rounded-lg border border-gray-200 p-3 text-sm text-[#082f57] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={onDescriptionSave}
                    disabled={savingDescription}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                  >
                    {savingDescription ? "Updating..." : "Update Description"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="min-h-[60px] text-base text-[#082f57] leading-relaxed whitespace-pre-line">
                  {formatDescription(description)}
                </p>
                {onDescriptionEdit && (
                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      onClick={onDescriptionEdit}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
                    >
                      Update Description
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* PERSONAL, BANK & SALARY DETAILS */}
        <div className="flex items-center justify-between mt-10 mb-4">
          <h3 className="font-bold text-gray-400">
            PERSONAL & FINANCIAL DETAILS
          </h3>
          {onEditProfile && (
            <button
              type="button"
              onClick={onEditProfile}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-lg border border-blue-200 transition cursor-pointer"
            >
              <Edit3 size={13} />
              Edit Personal & Bank Info
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <DetailSection
            title="PERSONAL DETAILS"
            items={{
              "Employee ID": profile.empId || employees?.empId,
              "Date of Birth": dobDisplay,
              Gender: profile.gender || employees?.gender,
              "Emergency Contact": profile.emergencyNo || employees?.emergencyNo,
              Address: profile.address || employees?.address,
            }}
          />
          <DetailSection
            title="BANK DETAILS"
            items={{
              "Account Holder": bankDetails.accountHolderName,
              "Bank Name": bankDetails.bankName,
              "Branch Name": bankDetails.branchName,
              "Account Number": bankDetails.accountNumber,
              "IFSC Code": bankDetails.ifscCode,
              "Account Type": bankDetails.accountType,
            }}
          />
          <DetailSection
            title="SALARY DETAILS"
            items={{
              "Basic Salary": formatCurrency(salary.basicSalary),
              "Gross Salary": formatCurrency(salary.grossSalary),
              "Net Salary": formatCurrency(salary.netSalary),
              Allowances: formatSalaryMap(salary.allowances),
              Deductions: formatSalaryMap(salary.deductions),
            }}
          />
        </div>

        {/* Employee Information */}
        <div className="mt-10">
          <h3 className="font-bold text-gray-400 mb-5">
            CONTACT & EMPLOYMENT DETAILS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={index}
                  whileHover={{
                    y: -4,
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

      </div>
    </motion.div>
  );
}

function DetailSection({ title, items }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="font-bold text-gray-500 text-sm mb-4 border-b border-gray-100 pb-2">
        {title}
      </h3>
      <dl className="space-y-3">
        {Object.entries(items).map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-gray-100 pb-2 text-sm">
            <dt className="text-gray-500">{label}</dt>
            <dd className="text-right font-medium text-[#082f57] break-all">
              {value || "Not Available"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}