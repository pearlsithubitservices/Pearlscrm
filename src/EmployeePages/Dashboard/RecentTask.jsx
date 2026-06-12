import React, { useEffect, useState } from 'react'
import { motion } from "framer-motion";

const RecentTask = () => {

    const [recentTask, setRecentTask] = useState([]);
    console.log(recentTask);
    useEffect(() => {
        getrecentTask()
    }, []);

    const getrecentTask = async () => {
        try {
            const result = await fetch("http://localhost:5000/api/tasks/recent");
            if (!result.ok) {
                alert('No Recent Task')
            }
            const data = await result.json();
            setRecentTask(data);
        }
        catch (error) {
            console.error(error);
            
        }
    }

   
    const tasks = [
        {
            assignedBy: "Ragavi",
            title: "Redesign onboarding flow for enterprise clients",
            status: "In progress",
            priority: "High",
        },
        {
            assignedBy: "Jeeva",
            title: "Redesign onboarding flow for enterprise clients",
            status: "In Review",
            priority: "Low",
        },
        {
            assignedBy: "Ragavi",
            title: "Redesign onboarding flow for enterprise clients",
            status: "In Review",
            priority: "Low",
        },
        {
            assignedBy: "Jeeva",
            title: "Redesign onboarding flow for enterprise clients",
            status: "To do",
            priority: "Med",
        },
        {
            assignedBy: "Deepan",
            title: "Redesign onboarding flow for enterprise clients",
            status: "To do",
            priority: "Med",
        },
    ];
    const getPriorityStyle = (priority) => {
        switch (priority) {
            case "High":
                return "bg-red-100 text-red-500";
            case "Low":
                return "bg-purple-100 text-purple-500";
            case "Med":
                return "bg-yellow-100 text-yellow-600";
            default:
                return "bg-gray-100 text-gray-500";
        }
    };
    return (
        <div className="mt-6 space-y-5">
            {tasks.map((task, index) => (
                <motion.div
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-semibold text-[#082d5b]">
                                Assigned by :{" "}
                                <span className="font-bold">{task.assignedBy}</span>
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
                                    task.priority
                                )}`}
                            >
                                <div className="w-3 h-3 rounded-full bg-current" />
                                {task.priority}
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

export default RecentTask