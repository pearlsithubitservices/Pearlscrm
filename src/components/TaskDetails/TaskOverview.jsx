import React, { useMemo } from "react";
import { motion } from "framer-motion";
import useEmployees from "../../Hooks/useEmployees";

const TaskOverview = ({
    tasks,
    isEditing,
    editData,
    handleChange,
}) => {
    const taskObj = Array.isArray(tasks) ? tasks[0] : tasks;

    const { employees } = useEmployees();

    const employeeMap = useMemo(() => {
        return employees.reduce((map, employee) => {
            const name = employee.name || employee.employeeName || employee.displayName || employee.email;
            if (employee._id) map[employee._id] = name;
            if (employee.id) map[employee.id] = name;
            if (employee.uid) map[employee.uid] = name;
            return map;
        }, {});
    }, [employees]);

    const getPersonName = (val, defaultName = "Unassigned") => {
        if (!val) return defaultName;
        if (typeof val === 'object' && val !== null) {
            return val.name || val.employeeName || val.displayName || val.email || defaultName;
        }
        const strId = String(val).toLowerCase().trim();
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
        if (employeeMap[val]) return employeeMap[val];
        const isRawId = /^[0-9a-fA-F]{24}$/.test(val) || /^[A-Za-z0-9_-]{20,}$/.test(val);
        return isRawId ? defaultName : val;
    };

    const assignedName = getPersonName(taskObj?.assignedTo, "Unassigned");
    const assignerName = getPersonName(taskObj?.assignedBy || taskObj?.assignedFrom, "Admin");

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
                        <p className="font-semibold text-gray-800">{taskObj?.title || "No Title"}</p>
                    )}
                </div>
            </div>

            {/* TASK DESCRIPTION */}
            <div className="flex flex-col gap-4 ml-4 mt-4">
                <h1 className="font-bold text-gray-600">TASK DESCRIPTION</h1>

                <div className="bg-white rounded-lg w-full p-3">
                    {isEditing ? (
                        <textarea
                            name="description"
                            value={editData?.description || ""}
                            onChange={handleChange}
                            className="w-full border p-2 rounded h-24"
                            placeholder="Enter task description..."
                        />
                    ) : (
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {taskObj?.description || "No description provided."}
                        </p>
                    )}
                </div>
            </div>

            {/* TASK INFO */}
            <div className="mt-6 ml-4">
                <h1 className="text-lg mb-4 font-bold text-[#082f57]">TASK INFORMATION</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

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
                                {taskObj?.dueDate ? new Date(taskObj.dueDate).toLocaleDateString() : "No Due Date"}
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
                                    <option key={emp._id || emp.id || emp.uid} value={emp._id || emp.id || emp.uid}>
                                        {emp.name || emp.employeeName}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <h1 className="font-bold text-xl text-blue-700">
                                {assignedName}
                            </h1>
                        )}
                    </div>

                    {/* ASSIGNED BY */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border">
                        <h3 className="text-sm text-gray-500">ASSIGNED BY</h3>

                        <h1 className="font-bold text-xl text-purple-700">
                            {assignerName}
                        </h1>
                    </div>

                </div>
            </div>

            {/* TASK PROGRESS */}
            <div className="mt-6 ml-4">
                <h1 className="font-bold mb-3">TASK PROCESS</h1>

                <div className="flex flex-col gap-4 bg-white p-4 rounded-lg">
                    <h3>Task status: {taskObj?.status || "Pending"}</h3>

                    <div className="w-full h-2 bg-gray-300 rounded-lg">
                        <div
                            className={`h-full rounded-lg ${
                                (taskObj?.status || '').toLowerCase() === 'completed'
                                    ? 'bg-green-500 w-full'
                                    : (taskObj?.status || '').toLowerCase() === 'in progress'
                                    ? 'bg-yellow-500 w-1/2'
                                    : 'bg-blue-500 w-1/4'
                            }`}
                        />
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

export default TaskOverview;