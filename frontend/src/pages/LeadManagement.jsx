import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Bell,
  Plus,
  IndianRupee,
  ChartNoAxesCombined,
  Users2,
  Briefcase,
  Trash2,
} from "lucide-react";

import { motion } from "framer-motion";
import Pagination from "../components/Pagination";
import CreateLead from "./CreateLead";
import AnimateModals from "../components/Dashboard/AnimateModals";
import LoadingPage from "../components/Dashboard/Loading";
import useLeadfilter from "../Hooks/useLeadfilter";
import { apiUrl } from "../config/api.js";

export default function LeadManagement() {
  const [leaddetails, setLeaddetails] = useState([]);
  const [dashboarddata, setDashboardData] = useState();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [openlead, setOpenlead] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const deleteLead = async (leadId) => {
    if (!window.confirm("Delete this lead permanently?")) return;
    const response = await fetch(apiUrl(`/leads/${leadId}`), { method: "DELETE" });
    if (response.ok) fetchleads();
    else alert("Failed to delete lead.");
  };
  const buttons = ["All", "Hot", "Warm", "Cold"];

  useEffect(() => {
    fetchleads();
    fetchDashboard();
  }, []);

  // FETCH DASHBOARD DATA
  const fetchDashboard = async () => {
    try {
      const response = await fetch(apiUrl("/dashboard"));
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // FETCH LEADS FROM BACKEND API
  const fetchleads = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/leads"));
      if (response.ok) {
        const data = await response.json();
        setLeaddetails(Array.isArray(data) ? data : []);
      } else {
        setLeaddetails([]);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeaddetails([]);
    } finally {
      setLoading(false);
    }
  };

  const safeLeaddetails = Array.isArray(leaddetails) ? leaddetails : [];
  const filteredLeads = useLeadfilter(safeLeaddetails, search, buttons[active]);
  const safeFilteredLeads = Array.isArray(filteredLeads) ? filteredLeads : [];

  // PAGINATION
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = safeFilteredLeads.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(safeFilteredLeads.length / filesPerPage) || 1;

  // DYNAMIC STATS CALCULATIONS
  const convertedLeads = safeLeaddetails.filter(
    (lead) => (lead?.status || "").toLowerCase() === "converted" || (lead?.status || "").toLowerCase() === "closed"
  ).length;

  const convertedPercent =
    safeLeaddetails.length > 0
      ? ((convertedLeads / safeLeaddetails.length) * 100).toFixed(1)
      : 0;

  const totalPipelineValue = safeLeaddetails.reduce((acc, lead) => {
    const budgetNum = parseFloat(String(lead?.budget || 0).replace(/[^0-9.]/g, "")) || 0;
    return acc + budgetNum;
  }, 0);

  const formattedPipeline =
    totalPipelineValue >= 10000000
      ? `₹${(totalPipelineValue / 10000000).toFixed(2)}Cr`
      : totalPipelineValue >= 100000
      ? `₹${(totalPipelineValue / 100000).toFixed(2)}L`
      : totalPipelineValue > 0
      ? `₹${totalPipelineValue.toLocaleString("en-IN")}`
      : "₹0";

  const stats = [
    { icon: Users2, title: "Total Leads", value: safeLeaddetails.length },
    {
      icon: Briefcase,
      title: "Hot Leads",
      value: safeLeaddetails.filter((lead) => (lead?.priority || "").toLowerCase() === "hot").length,
    },
    { icon: ChartNoAxesCombined, title: "Conversion Rate", value: `${convertedPercent}%` },
    { icon: IndianRupee, title: "Pipeline Value", value: formattedPipeline },
  ];

  return (
    <div className="flex max-h-screen overflow-y-auto custom-scrollbar bg-[#f3f0eb] flex-col min-h-screen">
      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#023167] p-2">
              Lead Management
            </h1>
            <p className="text-sm text-gray-500">
              Track and manage your company leads in real time
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={() => setOpenlead(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#2563a9] text-white rounded-lg hover:scale-105 transition-transform duration-200 shadow-xs text-sm font-medium"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Lead</span>
            </button>

            <button aria-label="Filter leads" title="Filter leads" className="w-10 h-10 shrink-0 flex items-center justify-center border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-105 transition-transform duration-200 shadow-xs">
              <Filter size={18} className="text-white" />
            </button>

            <button aria-label="View lead notifications" title="View lead notifications" className="w-10 h-10 shrink-0 flex items-center justify-center border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-105 transition-transform duration-200 shadow-xs">
              <Bell size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6 lg:p-8 bg-[#f3f0eb] space-y-6">
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs"
              >
                <div className="bg-gray-100 rounded-lg w-9 h-9 flex items-center justify-center mb-3 border border-gray-200">
                  <s.icon className="w-5 h-5 text-[#2563a9]" />
                </div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  {s.title}
                </p>
                <h2 className="text-2xl font-bold text-[#0b2b57] mt-1">
                  {s.value}
                </h2>
              </motion.div>
            ))}
          </div>

          {/* FILTER BAR */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="font-bold text-xl text-[#0b2b57]">
              <p>Lead List</p>
            </div>

            <div className="flex gap-2">
              {buttons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active === index
                      ? "bg-[#2563a9] text-white shadow-xs"
                      : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="flex items-center border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 w-full md:w-80">
              <Search size={16} className="text-gray-500 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 w-full outline-none text-xs bg-transparent text-gray-800 placeholder-gray-400"
                placeholder="Search by name, company or source..."
              />
            </div>
          </div>

          {/* TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl overflow-x-auto custom-scrollbar border border-gray-200 shadow-xs"
          >
            <table className="min-w-[900px] w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">LEAD</th>
                  <th className="p-3.5">STATUS</th>
                  <th className="p-3.5">PRIORITY</th>
                  <th className="p-3.5">BUDGET</th>
                  <th className="p-3.5">SOURCE</th>
                  <th className="p-3.5">FOLLOW UP</th>
                  <th className="p-3.5">ACTION</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                      <td colSpan="7" className="text-center py-10">
                      <LoadingPage />
                    </td>
                  </tr>
                ) : currentFiles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400 italic">
                      No leads found in database.
                    </td>
                  </tr>
                ) : (
                  currentFiles.map((l, i) => {
                    const leadName = l.name || l.clientName || "Unnamed Lead";
                    const company = l.company || "N/A";
                    const status = l.status || "New";
                    const priority = (l.priority || "cold").toLowerCase();
                    const budget = l.budget
                      ? `₹${Number(String(l.budget).replace(/[^0-9.]/g, "")).toLocaleString("en-IN")}`
                      : "N/A";
                    const source = l.source || "Direct";
                    const followUp = l.nextActionDate
                      ? new Date(l.nextActionDate).toLocaleDateString()
                      : l.follow || l.followUpDate || "Not Set";

                    return (
                      <tr
                        key={l._id || i}
                        className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/leadDetails/${l._id}`)}
                      >
                        <td className="p-3.5">
                          <p className="font-semibold text-gray-800 text-xs">{leadName}</p>
                          <p className="text-[11px] text-gray-400">{company}</p>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              status.toLowerCase() === "converted" || status.toLowerCase() === "closed"
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-blue-100 text-blue-700 border border-blue-300"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              priority === "hot"
                                ? "bg-red-100 text-red-700 border border-red-300"
                                : priority === "warm"
                                ? "bg-orange-100 text-orange-700 border-orange-300"
                                : "bg-gray-100 text-gray-600 border border-gray-300"
                            }`}
                          >
                            {priority.toUpperCase()}
                          </span>
                        </td>

                        <td className="p-3.5 font-medium text-gray-700">{budget}</td>

                        <td className="p-3.5">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px]">
                            {source}
                          </span>
                        </td>

                        <td className="p-3.5 text-gray-500 text-[11px]">{followUp}</td>
                        <td className="p-3.5">
                          <button type="button" onClick={(event) => { event.stopPropagation(); deleteLead(l._id); }} className="text-red-600" aria-label="Delete lead">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </motion.div>

          {/* PAGINATION */}
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </div>

      {/* ADD LEAD MODAL */}
      {openlead && (
        <AnimateModals>
          <CreateLead
            onClose={() => setOpenlead(false)}
            fetchleads={fetchleads}
          />
        </AnimateModals>
      )}
    </div>
  );
}
