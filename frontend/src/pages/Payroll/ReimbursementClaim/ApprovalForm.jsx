

import { motion } from 'framer-motion'
import { FileText } from 'lucide-react';
import useReimbursement from '../../../Hooks/useReimbursement';


const getReceiptUrl = (receiptPath) => {
    if (!receiptPath) return null;
    if (receiptPath.startsWith("http")) return receiptPath;
    const normalized = receiptPath.replace(/\\/g, "/");
    const uploadsIndex = normalized.indexOf("uploads/");
    const relativePath = uploadsIndex !== -1 ? normalized.substring(uploadsIndex) : normalized.replace(/^\/?/, "");
    return `http://localhost:5000/${relativePath}`;
};

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
        const remarks = prompt("Enter rejection reason (optional):") || "";

        try {
            await updateStatus(
                selectedClaims._id,
                "Rejected",
                remarks
            );

            alert("Claim rejected successfully.");

            onClose();
            if (getClaims) await getClaims();

        } catch (err) {
            console.error(err);
            alert("Failed to reject claim");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-h-[85vh] overflow-y-auto no-scrollbar rounded-2xl"
        >
            <div className="w-full bg-[#F7F4EE] rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8">

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

                {/* Description / Summary */}

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
                        Claim Description
                    </label>

                    <textarea
                        rows={3}
                        readOnly
                        value={selectedClaims.description || selectedClaims.summary || "No description provided."}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base resize-none outline-none"
                    />
                </div>

                {/* Attachment */}

                <div className="mb-8">

                    <label className="block mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
                        Attachment Receipt
                    </label>

                    <div className="border rounded-xl bg-white p-4 flex items-center justify-between">

                        <div className="flex items-center gap-3">

                            <FileText className="text-blue-600" />

                            {selectedClaims?.receipt ? (
                                <a
                                    href={getReceiptUrl(selectedClaims.receipt)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 font-semibold underline text-sm"
                                >
                                    View Uploaded Receipt Document
                                </a>
                            ) : (
                                <span className="text-gray-400 text-sm">No Receipt Attachment Uploaded</span>
                            )}

                        </div>

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