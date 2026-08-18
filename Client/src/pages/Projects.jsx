import React, {
  useState,
  useEffect
} from 'react';
import {
  Plus,
  Search,
  Users,
  Filter,
  Bell,
  TrendingUp,
  AlertTriangle,
  LoaderCircle,
  Paperclip,
  MessageSquareText,
  Calendar
} from 'lucide-react';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CreateProjects from './CreateProjects.jsx';
import AnimateModals from '../components/Dashboard/AnimateModals.jsx';
import LoadingPage from '../components/Dashboard/Loading.jsx';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import useProjectFilter from '../Hooks/useProjectfilter.js';
import Pagination from '../components/Pagination.jsx';
import { apiUrl } from "../config/api.js";
import { staticProjects, staticEmployees } from '../Utils/staticData.js';

export default function ProjectManagement() {

  const [project, setProject] = useState(staticProjects);
  const [employees, setEmployees] = useState(staticEmployees);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const buttons = ["All", "on Track", "At Risk"];

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/projects"));
      const data = await response.json();
      if (response.ok && Array.isArray(data) && data.length > 0) {
        setProject(data);
      } else {
        setProject(staticProjects);
      }
    } catch (error) {
      console.log(error);
      setProject(staticProjects);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'employees'));
      const employeeList = [];
      snapshot.forEach((doc) => {
        employeeList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      if (employeeList.length > 0) {
        setEmployees(employeeList);
      } else {
        setEmployees(staticEmployees);
      }
    } catch (error) {
      console.log(error);
      setEmployees(staticEmployees);
    }
  };

  const projectfilter = useProjectFilter(project, search, buttons[active]);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = projectfilter?.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil((projectfilter?.length || 0) / filesPerPage);

  const stats = [
    {
      title: "Total projects",
      value: project.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "onTrack",
      value: project.filter((p) => new Date(p.dueDate) > new Date()).length,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "At Risk",
      value: project.filter((p) => new Date(p.dueDate) <= new Date()).length,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "Avg Progress",
      value: `${Math.round(
        (project.reduce((acc, curr) => acc + Number(curr.progress || 0), 0) / (project.length || 1))
      )}%`,
      icon: LoaderCircle,
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
            Project Management
          </h1>

          <p className="text-gray-400 mt-0.5 text-xs md:text-sm">
            Track and manage your Projects
          </p>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3 flex-wrap">

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white text-sm font-semibold rounded-lg hover:bg-[#1d508b] transition-all shadow-sm shrink-0"
          >
            <Plus size={16} />
            New Project
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

        {/* PROJECT SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 md:mt-8 mb-4 border border-gray-200 bg-white p-3 sm:p-4 rounded-xl shadow-sm">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0b2b57]">
              Project List
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project..."
              className="w-full outline-none text-sm bg-transparent text-gray-800"
            />

          </div>

        </div>

        {/* PROJECT CARDS */}
        {loading ? (
          <div className='w-full min-h-[300px] flex items-center justify-center'>
            <LoadingPage />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {currentFiles.length > 0 ? (
              currentFiles.map((p) => {
                return (
                  <div
                    key={p.id || p._id}
                    className="bg-white border border-gray-200 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/projectDetails/${p._id || p.id}`)}
                  >

                    {/* HEADER */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-[#0b2b57] truncate">
                          {p.title}
                        </h3>
                        <p className="text-gray-500 text-xs sm:text-sm">
                          Company Name: {p.company || "No Company"}
                        </p>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="flex gap-2">
                          <span className={`text-xs px-2.5 py-1 rounded font-medium ${
                            p.status?.toLowerCase() === "pending"
                              ? "bg-yellow-100 text-yellow-600"
                              : p.status?.toLowerCase() === "in progress"
                              ? "bg-blue-100 text-blue-600"
                              : p.status?.toLowerCase() === "completed"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {p.status || "In Progress"}
                          </span>

                          <span className={`text-xs px-2.5 py-1 rounded font-medium ${
                            new Date(p.dueDate) <= new Date()
                              ? "text-red-600 bg-red-100"
                              : "text-green-600 bg-green-100"
                          }`}>
                            {p.dueDate ? (new Date(p.dueDate) <= new Date() ? "At Risk" : "On Track") : "On Track"}
                          </span>
                        </div>
                        <div className='text-xs text-gray-400'>
                          <p>Assigned by: Ragavi</p>
                        </div>
                      </div>

                    </div>

                    {/* DETAILS */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 pt-3 border-t border-gray-100 text-xs sm:text-sm">

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 flex-1">

                        <h1 className="text-xs sm:text-sm text-yellow-600 font-semibold min-w-fit">
                          Overall progress
                        </h1>

                        <div className="w-full max-w-md h-2 bg-gray-200 rounded-full overflow-hidden">

                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${p.progress || 50}%`,
                            }}
                            transition={{ duration: 1 }}
                            className="h-full bg-blue-500 rounded-full"
                          />

                        </div>

                      </div>

                      <div className='flex items-center gap-4 text-gray-400 shrink-0'>
                        <div className='flex items-center gap-1.5'>
                          <MessageSquareText size={16} /><p>2</p>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <Paperclip size={16} /><p>2</p>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 pt-3 border-t border-gray-100 text-xs sm:text-sm">

                      <div className="flex items-center gap-3 flex-wrap">

                        <h1 className="font-bold text-[#2563a9]">
                          Project Members :
                        </h1>

                        <div className="flex -space-x-2">

                          {p.members?.map((item, index) => {

                            const member = employees.find((emp) => emp.id === item || emp._id === item);

                            return (

                              <div
                                key={index}
                                className={`relative group w-8 h-8 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white cursor-pointer shadow-sm ${
                                  index === 0
                                    ? "bg-purple-800"
                                    : index === 1
                                    ? "bg-green-500"
                                    : "bg-blue-600"
                                }`}
                              >
                                {member?.name
                                  ? member.name.charAt(0).toUpperCase()
                                  : "M"
                                }

                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-md">
                                  {member?.name || "Member"}
                                </div>

                              </div>

                            );

                          })}

                        </div>

                      </div>

                      <div className="flex items-center font-bold gap-1 text-[#2563a9]">
                        <Calendar size={16} className='text-[#0b2b57]' />
                        <span>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "No Due Date"}</span>
                      </div>

                    </div>

                  </div>
                );
              })
            ) : (
              <div className="bg-white p-8 rounded-xl text-center text-gray-500 border border-gray-200">
                No Projects Found
              </div>
            )}

          </motion.div>
        )}

        {/* PAGINATION */}
        {!loading && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        )}

      </div>

      {/* ADD PROJECTS MODAL */}
      {open && (
        <AnimateModals>
          <CreateProjects onClose={() => setOpen(false)} />
        </AnimateModals>
      )}

    </div>
  );
}
