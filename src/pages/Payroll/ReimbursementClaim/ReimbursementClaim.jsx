import React, { useState } from "react";
import { motion } from "framer-motion";
import { IndianRupee, ReceiptText } from "lucide-react";
import ReimbursementApproval from "./ApprovalForm";
import { useNavigate } from "react-router-dom";



const badgeStyle = {
    pending:
        "bg-yellow-100 text-yellow-700 border border-yellow-200",
    approved:
        "bg-green-100 text-green-700 border border-green-200",
};

export default function ReimbursementClaim({ claims }) {

    const pendingClaims = claims?.filter((item) => (
        item.status.toLowerCase() == "pending"
    ));
    const [selectedClaim, setSelectedClaim] = useState(null);
    console.log(selectedClaim);
    const [form, setform] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full  p-4 md:p-4"
        >
            <div className="max-w-7xl mx-auto">

                {/* Header */}

                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-md px-6 py-5 flex items-center justify-between"
                >
                    <h2 className="text-2xl font-bold text-slate-800">
                        Reimbursement claims
                    </h2>

                    <div className="rounded-full bg-slate-100 px-5 py-2 text-sm font-medium text-slate-700">
                        {pendingClaims.length} pending
                    </div>
                </motion.div>

                {/* List */}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: .2 }}
                    className="mt-2 bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden"
                >
                    {claims.map((claim, index) => (
                        <motion.div
                            key={claim.id}
                            whileHover={{
                                backgroundColor: "#fafafa",
                                x: 3,
                            }}
                            transition={{ duration: .2 }}
                            className={`px-6 py-6 ${index !== claims.length - 1
                                ? "border-b border-gray-200"
                                : ""
                                }`}
                            onClick={() => {
                                return (
                                    setSelectedClaim(claim),
                                    setform(true)
                                )
                            }}
                        >
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5">

                                {/* Left */}

                                <div>

                                    <div className="flex items-center gap-2">

                                        <ReceiptText
                                            size={22}
                                            className="text-[#123B6B]"
                                        />

                                        <h3 className="text-xl font-bold text-[#123B6B]">
                                            {claim?.claimType}
                                        </h3>

                                        <span className="text-2xl text-gray-500">
                                            —
                                        </span>

                                        <span className="text-xl text-gray-900 font-normal">
                                            {claim?.description}
                                        </span>

                                    </div>

                                    <p className="mt-2 text-gray-400 text-sm">
                                        Expense Date: {new Date(claim?.expenseDate).toLocaleDateString("en-GB")}
                                    </p>

                                </div>

                                {/* Right */}

                                <div className="flex flex-col items-end">

                                    <div className="flex items-center text-[#1d56b3] font-bold text-2xl">
                                        <IndianRupee
                                            size={28}
                                            strokeWidth={2.4}
                                        />
                                        {claim?.amount}
                                    </div>

                                    <div className={` ${badgeStyle[claim?.status?.toLowerCase()]}flex gap-2 mt-3 flex-wrap justify-end p-1 rounded-lg`}>

                                        {claim?.status}

                                    </div>

                                </div>

                            </div>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
            {form && selectedClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25 }}
                        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setform(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
                        >
                            ✕
                        </button>

                        <ReimbursementApproval
                            selectedClaims={selectedClaim} />
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}