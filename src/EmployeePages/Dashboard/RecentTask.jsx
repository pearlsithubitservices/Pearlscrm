import React, { useEffect, useMemo, useState } from 'react'
import { motion } from "framer-motion";
import useTasks from '../../Hooks/useTaskid';
import { useAuth } from '../../context/AuthContext';
import useEmployees from '../../Hooks/useEmployees';

const RecentTask = () => {


    const { tasks } = useTasks();
    const { employees } = useEmployees();
    console.log(tasks);
    console.log(employees);

    const { user } = useAuth();
    const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    //GETTING EMPLOYEES NAME
    const employeeMap = useMemo(() => {
        return employees.reduce((map, employee) => {
            map[employee.uid||employee.id] = employee.name;
            return map;
        }, {});
    }, [employees]);

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case "hot":
                return "bg-red-100 text-red-500";
            case "warm":
                return "bg-purple-100 text-purple-500";
            case "cold":
                return "bg-yellow-100 text-yellow-600";
            default:
                return "bg-gray-100 text-gray-500";
        }
    };
    return (
        <div className="mt-6 space-y-5">
            {recentTasks?.map((task, index) => {
                const empName = employees.find(
                    (item) => item.uid === task.assignedBy
                );

                return (
                    <motion.div
                        key={task._id || index}
                        whileHover={{ scale: 1.01 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-semibold text-[#082d5b]">
                                    Assigned by:{" "}
                                    <span className="font-bold">
                                        {empName?.name || employeeMap[task.assignedBy]}
                                    </span>
                                </h3>

                                <p className="mt-3 text-xl text-black">
                                    {task.title}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-slate-100 text-[#082d5b] px-4 py-2 rounded-full flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#082d5b]" />
                                    {task.status}
                                </div>

                                <div
                                    className={`px-4 py-2 rounded-full flex items-center gap-2 ${getPriorityStyle(
                                        task.priority.toLowerCase()
                                    )}`}
                                >
                                    <div className="w-3 h-3 rounded-full bg-current" />
                                    {task.priority}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    )
}

export default RecentTask