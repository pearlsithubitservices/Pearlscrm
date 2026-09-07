import React from "react";
import { motion } from "framer-motion";
import {
    Bell,
    Wallet,
    Users,
    IndianRupee,
    Clock3,
    LayoutDashboard,
    CheckSquare,
    Calendar,
    BadgeIndianRupee,
    FolderKanban,
    Briefcase,
    LogOut,
    Menu,
} from "lucide-react";
import usePayslip from "../../../Hooks/usePayslip";
import { getFinancialYear } from '../../../Utils/formatNumber'
import SalaryBreakupSkeleton from "./Skeleton";
import { useAuth } from "../../../context/AuthContext";

const SalaryBreakup = () => {
    const { payslips, loading } = usePayslip();
    const { user } = useAuth();
    const userUid = user?.uid || user?.id || user?._id;
    const userEmpId = user?.profile?.empId || user?.empId;

    const empPayslips = (payslips || []).filter((item) =>
        item.employeeId == userUid ||
        item.employeeId == userEmpId ||
        item.employeeId?.toLowerCase() == user?.email?.toLowerCase() ||
        item.employeeName == user?.name ||
        item.employeeName == user?.profile?.name
    );

    const payslipById = empPayslips;
    const payslip = payslipById[0] || {};
    const financialYear = getFinancialYear();

    if (loading) {
        return <SalaryBreakupSkeleton />
    }

    if (!empPayslips || empPayslips.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 shadow-sm my-6">
                <p className="text-lg font-bold text-gray-700">No salary breakup details found.</p>
                <p className="text-xs text-gray-400 mt-1">Component and deduction breakup will be generated when your first payslip is issued.</p>
            </div>
        );
    }

    const annualSummary = payslipById.reduce(
        (totals, slip) => {
            totals.basicSalary += Number(slip.basicSalary || 0);
            totals.conveyance += Number(slip.conveyance || slip.convayance || 0);
            totals.medical += Number(slip.medical || 0);
            totals.performanceBonus += Number(slip.performanceBonus || 0);

            totals.pf += Number(slip.pf || 0);
            totals.esi += Number(slip.esi || 0);
            totals.tds += Number(slip.tds || 0);
            totals.professionalTax += Number(slip.professionalTax || 0);

            totals.gross += Number(slip.gross || 0);
            totals.net += Number(slip.net || 0);

            return totals;
        },
        {
            basicSalary: 0,
            conveyance: 0,
            medical: 0,
            performanceBonus: 0,

            pf: 0,
            esi: 0,
            tds: 0,
            professionalTax: 0,

            gross: 0,
            net: 0,
        }
    );

    console.log(annualSummary);
    console.log(payslips);


    const salaryData = [
        ["Basic salary", payslip?.basicSalary, annualSummary.basicSalary],
        ["Conveyance allowance", payslip?.conveyance, annualSummary.conveyance],
        ["Medical allowance", payslip?.medical, annualSummary.medical],
        ["Performance bonus (variable)", payslip?.performanceBonus, annualSummary.performanceBonus],
    ];

    const deductionData = [
        ["Provident Fund (PF)", payslip?.pf, annualSummary.pf],
        ["ESIC", payslip?.esi, annualSummary?.esi],
        ["Income Tax (TDS)", payslip?.tds, annualSummary.tds],
        ["Professional Tax", payslip?.professionalTax, annualSummary.professionalTax],
    ];

    const totalSalaryMonth = salaryData.reduce((sum, item) => sum + Number(item[1]), 0);
    const totalSalaryyear = salaryData.reduce((sum, item) => sum + Number(item[2]), 0);
    const totaldeductionMonth = deductionData.reduce((sum, item) => sum + Number(item[1]), 0);
    const totaldeductionyear = deductionData.reduce((sum, item) => sum + Number(item[2]), 0);


    return (
        <div className="min-h-screen  flex">
            <main className="flex-1">
                <div className="p-4  bg-[#f3f0eb]">
                    <div className=" rounded-2xl  shadow-sm  overflow-hidden">
                        <div className=" bg-white rounded-lg px-6 py-4 flex justify-between items-center mb-4 shadow-sm">
                            <h2 className="text-2xl font-bold">
                                Salary breakup
                            </h2>

                            <span className="font-semibold text-gray-500">
                                {financialYear}
                            </span>
                        </div>

                        <div className="overflow-x-auto bg-white rounded-lg">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr>
                                        <th className="text-left p-5 text-blue-900 text-xl">
                                            Component
                                        </th>
                                        <th className="text-right p-5 text-blue-600 text-xl">
                                            Monthly
                                        </th>
                                        <th className="text-right p-5 text-blue-600 text-xl">
                                            Annual
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {salaryData.map((row, index) => (
                                        <tr
                                            key={index}
                                            className="border-t"
                                        >
                                            <td className="p-5">
                                                {row[0]}
                                            </td>
                                            <td className="p-5 text-right">
                                                ₹{Number(row[1]).toLocaleString('en-IN')}
                                            </td>
                                            <td className="p-5 text-right">
                                                ₹{Number(row[2]).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}

                                    <tr className="border-t font-bold">
                                        <td className="p-5 text-2xl">
                                            Total CTC
                                        </td>
                                        <td className="p-5 text-right text-2xl text-green-600">
                                            ₹{totalSalaryMonth.toLocaleString('en-IN')}
                                        </td>
                                        <td className="p-5 text-right text-2xl text-green-600">
                                            ₹{totalSalaryyear.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Deduction Breakup */}

                    <div className="bg-[#f3f0eb] rounded-2xl border shadow-sm mt-8 overflow-hidden">
                        <div className="bg-white mb-8 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">
                                Deductions breakup
                            </h2>

                            <span className="font-semibold text-gray-500">
                                {financialYear}
                            </span>
                        </div>

                        <div className="overflow-x-auto rounded-lg bg-white">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr>
                                        <th className="text-left p-5 text-blue-900 text-xl">
                                            Component
                                        </th>
                                        <th className="text-right p-5 text-blue-600 text-xl">
                                            Monthly
                                        </th>
                                        <th className="text-right p-5 text-blue-600 text-xl">
                                            Annual
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {deductionData.map((row, index) => (
                                        <tr
                                            key={index}
                                            className="border-t"
                                        >
                                            <td className="p-5">
                                                {row[0]}
                                            </td>
                                            <td className="p-5 text-right">
                                                ₹{Number(row[1]).toLocaleString('en-IN')}
                                            </td>
                                            <td className="p-5 text-right">
                                                ₹{Number(row[2]).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}

                                    <tr className="border-t font-bold">
                                        <td className="p-5 text-2xl">
                                            Total CTC
                                        </td>
                                        <td className="p-5 text-right text-2xl text-orange-500">
                                            ₹{totaldeductionMonth.toLocaleString('en-IN')}
                                        </td>
                                        <td className="p-5 text-right text-2xl text-orange-500">
                                            ₹{totaldeductionyear.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SalaryBreakup;