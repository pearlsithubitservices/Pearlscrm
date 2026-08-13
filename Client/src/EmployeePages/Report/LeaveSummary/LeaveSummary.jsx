import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";
import useLeave from "../../../Hooks/useLeave";
import { useAuth } from "../../../context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { getFinancialYear } from "../../../Utils/formatNumber";
import useTotalLeave from "../../../Hooks/useTotalLeave";

export default function LeaveSummary() {
    const { user } = useAuth();
    const { getLeaves } = useLeave();
    const { getTotalLeave } = useTotalLeave();

    // ================= STATES =================
    const [leaves, setLeaves] = useState([]);
    const [totalLeave, setTotalLeave] = useState(null);

    // ================= FETCH LEAVES =================
    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const data = await getLeaves();
                setLeaves(Array.isArray(data) ? data : []);
            } catch (error) {
                console.log(error.message);
                setLeaves([]);
            }
        };

        fetchLeaves();
    }, []);

    // ================= FETCH TOTAL LEAVE =================
    useEffect(() => {
        const fetchTotalLeave = async () => {
            try {
                const data = await getTotalLeave(user?.uid);
                setTotalLeave(data);
            } catch (error) {
                console.log(error.message);
                setTotalLeave(null);
            }
        };

        if (user?.uid) {
            fetchTotalLeave();
        }
    }, [user?.uid]);

    // ================= FILTER USER LEAVES =================
    const LeaveById = useMemo(() => {
        return leaves.filter((item) => item.employeeId === user?.uid);
    }, [leaves, user?.uid]);

    // ================= TOTAL LEAVES (FROM DB OR DEFAULT) =================
    const totalPersonal = totalLeave?.personalLeave ?? 10;
    const totalSick = totalLeave?.sickLeave ?? 15;
    const totalAnnual = totalLeave?.annualLeave ?? 12;

    // ================= USED LEAVES =================
    const personalUsed = LeaveById.filter(
        (item) => item.leaveType?.toLowerCase() === "personal"
    ).length;

    const sickUsed = LeaveById.filter(
        (item) => item.leaveType?.toLowerCase() === "sick"
    ).length;

    const annualUsed = LeaveById.filter(
        (item) => item.leaveType?.toLowerCase() === "annual"
    ).length;

    // ================= BALANCE =================
    const personalBalance = Math.max(totalPersonal - personalUsed, 0);
    const sickBalance = Math.max(totalSick - sickUsed, 0);
    const annualBalance = Math.max(totalAnnual - annualUsed, 0);
    const totalLeaveBalance =personalBalance + sickBalance + annualBalance;

    const leaveBalanceData = [
        { type: "Personal leave", remaining: personalBalance },
        { type: "Sick leave", remaining: sickBalance },
        { type: "Annual leave", remaining: annualBalance },

    ];

    return (
        <div className="p-6 bg-[#F5F2EC] space-y-6">

            {/* ================= LEAVE TAKEN REPORT ================= */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border p-6"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Leave taken report</h2>
                    <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                        {getFinancialYear()}
                    </span>
                </div>

                <div className="overflow-auto no-scrollbar h-[500px]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b text-gray-500">
                                <th className="py-3">DATE</th>
                                <th className="py-3">LEAVE TYPE</th>
                                <th className="py-3">DAYS</th>
                                <th className="py-3">STATUS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {LeaveById.map((item, i) => (
                                <motion.tr
                                    key={item._id || i}
                                    className="border-b last:border-none"
                                >
                                    <td className="py-3">
                                        {new Date(item.leaveFrom).toLocaleDateString("en-GB")} -{" "}
                                        {new Date(item.leaveTo).toLocaleDateString("en-GB")}
                                    </td>

                                    <td className="py-3">{item.leaveType}</td>
                                    <td className="py-3">{item.leaveDays}</td>

                                    <td className="py-3">
                                        {item.status === "Approved" ? (
                                            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit text-xs">
                                                <CheckCircle2 size={14} /> Approved
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-3 py-1 rounded-full w-fit text-xs">
                                                <Clock size={14} /> Pending
                                            </span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ================= LEAVE BALANCE REPORT ================= */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border p-6"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Leave balance report</h2>
                    <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                        {getFinancialYear()}
                    </span>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left border-b text-gray-500">
                            <th className="py-3">LEAVE TYPE</th>
                            <th className="py-3">REMAINING LEAVE</th>
                        </tr>
                    </thead>

                    <tbody>
                        {leaveBalanceData.map((item, i) => (
                            <tr key={i} className="border-b last:border-none">
                                <td className="py-3">{item.type}</td>
                                <td className="py-3 font-medium">{item.remaining} days</td>
                            </tr>
                        ))}

                        <tr className="border-t">
                            <td className="py-4 font-bold text-black">TOTAL</td>
                            <td className="py-4 font-bold text-black text-lg">{totalLeaveBalance}days</td>
                        </tr>
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}