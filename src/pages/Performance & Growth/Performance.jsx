import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Star, Code2, Award } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import EmployeePerformancePage from "../../components/EmployeeDetails/EmployeePerformance";
import PerformanceReviews from "./performanceReviews";
import Skills from "./Skills&Certifications/Skills";
import Certifications from "./Skills&Certifications/Certifications";
import useEmployees from "../../Hooks/useEmployees";

const Performance = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { employees } = useEmployees();

    const currentEmployee = useMemo(() => {
        return employees?.find((item) =>
            String(item.id) === String(id) ||
            String(item._id) === String(id) ||
            String(item.uid) === String(id) ||
            String(item.empId) === String(id)
        ) || { uid: id, id, employeeName: "Employee", role: "Employee" };
    }, [employees, id]);

    const tabs = [
        { id: "overview", label: "Overview", icon: BarChart3 },
        { id: "reviews", label: "Reviews", icon: Star },
        { id: "skills", label: "Skills", icon: Code2 },
        { id: "certifications", label: "Certifications", icon: Award },
    ];

    const [activeTab, setActiveTab] = useState(() => {
        if (location.state?.isEdit || location.state?.openForm) return "reviews";
        return "overview";
    });

    useEffect(() => {
        if (location.state?.isEdit || location.state?.openForm) {
            setActiveTab("reviews");
        }
    }, [location.state]);

    const employeeName = currentEmployee?.employeeName || currentEmployee?.name || "Employee";
    const employeeRole = currentEmployee?.employeeRole || currentEmployee?.role || currentEmployee?.employeeDepartment || currentEmployee?.profile?.designation || "Employee";
    const employeeStatus = currentEmployee?.status || currentEmployee?.employeeStatus || "Active";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#f3efe9] px-3 py-4 sm:px-6"
        >
            {/* Header */}
            <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-white px-6 py-5 shadow-sm ring-1 ring-gray-100 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        type="button"
                        onClick={() => navigate("/admin-performance")}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer shrink-0"
                    >
                        <ArrowLeft size={16} />
                        Back to List
                    </button>

                    <div className="h-8 w-px bg-gray-200 hidden sm:block shrink-0" />

                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl sm:text-2xl font-bold text-[#082d5b] truncate">
                                {employeeName}
                            </h1>
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 shrink-0">
                                {employeeStatus}
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500 truncate">
                            {[employeeRole, currentEmployee?.department, currentEmployee?.email].filter(Boolean).join(" • ")}
                        </p>
                    </div>
                </div>

                {/* Tabs switcher */}
                <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-[#f0ede6] p-1.5 shrink-0 no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                                    isActive
                                        ? "bg-white text-blue-700 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                                }`}
                            >
                                <Icon size={15} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Tab Contents */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === "overview" && (
                    <EmployeePerformancePage employee={currentEmployee} />
                )}

                {activeTab === "reviews" && (
                    <PerformanceReviews currentUserid={id} employee={currentEmployee} />
                )}

                {activeTab === "skills" && (
                    <Skills employeeId={id} employee={currentEmployee} />
                )}

                {activeTab === "certifications" && (
                    <Certifications employeeId={id} employee={currentEmployee} />
                )}
            </motion.div>
        </motion.div>
    );
};

export default Performance;