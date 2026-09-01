import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import useEmployees from '../../Hooks/useEmployees';
import usePayslip from '../../Hooks/usePayslip';

const PayslipAdmin = ({ payslip }) => {
    const { employees } = useEmployees();
    const { deletePayslip } = usePayslip();

    // GETTING EMPLOYEES NAME & ID
    const employeeMap = useMemo(() => {
        const map = {};
        employees.forEach((employee) => {
            const info = {
                name: employee.name || employee.employeeName || (employee.email ? employee.email.split('@')[0] : "Employee"),
                role: employee.employeeRole || employee.role || "Employee",
                empId: employee.empId || employee.profile?.empId || employee.employeeCode || `EMP-${String(employee._id || employee.uid || employee.id || "").slice(-4).toUpperCase()}`,
            };
            if (employee.uid) map[employee.uid] = info;
            if (employee._id) map[employee._id] = info;
            if (employee.id) map[employee.id] = info;
            if (employee.email) map[employee.email.toLowerCase()] = info;
            if (employee.profile?.empId) map[employee.profile.empId] = info;
        });
        return map;
    }, [employees]);

    const handleDelete = async (e, payslipId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this payslip record?")) {
            try {
                await deletePayslip(payslipId);
            } catch (err) {
                alert(err.message || "Failed to delete payslip");
            }
        }
    };

    return (
        <div>
            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-200">
                <div className="p-4 font-bold text-gray-800 text-lg border-b">PAYMENT HISTORY</div>

                <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm min-w-[650px]">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-3">EMP NAME</th>
                            <th>EMP ID</th>
                            <th>DEPARTMENT</th>
                            <th>GROSS PAY</th>
                            <th>DEDUCTION</th>
                            <th>NET PAY</th>
                            <th className="text-center">DATE</th>
                            <th>STATUS</th>
                            <th className="text-center">ACTION</th>
                        </tr>
                    </thead>

                    <tbody>
                        {payslip && payslip.length > 0 ? (
                            payslip.map((row, i) => (
                                <tr key={row._id || i} className="border-t hover:bg-gray-50 transition">
                                    <td className="p-3 font-semibold">{employeeMap[row?.employeeId]?.name || row?.employeeName || "Employee"}</td>
                                    <td className="p-3 font-mono text-xs font-semibold text-slate-700">{employeeMap[row?.employeeId]?.empId || (row?.employeeId ? `EMP-${String(row.employeeId).slice(-4).toUpperCase()}` : "EMP ID")}</td>
                                    <td className="p-3">{employeeMap[row?.employeeId]?.role || "Employee"}</td>
                                    <td className="p-3 font-semibold text-blue-600">₹ {Number(row?.gross || 0).toLocaleString('en-IN')}</td>
                                    <td className="p-3 font-semibold text-red-500">₹ {Number(row?.totalDeductions || row?.deductions || 0).toLocaleString('en-IN')}</td>
                                    <td className="p-3 font-semibold text-green-600">₹ {Number(row?.net || 0).toLocaleString('en-IN')}</td>
                                    <td className="p-3 text-center text-gray-600">{row?.date ? new Date(row.date).toLocaleDateString('en-GB') : "N/A"}</td>

                                    <td className="p-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${row.status === "Paid"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-amber-100 text-amber-600"
                                                }`}
                                        >
                                            {row.status || "Pending"}
                                        </span>
                                    </td>

                                    <td className="p-3 text-center">
                                        <button
                                            onClick={(e) => handleDelete(e, row._id)}
                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                            title="Delete Payslip Record"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center py-6 text-gray-400 italic">No payslip records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    )
}

export default PayslipAdmin