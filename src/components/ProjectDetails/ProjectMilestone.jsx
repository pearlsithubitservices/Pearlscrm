import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function MilestonesContent() {
    const [milestones, setMilestones] = useState([
        {
            title: "Kick-off & discovery",
            date: "Apr 5",
            completed: true,
        },
        {
            title: "Data migration complete",
            date: "May 10",
            completed: true,
        },
        {
            title: "UAT sign-off",
            date: "Jun 14",
            completed: true,
        },
        {
            title: "Team training sessions",
            date: "Jun 28",
            completed: false,
        },
        {
            title: "Go-live",
            date: "Jul 15",
            completed: true,
        },
    ]);

    const [newMilestone, setNewMilestone] = useState("");

    const addMilestone = () => {
        if (!newMilestone.trim()) return;

        setMilestones([
            ...milestones,
            {
                title: newMilestone,
                date: "New",
                completed: false,
            },
        ]);

        setNewMilestone("");
    };
    const toggleMilestone = (index) => {
        const updatedMilestones = milestones.map((item, i) =>
            i === index
                ? { ...item, completed: !item.completed }
                : item
        );

        setMilestones(updatedMilestones);
    };

    return (
        <div className="w-full px-6 py-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">

                <h2 className="text-[10px] md:text-[20px] font-bold text-gray-400 uppercase">
                    Milestones Complete
                </h2>

                <span className="text-[10px] md:text-[20px] font-bold text-gray-400 uppercase">
                    Date
                </span>

            </div>

            {/* Milestone List */}
            <div className="flex flex-col gap-5">

                {milestones.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.3,
                            delay: index * 0.1,
                        }}
                        whileHover={{
                            scale: 1.01,
                        }}
                        className="bg-[#FAFAFA] rounded-xl px-6 py-5 flex items-center justify-between "
                    >

                        {/* Left */}
                        <div className="flex items-center gap-5">

                            {/* Checkbox */}
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                  onClick={() => toggleMilestone(index)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.completed
                                        ? "bg-[#2F7D57]"
                                        : "bg-[#B5B5B5]"
                                    }`}
                            >
                                {item.completed && (
                                    <Check
                                        size={22}
                                        className="text-white stroke-[3]"
                                      
                                    />
                                )}
                            </motion.div>

                            {/* Title */}
                            <h3
                                className={` text-[10px] md:text-[18px] font-semibold ${item.completed
                                        ? "text-[#1E1E1E]"
                                        : "text-[#0B2D57]"
                                    }`}
                            >
                                {item.title}
                            </h3>

                        </div>

                        {/* Date */}
                        <p className="text-[20px] text-gray-400 font-medium">
                            {item.date}
                        </p>

                    </motion.div>
                ))}

            </div>

            {/* Add Milestone */}
            <div className="mt-14">

                <h2 className="text-[10px] md:text-[20px] font-bold text-gray-400 uppercase mb-5">
                    Add Milestones
                </h2>

                <div className="bg-[#FAFAFA] rounded-2xl p-5 shadow-sm">

                    <textarea
                        value={newMilestone}
                        onChange={(e) =>
                            setNewMilestone(e.target.value)
                        }
                        placeholder="Add a new milestone..."
                        className="w-full h-[100px] resize-none bg-transparent outline-none text-[20px] placeholder:text-gray-300"
                    />

                    {/* Button */}
                    <div className="flex justify-end mt-5">
                        <motion.button
                            whileHover={{
                                scale: 1.05,
                            }}
                            whileTap={{
                                scale: 0.95,
                            }}
                            onClick={addMilestone}
                            className="px-8 py-3 rounded-full bg-[#2F6BFF] text-white font-semibold shadow-md"
                        >
                            Add
                        </motion.button>
                    </div>

                </div>
            </div>
        </div>
    );
}