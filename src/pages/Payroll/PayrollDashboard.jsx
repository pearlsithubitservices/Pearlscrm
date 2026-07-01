import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Bell,
    Wallet,
    User,
    BadgeDollarSign,
    Clock,
    Search,
    ChevronDown,
    Plus,
    ChevronLeft,
    MoreHorizontal,
    ChevronRight,
} from "lucide-react";
import PayslipAdmin from "./PayslipAdmin";
import usePayslip from "../../Hooks/usePayslip";
import useEmployees from "../../Hooks/useEmployees";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";


export default function PayrollDashboard() {
    const [activeTab, setActiveTab] = useState("Payslips");
    const { payslips, fetchPayslips } = usePayslip();
    console.log(payslips);
    const navigate = useNavigate();
    const employee = [
        {
            name: "Valeria Reyes",
            id: "PIH-1042",
            dept: "Engineering",
            gross: "₹85,300",
            deduction: "₹8,450",
            net: "₹74,300",
            status: "Pending",
        },
        {
            name: "Arjun Mehta",
            id: "PIH-1043",
            dept: "Design",
            gross: "₹8,450",
            deduction: "₹7,450",
            net: "₹70,300",
            status: "Paid",
        },
        {
            name: "Priya Nair",
            id: "PIH-1044",
            dept: "HR",
            gross: "₹8,450",
            deduction: "₹6,450",
            net: "₹73,300",
            status: "Pending",
        },
        {
            name: "Daniel Osei",
            id: "PIH-1045",
            dept: "Engineering",
            gross: "₹8,450",
            deduction: "₹8,450",
            net: "₹72,300",
            status: "Pending",
        },
        {
            name: "Carlos Fernandez",
            id: "PIH-1047",
            dept: "Finance",
            gross: "₹8,450",
            deduction: "₹6,450",
            net: "₹70,300",
            status: "Paid",
        },
        {
            name: "Aisha Khan",
            id: "PIH-1048",
            dept: "Marketing",
            gross: "₹8,450",
            deduction: "₹6,450",
            net: "₹69,300",
            status: "Paid",
        },
    ];

    const statusStyle = (status) => {
        switch (status) {
            case "Paid":
                return "bg-green-100 text-green-600";
            case "Pending":
                return "bg-yellow-100 text-yellow-600";
            default:
                return "bg-red-100 text-red-600";
        }
    };
    const { employees } = useEmployees();
    console.log(employees);

    /* PAGINATION */
    const [currentPage, setCurrentPage] = useState(1);

    const filesPerPage = 5;

    const lastIndex = currentPage * filesPerPage;
    const firstIndex = lastIndex - filesPerPage;

    const currentFiles = payslips?.slice(firstIndex, lastIndex);

    const totalPages = Math.ceil(payslips?.length / filesPerPage);
    //GETTING EMPLOYEES NAME
    const employeeMap = useMemo(() => {
        return employees.reduce((map, employee) => {
            map[employee.uid] = {
                name: employee.name,
                department: employee.employeeRole || employee.role,
            };
            return map;
        }, {});
    }, [employees]);

    return (
        <div className="flex max-h-screen overflow-y-auto bg-[#f3f0eb] font-sans">

            <div className="flex-1">

                {/* HEADER */}
                <header className="flex justify-between items-center p-6 bg-white shadow">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Admin — Payroll & Benefits
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage payroll for all employees
                        </p>
                    </div>

                    <Bell className="w-6 h-6 text-gray-600" />
                </header>

                <div className="p-6 space-y-6">

                    {/* TOP CARDS */}
                    <div className="grid grid-cols-4 gap-4">

                        <motion.div className="bg-white p-4 rounded-xl shadow">
                            <div className="flex justify-between">
                                <Wallet />
                                <span className="text-green-500 text-xs">Month</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Gross Amount</p>
                            <h2 className="text-xl font-bold text-blue-600">₹ 10,200</h2>
                        </motion.div>

                        <motion.div className="bg-white p-4 rounded-xl shadow">
                            <div className="flex justify-between">
                                <User />
                                <span className="text-green-500 text-xs">Month</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Deductions</p>
                            <h2 className="text-xl font-bold text-red-500">₹ 1,750</h2>
                        </motion.div>

                        <motion.div className="bg-white p-4 rounded-xl shadow">
                            <div className="flex justify-between">
                                <BadgeDollarSign />
                                <span className="text-green-500 text-xs">Month</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Net Salary</p>
                            <h2 className="text-xl font-bold text-green-600">₹ 8,450</h2>
                        </motion.div>

                        <motion.div className="bg-white p-4 rounded-xl shadow">
                            <div className="flex justify-between">
                                <Clock />
                                <span className="text-green-500 text-xs">Year</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Total Amounts</p>
                            <h2 className="text-xl font-bold">₹ 4,800</h2>
                        </motion.div>

                    </div>

                </div>
                <div className="p-6 bg-[#f3f0eb] min-h-screen">

                    {/* HEADER */}
                    <div className="flex justify-between bg-white p-3  rounded items-center mb-6">

                        <h1 className="text-2xl font-bold">
                            Employee payroll register
                        </h1>

                        <div className="flex items-center gap-3">

                            {/* SEARCH */}
                            <div className="flex items-center bg-gray-200 px-3 py-2 rounded-lg w-[250px]">
                                <Search size={16} className="text-gray-500" />
                                <input
                                    placeholder="Search Project.."
                                    className="bg-transparent outline-none ml-2 w-full text-sm"
                                />
                            </div>

                            {/* FILTER */}
                            <div className="flex items-center bg-gray-200 gap-2  px-4 py-2 rounded-lg">
                                <span className="text-sm">All Departments</span>
                                <ChevronDown size={16} />
                            </div>

                            {/* ADD BUTTON */}
                            <button className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg">
                                <Plus size={16} />
                                Add New
                            </button>

                        </div>
                    </div>

                    {/* TABLE */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow overflow-hidden"
                    >

                        <table className="w-full text-sm">

                            <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="p-4">EMP NAME</th>
                                    <th>EMP ID</th>
                                    <th>DEPARTMENT</th>
                                    <th>GROSS PAY</th>
                                    <th>DEDUCTIONS</th>
                                    <th>NET PAY</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentFiles?.map((emp, i) => (
                                    <tr key={i} className="border-t hover:bg-gray-50"
                                        onClick={() => navigate(`/payslipadmin/${emp._id}`)}>

                                        <td className="p-4 font-medium">{employeeMap[emp?.employeeId]?.name || "Ragavi"}</td>
                                        <td>{emp?.employeeId?.slice(0, 5) || "EMP ID"}</td>
                                        <td>{employeeMap[emp?.employeeId]?.department}</td>
                                        <td className="text-blue-600">{emp?.gross}</td>
                                        <td className="text-red-500">{emp?.deductions || emp?.totalDeductions}</td>
                                        <td className="text-green-600">{emp?.net}</td>

                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs ${statusStyle(
                                                    emp.status
                                                )}`}
                                            >
                                                {emp.status}
                                            </span>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>

                        {/* PAGINATION */}
                        <Pagination

                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            totalPages={totalPages}
                        />

                    </motion.div>

                </div>

            </div>
        </div>
    );
}