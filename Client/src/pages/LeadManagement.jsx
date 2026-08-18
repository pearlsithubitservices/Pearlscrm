import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FolderKanban,
  Settings,
  LogOut,
  Search,
  Filter,
  Bell,
  Plus,
  IndianRupee,
  CheckCircle2,
  ChartNoAxesCombined,
  Users2,
  CheckCircle,
  Briefcase,
  ArrowLeft,
  ArrowLeftCircleIcon,
  ArrowRightFromLine,
  ArrowRightCircleIcon,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    fetchleads();
    fetchDashboard();
  }, []);

  //FETCH DASHBOARD
  const fetchDashboard = async () => {
    try {
      const response = await fetch(apiUrl("/dashboard"));
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Leads
  const fetchleads = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/leads"));
      const data = await response.json();
      setLeaddetails(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const [active, setActive] = useState(0);
  const buttons = ["All", "Hot", "Warm", "Cold"];
  const filteredLeads = useLeadfilter(leaddetails, search, buttons[active]);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = filteredLeads?.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredLeads.length / filesPerPage);

  const [openlead, setOpenlead] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const convertedLeads = leaddetails.filter((lead) => (lead.status?.toLowerCase() === "converted")).length;
  const convertedPercent = leaddetails.length > 0 ? ((convertedLeads / leaddetails.length) * 100).toFixed(2) : 0;

  const stats = [
    { icon: Users2, title: "Total Lead", value: leaddetails.length },
    { icon: Briefcase, title: "Hot Leads", value: leaddetails.filter((leads) => (leads.priority?.toLowerCase() === "hot")).length },
    { icon: ChartNoAxesCombined, title: "Conversion Rate", value: `${convertedPercent}%` },
    { icon: IndianRupee, title: "Pipeline Value", value: "₹4.2M" },
  ];

  return (
    <div className="flex max-h-screen overflow-y-auto page-scroll bg-[#f3f0eb] w-full">

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 w-full">

        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#023167]">
              Lead Management
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Track and manage your leads
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">

            <button
              onClick={() => setOpenlead(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white text-sm font-semibold rounded-lg hover:bg-[#1d508b] transition-all shadow-sm shrink-0"
            >
              <Plus size={16} />
              Add Lead
            </button>

            <button className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:bg-[#1d508b] transition-colors shrink-0">
              <Filter size={18} className='text-white' />
            </button>

            <button className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:bg-[#1d508b] transition-colors shrink-0">
              <Bell size={18} className='text-white' />
            </button>

          </div>

        </div>

        {/* CONTENT */}
        <div className="p-4 sm:p-6 md:p-8 bg-[#f3f0eb] min-h-screen">

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className='bg-gray-100 rounded-lg w-9 h-9 flex items-center justify-center mb-3'>
                  <s.icon className="w-5 h-5 text-[#0b2b57]" />
                </div>
                <p className="text-xs sm:text-sm text-gray-500">{s.title}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0b2b57]">
                  {s.value}
                </h2>
              </motion.div>
            ))}

          </div>

          {/* FILTER BAR */}
          <div className="mt-6 bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="font-bold text-base sm:text-lg text-[#0b2b57]">
              <p>Lead List</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {buttons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-xl font-medium transition-all
            ${active === index
                      ? "bg-[#2563a9] text-white"
                      : "text-gray-500 hover:bg-[#2563a9] hover:text-white"
                    }`}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="flex items-center border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 w-full md:w-72">
              <Search size={16} className="text-gray-500 shrink-0" />
              <input
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 w-full outline-none text-sm bg-transparent text-gray-800"
                placeholder="Search Lead.."
              />
            </div>

          </div>

          {/* TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto responsive-table-container">

            <table className="min-w-[700px] w-full text-sm">

              <thead className="bg-gray-50 text-left text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3">LEAD</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">TEMP</th>
                  <th className="p-3">BUDGET</th>
                  <th className="p-3">SOURCE</th>
                  <th className="p-3">FOLLOW UP</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10">
                      <LoadingPage />
                    </td>
                  </tr>
                ) : (currentFiles.map((l, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50/80 cursor-pointer transition-colors" onClick={() => navigate(`/leadDetails/${l._id}`)}>

                    <td className="p-3">
                      <p className="font-semibold text-[#0b2b57]">{l.name || "John Doe"}</p>
                      <p className="text-xs text-gray-400">{l.company || "ABC Corp"}</p>
                    </td>

                    <td className="p-3">
                      <span className="bg-green-100 text-green-600 px-2.5 py-1 rounded text-xs font-medium">
                        {l.status || "New"}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded text-xs font-medium">
                        {l.priority || "cold"}
                      </span>
                    </td>

                    <td className="p-3 font-semibold text-gray-800">{l.budget || "1,20,000"}</td>

                    <td className="p-3">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-xs font-medium">
                        {l.source || "Website"}
                      </span>
                    </td>

                    <td className="p-3 text-gray-500">{l.follow || "Not Set"}</td>

                  </tr>
                )))}

              </tbody>

            </table>

          </motion.div>

          {/* PAGINATION */}
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </div>

        </div>

      </div>
      {/* ADD LEADS */}
      {openlead && (
        <AnimateModals>
          <CreateLead onClose={() => setOpenlead(false)}
            fetchleads={fetchleads} />
        </AnimateModals>
      )}
    </div>
  );
}
