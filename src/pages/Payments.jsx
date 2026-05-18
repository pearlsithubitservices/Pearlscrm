

import React, { useState } from "react";
import { data, Link, useNavigate } from "react-router-dom";
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
  Clock4,
  CircleAlert,
  CircleCheckBig,
  BanknoteArrowUp,
} from "lucide-react";

import { Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart } from "recharts";

import { motion, AnimatePresence } from "framer-motion";
import Pagination from "../components/Pagination";
import CreateLead from "./CreateLead";


export default function LeadManagement() {



  const leads = Array(6).fill({
    name: "Sarah Chen",
    company: "Nexigen Corp",
    status: "pending",
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
  const [openlead, setOpenlead] = useState(false);

  const buttons = ["All", "Paid", "Pending", "Partial", "Overdue"];

  const navigate = useNavigate();

  const [selectedPeriod, setSelectedPeriod] = useState("thismonth");

  const stats = [
    { icon: BanknoteArrowUp, title: "Total Revenue", value: "₹1243" },
    { icon: Clock4, title: "Pending", value: "₹48,830" },
    { icon: CircleAlert, title: "OverDue", value: "₹17,830" },
    { icon: CircleCheckBig, title: "Paid this Month", value: "₹4.2M" },
  ];

  const monthdata = [
    { month: "Jan", revenue: 20000, target: 15000 },
    { month: "Feb", revenue: 30000, target: 25000 },
    { month: "Mar", revenue: 25000, target: 20000 },
    { month: "Apr", revenue: 45000, target: 35000 },
    { month: "May", revenue: 35000, target: 30000 },
    { month: "Jun", revenue: 50000, target: 40000 }
  ];

  const yeardata = [
    { year: "2020", revenue: 250000, target: 220000 },
    { year: "2021", revenue: 320000, target: 300000 },
    { year: "2022", revenue: 410000, target: 380000 },
    { year: "2023", revenue: 530000, target: 500000 },
    { year: "2024", revenue: 620000, target: 580000 },
    { year: "2025", revenue: 750000, target: 700000 }
  ];



  return (
    <div className="flex min-h-screen bg-[#f3f0eb]">

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-[#023167] p-2">
              Payment Management
            </h1>
            <p className="text-sm text-gray-500">
              Track and manage Payments
            </p>
          </div>

          <div className="flex items-center gap-4">


            <button
              onClick={() => setOpenlead(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white rounded hover:scale-105 transition-transform duration-300"
            >
              <Plus size={16} />
              New Invoice
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
              <p>Payment List</p>
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

            <table className="min-w-[900px] w-full text-sm border">

              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>

                  <th className="p-3">CLIENTS</th>
                  <th>ISSUED</th>
                  <th>DUE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
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
                        {l.issued || "No"}
                      </span>
                    </td>

                    <td>
                      <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs">
                        {l.due || "NO"}
                      </span>
                    </td>

                    <td>{l.amount || "No"}</td>

                    <td>
                      <span className={`bg-gray-100 px-2 py-1 rounded-xl text-xs ${l.status.toLowerCase() === "paid" ? "bg-green-200" : l.status.toLowerCase() === "pending" ? "bg-yellow-200" : "bg-red-300"}`}>
                        {l.status || "No"}
                      </span>
                    </td>

                    <td className="text-black">{l.action || "No"}</td>

                  </tr>
                ))}

              </tbody>

            </table>
            {/*PAGINATION*/}
            <div className="mb-2">
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
              />
            </div>
          </motion.div>



        </div>

        <div className="flex gap-2 items-start justify-between   border-black mb-4  ">


          <div className="flex flex-col items-center  justify-between h-[400px] w-[600px] bg-white  ml-8 rounded-xl">
            <div className="flex gap-18 items-center   justify-between w-full mb-4 mt-2 p-2">
              <div>
                <h2 className="text-xl font-bold  text-blue-700 tracking-wide">
                  Monthly revenue overview
                </h2>
                <p className="text-sm text-gray-400">Track your clients revenue</p>
              </div>
              <div>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-gray-200 text-black/80 rounded mr-2">
                  <option value="thismonth"> This month</option>
                  <option value="thisyear"> This year</option>
                </select>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="100%" >

              <BarChart data={selectedPeriod === "thismonth" ? monthdata : yeardata}>

                <CartesianGrid strokeDasharray="3 3" />
                {selectedPeriod === "thismonth" ? <XAxis dataKey="month" /> : <XAxis dataKey="year" />}

                <YAxis />
                <Tooltip />


                {/* Revenue → Blue */}
                <Bar
                  dataKey="revenue"
                  fill="#ddead1"
                  radius={[8, 8, 0, 0]}
                />

                {/* Target → Red */}
                <Bar
                  dataKey="target"
                  fill="#2563a9"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-2 items-center justify-between mr-8 h-[400px] bg-white rounded-xl  overflow-y-scroll no-scrollbar">
            <div className="flex gap-16 items-center justify-between  mt-2 p-2">
              <h1 className="font-bold tracking-wide text-blue-900">Overdue Alerts</h1>
              <h3 className="text-blue-700 tracking-wide font-bold">4 INVOICES</h3>
            </div>
            {[
              {
                profile: "Rk",
                clientname: "Rajesh",
                companyname: "tidelpark",
                amout: "47,000",
                days: "4"
              },
              {
                profile: "Rk",
                clientname: "Rajesh",
                companyname: "tidelpark",
                amout: "47,000",
                days: "4"
              },
              {
                profile: "Rk",
                clientname: "Rajesh",
                companyname: "tidelpark",
                amout: "47,000",
                days: "4"
              },
              {
                profile: "Rk",
                clientname: "Rajesh",
                companyname: "tidelpark",
                amout: "47,000",
                days: "4"
              },
               {
                profile: "Rk",
                clientname: "Rajesh",
                companyname: "tidelpark",
                amout: "47,000",
                days: "4"
              },
               {
                profile: "Rk",
                clientname: "Rajesh",
                companyname: "tidelpark",
                amout: "47,000",
                days: "4"
              },
               {
                profile: "Rk",
                clientname: "Rajesh",
                companyname: "tidelpark",
                amout: "47,000",
                days: "4"
              },
            ].map((ev, i) => (
              <div
              key={i}
              className="flex items-center justify-between gap-10 mb-4">
                <div className="rounded-full w-10 h-10 bg-rose-200 items-center p-2 font-bold text-xl"> {ev.profile}</div>
                <div>
                  <h1 className="text-black font-bold tracking-wide">{ev.clientname}</h1>
                  <p className="text-[12px] text-gray-500 ">{ev.companyname}</p>
                </div>
                <div>
                  <h3 className=" text-red-400">₹{ev.amout}</h3>
                  <p className="bg-orange-100 text-red-500 rounded-xl p-1">{ev.days} days</p>
                </div>
              </div>
            ))}

          </div>

          
        </div>

      </div>
      {/**ADD LEADS */}
      <AnimatePresence>

        {openlead && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}

            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 "
          >

            {/* Modal */}

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
                duration: .4
              }}

              className="w-full max-w-3xl max-h-screen overflow-y-auto no-scrollbar "
            >

              <CreateLead
                onClose={() => setOpenlead(false)}
              />

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>
    </div>
  );
}

