import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Search,
    ChevronDown,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Bell,
} from "lucide-react";
import useEmployees from "../../Hooks/useEmployees";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";

export default function PerformanceList() {


    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All Departments");
    const { employees } = useEmployees();
    console.log(employees);
    const navigate = useNavigate();

    const filteredEmployees = useMemo(() => {
        return employees?.filter((emp) => {
            const matchesSearch =
                emp?.employeeName?.toLowerCase()?.includes(search.toLowerCase()) ||
                emp?.name?.toLowerCase()?.includes(search.toLowerCase()) ||
                emp?.employeeDepartment?.toLowerCase()?.includes(search.toLowerCase());

            const matchesDepartment = department === "All Departments" ||
                emp?.employeeDepartment === department;

            return matchesSearch && matchesDepartment;
        });
    }, [employees, search, department]);
    console.log(filteredEmployees);
    const [currentPage, setCurrentPage] = useState(1);
    /* PAGINATION */

    const filesPerPage = 5;

    const lastIndex = currentPage * filesPerPage;
    const firstIndex = lastIndex - filesPerPage;

    const currentFiles = filteredEmployees?.slice(firstIndex, lastIndex);

    const totalPages = Math.ceil(filteredEmployees?.length / filesPerPage);

    return (
        <div className="max-h-screen overflow-y-auto no-scrollbar bg-[#f7f4ee] ">

            {/* ================= HEADER ================= */}
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-xl px-6 py-6 shadow-sm mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#082d5b]">
                        Performance & Growth
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage and track all employees performances, goals, training, reveiws
                    </p>
                </div>

                <button className="bg-[#2563eb] p-3 rounded-lg w-fit">
                    <Bell className="text-white" size={20} />
                </button>
            </header>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-3 flex flex-wrap items-center justify-between gap-4 mx-4"
            >
                {/* Title */}

                <h1 className="text-4xl font-bold text-[#1A2D4B]">
                    Employee List
                </h1>

                {/* Right Controls */}

                <div className="flex items-center gap-4 flex-wrap">

                    {/* Search */}

                    <div className="relative">

                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Search name or id..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="
                w-64
                h-11
                rounded-xl
                bg-[#F5F5F5]
                pl-12
                pr-4
                outline-none
                border
                border-transparent
                focus:border-blue-500
              "
                        />

                    </div>

                    {/* Department */}

                    <div className="relative">

                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="
                appearance-none
                h-11
                w-44
                rounded-xl
                border
                border-gray-300
                bg-white
                px-4
                pr-10
                outline-none
              "
                        >
                            <option>All Departments</option>
                            <option>Engineering</option>
                            <option>Design</option>
                            <option>HR</option>
                            <option>Sales</option>
                            <option>Finance</option>
                            <option>Marketing</option>
                        </select>

                        <ChevronDown
                            size={18}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />

                    </div>

                    {/* Employee Count */}

                    <div className="px-6 h-11 rounded-xl bg-[#EEF3FB] flex items-center justify-center font-semibold text-gray-700">
                        {employees?.length} Employees
                    </div>

                </div>

            </motion.div>

            {/* ================= TABLE ================= */}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: .2 }}
                className="mt-6 bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden mx-6 mb-8"
            >

                <table className="w-full border-collapse">

                    {/* Table Head */}

                    <thead>

                        <tr className="bg-[#FAFAFA]">

                            <th className="border border-gray-300 py-5 text-[#173D6A] text-lg font-bold">
                                EMP NAME
                            </th>

                            <th className="border border-gray-300 py-5 text-[#173D6A] text-lg font-bold">
                                EMP ID
                            </th>

                            <th className="border border-gray-300 py-5 text-[#173D6A] text-lg font-bold">
                                DEPARTMENT
                            </th>

                            <th className="border border-gray-300 py-5 text-[#173D6A] text-lg font-bold">
                                ROLE
                            </th>

                            <th className="border border-gray-300 py-5 text-[#173D6A] text-lg font-bold">
                                ACTION
                            </th>

                        </tr>

                    </thead>

                    <tbody>
                        {currentFiles?.map((employee, index) => (
                            <motion.tr
                                key={employee.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.35,
                                    delay: index * 0.05,
                                }}
                                whileHover={{
                                    backgroundColor: "#fafafa",
                                }}
                                className="transition-colors"
                                onClick={()=>navigate(`/admin-performance/${employee?.uid || employee?.id}`)}
                            >
                                {/* Employee Name */}

                                <td className="border border-gray-300 py-5 px-6 text-center">
                                    <h3 className="text-[20px] font-medium text-[#1A1A1A]">
                                        {employee?.employeeName || employee?.name || "Ragavi"}
                                    </h3>
                                </td>

                                {/* Employee ID */}

                                <td className="border border-gray-300 py-5 text-center">
                                    <span className="text-gray-700">
                                        {employee?.uid?.slice(0, 5) || "EMP-001"}
                                    </span>
                                </td>

                                {/* Department */}

                                <td className="border border-gray-300 py-5 text-center">
                                    <span className="text-gray-700">
                                        {employee?.employeeDepartment || "Employee"}
                                    </span>
                                </td>

                                {/* Role */}

                                <td className="border border-gray-300 py-5 text-center">
                                    <span className="text-gray-700">
                                        {employee?.employeeDepartment || "Employee"}
                                    </span>
                                </td>

                                {/* Actions */}

                                <td className="border border-gray-300 py-5">

                                    <div className="flex items-center justify-center gap-4">

                                        {/* Remove Button */}

                                        <motion.button
                                            whileHover={{
                                                scale: 1.05,
                                            }}
                                            whileTap={{
                                                scale: 0.95,
                                            }}
                                            className="
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            border
            border-[#FF5C35]
            text-[#FF5C35]
            bg-white
            text-sm
            font-medium
            hover:bg-[#FFF5F2]
            transition
          "
                                        >
                                            <Trash2 size={15} />

                                            Remove
                                        </motion.button>

                                        {/* View Button */}

                                        <motion.button
                                            whileHover={{
                                                scale: 1.05,
                                            }}
                                            whileTap={{
                                                scale: 0.95,
                                            }}
                                            className="
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            bg-[#F3F3F3]
            text-gray-600
            text-sm
            font-medium
            hover:bg-gray-200
            transition
          "
                                        >
                                            <Eye size={15} />

                                            View
                                        </motion.button>

                                    </div>

                                </td>

                            </motion.tr>
                        ))}



                    </tbody>

                </table>
                {/* ================= PAGINATION ================= */}

                <Pagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                />

            </motion.div>

        </div>
    );
}