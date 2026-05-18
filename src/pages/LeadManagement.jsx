

import React, { useState } from "react";
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

import { motion } from "framer-motion";
import Pagination from "../components/Pagination";

export default function LeadManagement() {



   const leads = Array(6).fill({
    name: "Sarah Chen",
    company: "Nexigen Corp",
    status: "Qualified",
    temp: "warm",
    budget: "$120,000",
    source: "LinkedIn",
    follow: "Today"
  });

  // PAGINATION

  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = leads.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(leads.length / filesPerPage);

  const [active, setActive] = useState(0);

  const buttons = ["All", "Hot", "Warm", "Cold"];

  const navigate = useNavigate();

  const stats = [
    { icon: Users2, title: "Total Lead", value: "1243" },
    { icon: Briefcase, title: "Hot Leads", value: "48" },
    { icon: ChartNoAxesCombined, title: "Conversion Rate", value: "24.6%" },
    { icon: IndianRupee, title: "Pipeline Value", value: "₹4.2M" },
  ];

 

  return (
    <div className="flex min-h-screen bg-[#f3f0eb]">

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-[#023167] p-2">
              Lead Management
            </h1>
            <p className="text-sm text-gray-500">
              Track and manage your leads
            </p>
          </div>

          <div className="flex items-center gap-4">


            <button
              onClick={() => navigate('/create-lead')}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white rounded hover:scale-105 transition-transform duration-300"
            >
              <Plus size={16} />
              Add Lead
            </button>

            <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
              <Filter size={18} className='text-white' />
            </button>

            <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
              <Bell size={18} className='text-white' />
            </button>

          </div>

        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6 lg:p-8 bg-[#f3f0eb]">

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="bg-white p-6 rounded-xl border"
              >
                <div className='bg-gray-200  rounded w-8 h-8'>
                  <s.icon className="w-8 h-8 text-black p-2" />
                </div>
                <p className="text-sm text-gray-500">{s.title}</p>
                <h2 className="text-2xl font-bold text-[#0b2b57]">
                  {s.value}
                </h2>
              </motion.div>
            ))}

          </div>

          {/* FILTER BAR */}
          <div className="mt-6 bg-white p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className=" font-bold text-xl text-[#0b2b57]"  >
              <p>Lead List</p>
            </div>

            <div className="flex gap-3">
              {buttons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  className={`px-4  rounded-xl font-medium transition-all
            ${active === index
                      ? "bg-[#2563a9] text-white"
                      : "text-gray-400  hover:bg-[#2563a9] hover:text-white"
                    }`}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="flex items-center border bg-gray-200 rounded px-3 py-2 w-full md:w-80">
              <Search size={16} className="text-black" />
              <input
                className="ml-2 w-full outline-none text-sm bg-gray-200"
                placeholder="Search Lead.."
              />
            </div>

          </div>

          {/* TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white rounded-lg overflow-x-auto border">

            <table className="min-w-[900px] w-full text-sm">

              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="p-3">LEAD</th>
                  <th>STATUS</th>
                  <th>TEMP</th>
                  <th>BUDGET</th>
                  <th>SOURCE</th>
                  <th>FOLLOW UP</th>
                </tr>
              </thead>


              <tbody>

                {currentFiles.map((l, i) => (
                  <tr key={i} className="border-t">

                    <td className="p-3">
                      <p className="font-medium">{l.name}</p>
                      <p className="text-xs text-gray-400">{l.company}</p>
                    </td>

                    <td>
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                        {l.status}
                      </span>
                    </td>

                    <td>
                      <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs">
                        {l.temp}
                      </span>
                    </td>

                    <td>{l.budget}</td>

                    <td>
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {l.source}
                      </span>
                    </td>

                    <td>{l.follow}</td>

                  </tr>
                ))}

              </tbody>

            </table>

          </motion.div>

          {/*PAGINATION*/}
          <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          />

        </div>

      </div>
    </div>
  );
}

