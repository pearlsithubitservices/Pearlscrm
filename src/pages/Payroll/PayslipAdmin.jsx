import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Bell,
    Wallet,
    User,
    BadgeDollarSign,
    Clock,
    X,
    Trash2,
} from "lucide-react";


// import SalaryDetails from "./SalaryDetails";
// import TaxDocuments from "./TaxDocuments";
// import Reimbursements from "./Reimbursements";
// import Benefits from "./Benefits";
import Payslip from "./Payslip";
import { useNavigate, useParams } from "react-router-dom";
import usePayslip from "../../Hooks/usePayslip";
import useEmployees from "../../Hooks/useEmployees";

import ReimbursementClaim from "./ReimbursementClaim/ReimbursementClaim";
import ReimbursementPolicies from "./ReimbursementClaim/ReimbursementPolicies";
import Reimbursement from "./ReimbursementClaim/Reimbursement";
import SalaryBreakup from "./SalaryBreakup/SalaryBreakup";
import TaxDocuments from "./Tax Documents/TaxDocuments";
import EnrolledBenefits from "./Benifits/EnrolledBenefits";
import EmployeeBenefits from "./Benifits/EmployeeBenefits";


export default function PayslipAdmin() {
    const [activeTab, setActiveTab] = useState("Payslips");
    const { id } = useParams();
    const { payslips, fetchPayslips, updatePayslipStatus, deletePayslip } = usePayslip();
    const navigate = useNavigate();
    const EmpPayslip = payslips.find((item) => (
        item._id == id
    ));
    const routeEmployeeId = String(id || '').startsWith('employee-')
        ? String(id).slice('employee-'.length)
        : id;
    const currentPayslip = payslips.filter((item) => (
        item.employeeId == (EmpPayslip?.employeeId || routeEmployeeId)
    ));
    const PendingPayslip = currentPayslip
        ?.filter((p) => p?.status?.toLowerCase() === "pending")
        ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || EmpPayslip;

    const { employees } = useEmployees();
    const selectedEmployee = employees.find((employee) => {
        const employeeKeys = [employee.uid, employee._id, employee.id, employee.email, employee.profile?.empId];
        const targetId = EmpPayslip?.employeeId || routeEmployeeId;
        return employeeKeys.some((key) => String(key || '').toLowerCase() === String(targetId || '').toLowerCase());
    });
    // GETTING EMPLOYEES NAME & ID
    const employeeMap = useMemo(() => {
        const map = {};
        employees.forEach((employee) => {
            const info = {
                name: employee.name || employee.employeeName || (employee.email ? employee.email.split('@')[0] : "Employee"),
                role: employee.employeeRole || employee.role || "Employee",
                empId: employee.empId || employee.profile?.empId || employee.employeeCode || `EMP-${String(employee._id || employee.uid || employee.id || "").slice(-4).toUpperCase()}`,
            };
            if (employee.uid) map[employee.uid] = info;
            if (employee._id) map[employee._id] = info;
            if (employee.id) map[employee.id] = info;
            if (employee.email) map[employee.email.toLowerCase()] = info;
            if (employee.profile?.empId) map[employee.profile.empId] = info;
        });
        return map;
    }, [employees]);

    const handleToggleStatus = async () => {
        if (!PendingPayslip?._id) return;
        const newStatus = PendingPayslip.status === "Paid" ? "Pending" : "Paid";
        try {
            await updatePayslipStatus(PendingPayslip._id, newStatus);
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };


    const renderTab = () => {
        switch (activeTab) {
            case "Payslips":
                return <Payslip
                    payslip={currentPayslip} />;

            case "Salary Details":
                return <SalaryBreakup
                    currentPayslip={currentPayslip}
                    employee={selectedEmployee}
                    onCreated={fetchPayslips}
                />

            case "Tax Documents":
                return <TaxDocuments />

            case "Reimbursements":
                return <Reimbursement currentPayslip={currentPayslip} />
            case "Benefits":
                return (
                    <>
                        <EnrolledBenefits />
                        <EmployeeBenefits />
                    </>
                )

            default:
                return <Payslip />;
        }
    };

    return (
        <div className="bg-[#f3f0eb] max-h-screen overflow-y-auto custom-scrollbar">

            {/* Header */}

            <header className="flex justify-between items-center p-4 sm:p-6 bg-white shadow">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">
                        Admin — Payroll & Benefits
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500">
                        Manage payroll for all employees
                    </p>
                </div>

                <div className="flex items-center justify-between gap-4 cursor-pointer">
                    <Bell className="w-6 h-6 bg-blue-700 text-white rounded p-1" />
                    <X className="w-6 h-6 text-red-700 hover:scale-110 transition" onClick={() => navigate(-1)} />
                </div>
            </header>

            <div className="p-4 sm:p-8">

                {/* Summary */}

                <div className="space-y-6">

                    {/* TOP CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        <motion.div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                            <div className="flex justify-between">
                                <Wallet className="text-blue-600" />
                                <span className="text-green-500 text-xs font-semibold">Month</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Gross Amount</p>
                            <h2 className="text-xl font-bold text-blue-600">₹ {PendingPayslip?.gross || 0}</h2>
                        </motion.div>

                        <motion.div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                            <div className="flex justify-between">
                                <User className="text-red-500" />
                                <span className="text-green-500 text-xs font-semibold">Month</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Deductions</p>
                            <h2 className="text-xl font-bold text-red-500">₹ {PendingPayslip?.totalDeductions || PendingPayslip?.deductions || 0}</h2>
                        </motion.div>

                        <motion.div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                            <div className="flex justify-between">
                                <BadgeDollarSign className="text-green-600" />
                                <span className="text-green-500 text-xs font-semibold">Month</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Net Salary</p>
                            <h2 className="text-xl font-bold text-green-600">₹ {PendingPayslip?.net || 0}</h2>
                        </motion.div>

                        <motion.div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                            <div className="flex justify-between">
                                <Clock className="text-amber-500" />
                                <span className="text-amber-500 text-xs font-semibold">Status</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Payment Status</p>
                            <h2 className="text-xl font-bold text-amber-600">{PendingPayslip?.status || "Pending"}</h2>
                        </motion.div>

                    </div>

                </div>

                {/* Employee Card */}

                {PendingPayslip && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl shadow mt-8 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-gray-100"
                    >

                        <div className="flex items-center gap-4">

                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-blue-800 shrink-0">

                                {(employeeMap[PendingPayslip?.employeeId]?.name || "Employee")?.charAt(0).toUpperCase()}

                            </div>

                            <div>

                                <h2 className="text-xl sm:text-2xl font-semibold">
                                    {employeeMap[PendingPayslip?.employeeId]?.name || PendingPayslip?.employeeName || "Employee"}
                                </h2>

                                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                                    {employeeMap[PendingPayslip?.employeeId]?.role || "Team Member"} • ID: <span className="font-mono text-slate-700">{employeeMap[PendingPayslip?.employeeId]?.empId || (PendingPayslip?.employeeId ? `EMP-${String(PendingPayslip.employeeId).slice(-4).toUpperCase()}` : "EMP ID")}</span>
                                </p>

                            </div>

                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <button
                                onClick={handleToggleStatus}
                                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold text-white transition shadow-sm ${
                                    PendingPayslip?.status === "Paid"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-amber-500 hover:bg-amber-600"
                                }`}
                            >
                                Mark as {PendingPayslip?.status === "Paid" ? "Pending" : "Paid"} ({PendingPayslip?.status || "Pending"})
                            </button>
                            <button
                                onClick={async () => {
                                    if (window.confirm("Are you sure you want to delete this payslip record?")) {
                                        try {
                                            await deletePayslip(PendingPayslip._id);
                                            navigate("/payroll");
                                        } catch (err) {
                                            alert(err.message || "Failed to delete");
                                        }
                                    }
                                }}
                                className="p-2.5 sm:p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition border border-red-200"
                                title="Delete Payslip"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                    </motion.div>
                )}

                {/* Tabs */}

                <div className="flex items-center overflow-x-auto custom-scrollbar gap-2 sm:gap-4 mt-8 text-base sm:text-lg bg-white p-2 rounded-2xl border border-gray-200 whitespace-nowrap">

                    {[
                        "Payslips",
                        "Salary Details",
                        "Tax Documents",
                        "Reimbursements",
                        "Benefits",
                    ].map((tab) => (

                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 pt-2 px-4 transition-all font-semibold rounded-xl text-sm sm:text-base

              ${activeTab === tab
                                    ? "bg-blue-50 text-blue-700 font-bold border-b-2 border-blue-600"
                                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                }
              
              `}
                        >

                            {tab}

                        </button>

                    ))}

                </div>

                {/* Current Page */}

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .3 }}
                    className="mt-8"
                >

                    {renderTab()}

                </motion.div>

            </div>

        </div>
    );
}