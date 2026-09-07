import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    SquarePen,
    Trash2,
    SquarePenIcon,
    Plus,
    X,
    ShieldCheck,
    CheckCircle2
} from "lucide-react";
import useBenefits from "../../../Hooks/useBenefits";

const defaultCatalog = [
    {
        _id: "default-1",
        title: "Group Health Insurance",
        subtitle: "Mediclaim cover for you + family",
        action: "View Policy",
        category: "Insurance",
        provider: "Star Health",
        coverAmount: "₹5,00,000",
        footer: "Members: Self + Spouse + 2 kids",
    },
    {
        _id: "default-2",
        title: "Provident Fund (PF)",
        subtitle: "Employee + employer PF contributions",
        action: "View Passbook",
        category: "Retirement",
        provider: "EPFO",
        coverAmount: "₹1,800 / Month",
        footer: "Members: Self",
    },
    {
        _id: "default-3",
        title: "Gratuity",
        subtitle: "Long-service benefit",
        action: "Learn More",
        category: "Retirement",
        provider: "Company Gratuity Trust",
        coverAmount: "5 Years Service Eligible",
        footer: "Projected (5 yr): ₹2,45,000",
    },
    {
        _id: "default-4",
        title: "Work From Home",
        subtitle: "WFH equipment & internet allowance",
        action: "Claim Now",
        category: "Allowance",
        provider: "Company HR",
        coverAmount: "₹1,000 / Month",
        footer: "Used this year: ₹3,200",
    },
    {
        _id: "default-5",
        title: "Learning & Development",
        subtitle: "Training, courses & certifications",
        action: "Explore Courses",
        category: "Perks",
        provider: "Udemy & Coursera",
        coverAmount: "₹10,000 / Year",
        footer: "Includes: Udemy, Coursera, books",
    },
    {
        _id: "default-6",
        title: "ESIC",
        subtitle: "Employee State Insurance cover",
        action: "View Policy",
        category: "Insurance",
        provider: "ESIC Portal",
        coverAmount: "₹131 / Month",
        footer: "Members: Covered (self + family)",
    },
];

