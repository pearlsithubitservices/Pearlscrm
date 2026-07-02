import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BadgeDollarSign, Clock, User, Wallet } from 'lucide-react'
import useEmployees from '../../Hooks/useEmployees';
import { useNavigate } from 'react-router-dom';

const PayslipAdmin = ({ payslip }) => {
    console.log(payslip);
    const { employees } = useEmployees();
    console.log(employees);
    //GETTING EMPLOYEES NAME
    const employeeMap = useMemo(() => {
        return employees.reduce((map, employee) => {
            map[employee.uid] = {
                name: employee.name,
                role: employee.employeeRole || employee.role,
            };
            return map;
        }, {});
    }, [employees]);
    return (
        <div >

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-4 font-bold">PAYMENT HISTORY</div>

                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-3">EMP NAME</th>
                            <th>EMP ID</th>
                            <th>DEPARTMENT</th>
                            <th>GROSS PAY</th>
                            <th>DEDUCTION</th>
                            <th>NET PAY</th>
                            <th className='flex justify-center  mt-2 '>Date</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>

                    <tbody>
                        {payslip?.map((row, i) => (
                            <tr key={i} className="border-t">

                                <td className="p-3">{employeeMap[row?.employeeId]?.name}</td>
                                <td className="p-3">{row?.employeeId?.slice(0, 5)}</td>
                                <td className="p-3">{employeeMap[row?.employeeId]?.role || "Employee"}</td>
                                <td className="p-3">₹ {row?.gross}</td>
                                <td className="p-3">₹ {row?.totalDeductions}</td>
                                <td className="p-3">₹ {row?.net}</td>
                                <td className="p-3">{row?.date}</td>

                                <td className="p-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs ${row.status === "Paid"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-purple-100 text-purple-600"
                                            }`}
                                    >
                                        {row.status}
                                    </span>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}

export default PayslipAdmin