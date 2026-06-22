import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

const GoalOverview = ( {goals }) => {
    console.log( {goals} );

    // Show loading until data arrives
    // if (!goals) {
    //     return (
    //         <div className="p-6 text-center text-gray-500">
    //             Loading...
    //         </div>
    //     );
    // }

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            exit={{
                opacity: 0,
                y: -15,
            }}
            className="space-y-8 mt-4"
        >
            {/* Goal Title */}
            <div>
                <p className="text-gray-500 font-bold uppercase text-lg mb-3">
                    Goal Title
                </p>

                <div className="bg-white rounded-2xl p-6 text-[20px] font-medium text-[#244161]">
                    {goals?.title}
                </div>
            </div>

            {/* Goal Description */}
            <div>
                <p className="text-gray-500 font-bold uppercase text-lg mb-3">
                    Goal Description
                </p>

                <div className="bg-white rounded-2xl p-6 text-[20px] leading-relaxed text-[#244161]">
                    {goals?.goalDescription}
                </div>
            </div>

            {/* Goal Duration */}
            <div>
                <p className="text-gray-500 font-bold uppercase text-lg mb-4">
                    Goal Duration
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <div className="bg-white rounded-2xl p-5">
                        <div className="flex items-center gap-2 text-gray-400 font-bold uppercase">
                            <Calendar size={18} />
                            Start Date
                        </div>

                        <p className="mt-2 text-[22px] font-bold text-[#244161]">
                            {goals?.startDate
                                ? new Date(goals?.startDate).toLocaleDateString(
                                      "en-GB"
                                  )
                                : "-"}
                        </p>
                    </div>

                    {/* Due Date */}
                    <div className="bg-white rounded-2xl p-5">
                        <div className="flex items-center gap-2 text-gray-400 font-bold uppercase">
                            <Calendar size={18} />
                            Due Date
                        </div>

                        <p className="mt-2 text-[22px] font-bold text-[#244161]">
                            {goals?.dueDate
                                ? new Date(goals?.dueDate).toLocaleDateString(
                                      "en-GB"
                                  )
                                : "-"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div>
                <p className="text-gray-500 font-bold uppercase text-lg mb-4">
                    Goal Progress
                </p>

                <div className="bg-white rounded-2xl p-6">
                    <p className="text-[#244161] text-xl mb-4">
                        Goal Progress {goals?.progress ?? 0}% complete
                    </p>

                    <div className="w-full h-4 rounded-full bg-gray-200 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{
                                width: `${goals?.progress ?? 0}%`,
                            }}
                            transition={{
                                duration: 1,
                            }}
                            className="h-full rounded-full bg-[#5D8EF7]"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default GoalOverview;