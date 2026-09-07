import React, { useState } from "react";
import usePayslip from "../../Hooks/usePayslip";
import { X } from "lucide-react";
import useEmployees from "../../Hooks/useEmployees";

export default function PayslipForm({ onClose, fetchPayslips }) {
    const { createPayslip } = usePayslip();

    const [month, setMonth] = useState("");
    const [status, setStatus] = useState("Pending");
    const [employeeId, setEmployeeId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { employees } = useEmployees();

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

        if (!employeeId) {
            alert("Please select an employee before saving.");
            return;
        }

        setIsSubmitting(true);

        try {
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
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                status,
                employeeId,
                ...flatEarnings,
                ...flatDeductions,
                gross,
                totalDeductions: totalDeduction,
                net,
            });

            if (fetchPayslips) {
                await fetchPayslips();
            }

            alert("Payslip created successfully!");
            onClose();
        } catch (err) {
            console.error("Error creating payslip:", err);
            alert("Failed to save payslip: " + (err.message || "Server Error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

            <div className="bg-white w-[800px] max-h-[90vh] overflow-auto p-6 rounded-2xl relative shadow-2xl">

                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
                    type="button"
                >
                    <X />
                </button>

                <h2 className="text-2xl font-bold mb-4 text-slate-800">Create Payslip</h2>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* MONTH + STATUS + EMPLOYEE */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Month / Period</label>
                            <input
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                placeholder="e.g. JUL-2026"
                                className="border p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="border p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Employee</label>
                            <select
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="border p-3 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select an employee</option>
                                {employees.map((item) => {
                                    const idVal = item.uid || item._id || item.id;
                                    return (
                                        <option key={idVal} value={idVal}>
                                            {item.name} ({item.role || "Employee"})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    {/* EARNINGS */}
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-slate-800">Earnings</h3>

                        {earnings.map((item, i) => (
                            <div key={i} className="flex justify-between items-center mb-2 bg-gray-50 p-2.5 rounded-lg border">
                                <span className="text-sm font-medium text-gray-700">{item.title}</span>

                                <input
                                    type="number"
                                    min="0"
                                    value={item.amount}
                                    onChange={(e) => handleEarnings(i, e.target.value)}
                                    placeholder="0"
                                    className="border p-2 w-40 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ))}
                    </div>

                    {/* DEDUCTIONS */}
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-slate-800">Deductions</h3>

                        {deductions.map((item, i) => (
                            <div key={i} className="flex justify-between items-center mb-2 bg-gray-50 p-2.5 rounded-lg border">
                                <span className="text-sm font-medium text-gray-700">{item.title}</span>

                                <input
                                    type="number"
                                    min="0"
                                    value={item.amount}
                                    onChange={(e) => handleDeductions(i, e.target.value)}
                                    placeholder="0"
                                    className="border p-2 w-40 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ))}
                    </div>

                    {/* LIVE SUMMARY */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-around text-sm font-medium">
                        <p className="text-blue-800">Gross: <span className="font-bold">₹{gross.toLocaleString('en-IN')}</span></p>
                        <p className="text-red-700">Deductions: <span className="font-bold">₹{totalDeduction.toLocaleString('en-IN')}</span></p>
                        <p className="text-green-700 font-bold text-base">
                            Net Salary: ₹{net.toLocaleString('en-IN')}
                        </p>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100 font-medium text-gray-700 transition"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? "Saving..." : "Save Payslip"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}