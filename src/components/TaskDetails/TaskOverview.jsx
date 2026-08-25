import React, { useMemo } from "react";
import { motion } from "framer-motion";
import useEmployees from "../../Hooks/useEmployees";

const TaskOverview = ({
    tasks,
    isEditing,
    editData,
    handleChange,
}) => {
    console.log(tasks);

    const { employees } = useEmployees();

    const employeeMap = useMemo(() => {
        return employees.reduce((map, employee) => {
            map[employee.uid] = employee.name;
            return map;
        }, {});
    }, [employees]);

     // safer shortcut

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="rounded-xl p-4"
        >

            {/* TASK TITLE */}
            <div className="flex flex-col gap-4 ml-4">
                <h1 className="font-bold text-gray-600">TASK DETAILS</h1>

                <div className="bg-white rounded-lg w-full p-3">
                    {isEditing ? (
                        <input
                            name="title"
                            value={editData?.title || ""}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    ) : (
                        <p>{tasks?.title}</p>
                    )}
                </div>
            </div>

            {/* TASK DESCRIPTION */}
            <div className="flex flex-col gap-4 ml-4 mt-4">
                <h1 className="font-bold text-gray-600">TASK DESCRIPTION</h1>

                <div className="bg-white rounded-lg w-full p-3">
                    {isEditing ? (
                        <textarea
                            name="notes"
                            value={editData?.notes || ""}
                            onChange={handleChange}
                            className="w-full border p-2 rounded h-24"
                        />
                    ) : (
                        <p>
                            {tasks?.notes ||
                                "ReDesign the onboarding experience for enterprise accounts"}
                        </p>
                    )}
                </div>
            </div>

            {/* TASK INFO */}
            <div className="mt-6 ml-4">
                <h1 className="text-lg mb-4 font-bold">TASK INFORMATION</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* DUE DATE */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border">
                        <h3 className="text-sm text-gray-500">DUE DATE</h3>

                        {isEditing ? (
                            <input
                                type="date"
                                name="dueDate"
                                value={editData?.dueDate || ""}
                                onChange={handleChange}
                                className="border p-2 rounded w-full mt-2"
                            />
                        ) : (
                            <p className="font-semibold text-gray-800">
                                {tasks?.dueDate || "26-06-2026"}
                            </p>
                        )}
                    </div>

                    {/* ASSIGNED TO */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border">
                        <h3 className="text-sm text-gray-500">ASSIGNED TO</h3>

                        {isEditing ? (
                            <select
                                name="assignedTo"
                                value={editData?.assignedTo || ""}
                                onChange={handleChange}
                                className="border p-2 rounded w-full mt-2"
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.uid} value={emp.uid}>
                                        {emp.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <h1 className="font-bold text-xl text-[#082f57]">
                                {employeeMap[tasks?.assignedTo] || "Vishnu"}
                            </h1>
                        )}
                    </div>

                </div>
            </div>

            {/* TASK PROGRESS */}
            <div className="mt-6 ml-4">
                <h1 className="font-bold mb-3">TASK PROCESS</h1>

                <div className="flex flex-col gap-4 bg-white p-4 rounded-lg">
                    <h3>Task progress 65% complete</h3>

                    <div className="w-full h-2 bg-gray-300 rounded-lg">
                        <div
                            className="h-full bg-blue-500 rounded-lg"
                            style={{ width: "65%" }}
                        />
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

export default TaskOverview;