import React, { useState } from "react";
import { motion } from "framer-motion";
import { Circle, Plus, Trash2, X } from "lucide-react";
import useBenefits from "../../../Hooks/useBenefits";

const defaultBenefits = [
    {
        id: "default-1",
        benefit: "Health insurance",
        plan: "Family floater",
        coverage: "₹5,00,000",
        status: "Active",
    },
    {
        id: "default-2",
        benefit: "Life insurance",
        plan: "Standard",
        coverage: "₹10,00,000",
        status: "Active",
    },
    {
        id: "default-3",
        benefit: "Provident fund",
        plan: "EPF",
        coverage: "12% of basic",
        status: "Active",
    },
];

export default function EnrolledBenefits() {
    const { benefits, createBenefit, deleteBenefit } = useBenefits();
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: "",
        category: "Insurance",
        coverAmount: "",
    });

    const formattedDbBenefits = (benefits || []).map((item) => ({
        id: item._id,
        benefit: item.title,
        plan: item.category || "Standard",
        coverage: item.coverAmount || "Included",
        status: item.status || "Active",
        isCustom: true,
    }));

    const displayList = [...formattedDbBenefits, ...defaultBenefits];

    const handleAddBenefit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;

        try {
            setIsSubmitting(true);
            await createBenefit({
                title: form.title,
                category: form.category,
                coverAmount: form.coverAmount || "Included",
                status: "Active",
            });
            setShowModal(false);
            setForm({ title: "", category: "Insurance", coverAmount: "" });
        } catch (err) {
            alert(err.message || "Failed to add benefit");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, isCustom) => {
        if (!isCustom) {
            alert("Default policies cannot be deleted");
            return;
        }
        if (window.confirm("Delete this benefit from Enrolled Benefits table?")) {
            try {
                await deleteBenefit(id);
            } catch (err) {
                alert(err.message || "Failed to delete");
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 relative"
        >
            {/* Heading & Add Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                    Enrolled Benefits
                </h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm cursor-pointer"
                >
                    <Plus size={16} />
                    Add Benefit to Table
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-300 py-4 px-6 text-center text-[#0F3556] font-bold uppercase">
                                Benefit Name
                            </th>
                            <th className="border border-gray-300 py-4 px-6 text-center text-[#0F3556] font-bold uppercase">
                                Plan / Category
                            </th>
                            <th className="border border-gray-300 py-4 px-6 text-center text-[#0F3556] font-bold uppercase">
                                Coverage / Value
                            </th>
                            <th className="border border-gray-300 py-4 px-6 text-center text-[#0F3556] font-bold uppercase">
                                Status
                            </th>
                            <th className="border border-gray-300 py-4 px-6 text-center text-[#0F3556] font-bold uppercase">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {displayList.map((item, index) => (
                            <motion.tr
                                key={item.id || index}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: index * 0.08,
                                }}
                                className="hover:bg-gray-50 transition"
                            >
                                <td className="border border-gray-300 py-4 px-6 text-center text-gray-800 font-semibold">
                                    {item.benefit}
                                </td>

                                <td className="border border-gray-300 py-4 px-6 text-center text-gray-800">
                                    {item.plan}
                                </td>

                                <td className="border border-gray-300 py-4 px-6 text-center font-semibold text-gray-900">
                                    {item.coverage}
                                </td>

                                <td className="border border-gray-300 py-4 px-6">
                                    <div className="flex justify-center">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-emerald-600 font-medium text-xs">
                                            <Circle
                                                size={8}
                                                fill="currentColor"
                                                className="stroke-none"
                                            />
                                            {item.status}
                                        </span>
                                    </div>
                                </td>

                                <td className="border border-gray-300 py-4 px-6 text-center">
                                    {item.isCustom ? (
                                        <button
                                            onClick={() => handleDelete(item.id, item.isCustom)}
                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                            title="Delete Benefit"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 font-medium">Standard</span>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Quick Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Add Enrolled Benefit</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddBenefit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                                    Benefit Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Dental Cover, WFH Allowance"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                                    Plan / Category
                                </label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Insurance">Insurance</option>
                                    <option value="Retirement">Retirement</option>
                                    <option value="Allowance">Allowance</option>
                                    <option value="Wellness">Wellness</option>
                                    <option value="Perks">Perks</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                                    Coverage / Value
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. ₹2,00,000 or ₹1,500/month"
                                    value={form.coverAmount}
                                    onChange={(e) => setForm({ ...form, coverAmount: e.target.value })}
                                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow transition"
                                >
                                    {isSubmitting ? "Adding..." : "Add to Table"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
}