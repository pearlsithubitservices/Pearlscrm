
import React, {
  useState,
  useEffect,
  useMemo
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
  Trash2,
  Clock
} from 'lucide-react';

import { useIndustry } from '../context/IndustryContext';

import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '../lib/utils';

import { useNavigate } from 'react-router-dom';

import * as XLSX from 'xlsx';
import CreateProjects from './CreateProjects.jsx'
import AnimateModals from '../components/Dashboard/AnimateModals.jsx';
import LoadingPage from '../components/Dashboard/Loading.jsx';
import useProjectFilter from '../Hooks/useProjectfilter.js';
import Pagination from '../components/Pagination.jsx';

import { apiUrl } from '../config/api.js';
import { socket } from '../config/socket.js';

export default function ProjectManagement() {
  const [project, setProject] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjects = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const response = await fetch(apiUrl("/projects"));
      if (response.ok) {
        const data = await response.json();
        setProject(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching admin projects:", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(apiUrl('/employees'));
      let empList = [];
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) empList = data;
      }

      const resUsers = await fetch(apiUrl('/auth/users'));
      if (resUsers.ok) {
        const userData = await resUsers.json();
        if (Array.isArray(userData)) {
          userData.forEach(u => {
            const uId = u._id || u.uid;
            if (!empList.some(e => (e._id || e.uid) === uId)) {
              empList.push({
                _id: uId,
                id: uId,
                uid: uId,
                name: u.displayName || u.name || u.email,
                employeeName: u.name || u.displayName,
                email: u.email,
              });
            }
          });
        }
      }

      setEmployees(empList);
    } catch (error) {
      console.error("Error fetching employees for projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchEmployees();

    if (socket) {
      const handleSync = () => fetchProjects(true);
      socket.on("projectCreated", handleSync);
      socket.on("projectUpdated", handleSync);
      socket.on("projectDeleted", handleSync);

      return () => {
        socket.off("projectCreated", handleSync);
        socket.off("projectUpdated", handleSync);
        socket.off("projectDeleted", handleSync);
      };
    }
  }, []);

  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      const eKey = emp._id || emp.id || emp.uid;
      if (eKey) map[eKey] = emp.name || emp.employeeName || emp.email;
    });
    return map;
  }, [employees]);

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(apiUrl(`/projects/${projectId}`), {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProjects(true);
      } else {
        alert("Failed to delete project");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handlePriorityChange = async (e, projectId, newPriority) => {
    e.stopPropagation();
    try {
      const res = await fetch(apiUrl(`/projects/${projectId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.ok) {
        fetchProjects(true);
      }
    } catch (err) {
      console.error("Error updating project priority:", err);
    }
  };

  const buttons = ["All", "Pending", "on Track", "At Risk", "Completed"];

  const projectfilter = useProjectFilter(project, search, buttons[active]);

  //PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = projectfilter?.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(projectfilter?.length / filesPerPage) || 1;

  const pendingCount = project.filter((p) => {
    const st = (p.status || "").toLowerCase();
    return st === "pending" || st === "in progress" || st === "planning" || (st !== "completed" && (Number(p.progress) || 0) < 100);
  }).length;

  const onTrackCount = project.filter(
    (p) => new Date(p.dueDate) >= new Date() && (p.status || "").toLowerCase() !== "completed"
  ).length;

  const atRiskCount = project.filter(
    (p) => new Date(p.dueDate) < new Date() && (p.status || "").toLowerCase() !== "completed"
  ).length;

  const stats = [
    {
      title: "Total projects",
      value: project.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Pending Projects",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "onTrack",
      value: onTrackCount,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "At Risk",
      value: atRiskCount,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50"
    }
  ];






  return (
    <div className="text-black max-h-screen overflow-y-auto no-scrollbar">

      {/* TOPBAR */}
      <div className="w-full bg-white border-b border-black/10 px-8 py-6 flex items-center justify-between">

        {/* LEFT */}
        <div>
          <h1 className="text-2xl text-[#023167] font-bold">
            Project Management
          </h1>

          <p className="text-gray-400 mt-1 text-sm">
            Track and manage your Projects
          </p>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white rounded hover:scale-105 transition-transform duration-300"
          >
            <Plus size={16} />
            New Project
          </button>

          <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
            <Filter size={18} className='text-white' />
          </button>

          <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
            <Bell size={18} className='text-white' />
          </button>



        </div>

      </div>

      {/* BODY */}
      <div className="p-8 bg-[#f3f0eb] ">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {stats.map((item, i) => (
            < motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="bg-white border border-black/10 p-4 rounded-xl"
            >

              <div className="flex items-center justify-between mb-3">

                <div className="bg-gray-100 rounded w-10 h-10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#0b2b57]" />
                </div>

                <span className="text-green-500 bg-green-100 px-2 py-1 rounded text-xs font-semibold">
                  ↑ 8.4%
                </span>

              </div>

              <p className="text-sm text-gray-500">
                {item.title}
              </p>

              <h2 className="text-3xl font-bold text-[#0b2b57]">
                {item.value}
              </h2>

            </motion.div>
          ))}

        </div>

        {/* PROJECT SECTION HEADER */}
        <div className="flex items-center justify-between mt-8 mb-4 border bg-white p-2 rounded">
          <div>
            <h2 className="text-lg font-bold text-[#0b2b57]">
              Project List
            </h2>
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
          <div className="flex items-center gap-2 bg-gray-200 border px-3 py-2 rounded w-[350px]">

            <Search size={16} className="text-black" />

            <input
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project..."
              className="w-full outline-none text-sm bg-gray-200"
            />

          </div>

        </div>

        {/* PROJECT CARDS */}
        {loading ? <div className='h-screen w-full'>
          <LoadingPage />
        </div> : <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4">

          {currentFiles.length > 0 ? (currentFiles.map((p) => {
            const isOverdue = p.dueDate && new Date(p.dueDate) <= new Date();

            return (
              <div
                key={p._id || p.id}
                className="bg-white border border-black/10 p-5 rounded hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/projectDetails/${p._id || p.id}`)}
              >

                {/* HEADER */}
                <div className="flex justify-between items-center">

                  <div>
                    <h3 className="text-lg font-bold text-[#0b2b57]">
                      {p.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Company: {p.company || "Pearls Client"}
                    </p>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className="flex items-center gap-2">
                      <select
                        value={p.priority || "Medium"}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handlePriorityChange(e, p._id || p.id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-full font-bold border-none outline-none cursor-pointer ${
                          (p.priority || "").toLowerCase() === "urgent" || (p.priority || "").toLowerCase() === "hot"
                            ? "bg-rose-100 text-rose-700"
                            : (p.priority || "").toLowerCase() === "high" || (p.priority || "").toLowerCase() === "warm"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        <option value="Urgent">🔥 Urgent</option>
                        <option value="Hot">🔥 Hot</option>
                        <option value="High">⚡ High</option>
                        <option value="Medium">⚡ Medium</option>
                        <option value="Warm">⚡ Warm</option>
                        <option value="Low">🌱 Low</option>
                        <option value="Cold">❄️ Cold</option>
                      </select>

                      <span className={`text-xs px-3 py-1 rounded font-semibold ${p.status?.toLowerCase() === "completed" ? "bg-green-100 text-green-700" : p.status?.toLowerCase() === "in progress" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {p.status || "Active"}
                      </span>

                      <span className={`text-xs px-3 py-1 rounded font-semibold ${isOverdue ? "text-red-600 bg-red-100" : "text-green-600 bg-green-100"}`}>
                        {isOverdue ? "At Risk" : "On Track"}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteProject(e, p._id || p.id)}
                      className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition"
                      title="Delete Project"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>

                {/* DETAILS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4 text-sm">

                  <div className="flex items-center gap-5 flex-1 max-w-xl">

                    <h1 className="text-sm font-bold text-yellow-600 min-w-fit">
                      Progress: {p.progress || 0}%
                    </h1>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">

                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${p.progress || 0}%`,
                        }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-blue-500 rounded-full"
                      />

                    </div>

                  </div>

                  <div className='flex items-center gap-4 text-xs text-gray-400'>
                    <div className='flex items-center gap-1'>
                      <MessageSquareText size={16} /><p>{p.notes?.length || 0}</p>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Paperclip size={16} /><p>{p.documents?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/** Bottom */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mt-4">

                  <div className="flex items-center flex-wrap gap-2">

                    <h1 className="text-sm font-bold text-[#2563a9]">
                      Project Members:
                    </h1>

                    <div className="flex -space-x-3">

                      {Array.isArray(p.members) && p.members.length > 0 ? (
                        p.members.map((item, index) => {
                          const mUid = typeof item === 'object' ? (item.uid || item._id || item.id) : item;
                          const mName = typeof item === 'object' ? (item.name || item.employeeName) : (employeeMap[mUid] || String(item));
                          const initial = (mName || 'M').charAt(0).toUpperCase();

                          return (
                            <div
                              key={index}
                              className={`relative group w-9 h-9 rounded-full flex items-center justify-center text-xs text-white font-bold border-2 border-white cursor-pointer ${
                                index % 3 === 0 ? "bg-purple-800" : index % 3 === 1 ? "bg-green-600" : "bg-blue-600"
                              }`}
                            >
                              {initial}

                              <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                                {mName || "Member"}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-400 italic">No assigned members</span>
                      )}

                    </div>

                  </div>

                  <div className="text-xs font-bold">
                    <div className={`flex items-center gap-1.5 ${isOverdue ? "text-red-600" : "text-[#2563a9]"}`}>
                      <Calendar size={16} className='text-[#0b2b57]' />
                      <p>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "No Due Date"}</p>
                    </div>
                  </div>

                </div>

              </div>
            )
          })) : (<div className="bg-white p-10 rounded text-center text-gray-500">
            No Projects Found
          </div>)}

        </motion.div>}
        {/**PAGINATION */}
        {loading ? " " :
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        }

      </div>
      {/**ADD PROJECTS */}
      {open && (

        <AnimateModals>

          <CreateProjects onClose={() => setOpen(false)}
            fetchProjects={fetchProjects} />
        </AnimateModals>
      )}
    </div>
  );


}
