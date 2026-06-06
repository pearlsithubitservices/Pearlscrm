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

const SalaryBreakup = () => {


    const salaryData = [
        ["Basic salary", "42500", "510000"],
        ["House Rent Allowance (HRA)", "20000", "204000"],
        ["Special allowance", "20000", "150000"],
        ["Conveyance allowance", "20000", "36000"],
        ["Medical allowance", "20000", "60000"],
        ["Performance bonus (variable)", "15000", "15000"],
    ];

    const deductionData = [
        ["Provident Fund (PF)", "1800", "21600"],
        ["ESIC", "131", "1572"],
        ["Income Tax (TDS)", "4500", "1788"],
        ["Professional Tax", "149", "15000"],
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
                                FY 2025-26
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
                                FY 2025-26
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