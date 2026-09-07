import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Calendar, X } from "lucide-react";
import useGoals from "../../../Hooks/useGoals";

export default function AddGoalForm({ onClose, onSuccess }) {
    const { createGoal } = useGoals();
    const [formData, setFormData] = useState({
        goalTitle: "",
        description: "",
        alignedTo: "",
        dueDate: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const alignmentOptions = [
        "Company OKR",
        "Team OKR",
        "Personal Growth",
    ];

    const validateForm = () => {
        const newErrors = {};
        if (!formData.goalTitle.trim()) {
            newErrors.goalTitle = "Goal title is required";
        }
        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }
        if (!formData.alignedTo) {
            newErrors.alignedTo = "Please select an alignment option";
        }
        if (!formData.dueDate) {
            newErrors.dueDate = "Due date is required";
        }
        return newErrors;
    };

    const handleGoal = async () => {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const createdGoal = await createGoal({
                title: formData.goalTitle,
                goalDescription: formData.description,
                alignedTo: formData.alignedTo,
                dueDate: formData.dueDate,
                startDate: new Date().toISOString(),
                progress: 0,
                status: "On Track",
                progressDescription: "",
            });

            onSuccess?.(createdGoal);
            onClose?.();
        } catch (err) {
            console.log(err);
            setErrors({ submit: err?.message || "Failed to create goal" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl px-8 py-8 max-h-[90vh] overflow-y-auto no-scrollbar"
        >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0B2B57]">
                            Add New Goal
                        </h2>
                        <p className="text-gray-500 mt-2">Set and track your performance goals</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Goal Title */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#0B2B57] mb-2">
                        Goal title <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        placeholder="Enter your goal title"
                        value={formData.goalTitle}
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                goalTitle: e.target.value,
                            });
                            if (errors.goalTitle) {
                                setErrors({ ...errors, goalTitle: "" });
                            }
                        }}
                        className={`w-full bg-white rounded-xl border ${errors.goalTitle ? "border-red-500" : "border-gray-300"} px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition placeholder:text-gray-400`}
                    />
                    {errors.goalTitle && (
                        <span className="text-red-500 text-sm mt-1 block">{errors.goalTitle}</span>
                    )}
                </div>

                {/* Description */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-[#0B2B57]">
                            Description <span className="text-red-500">*</span>
                        </label>

                        <span className="text-xs text-gray-500">
                            {formData.description.length} / 500
                        </span>
                    </div>

                    <textarea
                        rows={4}
                        maxLength={500}
                        placeholder="Describe your goal and what you want to achieve..."
                        value={formData.description}
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                description: e.target.value,
                            });
                            if (errors.description) {
                                setErrors({ ...errors, description: "" });
                            }
                        }}
                        className={`w-full bg-white rounded-xl border ${errors.description ? "border-red-500" : "border-gray-300"} px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition resize-none placeholder:text-gray-400`}
                    />
                    {errors.description && (
                        <span className="text-red-500 text-sm mt-1 block">{errors.description}</span>
                    )}
                </div>

                {/* Two Column Fields */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Aligned To */}
                    <div>
                        <label className="block text-sm font-semibold text-[#0B2B57] mb-2">
                            Aligned to <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                            <select
                                value={formData.alignedTo}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        alignedTo: e.target.value,
                                    });
                                    if (errors.alignedTo) {
                                        setErrors({ ...errors, alignedTo: "" });
                                    }
                                }}
                                className={`w-full appearance-none bg-white rounded-xl border ${errors.alignedTo ? "border-red-500" : "border-gray-300"} px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition`}
                            >
                                <option value="">
                                    Select alignment option
                                </option>

                                {alignmentOptions.map((item) => (
                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>
                                ))}
                            </select>

                            <ChevronDown
                                size={18}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                        </div>
                        {errors.alignedTo && (
                            <span className="text-red-500 text-sm mt-1 block">{errors.alignedTo}</span>
                        )}
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-semibold text-[#0B2B57] mb-2">
                            Due date <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        dueDate: e.target.value,
                                    });
                                    if (errors.dueDate) {
                                        setErrors({ ...errors, dueDate: "" });
                                    }
                                }}
                                className={`w-full bg-white rounded-xl border ${errors.dueDate ? "border-red-500" : "border-gray-300"} px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-700`}
                            />
                        </div>
                        {errors.dueDate && (
                            <span className="text-red-500 text-sm mt-1 block">{errors.dueDate}</span>
                        )}
                    </div>
                </div>

                {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {errors.submit}
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-base font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        className="flex-1 px-6 py-3 rounded-xl bg-[#0B5DB5] text-white text-base font-semibold hover:bg-[#0945A0] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleGoal}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Add Goal"}
                    </motion.button>
                </div>
            </motion.div>
        );
    }