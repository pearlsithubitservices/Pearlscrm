import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ShieldCheck,
  X,
  FileText,
  Clock,
  HeartPulse,
  CalendarCheck,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import LeaveHistory from "./LeaveHistory";
import useLeave from "../../Hooks/useLeave";
import { useAuth } from "../../context/AuthContext";
import useTotalLeave from "../../Hooks/useTotalLeave";

const LeaveBalance = () => {
  const { user } = useAuth();
  const { getTotalLeave } = useTotalLeave();
  const [totalLeave, setTotalLeave] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState("annual");
  const { leaves = [] } = useLeave();

  const employeeId = user?.profile?.empId || user?.empId || user?.id || user?.uid || user?._id;

  // Filter approved leaves for this employee
  const userApprovedLeaves = useMemo(() => {
    return leaves.filter(
      (item) =>
        String(item.employeeId) === String(employeeId) &&
        item.status?.toLowerCase() === "approved"
    );
  }, [leaves, employeeId]);

  useEffect(() => {
    const fetchTotalLeave = async () => {
      try {
        const data = await getTotalLeave();
        setTotalLeave(data);
      } catch (error) {
        console.log(error.message);
        setTotalLeave(null);
      }
    };

    if (employeeId) {
      fetchTotalLeave();
    }
  }, [employeeId]);

  // Quotas from database or defaults
  const totalPersonal = totalLeave?.personalLeave ?? 10;
  const totalSick = totalLeave?.sickLeave ?? 15;
  const totalAnnual = totalLeave?.annualLeave ?? 12;

  // Accurately calculate used days by checking substrings ("Annual Leave", "Sick Leave", etc.)
  const annualUsed = useMemo(() => {
    return userApprovedLeaves
      .filter((item) => (item.leaveType || "").toLowerCase().includes("annual"))
      .reduce((sum, item) => sum + (Number(item.leaveDays) || 0), 0);
  }, [userApprovedLeaves]);

  const sickUsed = useMemo(() => {
    return userApprovedLeaves
      .filter((item) => (item.leaveType || "").toLowerCase().includes("sick"))
      .reduce((sum, item) => sum + (Number(item.leaveDays) || 0), 0);
  }, [userApprovedLeaves]);

  const personalUsed = useMemo(() => {
    return userApprovedLeaves
      .filter((item) => {
        const t = (item.leaveType || "").toLowerCase();
        return t.includes("personal") || t.includes("casual") || t.includes("emergency");
      })
      .reduce((sum, item) => sum + (Number(item.leaveDays) || 0), 0);
  }, [userApprovedLeaves]);

  const balances = [
    {
      title: "Annual Leave",
      category: "annual",
      used: annualUsed,
      total: totalAnnual,
      remaining: Math.max(0, totalAnnual - annualUsed),
      icon: CalendarCheck,
      color: "from-blue-600 to-indigo-600",
      bgColor: "bg-blue-50/70 border-blue-100",
      accent: "#2563EB",
    },
    {
      title: "Sick Leave",
      category: "sick",
      used: sickUsed,
      total: totalSick,
      remaining: Math.max(0, totalSick - sickUsed),
      icon: HeartPulse,
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-50/70 border-rose-100",
      accent: "#E11D48",
    },
    {
      title: "Personal / Casual Leave",
      category: "casual",
      used: personalUsed,
      total: totalPersonal,
      remaining: Math.max(0, totalPersonal - personalUsed),
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50/70 border-amber-100",
      accent: "#D97706",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-black/10 rounded-3xl p-6 lg:p-8 relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0B2B57]">Leave Balance</h2>
          <p className="text-gray-500 text-xs mt-1">
            Real-time breakdown of your leave entitlements & usage
          </p>
        </div>

        <button
          onClick={() => setShowPolicyModal(true)}
          className="flex items-center text-sm gap-1.5 text-[#2F6CC5] font-semibold hover:text-[#0B2B57] bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all"
        >
          <FileText size={16} />
          <span>View Policy</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {balances.map((item, index) => {
          const usedPercent = Math.min(100, Math.round((item.used / (item.total || 1)) * 100));
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className={`border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${item.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0B2B57]">
                  {item.title}
                </h3>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: item.accent }}
                >
                  <Icon size={18} />
                </div>
              </div>

              {/* Usage Numbers */}
              <div className="mt-5 flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-[#0B2B57]">
                      {String(item.used).padStart(2, "0")}
                    </span>
                    <span className="text-gray-500 text-sm font-medium">
                      / {String(item.total).padStart(2, "0")} days used
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-white text-gray-700 shadow-sm border border-gray-200">
                    {item.remaining} left
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2.5 bg-white/80 border border-black/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usedPercent}%` }}
                    transition={{ duration: 0.8, delay: index * 0.15 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.accent }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                  <span>{usedPercent}% consumed</span>
                  <span>{item.remaining} days available</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* History */}
      <div className="mt-12 border-t border-gray-100 pt-8 w-full">
        <LeaveHistory />
      </div>

      {/* View Policy Modal */}
      <AnimatePresence>
        {showPolicyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 bg-[#0B2B57] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Company Leave Policy</h3>
                    <p className="text-xs text-blue-200 mt-0.5">
                      Guidelines & entitlement criteria for all full-time employees
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Policy Category Nav */}
              <div className="flex border-b border-gray-100 px-6 bg-gray-50 text-xs font-semibold text-gray-600 gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: "annual", label: "Annual Leave" },
                  { id: "sick", label: "Sick Leave" },
                  { id: "casual", label: "Casual / Emergency" },
                  { id: "general", label: "General Rules" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePolicyTab(tab.id)}
                    className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
                      activePolicyTab === tab.id
                        ? "border-[#2F6CC5] text-[#2F6CC5] font-bold"
                        : "border-transparent hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Policy Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-700 max-h-[60vh]">
                {activePolicyTab === "annual" && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <h4 className="font-bold text-[#0B2B57] text-base mb-1">
                        Annual Leave (12 Days / Year)
                      </h4>
                      <p className="text-xs text-gray-600">
                        Intended for personal recreation, vacations, and planned family events.
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2F6CC5] mt-1.5 flex-shrink-0" />
                        <p>
                          <strong>Advance Notice:</strong> Please submit requests at least 3 business days in advance for short leaves and 2 weeks in advance for vacations longer than 5 days.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2F6CC5] mt-1.5 flex-shrink-0" />
                        <p>
                          <strong>Accrual:</strong> Leave quota is credited annually at the start of the financial year.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2F6CC5] mt-1.5 flex-shrink-0" />
                        <p>
                          <strong>Carry Forward:</strong> Up to a maximum of 5 unused annual leave days can be carried over into the next financial year.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activePolicyTab === "sick" && (
                  <div className="space-y-4">
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                      <h4 className="font-bold text-rose-900 text-base mb-1">
                        Sick Leave (15 Days / Year)
                      </h4>
                      <p className="text-xs text-rose-700">
                        Provided to assist recovery from illness, unexpected health emergencies, or doctor appointments.
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                        <p>
                          <strong>Intimation:</strong> Inform your reporting manager by 9:30 AM on the day of absence.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                        <p>
                          <strong>Medical Certificate:</strong> Absences extending beyond 2 consecutive days require a medical practitioner's certificate upon return.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                        <p>
                          <strong>Lapse:</strong> Unused sick leaves lapse at the end of each calendar year and cannot be encashed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activePolicyTab === "casual" && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                      <h4 className="font-bold text-amber-900 text-base mb-1">
                        Casual & Personal Leave (10 Days / Year)
                      </h4>
                      <p className="text-xs text-amber-700">
                        For unforeseen personal responsibilities, urgent domestic obligations, or family exigencies.
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <p>
                          <strong>Notice:</strong> 24 hours prior intimation is appreciated whenever feasible.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <p>
                          <strong>Emergency Leaves:</strong> In genuine emergencies, leaves may be applied retrospectively within 24 hours of resuming duty.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <p>
                          <strong>Maximum Stretch:</strong> Typically cannot be taken for more than 3 consecutive days without prior management approval.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activePolicyTab === "general" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <h4 className="font-bold text-[#0B2B57] text-base mb-1">
                        General Leave Guidelines
                      </h4>
                      <p className="text-xs text-gray-600">
                        Operational rules governing leave applications and approvals.
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
                        <p>
                          <strong>Manager Response Time (SLA):</strong> Reporting managers must respond to leave requests within 48 business hours.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
                        <p>
                          <strong>Holidays & Weekends:</strong> Official public holidays and scheduled weekend off-days falling within a leave span do not count against your leave balance.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
                        <p>
                          <strong>Maternity / Paternity:</strong> As mandated by law, 26 weeks paid maternity and 2 weeks paid paternity leave are available upon formal HR application.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-[#2F6CC5]" />
                  For inquiries, please reach out to HR.
                </span>
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="px-5 py-2 rounded-xl bg-[#0B2B57] text-white text-xs font-semibold hover:bg-[#2F6CC5] transition-colors"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LeaveBalance;