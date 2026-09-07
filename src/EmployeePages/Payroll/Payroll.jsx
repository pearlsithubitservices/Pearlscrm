import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Clock2, CreditCard, FileText, IndianRupee, UserMinus2 } from "lucide-react";
import ReimbursementClaimForm from "./Reimbursement/ReimburesementClaimForm";
import Payslip from "./Payslip/Payslip";
import PaySummary from "./Payslip/PaySummary";
import SalaryBreakup from "./SalaryDetails.jsx/SalaryBreakup";
import Reimbursement from "./Reimbursement/Reimbursement";
import TaxDocument from "./TaxDocument.jsx/TaxDocument";
import Benefits from "./Benefits/Benefits";
import usePayslip from "../../Hooks/usePayslip";
import useReimbursement from "../../Hooks/useReimbursement";
import { useAuth } from "../../context/AuthContext";




const Payroll = () => {
  const [activeTab, setActiveTab] = useState("Payslip");
  const [form, setForm] = useState(false);
  const { user } = useAuth();
  const { payslips } = usePayslip();
  const { getClaims } = useReimbursement();

  const userUid = user?.uid || user?.id || user?._id;
  const userEmpId = user?.profile?.empId || user?.empId;

  const empPayslips = (payslips || []).filter(
    (p) =>
      p.employeeId === userUid ||
      p.employeeId === userEmpId ||
      p.employeeId?.toLowerCase() === user?.email?.toLowerCase() ||
      p.employeeName === user?.name ||
      p.employeeName === user?.profile?.name
  );
  const latestPayslip = empPayslips[0] || {};

  const grossVal = Number(latestPayslip.gross || 0);
  const deductionsVal = Number(latestPayslip.totalDeductions || latestPayslip.deductions || 0);
  const netVal = Number(latestPayslip.net || 0);

  const pendingClaimsAmount = Array.isArray(getClaims)
    ? getClaims
        .filter((c) => (c.employeeId === userUid || c.employeeName === user?.name) && c.status?.toLowerCase() === "pending")
        .reduce((sum, c) => sum + Number(c.amount || 0), 0)
    : 0;

  const stats = [
    { icon: CreditCard, label: "Gross Salary", value: `₹ ${grossVal.toLocaleString('en-IN')}` },
    { icon: UserMinus2, label: "Deductions", value: `₹ ${deductionsVal.toLocaleString('en-IN')}` },
    { icon: IndianRupee, label: "Net Salary", value: `₹ ${netVal.toLocaleString('en-IN')}` },
    { icon: Clock2, label: "Pending Claims", value: `₹ ${pendingClaimsAmount.toLocaleString('en-IN')}` },
  ];

  const tabs = [
    "Payslip",
    "Salary Details",
    "Tax Documents",
    "Reimbursements",
    "Benefits",
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Payslip":
        return (
          <motion.div
            key="payslip"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#f3f0eb] rounded-xl flex flex-col gap-6 p-6"
          >


            {/* <PayslipsTable /> */}
            <Payslip />
            <PaySummary />
          </motion.div>
        );

      case "Salary Details":
        return (
          <motion.div
            key="salary"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className=" rounded-xl  p-1"
          >

            <SalaryBreakup />
          </motion.div>
        );

      case "Tax Documents":
        return (
          <motion.div
            key="tax"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className=" rounded-xl p-6 "
          >
            <TaxDocument />
          </motion.div>
        );

      case "Reimbursements":
        return (
          <motion.div
            key="reimbursements"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className=" rounded-xl "
          >
            <div>
              <Reimbursement
              getclaims={getClaims} />
            </div>
          </motion.div>
        );

      case "Benefits":
        return (
          <motion.div
            key="benefits"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className=" rounded-xl "
          >
            <Benefits />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-h-screen overflow-y-auto custom-scrollbar bg-[#f3f0eb]"
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-xl px-6 py-6 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#082d5b]">
            Payroll & Benefits
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            Financial year 2025–26 · Salary processed on 30th every month
          </p>
        </div>

        <button className="bg-[#2563eb] hover:bg-blue-700 p-3 rounded-xl w-fit transition shadow-sm">
          <Bell className="text-white" size={20} />
        </button>
      </header>

      {/**Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 px-4">

        {stats.map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
          >
            <div className='rounded w-full h-8 flex items-center justify-between'>
              <s.icon className="w-8 h-8 bg-blue-50 rounded-lg text-blue-700 p-1.5" />
              <p className="rounded-xl px-2 py-1 bg-green-100 text-green-700 font-semibold text-[10px]">Month</p>
            </div>

            <p className="text-sm text-gray-500 mt-3">{s.label}</p>
            <h2 className={`text-2xl font-bold mt-1 text-[#0b2b57] ${s.label.toLowerCase() == "deductions" ? "text-orange-500" : s.label.toLowerCase() == "pending claims" ? "text-amber-600" : "text-blue-700"}`}>
              {s.value}
            </h2>
          </motion.div>
        ))}

      </div>

      {/* Tabs */}
      <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-4 mx-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center overflow-x-auto custom-scrollbar gap-2 pb-1 whitespace-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 ${activeTab === tab
                  ? "bg-[#2563eb] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="inline-flex items-center justify-center gap-2 bg-[#2563eb] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm shrink-0"
            onClick={() => setForm((prev) => (!prev))}
          >
            <FileText size={18} />
            <span>Submit Claim</span>
          </button>
        </div>
      </div>

      {/* Render Active Tab */}
      <div className="my-6 mx-4">{renderTabContent()}</div>
      {form && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto modal-scrollbar rounded-2xl"
          >
            <ReimbursementClaimForm
              onClose={() => setForm(false)}
              getclaims={getClaims}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Payroll;