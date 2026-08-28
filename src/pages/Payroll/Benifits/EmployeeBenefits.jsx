import React from "react";
import { motion } from "framer-motion";
import {
    SquarePen,
    Trash2,
    SquarePenIcon,
} from "lucide-react";

const benefits = [
    {
        id: 1,
        title: "Group Health Insurance",
        subtitle: "Mediclaim cover for you + family",
        action: "View Policy",
        details: [
            { label: "Provider", value: "Star Health" },
            { label: "Cover", value: "₹5,00,000" },
        ],
        footer: "Members: Self + Spouse + 2 kids",
    },
    {
        id: 2,
        title: "Provident Fund (PF)",
        subtitle: "Employee + employer PF contributions",
        action: "View Passbook",
        details: [
            { label: "UAN", value: "101234567890" },
            { label: "Employee contrib", value: "₹1,800-Month" },
        ],
        footer: "Members: Self",
    },
    {
        id: 3,
        title: "Gratuity",
        subtitle: "Long-service benefit",
        action: "Learn More",
        details: [
            { label: "Eligible after", value: "5 years" },
            { label: "Service", value: "1 year 2 month" },
        ],
        footer: "Projected (5 yr): ₹2,45,000",
    },
    {
        id: 4,
        title: "Work From Home",
        subtitle: "WFH equipment & internet allowance",
        action: "Claim Now",
        details: [
            { label: "Internet", value: "₹1,000-Month" },
            { label: "Equipment", value: "₹5,000-year" },
        ],
        footer: "Used this year: ₹3,200",
    },
    {
        id: 5,
        title: "Learning & Development",
        subtitle: "Training, courses & certifications",
        action: "Explore Courses",
        details: [
            { label: "Annual budget", value: "₹10,000" },
            { label: "Used", value: "₹3,200" },
        ],
        footer: "Includes: Udemy, Coursera, books",
    },
    {
        id: 6,
        title: "ESIC",
        subtitle: "Employee State Insurance cover",
        action: "View Policy",
        details: [
            { label: "IP NO", value: "31-00-1234567" },
            { label: "Contribution", value: "₹131-Month" },
        ],
        footer: "Members: Covered (self + family)",
    },
];

export default function EmployeeBenefits() {
    return (
        <div className="min-h-screen bg-[#f7f4ed] p-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}

                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-300 shadow-sm px-6 py-4 flex items-center justify-between mb-6"
                >
                    <h1 className="text-5xl font-bold text-black">
                        Employee Benefits
                    </h1>

                    <button className="flex items-center gap-2 bg-[#E8EDF7] hover:bg-[#dde6f6] px-6 py-3 rounded-xl text-gray-700 font-medium transition">
                        <SquarePenIcon size={18} />
                        Add New
                    </button>
                </motion.div>

                {/* Cards */}

                <div className="grid md:grid-cols-2 gap-6">
                    {benefits.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            whileHover={{
                                y: -4,
                                transition: { duration: 0.2 },
                            }}
                            className="relative group bg-white col-span-2  rounded-2xl border border-gray-300 shadow-sm p-6"
                        >
                            {/* Top */}

                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <h2 className="text-[28px] font-bold text-[#163B63] leading-tight">
                                        {item.title}
                                    </h2>

                                    <p className="text-gray-400 text-xl mt-1">
                                        {item.subtitle}
                                    </p>
                                </div>

                                <button className="text-[#1F5D93] underline text-xl hover:text-blue-700 opacity-0 invisible translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
                                    {item.action}
                                </button>
                            </div>

                            {/* Details */}

                            <div className="space-y-1 mb-12">
                                {item.details.map((detail) => (
                                    <div
                                        key={detail.label}
                                        className="text-[20px]"
                                    >
                                        <span className="font-bold text-[#15395E]">
                                            {detail.label}:
                                        </span>{" "}
                                        <span className="text-gray-900">
                                            {detail.value}
                                        </span>
                                    </div>
                                ))}

                                <p className="text-gray-500 text-xl mt-2">
                                    {item.footer}
                                </p>
                            </div>

                            {/* Bottom */}

                            <div className="absolute bottom-3 right-3 flex gap-3 opacity-0 invisible translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
                                <button className=" bh-12 w-12 rounded-xl bg-green-100 flex items-center justify-center hover:bg-green-200 transition">
                                    <SquarePen
                                        size={22}
                                        className="text-green-700"
                                    />
                                </button>

                                <button className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center hover:bg-red-200 transition">
                                    <Trash2
                                        size={22}
                                        className="text-red-600"
                                    />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}