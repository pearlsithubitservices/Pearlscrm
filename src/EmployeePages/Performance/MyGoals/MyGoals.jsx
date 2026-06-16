import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CircleDot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFinancialYear } from '../../../Utils/formatNumber';
import useGoals from '../../../Hooks/useGoals';
const goals = [
    {
        title: "React 18 migration",
        alignedTo: "Team OKR",
        progress: 75,
        status: "On Track",
        due: "Due Jun 30, 2026",
    },
    {
        title: "AWS Solutions Architect certification",
        alignedTo: "Personal Growth",
        progress: 75,
        status: "On Track",
        due: "Due Jun 20, 2026",
    },
    {
        title: "Deliver mobile app v2.0",
        alignedTo: "Company OKR",
        progress: 100,
        status: "Completed",
        due: "Due Sep 30, 2026",
    },

];

const MyGoals = () => {
    const navigate = useNavigate();
    const financialyear = getFinancialYear();
    const [goal, setGoal]=useState([]);
    const { getGoals } = useGoals();

    useEffect(() => {
        const fetchgoals = async () => {
            try {
                const data = await getGoals();
                setGoal(data);
                if (data) {
                    console.log(data);
                }
            } catch (err) {
                console.log(err);
            }
        };

        fetchgoals();
    }, []);

    return (
        <>
            {/* Goals Header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 mx-6 flex justify-between items-center">
                <h2 className="text-3xl font-bold">
                    My goals · {financialyear}
                </h2>

                <span className="bg-gray-100 px-5 py-2 rounded-full font-semibold text-gray-600">
                    <p>{goals.length} Goals</p>
                </span>
            </div>

            {/* Goal Cards */}
            <div className="space-y-6">
                {goal?.map((goal, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{ y: -2 }}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mx-6"
                        onClick={() => navigate(`/employee/performance/${goal._id}`)}
                    >
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-[#0b2b57]">
                                    {goal.title}
                                </h3>

                                <p className="mt-3 text-xl">
                                    <span className="font-semibold">
                                        Aligned to :
                                    </span>

                                    <span className="text-blue-600 ml-2">
                                        {goal.alignedTo}
                                    </span>
                                </p>
                            </div>

                            <div className="text-right">
                                <span
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${goal.status === "Completed"
                                        ? "bg-blue-50 text-[#0b2b57]"
                                        : "bg-green-50 text-green-600"
                                        }`}
                                >
                                    <CircleDot size={12} />
                                    {goal.status?goal.status:"on Track"}
                                </span>

                                <p className="text-gray-500 mt-6">
                                    {goal.due}
                                </p>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[#d2a44a] text-xl">
                                    Overall progress
                                </span>

                                <span className="text-blue-500 text-2xl font-medium">
                                    {goal.progress}%
                                </span>
                            </div>

                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${goal.progress}%`,
                                    }}
                                    transition={{
                                        duration: 1,
                                        delay: index * 0.1,
                                    }}
                                    className="h-full bg-blue-500 rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </>
    )
}

export default MyGoals