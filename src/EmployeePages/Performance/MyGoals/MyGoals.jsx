import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CircleDot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFinancialYear } from '../../../Utils/formatNumber';
import useGoals from '../../../Hooks/useGoals';

const MyGoals = ({ newGoal, refreshKey = 0 }) => {
    const navigate = useNavigate();
    const financialyear = getFinancialYear();
    const [goal, setGoal]=useState([]);
    const { getGoals } = useGoals();

    useEffect(() => {
        const fetchgoals = async () => {
            try {
                const data = await getGoals();
                setGoal(data || []);
            } catch (err) {
                console.log(err);
            }
        };

        fetchgoals();
    }, [refreshKey, getGoals]);

    useEffect(() => {
        if (!newGoal) return;

        setGoal((prevGoals) => {
            const hasGoal = prevGoals.some((item) => item?._id === newGoal?._id);
            if (hasGoal) return prevGoals;

            return [newGoal, ...prevGoals];
        });
    }, [newGoal]);

    return (
        <>
            {/* Goals Header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 mx-6 flex justify-between items-center">
                <h2 className="text-3xl font-bold">
                    My goals · {financialyear}
                </h2>

                <span className="bg-gray-100 px-5 py-2 rounded-full font-semibold text-gray-600">
                    <p>{goal?.length || 0} Goals</p>
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

                            <div className="text-right flex h-fit items-center justify-center gap-4">
                                <span
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                                        goal.status === "Completed"
                                        ? "bg-blue-50 text-[#0b2b57]"
                                        : goal.status === "On Track"
                                        ? "bg-green-50 text-green-600"
                                        : "bg-yellow-50 text-yellow-600"
                                        }`}
                                >
                                    <CircleDot size={12} />
                                    {goal.status || "On Track"}
                                </span>

                                <p className="text-gray-500 ">
                                    {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString('en-GB') : "No due date"}
                                </p>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-2">
                            <div className="flex justify-between items-center ">
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