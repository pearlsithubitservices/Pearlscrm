import React, { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import usePayslip from "../../../Hooks/usePayslip";
import { getFinancialYear } from "../../../Utils/formatNumber";

const earningsFields = [
    ["basicSalary", "Basic salary"],
    ["conveyance", "Conveyance allowance"],
    ["medical", "Medical allowance"],
    ["performanceBonus", "Performance bonus"],
];

const deductionFields = [
    ["pf", "Provident Fund (PF)"],
    ["esi", "ESIC"],
    ["tds", "Income Tax (TDS)"],
    ["professionalTax", "Professional Tax"],
];

const amount = (value) => Number(value) || 0;

const SalaryBreakup = ({ currentPayslip = [], employee, onCreated }) => {
    const { createPayslip, updatePayslip } = usePayslip();
    const [selectedId, setSelectedId] = useState("");
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [newForm, setNewForm] = useState({ month: "", date: "" });

    const payslips = useMemo(
        () => [...currentPayslip].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        [currentPayslip]
    );
    const selectedPayslip = payslips.find((item) => item._id === selectedId) || payslips[0];

    useEffect(() => {
        if (!selectedPayslip) {
            setSelectedId("");
            setForm({});
            return;
        }

        setSelectedId(selectedPayslip._id);
        setForm(selectedPayslip);
        setMessage("");
    }, [selectedPayslip]);

    const gross = earningsFields.reduce((total, [field]) => total + amount(form[field]), 0);
    const totalDeductions = deductionFields.reduce((total, [field]) => total + amount(form[field]), 0);
    const net = gross - totalDeductions;
    const newGross = earningsFields.reduce((total, [field]) => total + amount(newForm[field]), 0);
    const newDeductions = deductionFields.reduce((total, [field]) => total + amount(newForm[field]), 0);
    const newNet = newGross - newDeductions;
    const profile = employee?.profile || {};
    const bankDetails = profile.bankDetails || employee?.bankDetails || {};
    const documents = profile.documents || employee?.documents || {};
    const employeeName = employee?.name || employee?.employeeName || employee?.displayName || "Employee";
    const details = [
        ["Full name", employeeName],
        ["Employee ID", employee?.empId || employee?.employeeCode || profile.empId],
        ["Email", employee?.email],
        ["Phone", employee?.phone || profile.phone || employee?.contact],
        ["Emergency contact", profile.emergencyNo || employee?.emergencyNo],
        ["Date of birth", profile.dob || employee?.dob],
        ["Gender", profile.gender || employee?.gender],
        ["Role", employee?.role || employee?.employeeRole],
        ["Department", profile.department || employee?.department],
        ["Designation", profile.designation || employee?.designation],
        ["Employment status", employee?.status],
        ["Industry", employee?.industry],
        ["Joining date", profile.joiningDate || employee?.joinDate],
        ["Work location", profile.workLocation || employee?.location],
        ["Address", profile.address || employee?.address],
        ["Reporting manager", profile.reportingManager || employee?.reportingManager],
        ["Employee notes", employee?.notes || profile.description],
        ["Account holder", bankDetails.accountHolderName],
        ["Bank name", bankDetails.bankName],
        ["Branch", bankDetails.branchName],
        ["Account number", bankDetails.accountNumber],
        ["IFSC code", bankDetails.ifscCode],
        ["Account type", bankDetails.accountType],
        ["Documents uploaded", Object.values(documents).filter((document) => document?.fileName || document?.fileUrl).length || undefined],
    ].filter(([, value]) => value);

    const formatDetail = (label, value) => {
        if (["Joining date", "Date of birth"].includes(label)) {
            const date = new Date(value);
            return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-IN");
        }
        return value;
    };

    const updateField = (field, value) => {
        setMessage("");
        setForm((previous) => ({ ...previous, [field]: value }));
    };

    const updateNewField = (field, value) => {
        setMessage("");
        setNewForm((previous) => ({ ...previous, [field]: value }));
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        if (!employee || !newForm.month || !newForm.date) {
            setMessage("Enter the month or pay period and salary date.");
            return;
        }

        setSaving(true);
        setMessage("");
        try {
            await createPayslip({
                employeeId: employee.uid || employee._id || employee.id || employee.email || employee.profile?.empId,
                month: newForm.month,
                date: new Date(`${newForm.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                status: "Pending",
                ...Object.fromEntries([
                    ...earningsFields,
                    ...deductionFields,
                ].map(([field]) => [field, amount(newForm[field])])),
                gross: newGross,
                totalDeductions: newDeductions,
                net: newNet,
            });
            await onCreated?.();
            setMessage("Salary breakup created successfully.");
        } catch (error) {
            setMessage(error.message || "Unable to create salary breakup.");
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async (event) => {
        event.preventDefault();
        if (!selectedPayslip?._id) return;

        setSaving(true);
        setMessage("");
        try {
            await updatePayslip(selectedPayslip._id, {
                employeeId: selectedPayslip.employeeId,
                month: selectedPayslip.month,
                date: selectedPayslip.date,
                status: selectedPayslip.status,
                ...Object.fromEntries([
                    ...earningsFields,
                    ...deductionFields,
                ].map(([field]) => [field, amount(form[field])])),
                gross,
                totalDeductions,
                net,
            });
            setMessage("Salary breakup saved. The employee portal will now show these values.");
        } catch (error) {
            setMessage(error.message || "Unable to save salary breakup.");
        } finally {
            setSaving(false);
        }
    };

    if (!selectedPayslip) {
        return (
            <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900">Salary breakup</h2>
                    <p className="text-sm text-amber-700 mt-2">No salary record has been created for {employeeName} yet. Add the first salary breakup below.</p>
                </div>
                <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h3 className="text-lg font-bold text-blue-900">Add new salary breakup</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <label className="text-xs font-semibold text-gray-600">
                                Pay period
                                <input
                                    required
                                    value={newForm.month}
                                    onChange={(event) => updateNewField("month", event.target.value)}
                                    placeholder="e.g. Sep 2026"
                                    className="mt-1 block w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-blue-500"
                                />
                            </label>
                            <label className="text-xs font-semibold text-gray-600">
                                Salary date
                                <input
                                    required
                                    type="date"
                                    value={newForm.date}
                                    onChange={(event) => updateNewField("date", event.target.value)}
                                    className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-blue-500"
                                />
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[earningsFields, deductionFields].map((fields, groupIndex) => (
                            <section key={groupIndex}>
                                <h4 className="font-semibold text-gray-700 mb-3">{groupIndex === 0 ? "Earnings" : "Deductions"}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {fields.map(([field, label]) => (
                                        <label key={field}>
                                            <span className="block text-sm font-semibold text-gray-600 mb-1">{label}</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={newForm[field] ?? ""}
                                                onChange={(event) => updateNewField(field, event.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Gross salary</p>
                            <p className="mt-1 text-xl font-bold text-blue-700">₹{newGross.toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total deductions</p>
                            <p className="mt-1 text-xl font-bold text-red-600">₹{newDeductions.toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Net salary</p>
                            <p className="mt-1 text-xl font-bold text-green-600">₹{newNet.toLocaleString("en-IN")}</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-sm text-gray-600" role="status">{message}</p>
                        <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                            {saving ? "Saving..." : `Add salary breakup · ₹${newNet.toLocaleString("en-IN")} net`}
                        </button>
                    </div>
                </form>
                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="text-lg font-bold text-blue-900 mb-4">Employee details</h3>
                    {details.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                            {details.map(([label, value]) => (
                                <div key={label}>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                                    <p className="mt-1 text-sm font-medium text-gray-800 break-words">{formatDetail(label, value)}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Employee details are not available.</p>
                    )}
                </section>
            </div>
        );
    }

    const renderFields = (fields) => fields.map(([field, label]) => (
        <label key={field} className="block">
            <span className="block text-sm font-semibold text-gray-600 mb-1">{label}</span>
            <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                <input
                    type="number"
                    min="0"
                    value={form[field] ?? ""}
                    onChange={(event) => updateField(field, event.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
            </div>
        </label>
    ));

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Salary breakup</h2>
                    <p className="text-sm text-gray-500 mt-1">Edit the real payslip record for {form.month || "this period"} · {getFinancialYear()}</p>
                </div>
                {payslips.length > 1 && (
                    <select
                        value={selectedPayslip._id}
                        onChange={(event) => setSelectedId(event.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                        {payslips.map((payslip) => (
                            <option key={payslip._id} value={payslip._id}>{payslip.month || payslip.date}</option>
                        ))}
                    </select>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <h3 className="text-lg font-bold text-blue-900 mb-4">Earnings</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{renderFields(earningsFields)}</div>
                    </section>
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <h3 className="text-lg font-bold text-blue-900 mb-4">Deductions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{renderFields(deductionFields)}</div>
                    </section>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div><p className="text-sm text-gray-500">Gross salary</p><p className="text-2xl font-bold text-blue-700">₹{gross.toLocaleString("en-IN")}</p></div>
                        <div><p className="text-sm text-gray-500">Total deductions</p><p className="text-2xl font-bold text-red-600">₹{totalDeductions.toLocaleString("en-IN")}</p></div>
                        <div><p className="text-sm text-gray-500">Net salary</p><p className="text-2xl font-bold text-green-600">₹{net.toLocaleString("en-IN")}</p></div>
                    </div>
                    <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-sm text-gray-600" role="status">{message}</p>
                        <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                            <Save size={17} />
                            {saving ? "Saving..." : "Save salary breakup"}
                        </button>
                    </div>
                </div>
            </form>
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Employee details</h3>
                {details.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        {details.map(([label, value]) => (
                            <div key={label}>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                                <p className="mt-1 text-sm font-medium text-gray-800 break-words">{formatDetail(label, value)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Employee details are not available for this payslip.</p>
                )}
            </section>
        </div>
    );
};

export default SalaryBreakup;
