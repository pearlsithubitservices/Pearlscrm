import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAttendance from '../../Hooks/useAttendance';
import useEmployees from '../../Hooks/useEmployees';
import { apiUrl } from '../../config/api';

const Employeecomp = ({ leadcounts }) => {
    const [leads, setLeads] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const { getAttendance } = useAttendance();
    const { employees } = useEmployees();
    const navigate = useNavigate();

    const isToday = (isoDate) => {
        if (!isoDate) return false;
        const today = new Date();
        const d = new Date(isoDate);

        return (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
        );
    };

    const safeAttendance = Array.isArray(attendance) ? attendance : [];
    const safeEmployees = Array.isArray(employees) ? employees : [];
    const safeLeads = Array.isArray(leads) ? leads : [];
    const pendingQuotations = safeLeads.filter((lead) =>
        ['proposal', 'quote', 'quotation', 'pending quotation'].includes(String(lead?.status || '').trim().toLowerCase())
    );

    // Get today's online employee UIDs
    const onlineEmployeeIds = safeAttendance
        .filter(item => isToday(item?.date) && item?.isOnline === true)
        .map(item => item?.employee_uid);

    const uniqueOnlineEmployeeIds = [...new Set(onlineEmployeeIds)];

    const onlineEmployees = safeEmployees.filter(emp =>
        uniqueOnlineEmployeeIds.includes(emp?.uid || emp?.id || emp?._id)
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAttendance();
                setAttendance(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setAttendance([]);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const loadLeads = async () => {
            try {
                const response = await fetch(apiUrl('/leads'));
                if (response.ok) {
                    const data = await response.json();
                    setLeads(Array.isArray(data) ? data : data.data || []);
                } else {
                    setLeads([]);
                }
            } catch (error) {
                console.log("Employeecomp leads fetch error:", error);
                setLeads([]);
            }
        };
        loadLeads();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#f3f0eb] px-4 sm:px-8 py-2">
            {/* TABLE */}
            <div className="md:col-span-2">
                <div className="rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 bg-white border border-gray-200 rounded-2xl mb-4 text-[#0b2b57] text-lg shadow-sm">
                        <h2 className="text-base font-bold text-[#0b2b57]">
                            Employee Activity
                        </h2>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            {onlineEmployees.length} Online
                        </span>
                    </div>

                    <div className="overflow-auto bg-white text-black h-[380px] p-6 shadow-sm border border-gray-200 rounded-2xl">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100 text-xs font-bold uppercase text-gray-500">
                            <p className="text-[#0b2b57]">Employee</p>
                            <p>Leads</p>
                            <p>Progress</p>
                        </div>

                        {safeEmployees.length > 0 ? (
                            safeEmployees.slice(0, 6).map((data) => {
                                const empId = data.uid || data.id || data._id;
                                const leadCount = (leadcounts && leadcounts[empId]) || 0;
                                return (
                                    <div
                                        key={empId}
                                        className="flex justify-between mt-4 gap-2 items-center text-xs border-b border-gray-50 pb-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 text-[#2563a9] rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                                {(data.name || data.employeeName || "E")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 truncate">
                                                    {data.name || data.employeeName || "Employee"}
                                                </p>
                                                <p className="text-[11px] text-gray-400 truncate">
                                                    {data.role || data.employeeRole || "Team Member"}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="text-xs font-semibold text-gray-600">
                                            {leadCount} Leads
                                        </span>

                                        <div className="w-28 bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-[#2563a9] rounded-full"
                                                style={{ width: `${Math.min(100, (leadCount + 1) * 20)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center py-8 text-xs text-gray-400">
                                No employees found in database.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: PENDING QUOTATIONS */}
            <div className="rounded-2xl">
                <div className="flex items-center justify-between mb-4 border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
                    <h2 className="text-base font-bold text-[#0b2b57]">
                        Pending Quotations
                    </h2>
                    <button
                        type="button"
                        onClick={() => navigate('/leads')}
                        className="text-xs font-semibold text-[#2563a9] bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100"
                    >
                        View all
                    </button>
                </div>

                <div className="overflow-hidden rounded-2xl bg-white text-black p-5 border border-gray-200 shadow-sm">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                            <tr>
                                <th className="p-2.5">Company</th>
                                <th className="p-2.5">Budget</th>
                                <th className="p-2.5">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {pendingQuotations.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-6 text-center text-gray-400">
                                        No pending quotations.
                                    </td>
                                </tr>
                            ) : (
                                pendingQuotations.slice(0, 5).map((lead) => (
                                    <tr key={lead._id || lead.id} className="hover:bg-gray-50 transition">
                                        <td className="p-2.5">
                                            <h2 className="font-bold text-gray-900 truncate">
                                                {lead.company || lead.name || "Pearl Client"}
                                            </h2>
                                            <p className="text-gray-400 text-[11px] truncate">
                                                {lead.name || lead.email}
                                            </p>
                                        </td>
                                        <td className="p-2.5 font-semibold text-gray-800">
                                            {lead.budget ? `₹${lead.budget}` : "Not specified"}
                                        </td>
                                        <td className="p-2.5">
                                            <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                                {lead.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Employeecomp;