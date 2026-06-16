import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Calendar, X } from "lucide-react";
import useGoals from "../../../Hooks/useGoals";

export default function AddGoalForm({ onClose }) {
    const { createGoal } = useGoals();
    const [formData, setFormData] = useState({
        goalTitle: "",
        description: "",
        alignedTo: "",
        dueDate: "",
    });



    const alignmentOptions = [
        "Company OKR",
        "Team OKR",
        "Personal Growth",
    ];

    const handleGoal = async () => {
        try {
            await createGoal({
                title: formData.goalTitle,
                goalDescription: formData.description,
                alignedTo: formData.alignedTo,
                dueDate: formData.dueDate,
                startDate: new Date().toISOString(), // auto set start date
                progress: 0,
                status: " ",
                progressDescription: "",
            });

            onClose?.(); // close modal after success
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className=" bg-[#D9D9D9] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 25, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-5xl bg-[#F6F3ED]  px-10 py-10 shadow-sm"
            >
                {/* Section Header */}
                <div className="flex items-center gap-5 mb-8">
                    <h2 className="text-sm tracking-[4px] uppercase text-gray-500 whitespace-nowrap">
                        Goals Information
                    </h2>

                    <div className="flex-1 border-t border-gray-400" />
                    <div><X size={20} className="bg-red-600 text-white hover:scale-105 transition-all duration-100"
                        onClick={onClose}
                    /></div>
                </div>

                {/* Goal Title */}
                <div className="mb-6">
                    <label className="block text-[18px] font-bold text-[#0B2B57] mb-3">
                        Goal title
                    </label>

                    <div className="relative">
                        <input
                            type="text"
                           placeholder="Goal Title"
                            value={formData.goalTitle}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    goalTitle: e.target.value,
                                })
                            }
                            className="w-full bg-white rounded-2xl border border-gray-200 px-5 py-5 resize-none outline-none text-lg placeholder:text-gray-400"
                        />


                    </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-[18px] font-bold text-[#0B2B57]">
                            Description
                        </label>

                        <span className="text-sm text-gray-400">
                            {formData.description.length} / 500
                        </span>
                    </div>

                    <textarea
                        rows={5}
                        maxLength={500}
                        placeholder="Please explain the reason for this regularization request..."
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                description: e.target.value,
                            })
                        }
                        className="w-full bg-white rounded-2xl border border-gray-200 px-5 py-5 resize-none outline-none text-lg placeholder:text-gray-400"
                    />
                </div>

                {/* Two Column Fields */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    {/* Aligned To */}
                    <div>
                        <label className="block text-[18px] font-bold text-[#0B2B57] mb-3">
                            Aligned to
                        </label>

                        <div className="relative">
                            <select
                                value={formData.alignedTo}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        alignedTo: e.target.value,
                                    })
                                }
                                className="w-full appearance-none bg-white rounded-2xl border border-gray-200 px-5 py-5 text-lg outline-none"
                            >
                                <option value="">
                                    Company OKR
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
                                size={20}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-[18px] font-bold text-[#0B2B57] mb-3">
                            Due date
                        </label>

                        <div className="relative">
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        dueDate: e.target.value,
                                    })
                                }
                                className="w-full bg-white rounded-2xl border border-gray-200 px-5 py-5 text-lg outline-none text-gray-700"
                            />


                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="sm:w-[140px] py-5 rounded-2xl border border-gray-400 bg-white text-gray-500 text-lg font-medium"
                        onClick={onClose}
                    >
                        Cancel
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-5 rounded-2xl bg-[#0B5DB5] text-white text-xl font-semibold shadow-sm"
                        onClick={handleGoal}
                    >
                        Add to Goal
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}