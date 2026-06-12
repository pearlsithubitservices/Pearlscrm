import React, { useState } from "react";
import usePayslip from "../../../Hooks/usePayslip";
import { X } from "lucide-react";

export default function PayslipForm({ onClose }) {
  const { createPayslip } = usePayslip();

  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("Pending");

  const [earnings, setEarnings] = useState([
    { title: "Basic salary", amount: "" },
    { title: "Medical", amount: "" },
    { title: "Performance Bonus", amount: "" },
    { title: "Conveyance", amount: "" },
  ]);

  const [deductions, setDeductions] = useState([
    { title: "PF (Employee)", amount: "" },
    { title: "ESI", amount: "" },
    { title: "TDS (Income Tax)", amount: "" },
    { title: "Professional Tax", amount: "" },
  ]);

  // update earnings
  const handleEarnings = (index, value) => {
    const updated = [...earnings];
    updated[index].amount = value;
    setEarnings(updated);
  };

  // update deductions
  const handleDeductions = (index, value) => {
    const updated = [...deductions];
    updated[index].amount = value;
    setDeductions(updated);
  };

  // calculations
  const gross = earnings.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalDeduction = deductions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const net = gross - totalDeduction;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Map earnings array to schema fields
    const earningsMap = {
      "Basic salary": "basicSalary",
      "Medical": "medical",
      "Performance Bonus": "performanceBonus",
      "Conveyance": "conveyance",
    };

    // Map deductions array to schema fields
    const deductionsMap = {
      "PF (Employee)": "pf",
      "ESI": "esi",
      "TDS (Income Tax)": "tds",
      "Professional Tax": "professionalTax",
    };

    // Flatten earnings
    const flatEarnings = {};
    earnings.forEach((item) => {
      const fieldName = earningsMap[item.title];
      if (fieldName) {
        flatEarnings[fieldName] = Number(item.amount) || 0;
      }
    });

    // Flatten deductions
    const flatDeductions = {};
    deductions.forEach((item) => {
      const fieldName = deductionsMap[item.title];
      if (fieldName) {
        flatDeductions[fieldName] = Number(item.amount) || 0;
      }
    });

    await createPayslip({
      month,
      date: new Date().toDateString(),
      status,
      ...flatEarnings,
      ...flatDeductions,
      gross,
       totalDeductions: totalDeduction,
      net,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      
      <div className="bg-white w-[800px] max-h-[90vh] overflow-auto p-6 rounded-2xl relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold mb-4">Create Payslip</h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* MONTH + STATUS */}
          <div className="grid grid-cols-2 gap-4">
            <input
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="Month (JUL-2026)"
              className="border p-3 rounded-lg"
              type="date"
              required
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option>Pending</option>
              <option>Paid</option>
              <option>Present</option>
            </select>
          </div>

          {/* EARNINGS */}
          <div>
            <h3 className="font-bold text-lg mb-2">Earnings</h3>

            {earnings.map((item, i) => (
              <div key={i} className="flex justify-between mb-2">
                <span>{item.title}</span>

                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleEarnings(i, e.target.value)}
                  className="border p-2 w-40 rounded"
                />
              </div>
            ))}
          </div>

          {/* DEDUCTIONS */}
          <div>
            <h3 className="font-bold text-lg mb-2">Deductions</h3>

            {deductions.map((item, i) => (
              <div key={i} className="flex justify-between mb-2">
                <span>{item.title}</span>

                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleDeductions(i, e.target.value)}
                  className="border p-2 w-40 rounded"
                />
              </div>
            ))}
          </div>

          {/* LIVE SUMMARY */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <p>Gross: ₹{gross}</p>
            <p>Deductions: ₹{totalDeduction}</p>
            <p className="font-bold text-blue-600">
              Net: ₹{net}
            </p>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded"
            >
              Save Payslip
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}