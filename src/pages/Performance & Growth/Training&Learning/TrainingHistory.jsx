import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const trainings = [
    {
        id: 1,
        title: "Python for Data Science",
        completed: "Completed May 2026",
        duration: "24 hrs",
    },
    {
        id: 2,
        title: "Web Security Fundamentals",
        completed: "Completed Mar 2026",
        duration: "16 hrs",
    },
    {
        id: 3,
        title: "Agile & Scrum Essentials",
        completed: "Completed Jan 2026",
        duration: "8 hrs",
    },
    {
        id: 4,
        title: "Data Visualization with D3.js",
        completed: "Completed Nov 2025",
        duration: "12 hrs",
    },
];

export default function TrainingHistory() {
    return (
        <div className="min-h-screen bg-[#F7F4EC] p-5 lg:p-7">

            {/* Header */}

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="
          bg-white
          rounded-2xl
          border
          border-gray-200
          shadow-sm
          px-6
          py-4
          flex
          items-center
          justify-between
        "
            >
                <h1 className="text-[42px] font-bold text-black">
                    Training history
                </h1>

                <div
                    className="
            bg-[#EEF2F7]
            px-5
            py-2
            rounded-full
            text-gray-600
            font-semibold
            text-lg
          "
                >
                    04 Completed
                </div>


            </motion.div>
            {/* Training Cards */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {trainings.map((training, index) => (
                    <motion.div
                        key={training.id}
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.45,
                            delay: index * 0.08,
                        }}
                        whileHover={{
                            y: -4,
                            scale: 1.01,
                        }}
                        className="
              bg-white
              rounded-2xl
              border
              border-gray-200
              shadow-sm
              px-6
              py-6
              flex
              items-center
              gap-5
              cursor-pointer
            "
                    >
                        {/* Status Icon */}

                        <div
                            className="
                w-14
                h-14
                rounded-xl
                bg-[#CFFFD4]
                flex
                items-center
                justify-center
                flex-shrink-0
              "
                        >
                            <CheckCircle2
                                size={30}
                                className="text-[#1B7A43]"
                                strokeWidth={2.3}
                            />
                        </div>

                        {/* Course Details */}

                        <div className="flex-1">

                            <h2 className="text-[20px] font-bold text-[#222]">
                                {training.title}
                            </h2>

                            <p className="mt-1 text-[17px] text-gray-500">
                                {training.completed}
                                <span className="mx-2">·</span>
                                {training.duration}
                            </p>

                        </div>

                    </motion.div>
                ))}
            </div>
            {/* Empty State */}

            {trainings.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24"
                >
                    <CheckCircle2
                        size={70}
                        className="text-gray-300 mb-5"
                    />

                    <h2 className="text-3xl font-bold text-gray-700">
                        No Training History
                    </h2>

                    <p className="mt-3 text-lg text-gray-500">
                        Completed trainings will appear here.
                    </p>
                </motion.div>
            )}
        </div>
    );
}