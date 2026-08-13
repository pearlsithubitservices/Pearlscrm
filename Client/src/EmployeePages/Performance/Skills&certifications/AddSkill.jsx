import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import useSkillCertification from "../../../Hooks/useSkillCertification";
import { useAuth } from "../../../context/AuthContext";

export default function AddSkill({ onClose, fetchskills }) {
    const [skill, setSkill] = useState("");
    const [level, setLevel] = useState("Beginner");
    const { user } = useAuth();

    const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];

    const { addSkill, loading } = useSkillCertification();

    // ✅ submit handler
    const handleSubmit = async () => {
        if (!skill.trim()) return;

        const payload = {
            employee_uid: user?.uid, // 👉 replace with real user id
            name: skill,
            level: level,
            progress:
                level === "Beginner"
                    ? 25
                    : level === "Intermediate"
                        ? 50
                        : level === "Advanced"
                            ? 75
                            : 90,
        };

        const res = await addSkill(payload);

        if (res?.success) {
            setSkill("");
            setLevel("Beginner");
            await fetchskills();
            onClose(); // close modal after success
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="relative w-full max-w-xl bg-[#f3f0ec] rounded-2xl shadow-2xl p-8"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-[#0a3762] mb-8">
                        Add Skill
                    </h2>

                    {/* Skill Name */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                            Skill Name
                        </label>

                        <input
                            type="text"
                            value={skill}
                            onChange={(e) => setSkill(e.target.value)}
                            placeholder="Amazon Web Services"
                            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Skill Level */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                            Level
                        </label>

                        <div className="relative">
                            <select
                                value={level}
                                onChange={(e) =>
                                    setLevel(e.target.value)
                                }
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {levels.map((item) => (
                                    <option key={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>

                            <ChevronDown
                                size={18}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-600"
                        >
                            Cancel
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-[#0f5ca8] text-white rounded-xl font-medium disabled:opacity-50"
                        >
                            {loading ? "Adding..." : "Add Skill"}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}