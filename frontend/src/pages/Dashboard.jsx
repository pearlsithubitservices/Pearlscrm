import { useEffect, useState } from 'react';
import { Dashboardskeleton } from "../components/Dashboard/Skeleton.jsx";
import Hotleads from '../components/Dashboard/Hotleads.jsx';
import {
  ArrowUpRight,
  Users,
  Bell,
  Plus,
  IndianRupee,
  Search,
  Briefcase,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CheckSquare,
  CircleUser,
  CreditCard,
  FileSignature,
  FileText,
  FolderOpen,
  KanbanSquare,
  Landmark,
  Mail,
  Megaphone,
  NotebookPen,
  Share2,
  Video,
  Clock3,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIndustry } from '../context/IndustryContext';
import { canAccessAdminModule } from '../data/departmentModuleAccess';
import Employeecomp from '../components/Dashboard/Employeecomp.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import CreateLead from './CreateLead.jsx';
import useLead from '../Hooks/useLead.js';
import { apiUrl } from '../config/api.js';
import { useNavigate } from 'react-router-dom';

const moduleGroups = [
  {
    title: 'Core CRM',
    icon: Briefcase,
    theme: 'blue',
    modules: [
      { name: 'Leads', path: '/leads', icon: Users, access: 'leads' },
      { name: 'Tasks', path: '/tasks', icon: CheckSquare, access: 'tasks' },
      { name: 'Follow-ups', path: '/follow-ups', icon: CalendarDays, access: 'followUps' },
      { name: 'Projects', path: '/projects', icon: FolderOpen, access: 'projects' },
      { name: 'Boards', path: '/boards', icon: KanbanSquare },
      { name: 'Attendance Management', path: '/attendance-management', icon: Clock3, access: 'attendance' },
      { name: 'Communication', path: '/communication', icon: Megaphone },
      { name: 'Collaboration', path: '/collaboration', icon: Share2 },
      { name: 'Meetings', path: '/meeting', icon: Video },
      { name: 'Web Mail', path: '/web-mail', icon: Mail },
      { name: 'E-Signature', path: '/e-signature', icon: FileSignature, access: 'esignature' },
    ],
  },
  {
    title: 'People & Operations',
    icon: Landmark,
    theme: 'emerald',
    modules: [
      { name: 'Leave Management', path: '/leave', icon: NotebookPen, access: 'leave' },
      { name: 'Payroll & Benefits', path: '/admin-payroll', icon: Landmark, access: 'payroll' },
      { name: 'Performance & Growth', path: '/admin-performance', icon: ChartNoAxesColumnIncreasing, access: 'performance' },
      { name: 'Client Management', path: '/clientmanagement', icon: CircleUser, access: 'clients' },
      { name: 'Employee Management', path: '/employees', icon: Users, access: 'employees' },
      { name: 'Payments', path: '/payments', icon: CreditCard, access: 'payroll' },
      { name: 'Reports', path: '/reports', icon: FileText, access: 'reports' },
    ],
  },
];

const moduleThemeClasses = {
  blue: { accent: 'bg-blue-50 text-blue-700', hover: 'hover:border-blue-300' },
  emerald: { accent: 'bg-emerald-50 text-emerald-700', hover: 'hover:border-emerald-300' },
};

