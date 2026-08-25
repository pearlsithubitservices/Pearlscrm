import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, SquarePen } from "lucide-react";
import usePolicies from "../../../Hooks/usePolicies";

export default function PolicyForm({ onClose, editData, getPolicy }) {

    const { addPolicy, updatePolicy } = usePolicies();

    const isEdit = Boolean(editData?._id);

    const [form, setForm] = useState({
        name: "",
        amount: "",
        duration: "month",
    });

    // 👉 Fill form when editing
    useEffect(() => {
        if (editData) {
            const [amount, duration] = editData.amount?.split("-") || [];

            setForm({
                name: editData.name || "",
                amount: amount?.replace("₹", "") || "",
                duration: duration || "month",
            });
        }
    }, [editData]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        if (!form.name || !form.amount) return;

        const payload = {
            name: form.name,
            amount: `₹${form.amount}-${form.duration}`,
        };

        try {
            if (isEdit) {
                await updatePolicy(editData._id, payload);
                await getPolicy();
            } else {
                await addPolicy(payload);
                await getPolicy();
            }

            onClose?.();

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl bg-[#f7f5f0] rounded-2xl shadow-xl p-6"
            >
                {/* HEADER */}
                <div className="flex justify-between items-center border-b pb-4">
                    <h1 className="text-xl font-bold text-gray-700">
                        {isEdit ? "UPDATE POLICY" : "ADD POLICY"}
                    </h1>

                    <button
                        onClick={onClose}
                        className="text-red-500 hover:bg-red-100 p-2 rounded-lg"
                    >
                        <X />
                    </button>
                </div>

                {/* FORM */}
                <div className="mt-6 space-y-5">

                    {/* NAME */}
                    <div>
                        <label className="text-sm font-semibold text-gray-600">
                            Policy Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full mt-2 p-3 rounded-xl border bg-white"
                        />
                    </div>

                    {/* AMOUNT + DURATION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                            <label className="text-sm font-semibold text-gray-600">
                                Amount (₹)
                            </label>

                            <input
                                type="number"
                                name="amount"
                                value={form.amount}
                                onChange={handleChange}
                                className="w-full mt-2 p-3 rounded-xl border bg-white"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600">
                                Month / Year
                            </label>

                            <select
                                name="duration"
                                value={form.duration}
                                onChange={handleChange}
                                className="w-full mt-2 p-3 rounded-xl border bg-white"
                            >
                                <option value="month">Month</option>
                                <option value="year">Year</option>
                            </select>
                        </div>

                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-4 pt-4">

                        <button
                            onClick={onClose}
                            className="px-5 py-3 rounded-xl border bg-white"
                        >
                            Cancel
                        </button>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            className="px-6 py-3 rounded-xl bg-blue-600 text-white flex items-center gap-2"
                        >
                            <SquarePen size={18} />
                            {isEdit ? "Update Policy" : "Add Policy"}
                        </motion.button>

                    </div>

                </div>
            </motion.div>
        </div>
    );
}