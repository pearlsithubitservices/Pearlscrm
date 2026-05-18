import React, { useEffect, useState } from "react";
import ReportAnalytics from "../components/Dashboard/ReportAnalytics.jsx";

import Createinvoice from '../pages/Createinvoice.jsx'

import {
  Plus,
  Search,
  ChartNoAxesCombined,
  Briefcase,
  RefreshCcw,
  IndianRupee,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function Reports() {
  const [loading, setLoading] = useState(
    !sessionStorage.getItem("loaded")
  );

  const [open, setOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    totalLeads: 0,
    pendingTasks: 0,
    completedTasks: 0,
    followupsToday: 0,
    recentLeads: [],
    todayTasks: [],
  });

  // Skeleton Loader
  useEffect(() => {
    if (!sessionStorage.getItem("loaded")) {
      const timer = setTimeout(() => {
        setLoading(false);

        sessionStorage.setItem(
          "loaded",
          "true"
        );
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch Dashboard Data
  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        "https://pearlscrm.onrender.com/api/dashboard"
      );

      const data = await response.json();

      setDashboardData(data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = [
    {
      title: "Total Revenue",
      value: "₹1.24M",
      icon: IndianRupee,
    },
    {
      title: "Lead Conversion",
      value: "82.2%",
      icon: Briefcase,
    },
    {
      title: "Avg Performance",
      value: "87%",
      icon: ChartNoAxesCombined,
    },
    {
      title: "Projects On Track",
      value: "67%",
      icon: IndianRupee,
    },
  ];

  return (
    <>
      <div className="text-white">

        {/* TOPBAR */}

        <div className="flex items-center justify-between bg-white px-8 py-6">

          <div>
            <h1 className="text-2xl text-[#023167] font-bold tracking-wide">
              Reports & Analytics
            </h1>

            <p className="text-gray-400 mt-1 text-sm">
              Track and manage your reports
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* Search */}

            <div className="flex items-center border bg-gray-200 rounded px-3 py-2 w-80">

              <Search
                size={16}
                className="text-black"
              />

              <input
                className="ml-2 w-full outline-none text-sm text-black bg-gray-200"
                placeholder="Search Lead..."
              />

            </div>

            {/* Export */}

            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded bg-[#2563a9] font-semibold hover:scale-110 transition"
            >
              <Plus className="w-4 h-4" />
              Export
            </button>

            {/* Refresh */}

            <button
              onClick={fetchDashboard}
              className="w-10 h-10 rounded bg-[#2563a9] flex items-center justify-center hover:scale-110 transition"
            >
              <RefreshCcw size={22} />
            </button>

          </div>
        </div>

        {/* BODY */}

        <div className="p-8 bg-[#f3f0eb] min-h-screen">

          {/* Stats */}

          <div className="grid grid-cols-4 gap-6">

            {stats.map((item, i) => (

              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-xl p-4 border border-gray-300"
              >

                <div className="flex items-center justify-between mb-4">

                  <div className="bg-gray-200 rounded w-10 h-10 flex items-center justify-center">

                    <item.icon className="text-black" />

                  </div>

                  <div className="text-green-500 bg-green-100 px-3 py-1 rounded text-sm font-semibold">
                    ↑ 8.4%
                  </div>

                </div>

                <p className="text-sm text-gray-500">
                  {item.title}
                </p>

                <h2 className="text-xl text-[#0b2b57] font-bold mt-2">
                  {item.value}
                </h2>

              </motion.div>

            ))}

          </div>

          {/* Report Analytics */}

          <div className="mt-8">
            <ReportAnalytics />
          </div>

        </div>
      </div>

      {/* Modal */}

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}

            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          >

            <motion.div
              initial={{
                opacity: 0,
                y: 100,
                scale: 0.9
              }}

              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }}

              exit={{
                opacity: 0,
                y: 100,
                scale: 0.9
              }}

              transition={{
                duration: 0.4
              }}

              className="w-full max-w-3xl max-h-screen overflow-y-auto no-scrollbar"
            >

              <Createinvoice
                onClose={() => setOpen(false)}
              />

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>
    </>
  );
}