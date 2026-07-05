

import { motion } from 'framer-motion'
import { FileText } from 'lucide-react';
import useReimbursement from '../../../Hooks/useReimbursement';


export default function ReimbursementApproval({ selectedClaims, getClaims, onClose }) {
    const { updateStatus } = useReimbursement()
    if (!selectedClaims) return null;
    const handleApprove = async () => {
        try {
            await updateStatus(
                selectedClaims._id,
                "Approved"
            );

            alert("Claim approved successfully.");

            // optional
            onClose();
            await getClaims();

        } catch (err) {
            console.error(err);
            alert("Failed to approve claim");
        }
    };

    const handleDecline = async () => {
        // const remarks = prompt("Enter decline reason") || "";

        try {
            await updateStatus(
                selectedClaims._id,
                "Declined",
              
            );

            alert("Claim declined successfully.");

            // optional
            onClose();
            await getClaims();

        } catch (err) {
            console.error(err);
            alert("Failed to decline claim");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[500px] overflow-y-auto no-scrollbar rounded-2xl flex items-center justify-center"
        >
            <div className="w-full max-w-5xl bg-[#F7F4EE] rounded-2xl shadow-xl border border-gray-200 p-8">

                <h2 className="text-4xl font-bold text-[#123B6B] mb-8">
                    Reimbursement Approval
                </h2>

                {/* Claim Type */}

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
                        Claim Type
                    </label>

                    <input
                        type="text"
                        readOnly
                        value={selectedClaims.claimType || ""}
                        className="w-full h-14 rounded-xl border border-gray-200 bg-white px-4 text-xl outline-none"
                    />
                </div>

                {/* Amount & Expense Date */}

                <div className="grid md:grid-cols-2 gap-6 mb-6">

                    <div>
                        <label className="block mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
                            Amount
                        </label>

                        <input
                            type="text"
                            readOnly
                            value={selectedClaims.amount || ""}
                            className="w-full h-14 rounded-xl border border-gray-200 bg-white px-4 text-xl outline-none"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
                            Expense Date
                        </label>

                        <input
                            type="text"
                            readOnly
                            value={selectedClaims.expenseDate || ""}
                            className="w-full h-14 rounded-xl border border-gray-200 bg-white px-4 text-xl outline-none"
                        />
                    </div>

                </div>

                {/* Summary */}

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
                        Claim Summary
                    </label>

                    <textarea
                        rows={4}
                        readOnly
                        value={selectedClaims.summary || ""}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-xl resize-none outline-none"
                    />
                </div>

                {/* Attachment */}

                <div className="mb-8">

                    <label className="block mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
                        Attachment
                    </label>

                    <div className="border rounded-xl bg-white p-6 flex items-center justify-between">

                        <div className="flex items-center gap-3">

                            <FileText className="text-green-700" />

                            {selectedClaims?.receipt ? (
                                <a
                                    href={selectedClaims?.receipt}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    View File
                                </a>
                            ) : (
                                <span>No File</span>
                            )}

                        </div>

                        {selectedClaims.fileUrl && (
                            <a
                                href={selectedClaims.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-green-700 hover:underline"
                            >
                                <Download size={18} />
                                Download
                            </a>
                        )}

                    </div>

                </div>

                {/* Buttons */}

                <div className="grid md:grid-cols-2 gap-6">

                    <button className="h-14 rounded-xl border border-red-500 text-red-500 font-semibold"
                        onClick={handleDecline}>
                        Decline
                    </button>

                    <button className="h-14 rounded-xl bg-green-200 text-green-800 font-semibold"
                        onClick={handleApprove}>
                        Approve
                    </button>

                </div>

            </div>
        </motion.div>
    );
}