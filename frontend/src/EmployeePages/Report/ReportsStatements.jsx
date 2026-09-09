import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  UserCheck,
  ClipboardList,
  Clock,
  LogOut,
} from "lucide-react";

import AttendanceReport from "./AttendanceSummary/AttendanceReport";
import AbsentReport from "./AttendanceSummary/AbsentReport";
import PayrollSummary from "./PayrollSummary/PayrollSummary";
import LeaveSummary from "./LeaveSummary/LeaveSummary";
import TaxDocuments from "./TaxDocuments";
import { useAuth } from "../../context/AuthContext";
import { apiUrl } from "../../config/api";

export default function ReportsStatements() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendance, setAttendance] = useState([]);
  const { user } = useAuth();
  const userId = user?.uid || user?._id || user?.id || "";

  useEffect(() => {
    if (!userId) return;
    const fetchAttendance = async () => {
      try {
        const response = await fetch(apiUrl(`/empattendancenew/employee/${userId}`));
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load attendance");
        setAttendance(data?.data || []);
      } catch (error) {
        console.error("Error fetching report attendance:", error);
        setAttendance([]);
      }
    };
    fetchAttendance();
  }, [userId]);

  const currentMonthAttendance = useMemo(() => {
    const now = new Date();
    return attendance.filter((item) => {
      const date = new Date(item.clockIn || item.date);
      return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  }, [attendance]);

  const statusCounts = currentMonthAttendance.reduce((counts, item) => {
    const status = String(item.status || "").toLowerCase();
    if (status === "absent") counts.absent += 1;
    if (status === "late" || status === "late comer") counts.late += 1;
    if (status === "early logout") counts.earlyExit += 1;
    if (status === "present" || item.clockIn) counts.present += 1;
    return counts;
  }, { present: 0, absent: 0, late: 0, earlyExit: 0 });

  const stats = [
    { title: "Present days", value: statusCounts.present, icon: UserCheck },
    { title: "Absences", value: statusCounts.absent, icon: ClipboardList },
    { title: "Late arrivals", value: statusCounts.late, icon: Clock },
    { title: "Early exit", value: statusCounts.earlyExit, icon: LogOut },
  ];

  const tabs = [
    { label: "Attendance Summary", value: "attendance" },
    { label: "Payroll Summary", value: "payroll" },
    { label: "Leave Summary", value: "leave" },
    { label: "Form 16 / 16A", value: "form16" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "attendance":
        return (
          <>
            <AttendanceReport records={currentMonthAttendance} />
            <AbsentReport records={currentMonthAttendance} />
          </>)

      case "payroll":
        return (
          <PayrollSummary/>
        );

      case "leave":
        return (
          <LeaveSummary/>
        );

      case "form16":
        return (
         <TaxDocuments/>
        );

      default:
        return <AttendanceReport />;
    }
  };

  return (
    <div className="max-h-screen overflow-y-auto no-scrollbar bg-[#F5F2EC]">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 bg-white p-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0b2b57]">
            Reports & Statements
          </h1>
          <p className="text-gray-500">
            Track your monthly attendance, Payroll and Tax Summary
          </p>
        </div>

        <button className="bg-[#0f5ea8] text-white p-3 rounded-xl">
          <Bell size={18} />
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl p-5 shadow-sm border"
          >
            <div className="flex justify-between items-center">
              <s.icon className="text-gray-700" />
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                Month
              </span>
            </div>

            <p className="text-gray-500 mt-3">{s.title}</p>
            <h2 className="text-2xl font-bold text-[#0b2b57]">
              {s.value}
            </h2>
          </motion.div>
        ))}
      </div>

      {/* TABS */}
      <div className="bg-white p-3 rounded-xl flex gap-3 mb-6 mx-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === tab.value
              ? "bg-[#0f5ea8] text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT (SWITCH RENDER) */}
      <div className="pb-10">
        {renderTabContent()}
      </div>

    </div>
  );
}