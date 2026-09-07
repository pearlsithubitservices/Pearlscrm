import React, { useEffect, useState } from "react";
import ReportAnalytics from "../components/Dashboard/ReportAnalytics.jsx";

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
import { apiUrl } from "../config/api.js";

export default function Reports() {
  const [loading, setLoading] = useState(
    !sessionStorage.getItem("loaded")
  );

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

  const [leadData, setLeadData] = useState([]);

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

  const fetchLeads = async () => {
    try {
      const response = await fetch(apiUrl("/leads"));
      if (!response.ok) {
        throw new Error("Failed to load leads data");
      }

      const data = await response.json();
      setLeadData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching leads for reports:", error);
      setLeadData([]);
    }
  };

  // Fetch Dashboard Data
  const fetchDashboard = async () => {
    try {
      const response = await fetch(apiUrl("/dashboard"));

      if (!response.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const data = await response.json();
      setDashboardData(data || {
        totalLeads: 0,
        pendingTasks: 0,
        completedTasks: 0,
        followupsToday: 0,
        recentLeads: [],
        todayTasks: [],
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchLeads();
  }, []);

  const totalRevenue = leadData.reduce((sum, lead) => {
    const numericValue = Number(
      String(lead?.budget ?? "0")
        .replace(/[₹,\s]/g, "")
        .replace(/[^0-9.]/g, "")
    );

    return sum + (Number.isFinite(numericValue) ? numericValue : 0);
  }, 0);

  const totalTasks = (dashboardData.pendingTasks || 0) + (dashboardData.completedTasks || 0);
  const performanceRate = totalTasks
    ? Math.round(((dashboardData.completedTasks || 0) / totalTasks) * 100)
    : 0;

  const qualifiedLeadStatuses = [
    "qualified",
    "converted",
    "closed",
    "won",
    "proposal",
    "negotiation",
  ];

  const conversionRate = leadData.length
    ? Math.round(
        (leadData.filter((lead) =>
          qualifiedLeadStatuses.includes(String(lead?.status || "").trim().toLowerCase())
        ).length / leadData.length) * 100
      )
    : 0;

  const onTrackRate = totalTasks
    ? Math.round(((dashboardData.completedTasks || 0) / totalTasks) * 100)
    : 0;

  const formatCurrency = (value) => {
    if (!Number.isFinite(value) || value <= 0) return "₹0";

    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(2)}M`;
    }

    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }

    return `₹${Math.round(value)}`;
  };

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: IndianRupee,
    },
    {
      title: "Lead Conversion",
      value: `${conversionRate}%`,
      icon: Briefcase,
    },
    {
      title: "Avg Performance",
      value: `${performanceRate}%`,
      icon: ChartNoAxesCombined,
    },
    {
      title: "Projects On Track",
      value: `${onTrackRate}%`,
      icon: IndianRupee,
    },
  ];

  const handleExportReport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Revenue", formatCurrency(totalRevenue)],
      ["Lead Conversion", `${conversionRate}%`],
      ["Avg Performance", `${performanceRate}%`],
      ["Projects On Track", `${onTrackRate}%`],
      ["Total Leads", dashboardData.totalLeads || leadData.length || 0],
      ["Pending Tasks", dashboardData.pendingTasks || 0],
      ["Completed Tasks", dashboardData.completedTasks || 0],
      ["Followups Today", dashboardData.followupsToday || 0],
      [],
      ["Lead Name", "Company", "Status", "Budget", "Source", "Assigned To"],
      ...leadData.map((lead) => [
        lead?.name || "-",
        lead?.company || "-",
        lead?.status || "-",
        lead?.budget || "-",
        lead?.source || "-",
        lead?.assignedTo || lead?.assignedEmployee || "-",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const safeValue = value === null || value === undefined ? "" : String(value);
            return `"${safeValue.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "crm-report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="text-white max-h-screen overflow-y-auto no-scrollbar">

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
              onClick={handleExportReport}
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

    </>
  );
}