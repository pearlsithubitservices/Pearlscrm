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
  const employeeStatus = currentEmployee?.status || currentEmployee?.employeeStatus || "Active";
  const currentSalary = currentEmployee?.profile?.salary || {};
  const [editingSalary, setEditingSalary] = useState(false);
  const [savingSalary, setSavingSalary] = useState(false);
  const [description, setDescription] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [savingDescription, setSavingDescription] = useState(false);
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

  useEffect(() => {
    setDescription(currentEmployee?.profile?.description || currentEmployee?.description || currentEmployee?.notes || "");
  }, [currentEmployee]);

  const updateDescription = async () => {
    setSavingDescription(true);
    try {
      await api.put(`/auth/users/${id}/description`, { description });
      alert("Employee description updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update description");
    } finally {
      setSavingDescription(false);
    }
  };

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
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

        {/* LEFT SECTION */}
        <div className="flex items-start gap-4 w-full min-w-0">

          {/* Avatar */}
          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
            {(currentEmployee?.name || currentEmployee?.employeeName || "?")[0]}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">{currentEmployee?.name || currentEmployee?.employeeName || "Employee"}</h1>
            <p className="text-sm text-gray-500 mt-1">{currentEmployee?.role || currentEmployee?.employeeRole || "Employee"}</p>
            {(currentEmployee?.email || currentEmployee?.department) && (
              <p className="text-xs text-gray-400 mt-1 truncate">
                {[currentEmployee.department, currentEmployee.email].filter(Boolean).join(" • ")}
              </p>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {buttons.map((btn, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleButton(btn.label)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <btn.icon size={16} />
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
        {/* RIGHT STATUS */}
        <div className="flex w-full lg:w-auto flex-col gap-4 lg:items-end">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {employeeStatus}
            </span>
            
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
          <Employeehome
            employees={currentEmployee}
            editableDescription={editingDescription}
            descriptionValue={description}
            onDescriptionChange={(event) => setDescription(event.target.value)}
            onDescriptionSave={async () => {
              await updateDescription();
              setEditingDescription(false);
            }}
            savingDescription={savingDescription}
            onDescriptionEdit={() => setEditingDescription(true)}
          />
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

        {activeTab === "performance" && <EmployeePerformancePage employee={currentEmployee} />}

        {activeTab === "assigned work" && <EmployeeWork employee={currentEmployee} />}

        {activeTab === "activity" && <EmployeeActivity employee={currentEmployee} />}
      </motion.div>
    </div>
  );
};

export default EmployeeDetails;