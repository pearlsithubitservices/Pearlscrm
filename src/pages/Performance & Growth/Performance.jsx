import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bell } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import EmployeePerformancePage from "../../components/EmployeeDetails/EmployeePerformance";

const Performance = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#f3efe9] px-3 py-4 sm:px-6"
        >
            <header className="mb-5 flex flex-col gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-gray-100 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#082d5b] sm:text-3xl">Performance & Growth</h1>
                    <p className="mt-1 text-sm text-gray-500">Track employee performance and achievement across the month</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-sm">
                        <Bell size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                </div>
            </header>

            <EmployeePerformancePage employee={{ uid: id }} />
        </motion.div>
    );
};

export default Performance;