export default function EmployeeBenefits() {
    const { benefits, loading, createBenefit, deleteBenefit } = useBenefits();
    const [showModal, setShowModal] = useState(false);
    const [selectedViewBenefit, setSelectedViewBenefit] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        category: "Insurance",
        provider: "",
        coverAmount: "",
        contribution: "",
        footer: "",
    });

    const displayBenefits = benefits.length > 0 ? benefits : defaultCatalog;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        try {
            setIsSubmitting(true);
            await createBenefit(formData);
            setShowModal(false);
            setFormData({
                title: "",
                subtitle: "",
                category: "Insurance",
                provider: "",
                coverAmount: "",
                contribution: "",
                footer: "",
            });
        } catch (err) {
            alert(err.message || "Failed to create benefit");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (item) => {
        if (item._id.startsWith("default-")) {
            alert("Default company policies cannot be deleted");
            return;
        }

        if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
            try {
                await deleteBenefit(item._id);
            } catch (err) {
                alert(err.message || "Failed to delete");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f4ed] p-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-300 shadow-sm px-6 py-4 flex items-center justify-between mb-6"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-black flex items-center gap-3">
                            <ShieldCheck className="w-10 h-10 text-blue-600" />
                            Employee Benefits
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage & enroll employee perk programs, insurance, and company allowances
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-[#E8EDF7] hover:bg-[#dde6f6] text-blue-900 px-6 py-3 rounded-xl font-bold transition shadow-sm cursor-pointer"
                    >
                        <Plus size={20} />
                        Add New Benefit
                    </button>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {displayBenefits.map((item, index) => (
                        <motion.div
                            key={item._id || index}
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            whileHover={{ y: -4 }}
                            className="relative group bg-white rounded-2xl border border-gray-300 shadow-sm p-6 flex flex-col justify-between"
                        >
                            {/* Top info */}
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider rounded-lg border border-blue-100">
                                                {item.category || "Benefit"}
                                            </span>
                                            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Active
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-[#163B63] leading-tight">
                                            {item.title}
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-1">
                                            {item.subtitle || "Standard company benefit program"}
                                        </p>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-1.5 my-4 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                                    {item.provider && (
                                        <div className="text-sm">
                                            <span className="font-bold text-[#15395E]">Provider:</span>{" "}
                                            <span className="text-gray-900">{item.provider}</span>
                                        </div>
                                    )}
                                    {item.coverAmount && (
                                        <div className="text-sm">
                                            <span className="font-bold text-[#15395E]">Cover / Value:</span>{" "}
                                            <span className="text-gray-900 font-semibold">{item.coverAmount}</span>
                                        </div>
                                    )}
                                    {item.contribution && (
                                        <div className="text-sm">
                                            <span className="font-bold text-[#15395E]">Contribution:</span>{" "}
                                            <span className="text-gray-900">{item.contribution}</span>
                                        </div>
                                    )}
                                    {item.footer && (
                                        <p className="text-xs text-gray-500 pt-1 border-t border-gray-200 mt-2">
                                            {item.footer}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xs font-semibold text-gray-400">
                                    {item._id.startsWith("default-") ? "Company Policy" : "Custom Benefit"}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedViewBenefit(item)}
                                        className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:bg-blue-50 px-3 py-1.5 rounded-xl transition cursor-pointer border border-blue-100"
                                    >
                                        <span>View Details</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition cursor-pointer"
                                        title="Delete Benefit"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ADD BENEFIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full p-6 overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Add New Benefit Plan</h2>
                                <p className="text-xs text-gray-500">Create a new benefit program for all company employees</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                                    Benefit Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Group Health Insurance, Gym Allowance"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Insurance">Insurance</option>
                                        <option value="Retirement">Retirement / PF</option>
                                        <option value="Allowance">Allowance</option>
                                        <option value="Health & Wellness">Health & Wellness</option>
                                        <option value="Perks">Perks & Learning</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                                        Provider / Issuer
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Star Health, Cult.fit"
                                        value={formData.provider}
                                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                                    Subtitle / Short Description
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mediclaim cover for you + family"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                                        Coverage / Max Limit
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ₹5,00,000"
                                        value={formData.coverAmount}
                                        onChange={(e) => setFormData({ ...formData, coverAmount: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                                        Monthly Contribution
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ₹1,800 / Month"
                                        value={formData.contribution}
                                        onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                                    Eligibility / Notes
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Members: Self + Spouse + 2 Kids"
                                    value={formData.footer}
                                    onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : "Save Benefit"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* VIEW BENEFIT DETAILS MODAL */}
            {selectedViewBenefit && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full p-6 overflow-hidden relative"
                    >
                        <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                            <div>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] uppercase rounded border border-blue-100">
                                    {selectedViewBenefit.category || "Benefit Plan"}
                                </span>
                                <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedViewBenefit.title}</h2>
                                <p className="text-xs text-gray-500">{selectedViewBenefit.subtitle || "Company Benefit Program"}</p>
                            </div>
                            <button
                                onClick={() => setSelectedViewBenefit(null)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                                {selectedViewBenefit.provider && (
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="font-bold text-[#15395E]">Provider / Issuer:</span>
                                        <span className="text-gray-900 font-semibold">{selectedViewBenefit.provider}</span>
                                    </div>
                                )}
                                {selectedViewBenefit.coverAmount && (
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="font-bold text-[#15395E]">Cover / Value:</span>
                                        <span className="text-emerald-700 font-bold">{selectedViewBenefit.coverAmount}</span>
                                    </div>
                                )}
                                {selectedViewBenefit.contribution && (
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="font-bold text-[#15395E]">Contribution:</span>
                                        <span className="text-gray-900 font-medium">{selectedViewBenefit.contribution}</span>
                                    </div>
                                )}
                            </div>

                            {selectedViewBenefit.footer && (
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900">
                                    <span className="font-bold block uppercase mb-0.5">Eligibility & Notes:</span>
                                    {selectedViewBenefit.footer}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-5 mt-4 border-t border-gray-100">
                            <button
                                onClick={() => setSelectedViewBenefit(null)}
                                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
                            >
                                Close Details
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}