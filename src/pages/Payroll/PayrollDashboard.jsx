import React, { useEffect, useMemo, useState } from "react";
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
import AddPayslips from './AddPayslips'


export default function PayrollDashboard() {
    const { employees } = useEmployees();

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
    const [activeTab, setActiveTab] = useState("Payslips");
    const { payslips, fetchPayslips } = usePayslip();
    console.log(payslips);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All");
    const [addform, setAddForm] = useState(false);

    const filteredPayslips = useMemo(() => {
        return payslips?.filter((emp) => {

            const name = employeeMap[emp?.employeeId]?.name?.toLowerCase() || "";
            const empId = emp?.employeeId?.toLowerCase() || "";
            const dept = employeeMap[emp?.employeeId]?.department?.toLowerCase() || "";

            const searchMatch =
                name.includes(search.toLowerCase()) ||
                empId.includes(search.toLowerCase()) ||
                dept.includes(search.toLowerCase());

            const departmentMatch =
                department === "All" ||
                dept === department.toLowerCase();

            return searchMatch && departmentMatch;
        }) || [];
    }, [payslips, search, department, employeeMap]);


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


    /* PAGINATION */
    const [currentPage, setCurrentPage] = useState(1);

    const filesPerPage = 5;

    const lastIndex = currentPage * filesPerPage;
    const firstIndex = lastIndex - filesPerPage;

    const currentFiles = filteredPayslips?.slice(firstIndex, lastIndex);

    const totalPages = Math.ceil(filteredPayslips?.length / filesPerPage);
    useEffect(() => {
        setCurrentPage(1);
    }, [search, department]);


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
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* FILTER */}
                            <div className="flex items-center bg-gray-200 gap-2  px-4 py-2 rounded-lg">
                                <select
                                    className="bg-gray-200 px-4 py-2 rounded-lg text-sm"
                                    value={department}
                                    onChange={(e) => {
                                        setDepartment(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="All">All Departments</option>
                                    <option value="developer">Developer</option>
                                    <option value="designer">Designer</option>
                                    <option value="hr">HR</option>
                                    <option value="finance">Finance</option>
                                </select>
                            </div>

                            {/* ADD BUTTON */}
                            <button className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg"
                                onClick={() => setAddForm(true)}>
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
            {addform && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl max-h-[85vh] overflow-y-auto"
                    >
                        <AddPayslips onClose={() => setAddForm(false)}
                            fetchPayslips={fetchPayslips} />
                    </motion.div>
                </div>
            )}
        </div>
    );
}