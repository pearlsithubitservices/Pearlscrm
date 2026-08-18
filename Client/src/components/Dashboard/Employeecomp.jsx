import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import useAttendance from '../../Hooks/useAttendance';
import { LeafyGreen } from 'lucide-react';
import { apiUrl } from "../../config/api.js";
import { staticEmployees, staticLeads } from '../../Utils/staticData.js';

const Employeecomp = ({ leadcounts = {} }) => {
    const [employees, setEmployees] = useState(staticEmployees);
    const [leads, setLeads] = useState(staticLeads);
    const [loading, setLoading] = useState(false);
    const [attendance, setAttendance] = useState([]);
    const { getAttendance } = useAttendance();

    const isToday = (isoDate) => {
        const today = new Date();
        const d = new Date(isoDate);
        return (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
        );
    };

    // Get today's online employee UIDs
    const onlineEmployeeIds = attendance
        .filter(item => isToday(item.date) && item.isOnline === true)
        .map(item => item.employee_uid);

    const uniqueOnlineEmployeeIds = [...new Set(onlineEmployeeIds)];

    const onlineEmployeesList = employees.filter(emp =>
        uniqueOnlineEmployeeIds.includes(emp.uid || emp.id)
    );

    const displayEmployees = onlineEmployeesList.length > 0 ? onlineEmployeesList : employees;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAttendance();
                setAttendance(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl("/leads"));
            const data = await response.json();
            if (response.ok && Array.isArray(data) && data.length > 0) {
                setLeads(data);
            } else {
                setLeads(staticLeads);
            }
        } catch (error) {
            console.log(error);
            setLeads(staticLeads);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'employees'),
            (snapshot) => {
                const employeeList = [];
                snapshot.forEach((docItem) => {
                    employeeList.push({
                        id: docItem.id,
                        ...docItem.data(),
                    });
                });
                if (employeeList.length > 0) {
                    setEmployees(employeeList);
                } else {
                    setEmployees(staticEmployees);
                }
            },
            (err) => {
                console.log(err);
                setEmployees(staticEmployees);
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#f3f0eb]">

            {/* TABLE */}
            <div className="md:col-span-2 p-2">
                <div className="rounded-xl overflow-hidden ml-0 md:ml-6">
                    <div className="flex items-center justify-between px-6 py-5 bg-white border border-gray-200 rounded-xl h-12 mb-6 text-[#0b2b57] text-lg">
                        <h2 className="text-base sm:text-lg font-bold text-[#0b2b57]">
                            Employee Activity
                        </h2>

                        <button className="text-[#2563a9] font-semibold text-sm">
                            {displayEmployees.length} Active
                        </button>
                    </div>

                    <div className="overflow-auto no-scrollbar rounded-xl border border-gray-200 bg-white text-black h-[410px] mb-4 p-4 sm:p-6 shadow-sm">
                        <div>
                            <div className='flex justify-between items-center pb-3 border-b border-gray-100'>
                                <p className='text-[#0b2b57] text-sm font-bold'>Employee</p>
                                <p className='font-semibold text-sm text-gray-600'>Leads</p>
                                <p className='font-semibold text-sm text-gray-600'>Progress</p>
                            </div>
                            {displayEmployees.map((data) => (
                                <div
                                    key={data.uid || data.id}
                                    className="flex justify-between mt-4 gap-2 items-center font-sans border-b border-gray-50 pb-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                            {(data.name || "")
                                                .split(" ")
                                                .map(v => v[0])
                                                .join("")
                                                .toUpperCase()}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-semibold text-black text-sm truncate">{data.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{data.role}</p>
                                        </div>
                                    </div>

                                    <p className="text-xs font-medium text-gray-500">
                                        {leadcounts[data.uid || data.id] || 3} Leads
                                    </p>

                                    <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full"
                                            style={{ width: data.performance || "85%" }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="rounded-2xl p-2">
                <div className="flex items-center justify-between mb-6 border border-gray-200 rounded-xl p-3 bg-white">
                    <h2 className="text-base sm:text-lg font-bold text-[#0b2b57]">
                        Pending Quotations
                    </h2>

                    <button className="text-[#2563a9] font-semibold text-xs sm:text-sm">
                        View all
                    </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white text-black p-4 shadow-sm">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100">
                            <tr className="text-[#0b2b57]">
                                <th className="text-left p-2.5">Company</th>
                                <th className="text-left p-2.5">Budget</th>
                                <th className="text-left p-2.5">Status</th>
                            </tr>
                        </thead>

                        <tbody className="text-xs">
                            {leads.slice(0, 5).map((lead) => (
                                <tr key={lead._id || lead.id} className="border-t border-gray-100">
                                    <td className="p-2.5">
                                        <h2 className="font-bold text-gray-800 truncate max-w-[120px]">
                                            {lead.company}
                                        </h2>
                                        <p className="text-gray-400 text-[11px] truncate max-w-[120px]">
                                            {lead.name}
                                        </p>
                                    </td>

                                    <td className="p-2.5 font-semibold text-gray-700">
                                        ₹{lead.budget ? Number(lead.budget).toLocaleString() : "4,50,000"}
                                    </td>

                                    <td className="p-2.5">
                                        <span className="bg-red-100 text-red-500 px-2 py-0.5 rounded-full text-[11px] font-medium">
                                            Urgent
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

export default Employeecomp;