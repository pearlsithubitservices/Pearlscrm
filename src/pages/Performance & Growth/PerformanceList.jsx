import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Search,
    ChevronDown,
    Eye,
    Trash2,
} from "lucide-react";
import useEmployees from "../../Hooks/useEmployees";
import useReview from "../../Hooks/useReview";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";

export default function PerformanceList() {


    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All Departments");
    const [reviews, setReviews] = useState([]);
    const { employees, deleteEmployee, refetch: refetchEmployees } = useEmployees();
    const { getReviews, deleteReview } = useReview();
    const navigate = useNavigate();

    const handleRemove = async (e, employee) => {
        e.stopPropagation();
        if (!employee) return;

        const empName = getEmployeeDisplay(employee, "name");
        const isConfirmed = window.confirm(`Are you sure you want to remove ${empName}?`);
        if (!isConfirmed) return;

        try {
            const employeeId = employee?.uid || employee?.id || employee?._id;

            // Clean up review data
            if (employeeId) {
                try {
                    await deleteReview(employeeId);
                } catch (err) {
                    console.error("Error deleting review:", err);
                }
            }

            // Clean up employee
            if (employeeId) {
                await deleteEmployee(employeeId);
            }

            if (refetchEmployees) {
                await refetchEmployees();
            }
            const res = await getReviews();
            if (res && res.data) {
                setReviews(res.data);
            }
        } catch (error) {
            console.error("Error removing employee:", error);
            alert("Failed to remove employee: " + (error.message || "Unknown error"));
        }
    };

    const getEmployeeDisplay = (employee, field, fallback = "-") => {
        const profile = employee?.profile || {};

        if (field === "id") {
            return profile?.empId || employee?.empId || employee?.uid || employee?.id || employee?._id || fallback;
        }
        if (field === "department") {
            return employee?.employeeDepartment || profile?.department || employee?.department || employee?.industry || "Employee";
        }
        if (field === "role") {
            return employee?.employeeRole || profile?.designation || employee?.role || "Employee";
        }
        if (field === "name") {
            return employee?.employeeName || employee?.name || "Employee";
        }
        return employee?.[field] || profile?.[field] || fallback;
    };

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await getReviews();
                setReviews(Array.isArray(res?.data) ? res.data : []);
            } catch (error) {
                console.error("Error loading reviews:", error);
                setReviews([]);
            }
        };

        fetchReviews();
    }, [getReviews]);

    const availableDepartments = useMemo(() => {
        const set = new Set(["Engineering", "Design", "HR", "Sales", "Finance", "Marketing"]);
        employees?.forEach((emp) => {
            const dept = getEmployeeDisplay(emp, "department");
            if (dept && dept !== "-" && dept !== "Employee") {
                set.add(dept);
            }
        });
        return Array.from(set).sort();
    }, [employees]);

    const filteredEmployees = useMemo(() => {
        const query = search.trim().toLowerCase();

        return employees?.filter((emp) => {
            const empName = (emp?.employeeName || emp?.name || "").toLowerCase();
            const empDept = getEmployeeDisplay(emp, "department").toLowerCase();
            const empRole = getEmployeeDisplay(emp, "role").toLowerCase();
            const empId = String(getEmployeeDisplay(emp, "id")).toLowerCase();
            const empEmail = (emp?.email || "").toLowerCase();

            const matchesSearch =
                !query ||
                empName.includes(query) ||
                empDept.includes(query) ||
                empRole.includes(query) ||
                empId.includes(query) ||
                empEmail.includes(query);

            const matchesDepartment =
                department === "All Departments" ||
                empDept === department.toLowerCase();

            return matchesSearch && matchesDepartment;
        });
    }, [employees, search, department]);

    const [currentPage, setCurrentPage] = useState(1);

    const getPerformanceInfo = (employee) => {
        const employeeId = employee?.uid || employee?.id || employee?._id;
        const matchingReview = reviews.find((review) => {
            const reviewEmployeeId = review?.employee_uid || review?.employeeId || review?.employee?.uid || review?.employee?.id;
            return (
                (employeeId && String(reviewEmployeeId || "") === String(employeeId || "")) ||
                String(review?.employeeName || "").toLowerCase() === String(employee?.employeeName || employee?.name || "").toLowerCase() ||
                (employee?.uid && String(review?.employee_uid || "") === String(employee?.uid || ""))
            );
        });

        if (matchingReview && matchingReview.overallRating) {
            const rating = Number(matchingReview.overallRating);
            const percent = Math.min(100, Math.max(0, Math.round((rating / 5) * 100)));
            return {
                value: percent,
                hasReview: true,
                rating,
                label: `Performance ${percent}%`,
                badge: percent >= 80 ? "bg-emerald-100 text-emerald-700" : percent >= 60 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700",
            };
        }

        return {
            value: 0,
            hasReview: false,
            rating: 0,
            label: "No Review Yet",
            badge: "bg-gray-100 text-gray-600",
        };
    };

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
                        Manage and track all employees&apos; performance, goals, training, and reviews
                    </p>
                </div>

                {/* <button className="bg-[#2563eb] p-3 rounded-lg w-fit">
                    <Bell className="text-white" size={20} />
                </button> */}
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
                            {availableDepartments.map((deptName) => (
                                <option key={deptName} value={deptName}>
                                    {deptName}
                                </option>
                            ))}
                        </select>

                        <ChevronDown
                            size={18}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />

                    </div>

                    {/* Employee Count */}

                    <div className="px-6 h-11 rounded-xl bg-[#EEF3FB] flex items-center justify-center font-semibold text-gray-700">
                        {filteredEmployees?.length || 0} Employees
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
                        {currentFiles?.map((employee, index) => {
                            const perf = getPerformanceInfo(employee);
                            return (
                            <motion.tr
                                key={employee.id || employee._id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.35,
                                    delay: index * 0.05,
                                }}
                                whileHover={{
                                    backgroundColor: "#fafafa",
                                }}
                                className="transition-colors cursor-pointer"
                                onClick={()=>navigate(`/admin-performance/${employee?.uid || employee?.id || employee?._id}`)}
                            >
                                {/* Employee Name */}

                                <td className="border border-gray-300 py-5 px-6 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <h3 className="text-[20px] font-medium text-[#1A1A1A]">
                                            {getEmployeeDisplay(employee, "name")}
                                        </h3>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${perf.badge}`}>
                                            {perf.label}
                                        </span>
                                    </div>
                                </td>

                                {/* Employee ID */}

                                <td className="border border-gray-300 py-5 text-center">
                                    <span className="text-gray-700">
                                        {String(getEmployeeDisplay(employee, "id")).trim() || "-"}
                                    </span>
                                </td>

                                {/* Department */}

                                <td className="border border-gray-300 py-5 text-center">
                                    <span className="text-gray-700">
                                        {getEmployeeDisplay(employee, "department")}
                                    </span>
                                </td>

                                {/* Role */}

                                <td className="border border-gray-300 py-5 text-center">
                                    <span className="text-gray-700">
                                        {getEmployeeDisplay(employee, "role")}
                                    </span>
                                </td>

                                {/* Actions */}

                                <td className="border border-gray-300 py-5" onClick={(e) => e.stopPropagation()}>

                                    <div className="flex items-center justify-center gap-4">

                                        {/* Remove Button */}

                                        <motion.button
                                            whileHover={{
                                                scale: 1.05,
                                            }}
                                            whileTap={{
                                                scale: 0.95,
                                            }}
                                            onClick={(e) => handleRemove(e, employee)}
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
            cursor-pointer
            shadow-xs
          "
                                            title="Remove employee"
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
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/admin-performance/${employee?.uid || employee?.id || employee?._id}`);
                                            }}
                                            className="
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            bg-[#F3F3F3]
            text-gray-700
            text-sm
            font-medium
            hover:bg-gray-200
            transition
            cursor-pointer
            shadow-xs
          "
                                            title="View employee performance details"
                                        >
                                            <Eye size={15} />

                                            View
                                        </motion.button>

                                    </div>

                                </td>

                            </motion.tr>
                            );
                        })}

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