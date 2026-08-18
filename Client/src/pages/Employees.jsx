import React, {
  useState,
  useEffect,
} from 'react';

import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Phone,
  Mail,
  X,
  User2,
  BadgeDollarSign,
  Globe,
  Upload,
  Users,
  Briefcase,
  AlertCircle,
  Activity,
  Filter,
  Bell,
  TrendingUp,
  AlertTriangle,
  LoaderCircle,
  Paperclip,
  MessageSquareText,
  IdCardIcon,
  UserMinus,
  UserMinus2,
  UserCheck,
  Pin
} from 'lucide-react';

import { useIndustry } from '../context/IndustryContext';

import { motion, AnimatePresence, easeOut } from 'framer-motion';

import { cn } from '../lib/utils';

import { useNavigate } from 'react-router-dom';

import * as XLSX from 'xlsx';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Pagination from '../components/Pagination';
import LoadingPage from '../components/Dashboard/Loading';
import Createemployee from './Createemployee';
import AnimateModals from '../components/Dashboard/AnimateModals';
import useEmployees from '../Hooks/useEmployees';


export default function ClientManagement() {

  const [active, setActive] = useState(0);
  const buttons = ["All", "Sales", "Engineering", "Design"];
  const { employees } = useEmployees();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  //PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = employees?.slice(firstIndex, lastIndex) || [];
  const totalPages = Math.ceil((employees?.length || 0) / filesPerPage);


  const stats = [
    {
      title: "Total Employees",
      value: employees.length,
      icon: UserCheck,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Employee Performance",
      value: "48%",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Active Tasks",
      value: "12",
      icon: Activity,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "ON Leave",
      value: "20",
      icon: UserMinus,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="text-black max-h-screen overflow-y-auto page-scroll w-full">

      {/* TOPBAR */}
      <div className="w-full bg-white border-b border-black/10 px-4 sm:px-6 md:px-8 py-4 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* LEFT */}
        <div>
          <h1 className="text-xl md:text-2xl text-[#023167] font-bold">
            Employee Management
          </h1>

          <p className="text-gray-400 mt-0.5 text-xs md:text-sm">
            Track and manage your Employee
          </p>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3 flex-wrap">

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white text-sm font-semibold rounded-lg hover:bg-[#1d508b] transition-all shadow-sm shrink-0"
          >
            <Plus size={16} />
            Add Employee
          </button>

          <button className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:bg-[#1d508b] transition-colors shrink-0">
            <Filter size={18} className='text-white' />
          </button>

          <button className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:bg-[#1d508b] transition-colors shrink-0">
            <Bell size={18} className='text-white' />
          </button>

        </div>

      </div>

      {/* BODY */}
      <div className="p-4 sm:p-6 md:p-8 bg-[#f3f0eb] min-h-screen">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

          {stats.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: easeOut }}
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-black/10 p-4 sm:p-5 rounded-xl shadow-sm"
            >

              <div className="flex items-center justify-between mb-3">

                <div className="bg-gray-100 rounded-lg w-10 h-10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#0b2b57]" />
                </div>

                <span className="text-green-500 bg-green-100 px-2 py-1 rounded text-xs font-semibold">
                  ↑ 8.4%
                </span>

              </div>

              <p className="text-xs sm:text-sm text-gray-500">
                {item.title}
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-[#0b2b57]">
                {item.value}
              </h2>

            </motion.div>
          ))}

        </div>

        {/* SUBHEADER & FILTERS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 md:mt-8 mb-4 border border-gray-200 bg-white p-3 sm:p-4 rounded-xl shadow-sm">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0b2b57]">
              Employee List
            </h2>
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
          <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg w-full md:w-72">

            <Search size={16} className="text-gray-500 shrink-0" />

            <input
              placeholder="Search project..."
              className="w-full outline-none text-sm bg-transparent text-gray-800"
            />

          </div>

        </div>

        {/* EMPLOYEE CARDS */}

        {loading ?
          <div className='w-full min-h-[300px] flex items-center justify-center'>
            <LoadingPage />
          </div> :
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4">

            {currentFiles.map((p) => (
              <div
                key={p.id || p._id}
                className="bg-white border border-gray-200 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/EmployeeDetails/${p._id}`)}
              >

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0b2b57] truncate">
                      {p.name || "No Name"}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Role: {p.role || "No Employee"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2.5 py-1 rounded font-medium">
                      {p.status || "Active"}
                    </span>

                    <span className="bg-green-100 text-green-600 text-xs px-2.5 py-1 rounded font-medium">
                      {p.type || "AtRisk"}
                    </span>
                  </div>

                </div>

                {/* DETAILS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 text-sm border-t border-gray-100 pt-3">

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 flex-1">

                    <h1 className="text-base sm:text-lg text-yellow-600 font-semibold min-w-fit">
                      Performance
                    </h1>

                    <div className="w-full max-w-md h-2 bg-gray-200 rounded-full overflow-hidden">

                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: "60%",
                        }}
                        transition={{ duration: 1 }}
                        className="h-full bg-blue-500 rounded-full"
                      />

                    </div>

                  </div>

                  <div className='flex items-center gap-4 text-gray-500 text-xs sm:text-sm shrink-0'>
                    <div className='flex items-center gap-1.5'>
                      <MessageSquareText size={16} className='text-gray-400' /><p>2</p>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <Paperclip size={16} className='text-gray-400' /><p>2</p>
                    </div>
                  </div>
                </div>

                {/* BOTTOM */}
                <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-gray-100 text-xs sm:text-sm">

                  <div className="flex items-center gap-2">

                    <h1 className="font-bold text-gray-800">
                      Task Score:
                    </h1>

                    <div className="font-bold text-[#2563a9]">
                      13/15
                    </div>

                  </div>

                  <div className="flex items-center text-gray-700 font-bold">
                    <Pin size={18} className="rotate-45" />
                  </div>

                </div>

              </div>
            ))}

          </motion.div>
        }

        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>

      </div>

      {/* Add Employee Modal */}
      {open && (
        <AnimateModals>
          <Createemployee onClose={() => setOpen(false)} />
        </AnimateModals>
      )}

    </div>
  );
}
