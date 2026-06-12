import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Clock2, CreditCard, FileText, IndianRupee, UserMinus2 } from "lucide-react";
import ReimbursementClaimForm from "./Reimbursement/ReimburesementClaimForm";
import Payslip from "./Payslip/Payslip";
import PaySummary from "./Payslip/PaySummary";
import SalaryBreakup from "./SalaryDetails.jsx/SalaryBreakup";
import Reimbursement from "./Reimbursement/Reimbursement";
import { div } from "framer-motion/client";
import TaxDocument from "./TaxDocument.jsx/TaxDocument";
import Benefits from "./Benefits/Benefits";
import usePayslip from "../../Hooks/usePayslip";




const Payroll = () => {
  const [activeTab, setActiveTab] = useState("Payslip");
  const [form, setForm] = useState(false);
  const{ payslips}=usePayslip();


  const stats = [
    { icon: CreditCard, label: "Groce Salary", value: "₹ 10,700" },
    { icon: UserMinus2, label: "Deductions", value: "₹ 1,700" },
    { icon: IndianRupee, label: "Net Salary", value: "₹ 8,450" },
    { icon: Clock2, label: "Pending Claims", value: "₹ 4,800" },
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
            <TaxDocument/>
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
              <Reimbursement />
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
           <Benefits/>
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
      className="max-h-screen overflow-y-auto no-scrollbar  bg-[#f3f0eb] "
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-xl px-6 py-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[#082d5b]">
            Payroll & Benefits
          </h1>

          <p className="text-gray-500 mt-1">
            Financial year 2025–26 · Salary processed on 30th every month
          </p>
        </div>

        <button className="bg-[#2563eb] p-3 rounded-lg w-fit">
          <Bell className="text-white" size={20} />
        </button>
      </header>

      {/**Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 px-4 ">

        {stats.map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className="bg-white p-6 rounded-xl border"
          >
            <div className='  rounded w-full h-8 flex items-center justify-between'>
              <s.icon className="w-8 h-8 bg-gray-200 rounded-lg text-black p-2" />
              <p className="rounded-xl px-2 py-1 bg-green-100 text-green-500 font-medium text-[10px]">Month</p>
            </div>

            <p className="text-sm text-gray-500">{s.label}</p>
            <h2 className={`text-2xl font-medium  text-[#0b2b57] ${s.label.toLowerCase() == "deductions" ? "text-orange-400" : s.label.toLowerCase() == "pending claims" ? "text-orange-400" : "text-blue-700"}`}>
              {s.value}
            </h2>
          </motion.div>
        ))}

      </div>

      {/* Tabs */}
      <div className="mt-6 bg-white border rounded-xl p-4 mx-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-lg  font-bold transition-all duration-300 ${activeTab === tab
                  ? "bg-[#2563eb] text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="inline-flex items-center justify-center gap-2 bg-[#2563eb] text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transition"
            onClick={() => setForm((prev) => (!prev))}
          >
            <FileText size={16} />
            Submit Claim
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
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <ReimbursementClaimForm 
            onClose={()=>setForm(false)}/>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Payroll;