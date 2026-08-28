import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Calendar,
  Users,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  LoaderCircle,
  Paperclip,
  MessageSquareText,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '../../components/Dashboard/Loading';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../context/AuthContext';
import useEmployees from '../../Hooks/useEmployees';
import { apiUrl } from '../../config/api';

export default function EmpProjects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const buttons = ['All', 'Pending', 'On Track', 'At Risk', 'Completed'];

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/projects'));
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching projects for employee:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      const name = employee.name || employee.employeeName || employee.displayName || employee.email;
      if (employee._id) map[employee._id] = name;
      if (employee.uid) map[employee.uid] = name;
      if (employee.id) map[employee.id] = name;
      return map;
    }, {});
  }, [employees]);

  // Filter projects relevant to logged-in employee
  const userProjects = useMemo(() => {
    if (!user) return projects;

    const uId = String(user._id || user.uid || user.id || '').toLowerCase();
    const uEmail = String(user.email || '').toLowerCase();
    const uName = String(user.displayName || user.name || user.employeeName || '').toLowerCase();

    const userSpecific = projects.filter((p) => {
      // Check members list
      const members = Array.isArray(p.members) ? p.members : [];
      const isMember = members.some((m) => {
        if (!m) return false;
        if (typeof m === 'object') {
          const mId = String(m._id || m.id || m.uid || '').toLowerCase();
          const mName = String(m.name || m.employeeName || '').toLowerCase();
          return (uId && mId === uId) || (uName && mName && (mName.includes(uName) || uName.includes(mName)));
        }
        const strM = String(m).toLowerCase();
        return (uId && strM === uId) || (uEmail && strM.includes(uEmail)) || (uName && strM.includes(uName));
      });

      const isAssigned = p.assignedTo && String(p.assignedTo).toLowerCase().includes(uId || uName);
      const isOwner = p.createdBy && String(p.createdBy).toLowerCase().includes(uId || uName);
      const isLeader = p.leader && String(p.leader).toLowerCase().includes(uId || uName);

      return isMember || isAssigned || isOwner || isLeader;
    });

    // If employee is assigned to specific projects return those; fallback to all projects if none specifically matched
    return userSpecific.length > 0 ? userSpecific : projects;
  }, [user, projects]);

  const filteredProjects = useMemo(() => {
    return userProjects.filter((p) => {
      const titleMatch = (p.title || '').toLowerCase().includes(search.toLowerCase());
      const companyMatch = (p.company || '').toLowerCase().includes(search.toLowerCase());
      const matchesSearch = titleMatch || companyMatch;

      const isOverdue = p.dueDate && new Date(p.dueDate) <= new Date();
      const statusStr = (p.status || '').toLowerCase();

      let matchesStatus = true;
      if (buttons[active] === 'Pending') {
        matchesStatus = statusStr === 'pending' || statusStr === 'in progress' || statusStr === 'planning' || (statusStr !== 'completed' && Number(p.progress || 0) < 100);
      } else if (buttons[active] === 'On Track') {
        matchesStatus = !isOverdue && statusStr !== 'completed';
      } else if (buttons[active] === 'At Risk') {
        matchesStatus = isOverdue && statusStr !== 'completed';
      } else if (buttons[active] === 'Completed') {
        matchesStatus = statusStr === 'completed' || Number(p.progress || 0) === 100;
      }

      return matchesSearch && matchesStatus;
    });
  }, [userProjects, search, active]);

  /* PAGINATION */
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = filteredProjects.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredProjects.length / filesPerPage) || 1;

  const pendingCount = userProjects.filter((p) => {
    const st = (p.status || '').toLowerCase();
    return st === 'pending' || st === 'in progress' || st === 'planning' || (st !== 'completed' && Number(p.progress || 0) < 100);
  }).length;

  const onTrackCount = userProjects.filter(
    (p) => new Date(p.dueDate) > new Date() && (p.status || '').toLowerCase() !== 'completed'
  ).length;

  const atRiskCount = userProjects.filter(
    (p) => new Date(p.dueDate) <= new Date() && (p.status || '').toLowerCase() !== 'completed'
  ).length;

  const completedCount = userProjects.filter(
    (p) => (p.status || '').toLowerCase() === 'completed'
  ).length;

  const stats = [
    {
      title: 'My Projects',
      value: userProjects.length,
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Pending',
      value: pendingCount,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'On Track',
      value: onTrackCount,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'At Risk',
      value: atRiskCount,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <div className="flex max-h-screen overflow-y-auto custom-scrollbar bg-[#f3f0eb] overflow-x-hidden">
      <div className="flex-1 flex flex-col min-h-screen">
        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#023167] tracking-tight">
              MY PROJECTS
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Monitor active project milestones, progress, and team deliverables
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6 lg:p-8 space-y-6 flex-1">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200/80 shadow-2xs"
              >
                <div className={`${s.bg} ${s.color} rounded-xl w-10 h-10 flex items-center justify-center mb-3`}>
                  <s.icon size={20} />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{s.title}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#0b2b57] mt-1">{s.value}</h2>
              </motion.div>
            ))}
          </div>

          {/* FILTER BAR */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200/80 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between gap-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h1 className="font-bold text-lg md:text-xl text-[#0b2b57] tracking-tight shrink-0">
                PROJECT PORTFOLIO
              </h1>

              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                {buttons.map((btn, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActive(index);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      active === index
                        ? 'bg-[#2563a9] text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>

            {/* SEARCH */}
            <div className="flex items-center bg-gray-100 rounded-xl px-3.5 py-2 text-xs border border-gray-200/60 min-w-[240px]">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search project or company..."
                className="ml-2 bg-transparent outline-none w-full text-xs text-gray-800"
              />
            </div>
          </div>

          {/* PROJECT LIST CARDS */}
          {loading ? (
            <div className="h-64 flex items-center justify-center bg-white rounded-2xl">
              <LoadingPage />
            </div>
          ) : currentFiles.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl text-center text-gray-500 border border-gray-200/80">
              No projects found matching filter.
            </div>
          ) : (
            <div className="max-h-[620px] overflow-y-auto pr-2 no-scrollbar">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {currentFiles.map((p) => {
                  const isOverdue = p.dueDate && new Date(p.dueDate) <= new Date();
                  const progressVal = Number(p.progress) || 0;

                  return (
                    <div
                      key={p._id || p.id}
                      onClick={() => navigate(`/employee/projectDetails/${p._id || p.id}`)}
                      className="bg-white border border-gray-200/80 p-5 md:p-6 rounded-2xl hover:border-blue-300 transition-all cursor-pointer shadow-2xs space-y-4"
                    >
                      {/* CARD HEADER */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-gray-100">
                        <div>
                          <h3 className="text-lg font-bold text-[#0b2b57]">
                            {p.title || 'Untitled Project'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Company: <span className="font-semibold text-gray-700">{p.company || 'Pearls Client'}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold ${
                              (p.status || '').toLowerCase() === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : (p.status || '').toLowerCase() === 'in progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            ● {p.status || 'Active'}
                          </span>

                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold ${
                              isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isOverdue ? 'At Risk' : 'On Track'}
                          </span>
                        </div>
                      </div>

                      {/* PROGRESS BAR & STATS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                            <span>Overall Progress</span>
                            <span className="text-blue-700 font-bold">{progressVal}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressVal}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-6 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5 font-medium">
                            <MessageSquareText size={16} className="text-gray-400" />
                            <span>Comments: {p.notes?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <Paperclip size={16} className="text-gray-400" />
                            <span>Docs: {p.documents?.length || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* CARD FOOTER (MEMBERS & DUE DATE) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#2563a9]">Team Members:</span>
                          <div className="flex -space-x-2 overflow-hidden">
                            {Array.isArray(p.members) && p.members.length > 0 ? (
                              p.members.slice(0, 5).map((m, idx) => {
                                const nameStr =
                                  typeof m === 'object'
                                    ? m.name || m.employeeName
                                    : employeeMap[m] || String(m);

                                const initial = (nameStr || 'M').charAt(0).toUpperCase();

                                return (
                                  <div
                                    key={idx}
                                    title={nameStr}
                                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-2xs"
                                  >
                                    {initial}
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-xs text-gray-400 italic">No assigned members</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                          <Calendar size={16} className="text-[#0b2b57]" />
                          <span>Due: {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'No Due Date'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          )}

          {/* PAGINATION */}
          {!loading && (
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          )}
        </div>
      </div>
    </div>
  );
}
