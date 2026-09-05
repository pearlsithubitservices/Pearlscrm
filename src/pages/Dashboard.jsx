import { useEffect, useState } from 'react';
import { Dashboardskeleton } from "../components/Dashboard/Skeleton.jsx";
import Hotleads from '../components/Dashboard/Hotleads.jsx';
import {
  Users,
  Bell,
  Plus,
  IndianRupee,
  Search,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Employeecomp from '../components/Dashboard/Employeecomp.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import CreateLead from './CreateLead.jsx';
import useLead from '../Hooks/useLead.js';
import { apiUrl } from '../config/api.js';

export default function Dashboard() {
  const [loading, setLoading] = useState(!sessionStorage.getItem("loaded"));
  const { user } = useAuth();
  const { fetchLead, fulllead } = useLead();
  
  const safeFulllead = Array.isArray(fulllead) ? fulllead : [];
  const filteredLeads = safeFulllead.filter((lead) => (lead?.priority?.toLowerCase() === "hot"));

  const leadCounts = safeFulllead.reduce((acc, lead) => {
    if (lead && lead.assignedTo) {
      acc[lead.assignedTo] = (acc[lead.assignedTo] || 0) + 1;
    }
    return acc;
  }, {});

  const [dashboardData, setDashboardData] = useState({
    totalLeads: safeFulllead.length || 0,
    pendingTasks: 0,
    completedTasks: 0,
    recentLeads: [],
    todayTasks: [],
  });
  const [projects, setProjects] = useState([]);

  // Skeleton Timer
  useEffect(() => {
    if (!sessionStorage.getItem("loaded")) {
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("loaded", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch(apiUrl("/dashboard"));
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === 'object' && !data.message) {
            setDashboardData((prev) => ({
              ...prev,
              ...data,
              totalLeads: data.totalLeads || safeFulllead.length || prev.totalLeads,
            }));
          }
        }
      } catch (error) {
        console.log("Error fetching dashboard:", error);
      }
    };
    loadDashboard();
  }, [safeFulllead.length]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch(apiUrl('/projects'));
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching projects for dashboard:', error);
        setProjects([]);
      }
    };

    loadProjects();
  }, []);

  const activeProjects = projects.filter((project) =>
    ['pending', 'in progress'].includes(String(project?.status || '').toLowerCase())
  ).length;
  const completedProjects = projects.filter((project) =>
    String(project?.status || '').toLowerCase() === 'completed'
  ).length;

  const stats = [
    {
      title: 'Total Leads',
      value: dashboardData.totalLeads || safeFulllead.length || 0,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Hot Leads',
      value: filteredLeads.length || 0,
      icon: Briefcase,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Monthly Revenue',
      value: dashboardData.monthlyRevenue ? `₹${Number(dashboardData.monthlyRevenue).toLocaleString('en-IN')}` : '₹0',
      icon: IndianRupee,
      color: 'from-orange-500 to-yellow-500',
    },
    {
      title: 'Project Report',
      value: projects.length,
      detail: `${activeProjects} active · ${completedProjects} completed`,
      icon: Briefcase,
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  const today = new Date();
  const fullDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [open, setOpen] = useState(false);

  return (
    <AnimatePresence mode='wait'>
      {loading ? (
        <motion.div key="skeleton">
          <Dashboardskeleton />
        </motion.div>
      ) : (
        <div key="content" className="text-gray-900 min-h-screen bg-[#f3f0eb] pb-10 font-sans">
          {/* TOPBAR */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl text-[#023167] font-bold">
                Welcome, {user?.displayName || user?.name || user?.email?.split('@')[0] || 'Admin'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {fullDate}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* SEARCH */}
              <div className="flex items-center border border-gray-300 bg-gray-50 rounded-xl px-3 py-2 flex-1 md:w-72">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  className="ml-2 w-full outline-none text-xs sm:text-sm text-gray-800 bg-transparent placeholder-gray-400"
                  placeholder="Search Lead..."
                />
              </div>

              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563a9] font-semibold text-xs sm:text-sm hover:bg-blue-700 transition-all text-white shadow-sm cursor-pointer"
                onClick={() => setOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add Lead
              </button>

              <button
                onClick={() => navigate("/followups")}
                title="Admin Notifications & Follow-up Reminders"
                className="w-9 h-9 rounded-xl bg-[#2563a9] flex items-center justify-center hover:bg-blue-700 transition-all text-white flex-shrink-0 cursor-pointer shadow-sm relative group"
              >
                <Bell size={18} />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between min-h-[130px]"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className='bg-blue-50 text-[#2563a9] rounded-xl w-10 h-10 flex items-center justify-center font-bold'>
                      <item.icon className="w-5 h-5 text-[#2563a9]" />
                    </div>
                    <div className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-bold">
                      ↑ 8.4%
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
                    {item.title}
                  </p>

                  <h2 className="text-3xl sm:text-4xl text-[#0b2b57] font-bold mt-1">
                    {item.value}
                  </h2>
                  {item.detail && (
                    <p className="text-xs text-gray-500 mt-1">{item.detail}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* HOT LEADS & REVENUE PIPELINE */}
          <Hotleads />

          {/* EMPLOYEE ACTIVITY */}
          <Employeecomp leadcounts={leadCounts} />
        </div>
      )}

      {/* ADD LEADS MODAL */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <CreateLead
              fetchleads={fetchLead}
              onClose={() => setOpen(false)}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}