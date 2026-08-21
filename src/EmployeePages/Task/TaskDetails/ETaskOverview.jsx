import React from "react";
import { motion } from "framer-motion";
import useEmployees from "../../../Hooks/useEmployees";

const ETasksOverview = ({ tasks }) => {
    const { employees } = useEmployees();

    const getAssignerName = () => {
        if (!tasks) return "Admin";
        if (tasks.assignedFrom && typeof tasks.assignedFrom === "string" && !/^[0-9a-fA-F]{24}$/.test(tasks.assignedFrom)) {
            return tasks.assignedFrom;
        }
        if (tasks.createdBy && typeof tasks.createdBy === "string" && !/^[0-9a-fA-F]{24}$/.test(tasks.createdBy)) {
            return tasks.createdBy;
        }

        const rawId = tasks.assignedBy || tasks.assignedFrom || tasks.createdBy;
        if (!rawId) return "Admin";

        const strId = String(rawId).toLowerCase().trim();
        if (strId === "admin") return "Admin";

        const found = (employees || []).find((emp) => {
            if (!emp) return false;
            const eId = String(emp._id || emp.id || emp.uid || "").toLowerCase();
            const eEmail = String(emp.email || "").toLowerCase();
            const eName = String(emp.employeeName || emp.name || emp.displayName || "").toLowerCase();
            return (
                eId === strId ||
                eEmail === strId ||
                (eEmail && strId.includes(eEmail)) ||
                (eName && eName === strId)
            );
        });

        if (found) {
            return found.employeeName || found.name || found.displayName || (found.email ? found.email.split("@")[0] : strId);
        }

        if (typeof rawId === "string" && rawId.includes("@")) {
            const prefix = rawId.split("@")[0];
            return prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }

        if (typeof rawId === "string" && !/^[0-9a-fA-F]{24}$/.test(rawId) && rawId.length < 20) {
            return rawId;
        }

        return "Admin";
    };

    const assignerName = getAssignerName();

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className=" rounded-xl p-4 "
        >

            <div className="flex flex-col gap-4 ml-4">
                <h1 className="font-semibold">Project Name</h1>
                <div className="bg-white rounded-lg w-full h-20 p-2">
                    <p>{tasks?.titl || tasks?.title || "Sri Sai Millets"}</p>
                </div>

            </div>
            <div className="flex flex-col gap-4 ml-4 mt-4">
                <h1 className="font-semibold">Task Title</h1>
                <div className="bg-white rounded-lg w-full h-20 p-2">
                    <p>{tasks?.title || " ReDesign the onboarding experiences for enterprise accounts"}</p>
                </div>

            </div>
            <div className="flex flex-col gap-4 ml-4 mt-4">
                <h1 className="font-semibold">Task Description</h1>
                <div className="bg-white rounded-lg w-full h-20 p-2">
                    <p>{tasks?.notes || tasks?.description || " ReDesign the onboarding experiences for enterprise accounts"}</p>
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
                            {assignerName}
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
                    <div className="w-[500px] h-2 bg-gray-300 rounded-lg">
                        <div
                            className="h-full bg-blue-500 rounded-lg" style={{ width: '65%' }}></div>
                    </div>
                </div>

            </div>

        </motion.div>
    );
};

export default ETasksOverview;