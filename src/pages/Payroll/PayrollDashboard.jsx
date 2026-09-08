import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
    Wallet,
    User,
    BadgeDollarSign,
    Clock,
    Search,
    Plus,
    Trash2,
    Download,
} from "lucide-react";

import PayslipAdmin from "./PayslipAdmin";
import usePayslip from "../../Hooks/usePayslip";
import useEmployees from "../../Hooks/useEmployees";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import AddPayslips from "./AddPayslips";

export default function PayrollDashboard() {
    const { employees } = useEmployees();

    // GETTING EMPLOYEE NAME, DEPARTMENT AND ORIGINAL ID
    const employeeMap = useMemo(() => {
        const map = {};

        employees.forEach((employee) => {
            const info = {
                name:
                    employee.name ||
                    employee.employeeName ||
                    (employee.email
                        ? employee.email.split("@")[0]
                        : "Employee"),

                department:
                    employee.profile?.department ||
                    employee.department ||
                    employee.employeeRole ||
                    employee.role ||
                    "General",

                empId:
                    employee.empId ||
                    employee.profile?.empId ||
                    employee.employeeCode ||
                    `EMP-${String(
                        employee._id ||
                        employee.uid ||
                        employee.id ||
                        ""
                    )
                        .slice(-4)
                        .toUpperCase()}`,
            };

            if (employee.uid) {
                map[employee.uid] = info;
            }

            if (employee._id) {
                map[employee._id] = info;
            }

            if (employee.id) {
                map[employee.id] = info;
            }

            if (employee.email) {
                map[employee.email.toLowerCase()] = info;
            }

            if (employee.profile?.empId) {
                map[employee.profile.empId] = info;
            }
        });

        return map;
    }, [employees]);

    const [activeTab, setActiveTab] = useState("Payslips");

    const {
        payslips,
        fetchPayslips,
        updatePayslipStatus,
        deletePayslip,
    } = usePayslip();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All");
    const [addform, setAddForm] = useState(false);

    const payrollRows = useMemo(() => {
        const getKeys = (employee) =>
            [
                employee?.uid,
                employee?._id,
                employee?.id,
                employee?.email,
                employee?.empId,
                employee?.profile?.empId,
                employee?.employeeCode,
            ]
                .filter(Boolean)
                .map((key) => String(key).toLowerCase());

        return employees
            .filter(
                (employee) =>
                    String(employee?.role || "").toLowerCase() !== "admin"
            )
            .map((employee) => {
                const employeeKeys = getKeys(employee);
                const employeePayslips = (payslips || []).filter((payslip) =>
                    employeeKeys.includes(
                        String(payslip?.employeeId || "").toLowerCase()
                    )
                );
                const latestPayslip = [...employeePayslips].sort(
                    (a, b) =>
                        new Date(b.createdAt || b.date || 0) -
                        new Date(a.createdAt || a.date || 0)
                )[0];
                const employeeId =
                    employee.empId ||
                    employee.profile?.empId ||
                    employee.uid ||
                    employee._id ||
                    employee.id;

                return (
                    latestPayslip || {
                        _id: `employee-${
                            employeeId ||
                            employee.email ||
                            employee.name ||
                            "unknown"
                        }`,
                        employeeId,
                        employeeName:
                            employee.name || employee.employeeName || "Employee",
                        status: "Not created",
                        gross: 0,
                        totalDeductions: 0,
                        net: 0,
                        isMissingPayslip: true,
                    }
                );
            });
    }, [employees, payslips]);

    const departments = useMemo(
        () =>
            [
                ...new Set(
                    payrollRows.map(
                        (row) =>
                            employeeMap[row.employeeId]?.department || "General"
                    )
                ),
            ],
        [payrollRows, employeeMap]
    );

    const handleExportCSV = () => {
        if (!filteredPayslips || filteredPayslips.length === 0) {
            alert("No employee data to export!");
            return;
        }

        const headers = [
            "Employee Name",
            "Employee ID",
            "Department",
            "Gross Pay",
            "Deductions",
            "Net Pay",
            "Status",
            "Date",
        ];

        const rows = filteredPayslips.map((emp) => [
            `"${employeeMap[emp?.employeeId]?.name ||
                emp?.employeeName ||
                "Employee"}"`,

            `"${employeeMap[emp?.employeeId]?.empId ||
                emp?.employeeId ||
                ""}"`,

            `"${employeeMap[emp?.employeeId]?.department ||
                "General"}"`,

            emp?.gross || 0,

            emp?.deductions ||
                emp?.totalDeductions ||
                0,

            emp?.net || 0,

            `"${emp?.status || "Pending"}"`,

            `"${emp?.createdAt
                ? new Date(
                      emp.createdAt
                  ).toLocaleDateString()
                : ""}"`,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [
                headers.join(","),
                ...rows.map((row) =>
                    row.join(",")
                ),
            ].join("\n");

        const encodedUri =
            encodeURI(csvContent);

        const link =
            document.createElement("a");

        link.setAttribute(
            "href",
            encodedUri
        );

        link.setAttribute(
            "download",
            `payroll_register_${new Date()
                .toISOString()
                .slice(0, 10)}.csv`
        );

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    };

    // DYNAMIC STATS
    const statsSummary = useMemo(() => {
        if (
            !payslips ||
            payslips.length === 0
        ) {
            return {
                gross: 0,
                deductions: 0,
                net: 0,
                pendingCount: 0,
            };
        }

        return payslips.reduce(
            (acc, curr) => {
                acc.gross += Number(
                    curr.gross || 0
                );

                acc.deductions += Number(
                    curr.totalDeductions ||
                        curr.deductions ||
                        0
                );

                acc.net += Number(
                    curr.net || 0
                );

                if (
                    curr.status?.toLowerCase() ===
                    "pending"
                ) {
                    acc.pendingCount += 1;
                }

                return acc;
            },
            {
                gross: 0,
                deductions: 0,
                net: 0,
                pendingCount: 0,
            }
        );
    }, [payslips]);

    // SEARCH + DEPARTMENT FILTER
    const filteredPayslips = useMemo(() => {
        return (
            payrollRows.filter((emp) => {
                const name =
                    (
                        employeeMap[emp?.employeeId]?.name ||
                        emp?.employeeName ||
                        "Employee"
                    )
                        .toLowerCase();

                const empId = String(emp?.employeeId || "").toLowerCase();
                const dept =
                    (
                        employeeMap[emp?.employeeId]?.department || "General"
                    )
                        .toLowerCase();

                const searchValue = search.toLowerCase();
                const searchMatch =
                    name.includes(searchValue) ||
                    empId.includes(searchValue) ||
                    dept.includes(searchValue);
                const departmentMatch =
                    department === "All" || dept === department.toLowerCase();

                return searchMatch && departmentMatch;
            }) || []
        );
    }, [payrollRows, search, department, employeeMap]);

    // STATUS STYLE
    const statusStyle = (status) => {
        switch (status) {
            case "Paid":
                return "bg-green-100 text-green-600";

            case "Pending":
                return "bg-yellow-100 text-yellow-600";

            case "Not created":
                return "bg-gray-100 text-gray-500";

            default:
                return "bg-red-100 text-red-600";
        }
    };

    // UPDATE PAYSLIP STATUS
    const handleStatusChange = async (
        e,
        payslipId,
        currentStatus
    ) => {
        e.stopPropagation();

        const newStatus =
            currentStatus === "Paid"
                ? "Pending"
                : "Paid";

        try {
            await updatePayslipStatus(
                payslipId,
                newStatus
            );
        } catch (err) {
            console.error(
                "Failed to update status",
                err
            );
        }
    };

    // PAGINATION
    const [currentPage, setCurrentPage] =
        useState(1);

    const filesPerPage = 5;

    const lastIndex =
        currentPage * filesPerPage;

    const firstIndex =
        lastIndex - filesPerPage;

    const currentFiles =
        filteredPayslips?.slice(
            firstIndex,
            lastIndex
        );

    const totalPages = Math.ceil(
        filteredPayslips?.length /
            filesPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, department]);

    return (
        <div className="flex max-h-screen overflow-y-auto custom-scrollbar bg-[#f3f0eb] font-sans">

            <div className="flex-1">

                {/* HEADER */}
                <header className="p-4 sm:p-6 bg-white shadow">

                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Admin — Payroll & Benefits
                        </h1>

                        <p className="text-xs sm:text-sm text-gray-500">
                            Manage payroll and benefits for all employees
                        </p>
                    </div>

                </header>

                {/* TOP CARDS */}
                <div className="p-4 sm:p-6 space-y-6">

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* GROSS */}
                        <motion.div className="bg-white p-4 rounded-xl shadow border border-gray-100">

                            <div className="flex justify-between">
                                <Wallet className="text-blue-600" />

                                <span className="text-green-500 text-xs font-semibold">
                                    Month
                                </span>
                            </div>

                            <p className="text-gray-500 text-sm mt-2">
                                Gross Amount
                            </p>

                            <h2 className="text-xl font-bold text-blue-600">
                                ₹{" "}
                                {statsSummary.gross.toLocaleString(
                                    "en-IN"
                                )}
                            </h2>

                        </motion.div>

                        {/* DEDUCTIONS */}
                        <motion.div className="bg-white p-4 rounded-xl shadow border border-gray-100">

                            <div className="flex justify-between">
                                <User className="text-red-500" />

                                <span className="text-green-500 text-xs font-semibold">
                                    Month
                                </span>
                            </div>

                            <p className="text-gray-500 text-sm mt-2">
                                Deductions
                            </p>

                            <h2 className="text-xl font-bold text-red-500">
                                ₹{" "}
                                {statsSummary.deductions.toLocaleString(
                                    "en-IN"
                                )}
                            </h2>

                        </motion.div>

                        {/* NET SALARY */}
                        <motion.div className="bg-white p-4 rounded-xl shadow border border-gray-100">

                            <div className="flex justify-between">
                                <BadgeDollarSign className="text-green-600" />

                                <span className="text-green-500 text-xs font-semibold">
                                    Month
                                </span>
                            </div>

                            <p className="text-gray-500 text-sm mt-2">
                                Net Salary
                            </p>

                            <h2 className="text-xl font-bold text-green-600">
                                ₹{" "}
                                {statsSummary.net.toLocaleString(
                                    "en-IN"
                                )}
                            </h2>

                        </motion.div>

                        {/* PENDING */}
                        <motion.div className="bg-white p-4 rounded-xl shadow border border-gray-100">

                            <div className="flex justify-between">
                                <Clock className="text-amber-500" />

                                <span className="text-amber-500 text-xs font-semibold">
                                    Active
                                </span>
                            </div>

                            <p className="text-gray-500 text-sm mt-2">
                                Pending Payslips
                            </p>

                            <h2 className="text-xl font-bold text-amber-600">
                                {statsSummary.pendingCount}
                            </h2>

                        </motion.div>

                    </div>

                </div>

                {/* PAYROLL REGISTER */}
                <div className="p-4 sm:p-6 bg-[#f3f0eb] min-h-screen">

                    {/* REGISTER HEADER */}
                    <div className="flex flex-col lg:flex-row justify-between bg-white p-4 sm:p-5 rounded-2xl items-start lg:items-center gap-4 mb-6 shadow-sm border border-gray-100">

                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Employee payroll register
                        </h1>

                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">

                            {/* SEARCH */}
                            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-xl flex-1 min-w-[200px] border border-gray-200 focus-within:border-blue-500 transition">

                                <Search
                                    size={16}
                                    className="text-gray-500"
                                />

                                <input
                                    placeholder="Search Employee, ID or Dept..."
                                    className="bg-transparent outline-none ml-2 w-full text-sm"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* DEPARTMENT */}
                            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-xl border border-gray-200">

                                <select
                                    className="bg-transparent outline-none text-sm font-medium text-gray-700"
                                    value={department}
                                    onChange={(e) => {
                                        setDepartment(
                                            e.target.value
                                        );
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="All">All Departments</option>
                                    {departments.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>

                            </div>

                            {/* EXPORT CSV */}
                            <button
                                onClick={
                                    handleExportCSV
                                }
                                className="flex items-center justify-center gap-2 bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 px-4 py-2.5 rounded-xl transition shadow-sm"
                                title="Export Payroll Register to CSV"
                            >
                                <Download size={16} />

                                <span className="hidden sm:inline">
                                    Export CSV
                                </span>
                            </button>

                            {/* ADD BUTTON */}
                            <button
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 px-4 py-2.5 rounded-xl transition shadow-sm"
                                onClick={() =>
                                    setAddForm(true)
                                }
                            >
                                <Plus size={16} />

                                <span>
                                    Add New
                                </span>
                            </button>

                        </div>

                    </div>

                    {/* TABLE */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 10,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="bg-white rounded-2xl shadow overflow-hidden border border-gray-200"
                    >

                        <div className="overflow-x-auto custom-scrollbar">

                            <table className="w-full text-sm min-w-[700px]">
                                <thead className="bg-gray-100 text-left">
                                    <tr>
                                        <th className="p-4">EMP NAME</th>
                                        <th>EMP ID</th>
                                        <th>DEPARTMENT</th>
                                        <th>GROSS PAY</th>
                                        <th>DEDUCTIONS</th>
                                        <th>NET PAY</th>
                                        <th>STATUS</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentFiles?.map((emp) => (
                                        <tr
                                            key={emp._id}
                                            className="border-t hover:bg-gray-50 cursor-pointer"
                                            onClick={() =>
                                                navigate(`/payslipadmin/${emp._id}`)
                                            }
                                        >
                                            <td className="p-4 font-medium">
                                                {employeeMap[emp?.employeeId]?.name ||
                                                    emp?.employeeName ||
                                                    "Employee"}
                                            </td>

                                            <td className="font-mono text-xs font-semibold text-slate-700">
                                                {employeeMap[emp?.employeeId]?.empId ||
                                                    (emp?.employeeId
                                                        ? `EMP-${String(
                                                              emp.employeeId
                                                          )
                                                            .slice(-4)
                                                            .toUpperCase()}`
                                                        : "EMP ID")}
                                            </td>

                                            <td>
                                                {employeeMap[emp?.employeeId]?.department ||
                                                    "General"}
                                            </td>

                                            <td className="text-blue-600 font-semibold">
                                                ₹ {Number(emp?.gross || 0).toLocaleString("en-IN")}
                                            </td>

                                            <td className="text-red-500 font-semibold">
                                                ₹ {Number(emp?.deductions || emp?.totalDeductions || 0).toLocaleString("en-IN")}
                                            </td>

                                            <td className="text-green-600 font-semibold">
                                                ₹ {Number(emp?.net || 0).toLocaleString("en-IN")}
                                            </td>

                                            <td>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(
                                                        emp.status
                                                    )}`}
                                                >
                                                    {emp.status}
                                                </span>
                                            </td>

                                            <td onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center gap-2">
                                                    {emp.isMissingPayslip ? (
                                                        <button
                                                            onClick={() => setAddForm(true)}
                                                            className="text-xs px-3 py-1 rounded font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                                                        >
                                                            Add payslip
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) =>
                                                                handleStatusChange(
                                                                    e,
                                                                    emp._id,
                                                                    emp.status
                                                                )
                                                            }
                                                            className={`text-xs px-3 py-1 rounded font-medium transition ${
                                                                emp.status === "Paid"
                                                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                                    : "bg-green-600 text-white hover:bg-green-700"
                                                            }`}
                                                        >
                                                            Mark as {emp.status === "Paid" ? "Pending" : "Paid"}
                                                        </button>
                                                    )}

                                                    {!emp.isMissingPayslip && (
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (
                                                                    window.confirm(
                                                                        "Are you sure you want to delete this payslip record?"
                                                                    )
                                                                ) {
                                                                    try {
                                                                        await deletePayslip(
                                                                            emp._id
                                                                        );
                                                                    } catch (err) {
                                                                        alert(
                                                                            err.message ||
                                                                                "Failed to delete"
                                                                        );
                                                                    }
                                                                }
                                                            }}
                                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete Payslip"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        </div>

                        {/* PAGINATION */}
                        <Pagination
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            totalPages={totalPages}
                        />

                    </motion.div>

                </div>

            </div>

            {/* ADD PAYSLIP MODAL */}
            {addform && (
                <AddPayslips
                    onClose={() =>
                        setAddForm(false)
                    }
                    fetchPayslips={
                        fetchPayslips
                    }
                />
            )}

        </div>
    );
}