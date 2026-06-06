import React from "react";
import { motion } from "framer-motion";
import { IndianRupee } from "lucide-react";

const PaySummary = () => {
    const earnings = [
        { title: "Basic salary", amount: "42500" },
        { title: "HRA", amount: "20000" },
        { title: "Special allowance", amount: "20000" },
        { title: "Conveyance", amount: "15000" },
    ];

    const deductions = [
        { title: "PF (Employee)", amount: "1800" },
        { title: "ESI", amount: "131" },
        { title: "TDS (Income Tax)", amount: "4500" },
        { title: "Professional Tax", amount: "15000" },
    ];

    const monthyear = new Date().toLocaleDateString("en-us", {
        month: "long",
        year: "numeric",
    });
  const Grossearnings=earnings.reduce((sum, item)=> sum + Number(item.amount),0)
  const totaldeductions=deductions.reduce((sum, item)=> sum + Number(item.amount),0);

  const netearnings=Grossearnings-totaldeductions;
    

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Summary Card */}
            <motion.div
                whileHover={{ y: -2 }}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#0b2b57]">
                            Pay summary · {monthyear}
                        </h1>

                        <p className="text-gray-500 mt-1 text-sm md:text-base">
                            Monthly Earnings and Deductions Summary
                        </p>
                    </div>

                    <div className="text-left md:text-right">
                        <p className="text-gray-500 text-lg">
                            Net take-home
                        </p>

                        <h2 className="text-4xl font-bold text-[#147a43]">
                            ₹{netearnings.toLocaleString("en-IN")}
                        </h2>
                    </div>
                </div>
            </motion.div>

            {/* Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Earnings */}
                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-[#0b2b57]">
                            Earnings
                        </h2>

                        <span className="text-2xl text-[#2563eb] font-medium">
                            Amount
                        </span>
                    </div>

                    {earnings.map((item, index) => (
                        <div key={index}>
                            <div className="flex items-center justify-between py-4">
                                <span className="text-xl text-black">
                                    {item.title}
                                </span>

                                <span className="text-xl text-[#163b63]">
                                    ₹{item.amount}
                                </span>
                            </div>

                            {index !== earnings.length - 1 && (
                                <div className="border-b border-gray-200" />
                            )}
                        </div>
                    ))}

                    <div className="border-b border-gray-200 my-2" />

                    <div className="flex items-center justify-between pt-3">
                        <h3 className="text-2xl font-bold text-[#0b2b57]">
                            Gross earnings
                        </h3>

                        <span className="text-4xl font-bold text-[#147a43]">
                            ₹{Grossearnings.toLocaleString("en-IN")}
                        </span>
                    </div>
                </motion.div>

                {/* Deductions */}
                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-[#0b2b57]">
                            Deductions
                        </h2>

                        <span className="text-2xl text-[#2563eb] font-medium">
                            Amount
                        </span>
                    </div>

                    {deductions.map((item, index) => (
                        <div key={index}>
                            <div className="flex items-center justify-between py-4">
                                <span className="text-xl text-black">
                                    {item.title}
                                </span>

                                <span className="text-xl text-[#163b63]">
                                    ₹{item.amount}
                                </span>
                            </div>

                            {index !== deductions.length - 1 && (
                                <div className="border-b border-gray-200" />
                            )}
                        </div>
                    ))}

                    <div className="border-b border-gray-200 my-2" />

                    <div className="flex items-center justify-between pt-3">
                        <h3 className="text-2xl font-bold text-[#0b2b57]">
                            Total deductions
                        </h3>

                        <span className="text-4xl font-bold text-[#f04b23]">
                            ₹{totaldeductions.toLocaleString("en-IN")}
                        </span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PaySummary;