export default function Dashboard() {
  const [loading, setLoading] = useState(!sessionStorage.getItem("loaded"));
  const { user } = useAuth();
  const { config } = useIndustry();
  const navigate = useNavigate();
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
  const [presentEmployees, setPresentEmployees] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState(false);
  const [employeesOnLeave, setEmployeesOnLeave] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [leaveError, setLeaveError] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    const loadPresentEmployees = async () => {
      try {
        const response = await fetch(apiUrl('/empattendancenew'));
        if (!response.ok) throw new Error('Failed to fetch attendance');

        const payload = await response.json();
        const records = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload) ? payload : [];
        const now = new Date();
        const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const todaysPresent = records.filter((record) => {
          const dateValue = record.date || record.clockIn || record.createdAt;
          const attendanceDate = dateValue ? new Date(dateValue) : null;
          if (!attendanceDate || Number.isNaN(attendanceDate.getTime())) return false;

          const recordDayKey = `${attendanceDate.getFullYear()}-${String(attendanceDate.getMonth() + 1).padStart(2, '0')}-${String(attendanceDate.getDate()).padStart(2, '0')}`;
          const state = String(record.attendanceState || '').toLowerCase();
          const status = String(record.status || '').toLowerCase();

          return recordDayKey === todayKey && (
            state === 'working' || state === 'break' || status === 'present'
          );
        }).sort((first, second) =>
          String(first.employee_name || '').localeCompare(String(second.employee_name || ''))
        );

        if (isMounted) {
          setPresentEmployees(todaysPresent);
          setAttendanceError(false);
        }
      } catch (error) {
        console.error('Error fetching today attendance:', error);
        if (isMounted) setAttendanceError(true);
      } finally {
        if (isMounted) setAttendanceLoading(false);
      }
    };

    loadPresentEmployees();
    const interval = setInterval(loadPresentEmployees, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadEmployeesOnLeave = async () => {
      try {
        const response = await fetch(apiUrl('/leave'));
        if (!response.ok) throw new Error('Failed to fetch leave requests');

        const payload = await response.json();
        const records = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const approvedLeaves = records.filter((leave) => {
          if (String(leave.status || '').toLowerCase() !== 'approved') return false;

          const startDate = new Date(leave.leaveFrom);
          const endDate = new Date(leave.leaveTo);
          if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return false;

          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          return today >= startDate && today <= endDate;
        }).sort((first, second) =>
          String(first.employeeName || '').localeCompare(String(second.employeeName || ''))
        );

        if (isMounted) {
          setEmployeesOnLeave(approvedLeaves);
          setLeaveError(false);
        }
      } catch (error) {
        console.error('Error fetching today leave requests:', error);
        if (isMounted) setLeaveError(true);
      } finally {
        if (isMounted) setLeaveLoading(false);
      }
    };

    loadEmployeesOnLeave();
    const interval = setInterval(loadEmployeesOnLeave, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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

  const department = user?.department || user?.profile?.department;
  const visibleModuleGroups = moduleGroups.map((group) => ({
    ...group,
    modules: group.modules.filter((module) =>
      !module.access || canAccessAdminModule(module.access, department)
    ),
  })).filter((group) => group.modules.length > 0);
  const visibleModuleCount = visibleModuleGroups.reduce(
    (count, group) => count + group.modules.length,
    0
  );

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

            <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm" aria-label="Employees present today">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <UserCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-[#0b2b57]">Present Today</h2>
                    <p className="text-xs text-gray-500">Live attendance overview</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                  {attendanceLoading ? '...' : presentEmployees.length}
                </span>
              </div>

              {attendanceLoading ? (
                <p className="py-6 text-center text-sm text-gray-500">Loading attendance...</p>
              ) : attendanceError ? (
                <p className="py-6 text-center text-sm text-rose-600">Attendance could not be loaded.</p>
              ) : presentEmployees.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">No employees marked present today.</p>
              ) : (
                <div className="mt-2 grid max-h-80 grid-cols-1 gap-x-6 overflow-y-auto sm:grid-cols-2">
                  {presentEmployees.map((employee, index) => {
                    const name = employee.employee_name || 'Employee';
                    const state = String(employee.attendanceState || '').toLowerCase();
                    const statusLabel = state === 'working'
                      ? 'Working'
                      : state === 'break' ? 'On break' : 'Present';

                    return (
                      <div
                        key={employee._id || employee.employee_uid || `${name}-${index}`}
                        className="flex min-w-0 items-center gap-3 border-b border-gray-100 py-3"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf4fb] text-xs font-bold text-[#2563a9]">
                          {name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800">{name}</p>
                          <p className="text-xs text-gray-500">
                            {employee.clockIn
                              ? `Checked in ${new Date(employee.clockIn).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                              : employee.department || 'Attendance recorded'}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          state === 'break'
                            ? 'bg-amber-50 text-amber-700'
                            : state === 'working'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-blue-50 text-blue-700'
                        }`}>
                          {statusLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm" aria-label="Employees on leave today">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-[#0b2b57]">On Leave Today</h2>
                    <p className="text-xs text-gray-500">Approved leave requests</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                  {leaveLoading ? '...' : employeesOnLeave.length}
                </span>
              </div>

              {leaveLoading ? (
                <p className="py-6 text-center text-sm text-gray-500">Loading leave records...</p>
              ) : leaveError ? (
                <p className="py-6 text-center text-sm text-rose-600">Leave records could not be loaded.</p>
              ) : employeesOnLeave.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">No approved leave today.</p>
              ) : (
                <div className="mt-2 grid max-h-80 grid-cols-1 gap-x-6 overflow-y-auto sm:grid-cols-2">
                  {employeesOnLeave.map((leave) => {
                    const name = leave.employeeName || 'Employee';
                    return (
                      <div
                        key={leave._id}
                        className="flex min-w-0 items-center gap-3 border-b border-gray-100 py-3"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-700">
                          {name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800">{name}</p>
                          <p className="truncate text-xs text-gray-500">
                            {leave.leaveType || leave.leaveTitle || leave.department || 'Approved leave'}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Approved
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
            </div>

            <section className="mt-10" aria-label="CRM modules">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2563a9]">Workspace</p>
                  <h2 className="text-xl font-bold text-[#0b2b57] mt-1">Module Directory</h2>
                </div>
                <span className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                  {visibleModuleCount} modules
                </span>
              </div>

              <div className="space-y-7">
                {visibleModuleGroups.map((group) => (
                  <div key={group.title}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${moduleThemeClasses[group.theme].accent}`}>
                        <group.icon className="h-4 w-4" />
                      </span>
                      <h3 className="text-sm font-bold text-gray-800">{group.title}</h3>
                      <span className="text-xs text-gray-400">{group.modules.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {group.modules.map((module) => (
                        <button
                          key={module.path}
                          type="button"
                          onClick={() => navigate(module.path)}
                          title={module.name}
                          aria-label={`Open ${module.name}`}
                          className={`group flex min-h-[76px] items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563a9] ${moduleThemeClasses[group.theme].hover}`}
                        >
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${moduleThemeClasses[group.theme].accent}`}>
                            <module.icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1 text-sm font-semibold leading-5 text-gray-800">
                            {module.name === 'Leads' ? config.labels.leads : module.name}
                          </span>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
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