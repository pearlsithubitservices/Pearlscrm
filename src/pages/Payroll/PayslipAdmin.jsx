import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Bell,
    Wallet,
    User,
    BadgeDollarSign,
    Clock,
    X
} from "lucide-react";


// import SalaryDetails from "./SalaryDetails";
// import TaxDocuments from "./TaxDocuments";
// import Reimbursements from "./Reimbursements";
// import Benefits from "./Benefits";
import Payslip from "./Payslip";
import { useNavigate, useParams } from "react-router-dom";
import usePayslip from "../../Hooks/usePayslip";
import useEmployees from "../../Hooks/useEmployees";
import Feedbackadmin from "./Feedback/feedbackadmin";
import ReimbursementClaim from "./ReimbursementClaim/ReimbursementClaim";
import ReimbursementPolicies from "./ReimbursementClaim/ReimbursementPolicies";
import Reimbursement from "./ReimbursementClaim/Reimbursement";


export default function PayslipAdmin() {
    const [activeTab, setActiveTab] = useState("Payslips");
    const { id } = useParams();
    const { payslips } = usePayslip();
    const navigate = useNavigate();
    const EmpPayslip = payslips.find((item) => (
        item._id == id
    ));
    const currentPayslip = payslips.filter((item) => (
        item.employeeId == EmpPayslip.employeeId
    ));
    const PendingPayslip = currentPayslip
        ?.filter((p) => p?.status?.toLowerCase() === "pending")
        ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    console.log(PendingPayslip)
    const { employees } = useEmployees();
    //GETTING EMPLOYEES NAME
    const employeeMap = useMemo(() => {
        return employees.reduce((map, employee) => {
            map[employee.uid] = {
                name: employee.name,
                role: employee.role, // or employee.employeeRole if that's your field
            };
            return map;
        }, {});
    }, [employees]);


    const renderTab = () => {
        switch (activeTab) {
            case "Payslips":
                return <Payslip
                    payslip={currentPayslip} />;

            case "Salary Details":
                return <Feedbackadmin />

            case "Tax Documents":
                return <div>
                    <p>hi</p>
                </div>;

            case "Reimbursements":
                return <Reimbursement />
            case "Benefits":
                return <div>
                    <p>hi</p>
                </div>;

            default:
                return <Payslip />;
        }
    };

    return (
        <div className="bg-[#f3f0eb] max-h-screen overflow-y-auto no-scrollbar">

            {/* Header */}

            <header className="flex justify-between items-center p-6 bg-white shadow">
                <div>
                    <h1 className="text-2xl font-bold">
                        Admin — Payroll & Benefits
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage payroll for all employees
                    </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <Bell className="w-6 h-6 bg-blue-700 text-white rounded p-1" />
                    <X className="w-6 h-6 text-red-700" onClick={() => navigate(-1)} />
                </div>
            </header>

            <div className="p-10">

                {/* Summary */}

                <div className=" space-y-6">

                    {/* TOP CARDS */}
                    <div className="grid grid-cols-4 gap-4">

                        <motion.div className="bg-white p-4 rounded-xl shadow">
                            <div className="flex justify-between">
                                <Wallet />
                                <span className="text-green-500 text-xs">Month</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Gross Amount</p>
                            <h2 className="text-xl font-bold text-blue-600">₹ 10,200</h2>
                        </motion.div>

                        <motion.div className="bg-white p-4 rounded-xl shadow">
                            <div className="flex justify-between">
                                <User />
                                <span className="text-green-500 text-xs">Month</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Deductions</p>
                            <h2 className="text-xl font-bold text-red-500">₹ 1,750</h2>
                        </motion.div>

                        <motion.div className="bg-white p-4 rounded-xl shadow">
                            <div className="flex justify-between">
                                <BadgeDollarSign />
                                <span className="text-green-500 text-xs">Month</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Net Salary</p>
                            <h2 className="text-xl font-bold text-green-600">₹ 8,450</h2>
                        </motion.div>

                        <motion.div className="bg-white p-4 rounded-xl shadow">
                            <div className="flex justify-between">
                                <Clock />
                                <span className="text-green-500 text-xs">Year</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Total Amounts</p>
                            <h2 className="text-xl font-bold">₹ 4,800</h2>
                        </motion.div>

                    </div>

                </div>

                {/* Employee Card */}

                {PendingPayslip && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl shadow mt-8 p-6 flex justify-between items-center"
                    >

                        <div className="flex items-center gap-4">

                            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold">

                                {(employeeMap[PendingPayslip?.employeeId]?.name || "Ragavi")?.charAt(0).toUpperCase()}

                            </div>

                            <div>

                                <h2 className="text-2xl font-semibold">
                                    {employeeMap[PendingPayslip?.employeeId]?.name || "Ragavi"}
                                </h2>

                                <p className="text-gray-500">
                                    {employeeMap[PendingPayslip?.employeeId]?.role || ""} • {PendingPayslip?.employeeId?.slice(0, 5)}
                                </p>

                            </div>

                        </div>

                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold">

                            Pending

                        </button>

                    </motion.div>
                )}

                {/* Tabs */}

                <div className="flex gap-12 mt-10  ml-14 text-xl">

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
                            className={`pb-4 transition-all font-medium

              ${activeTab === tab
                                    ? "border-b-4 border-blue-600 text-blue-700"
                                    : "text-gray-500"
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