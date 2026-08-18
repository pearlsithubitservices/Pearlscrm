import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";

const ETasksOverview = ({ tasks }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className=" rounded-xl p-4 "
        >

            <div className="flex flex-col gap-4 ml-4">
                <h1 className="font-semibold">Project Name</h1>
                <div className="bg-white rounded-lg w-full h-20 p-2">
                    <p>{tasks.titl || "Sri Sai Millets"}</p>
                </div>

            </div>
            <div className="flex flex-col gap-4 ml-4 mt-4">
                <h1 className="font-semibold">Task Title</h1>
                <div className="bg-white rounded-lg w-full h-20 p-2">
                    <p>{tasks.title || " ReDesign the onboarding experiences for enterprise accounts"}</p>
                </div>

            </div>
            <div className="flex flex-col gap-4 ml-4 mt-4">
                <h1 className="font-semibold">Task Description</h1>
                <div className="bg-white rounded-lg w-full h-20 p-2">
                    <p>{tasks.notes || " ReDesign the onboarding experiences for enterprise accounts"}</p>
                </div>

            </div>
            <div className="mt-4 w-full ml-4">
                <h1 className="text-lg  mb-4 font-semibold">
                    Task Informations
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

                    {/* Due Date */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-gray-500">
                            DUE DATE
                        </h3>

                        <p className="text-base font-semibold text-gray-800">
                            {tasks?.dueDate || "26-06-2026"}
                        </p>
                    </div>

                    {/* Assigned By */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-gray-500">
                            ASSIGNED BY
                        </h3>

                        <p className="text-base font-semibold text-gray-800">
                            {tasks?.assignedBy || "Ragavi M"}
                        </p>
                    </div>

                </div>
            </div>
            <div className="mt-4 w-full ml-4">
                <h1>TASK PROCESS</h1>
                <div className="flex flex-col items-start justify-center gap-4 bg-white p-4 rounded-lg">
                    <div>
                        <h3>Task progress 65% complete</h3>
                    </div>
                    <div className="w-full max-w-md h-2 bg-gray-300 rounded-lg">
                        <div
                            className="h-full bg-blue-500 rounded-lg" style={{ width: '65%' }}></div>
                    </div>
                </div>

            </div>

        </motion.div>
    );
};

export default ETasksOverview;