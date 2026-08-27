import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Mail, Notebook, Phone, X } from "lucide-react";

import Employeehome from "../components/EmployeeDetails/Employeehome";
import EmployeePerformancePage from "../components/EmployeeDetails/EmployeePerformance";
import EmployeeWork from "../components/EmployeeDetails/EmployeeWork";
import EmployeeActivity from "../components/EmployeeDetails/EmployeeActivity";
import { useNavigate, useParams } from "react-router-dom";
import useEmployees from "../Hooks/useEmployees";
import api from "../lib/api";

const EmployeeDetails = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { id } = useParams()
  const { employees } = useEmployees();
  const currentEmployee = employees?.find((item) => (
    String(item.id) === String(id) || String(item._id) === String(id) || String(item.uid) === String(id)
  ));
  const currentSalary = currentEmployee?.profile?.salary || {};
  const [editingSalary, setEditingSalary] = useState(false);
  const [savingSalary, setSavingSalary] = useState(false);
  const [salaryForm, setSalaryForm] = useState({ basicSalary: "", grossSalary: "", netSalary: "", allowances: "", deductions: "" });

  useEffect(() => {
    setSalaryForm({
      basicSalary: currentSalary.basicSalary || "",
      grossSalary: currentSalary.grossSalary || "",
      netSalary: currentSalary.netSalary || "",
      allowances: Object.entries(currentSalary.allowances || {}).map(([key, value]) => `${key}: ${value}`).join(", "),
      deductions: Object.entries(currentSalary.deductions || {}).map(([key, value]) => `${key}: ${value}`).join(", "),
    });
  }, [currentEmployee]);

  const updateSalary = async (event) => {
    event.preventDefault();
    setSavingSalary(true);
    try {
      const parseAmounts = (value) => value.split(",").reduce((result, item) => {
        const [key, amount] = item.split(":").map((part) => part.trim());
        if (key && amount) result[key] = Number(amount) || 0;
        return result;
      }, {});
      await api.put(`/auth/users/${id}/salary`, {
        ...salaryForm,
        allowances: parseAmounts(salaryForm.allowances),
        deductions: parseAmounts(salaryForm.deductions),
      });
      setEditingSalary(false);
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update salary");
    } finally {
      setSavingSalary(false);
    }
  };

  const tabs = ["overview", "performance", "assigned work", "activity"];
  const [button, setButton] = useState('');

  const buttons = [
    { label: "Call", icon: Phone },
    { label: "E Mail", icon: Mail },
    { label: "Notes", icon: Notebook },
  ];

  function handleButton(e) {
    setButton(e);
  }

  return (
    <div className="p-6 bg-[#efede8] max-h-screen overflow-y-auto no-scrollbar">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-6">

        {/* LEFT SECTION */}
        <div className="flex items-start gap-4  w-full max-w-[700px] p-4 rounded-md ">

          {/* Avatar */}
          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
            {(currentEmployee?.name || currentEmployee?.employeeName || "?")[0]}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{currentEmployee?.name || currentEmployee?.employeeName}</h1>
            <p className="text-gray-500">{currentEmployee?.role || currentEmployee?.employeeRole}</p>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {buttons.map((btn, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleButton(btn.label)}
                >
                  <btn.icon size={16} />
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
        {/* RIGHT STATUS */}
        <div className="relative flex flex-col gap-3  h-[130px]">
          <div className="flex gap-4 items-center">
            <span className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
              Active
            </span>

            <span className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full">
              Top performer
            </span>
            <span>
              <X size={20} className="bg-red-500 rounded text-white hover:bg-white hover:text-red-700" onClick={() => navigate(-1)} />
            </span>
          </div>
          <div>
            <button className=" absolute bottom-6 right-5 flex items-center gap-1 px-3 py-1 border border-black/80 rounded-md text-sm hover:bg-gray-100 transition">
              <Edit3 size={14} /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-8 mt-8 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm capitalize transition-all ${activeTab === tab
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        {activeTab === "overview" && <>
          <Employeehome employees={currentEmployee} />
          <section className="bg-white rounded-xl border border-gray-200 p-5 mt-6">
            <div className="flex items-center justify-between gap-4">
              <div><h3 className="font-bold text-gray-700">Salary Updates</h3><p className="text-sm text-gray-500">Update this employee&apos;s stored salary details.</p></div>
              <button type="button" onClick={() => setEditingSalary((value) => !value)} className="px-4 py-2 bg-blue-700 text-white rounded-md text-sm">{editingSalary ? "Cancel" : "Edit Salary"}</button>
            </div>
            {editingSalary && <form onSubmit={updateSalary} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              {[['basicSalary', 'Basic Salary'], ['grossSalary', 'Gross Salary'], ['netSalary', 'Net Salary']].map(([name, label]) => <label key={name} className="text-sm text-gray-600">{label}<input required type="number" min="0" value={salaryForm[name]} onChange={(event) => setSalaryForm({ ...salaryForm, [name]: event.target.value })} className="mt-1 w-full border rounded-md p-2" /></label>)}
              {[['allowances', 'Allowances'], ['deductions', 'Deductions']].map(([name, label]) => <label key={name} className="text-sm text-gray-600 md:col-span-3">{label} <span className="text-gray-400">(name: amount, comma separated)</span><input value={salaryForm[name]} onChange={(event) => setSalaryForm({ ...salaryForm, [name]: event.target.value })} className="mt-1 w-full border rounded-md p-2" placeholder="Travel: 1000, Meal: 500" /></label>)}
              <button disabled={savingSalary} type="submit" className="md:col-span-3 justify-self-end px-5 py-2 bg-green-700 text-white rounded-md">{savingSalary ? "Saving..." : "Save Salary"}</button>
            </form>}
          </section>
        </>}

        {activeTab === "performance" && <EmployeePerformancePage
        />}

        {activeTab === "assigned work" && <EmployeeWork />}

        {activeTab === "activity" && <EmployeeActivity />}
      </motion.div>
    </div>
  );
};

export default EmployeeDetails;