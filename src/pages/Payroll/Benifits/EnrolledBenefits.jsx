import React from "react";
import { motion } from "framer-motion";
import { Circle } from "lucide-react";

const benefits = [
    {
        id: 1,
        benefit: "Health insurance",
        plan: "Family floater",
        coverage: "₹5,00,000",
        status: "Active",
    },
    {
        id: 2,
        benefit: "Life insurance",
        plan: "Standard",
        coverage: "₹10,00,000",
        status: "Active",
    },
    {
        id: 3,
        benefit: "Provident fund",
        plan: "EPF",
        coverage: "12% of basic",
        status: "Active",
    },
];

export default function EnrolledBenefits() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-md border border-gray-200 p-6"
        >
            {/* Heading */}
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Enrolled benefits
            </h2>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-300 py-4 px-6 text-center text-[#0F3556] font-bold uppercase">
                                Benefit
                            </th>
                            <th className="border border-gray-300 py-4 px-6 text-center text-[#0F3556] font-bold uppercase">
                                Plan
                            </th>
                            <th className="border border-gray-300 py-4 px-6 text-center text-[#0F3556] font-bold uppercase">
                                Coverage
                            </th>
                            <th className="border border-gray-300 py-4 px-6 text-center text-[#0F3556] font-bold uppercase">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {benefits.map((item, index) => (
                            <motion.tr
                                key={item.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: index * 0.15,
                                }}
                                className="hover:bg-gray-50 transition"
                            >
                                <td className="border border-gray-300 py-5 px-6 text-center text-gray-800">
                                    {item.benefit}
                                </td>

                                <td className="border border-gray-300 py-5 px-6 text-center text-gray-800">
                                    {item.plan}
                                </td>

                                <td className="border border-gray-300 py-5 px-6 text-center font-medium text-gray-900">
                                    {item.coverage}
                                </td>

                                <td className="border border-gray-300 py-5 px-6">
                                    <div className="flex justify-center">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-2 text-emerald-600 font-medium">
                                            <Circle
                                                size={10}
                                                fill="currentColor"
                                                className="stroke-none"
                                            />
                                            {item.status}
                                        </span>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}