import React from "react";
import { motion } from "framer-motion";
import usePayslip from "../../../Hooks/usePayslip";
import SummarySkeleton from "./SummarySkeleton";

const PaySummary = () => {
    const { payslips = [] } = usePayslip();

    // Latest payslip
    const payslip = payslips?.[0];
    console.log(payslip);

    const monthyear = new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    if (!payslip) {
        return (
            <SummarySkeleton/>
        );
    }

    const earnings = [
        {
            title: "Basic Salary",
            amount: payslip.basicSalary || 0,
        },
        {
            title: "Medical Allowance",
            amount: payslip.medical || 0,
        },
        {
            title: "Performance Bonus",
            amount: payslip.performanceBonus || 0,
        },
        {
            title: "Conveyance",
            amount: payslip.convayance || 0,
        },
    ];

    const deductions = [
        {
            title: "PF (Employee)",
            amount: payslip.pf || 0,
        },
        {
            title: "ESI",
            amount: payslip.esi || 0,
        },
        {
            title: "TDS",
            amount: payslip.tds || 0,
        },
        {
            title: "Professional Tax",
            amount: payslip.professionalTax || 0,
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Summary */}
            <motion.div
                whileHover={{ y: -2 }}
                className="bg-white border rounded-2xl p-5 shadow-sm"
            >
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#0b2b57]">
                            Pay Summary · {monthyear}
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Monthly Earnings and Deductions Summary
                        </p>
                    </div>

                    <div className="text-left md:text-right">
                        <p className="text-gray-500 text-lg">
                            Net Take Home
                        </p>

                        <h2 className="text-4xl font-bold text-[#147a43]">
                            ₹{Number(
                                payslip.net || 0
                            ).toLocaleString("en-IN")}
                        </h2>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Earnings */}
                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white border rounded-2xl p-5 shadow-sm"
                >
                    <div className="flex justify-between mb-4">
                        <h2 className="text-2xl font-bold text-[#0b2b57]">
                            Earnings
                        </h2>

                        <span className="text-2xl text-[#2563eb]">
                            Amount
                        </span>
                    </div>

                    {earnings.map((item, index) => (
                        <div key={index}>
                            <div className="flex justify-between py-4">
                                <span className="text-xl">
                                    {item.title}
                                </span>

                                <span className="text-xl text-[#163b63]">
                                    ₹{Number(item.amount).toLocaleString("en-IN")}
                                </span>
                            </div>

                            {index !== earnings.length - 1 && (
                                <div className="border-b" />
                            )}
                        </div>
                    ))}

                    <div className="border-b my-2" />

                    <div className="flex justify-between pt-3">
                        <h3 className="text-2xl font-bold text-[#0b2b57]">
                            Gross Earnings
                        </h3>

                        <span className="text-4xl font-bold text-[#147a43]">
                            ₹{Number(
                                payslip.gross || 0
                            ).toLocaleString("en-IN")}
                        </span>
                    </div>
                </motion.div>

                {/* Deductions */}
                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white border rounded-2xl p-5 shadow-sm"
                >
                    <div className="flex justify-between mb-4">
                        <h2 className="text-2xl font-bold text-[#0b2b57]">
                            Deductions
                        </h2>

                        <span className="text-2xl text-[#2563eb]">
                            Amount
                        </span>
                    </div>

                    {deductions.map((item, index) => (
                        <div key={index}>
                            <div className="flex justify-between py-4">
                                <span className="text-xl">
                                    {item.title}
                                </span>

                                <span className="text-xl text-[#163b63]">
                                    ₹{Number(item.amount).toLocaleString("en-IN")}
                                </span>
                            </div>

                            {index !== deductions.length - 1 && (
                                <div className="border-b" />
                            )}
                        </div>
                    ))}

                    <div className="border-b my-2" />

                    <div className="flex justify-between pt-3">
                        <h3 className="text-2xl font-bold text-[#0b2b57]">
                            Total Deductions
                        </h3>

                        <span className="text-4xl font-bold text-[#f04b23]">
                            ₹{Number(
                                payslip.totalDeductions || 0
                            ).toLocaleString("en-IN")}
                        </span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PaySummary;