import React, {
  useState,
  useEffect,
  useMemo
} from 'react';

import {
  Plus,
  Search,
  Phone,
  Calendar,
  CheckCircle2,
  User2,
  Bell,
  Filter,
  TrendingUp,
  CheckCheck,
  CalendarArrowDown,
  Calendar1,
  MessageSquareText,
  Paperclip,
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon,
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import Pagination from '../components/Pagination';
import LoadingPage from '../components/Dashboard/Loading';
import CreateTask from './createTask.jsx';
import { AnimatePresence, motion } from "framer-motion";
import AnimateModals from '../components/Dashboard/AnimateModals.jsx';
import useTaskfilter from '../Hooks/useTaskfilter.js';

import { staticTasks, staticEmployees } from '../Utils/staticData.js';

export default function Tasks() {
  const [employees, setEmployees] = useState(staticEmployees);
  const [tasks, setTasks] = useState(staticTasks);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState("All");

  const buttons = ["All", "Hot", "Warm", "Cold"];
  const filterdata = useTaskfilter(tasks, search, active);

  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      map[employee.uid || employee.id] = employee.name;
      return map;
    }, { emp_1: "Ragavi M", emp_2: "Karthik Raja", emp_3: "Priya Sharma", emp_4: "Suresh Kumar" });
  }, [employees]);
 
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = filterdata.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil((filterdata.length || 0) / filesPerPage);

  const today = new Date();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'tasks'),
      (snapshot) => {
        const taskList = [];
        snapshot.forEach((doc) => {
          taskList.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        if (taskList.length > 0) {
          setTasks(taskList);
        } else {
          setTasks(staticTasks);
        }
      },
      (err) => {
        console.log(err);
        setTasks(staticTasks);
      }
    );

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
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    return () => unsubscribe();
  }, []);

  const inprogress = tasks.filter((task) =>
    task.status?.toLowerCase() === "in progress"
  );
  const completed = tasks.filter((task) =>
    task.status?.toLowerCase() === "completed"
  );
  const overdue = tasks.filter((task) =>
    new Date(task.dueDate) < new Date()
  );

  const stats = [
    { icon: User2, label: "Total Tasks", value: tasks.length },
    { icon: TrendingUp, label: "In Progress", value: inprogress.length },
    { icon: CheckCheck, label: "Completed", value: completed.length },
    { icon: CalendarArrowDown, label: "Overdue", value: overdue.length },
  ];

  function handleactiveindex(activeindex) {
    setActive(activeindex);
  }

  return (
    <div className="flex max-h-screen overflow-y-auto page-scroll bg-gray-100 w-full">

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 w-full">

        {/* TOPBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-4 sm:px-6 md:px-8 py-4 shadow-sm gap-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#023167]">Tasks Management</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Track and manage your Tasks
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white text-sm font-semibold rounded-lg hover:bg-[#1d508b] transition-all shadow-sm shrink-0"
            >
              <Plus size={16} />
              Add Tasks
            </button>

            <button className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:bg-[#1d508b] transition-colors shrink-0">
              <Filter size={18} className='text-white' />
            </button>

            <button className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:bg-[#1d508b] transition-colors shrink-0">
              <Bell size={18} className='text-white' />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-[#f3f0eb] min-h-screen">

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
                <p className="text-xs sm:text-sm text-gray-500">{s.label}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0b2b57]">
                  {s.value}
                </h2>
              </motion.div>
            ))}
          </div>

          {/* TASK HEADER */}
          <div className="mt-6 bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="font-bold text-base sm:text-lg text-[#0b2b57]">
              <p>Tasks List</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {buttons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => handleactiveindex(btn)}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-xl font-medium transition-all
                        ${active === btn
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

          {/* TASK LIST */}
          <div className="space-y-4">
            {loading ?
              <div className='min-h-[300px] flex items-center justify-center'>
                <LoadingPage />
              </div> :
              currentFiles?.map((task, index) => {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/taskDetails/${task.id}`)}>

                    {/* TOP */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* LEFT */}
                      <div>
                        <h1 className="text-base sm:text-lg font-bold text-[#082f57]">
                          {employeeMap[task.assignedTo] || "Unassigned"}
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-gray-800 font-medium">
                          {task.title || "Redesign onboarding flow for enterprise clients"}
                        </p>
                      </div>

                      {/* RIGHT */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              task.status?.toLowerCase() === "pending"
                                ? "bg-red-100 text-red-600"
                                : task.status?.toLowerCase() === "in progress"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            ● {task.status || "Pending"}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              task.priority?.toLowerCase() === "hot"
                                ? "bg-red-100 text-red-600"
                                : task.priority?.toLowerCase() === "warm"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            ● {task.priority || "Medium"}
                          </span>
                        </div>

                        <div className='text-xs text-gray-500 max-w-[200px] truncate'>
                          Assigned by: {employeeMap[task.assignedEmployee] || "Ragavi"}
                        </div>
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                        <h1 className="text-xs sm:text-sm text-yellow-600 font-semibold min-w-fit">
                          Overall progress
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
                    </div>

                    {/* BOTTOM */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-500">
                      <div
                        className={`flex items-center gap-1.5 ${
                          new Date(task.dueDate) < new Date(today)
                            ? "text-orange-500 font-semibold"
                            : "text-gray-500"
                        }`}
                      >
                        <Calendar1 size={16} />
                        <span>{task.dueDate || "0000-00-00"}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MessageSquareText size={16} />
                          <span>4</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Paperclip size={16} />
                          <span>2</span>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
          </div>

          {/* PAGINATION */}
          {!loading && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      </div>
      {/* ADD TASKS */}
      {open && (
        <AnimateModals>
          <CreateTask onClose={() => setOpen(false)} />
        </AnimateModals>
      )}
    </div>
  );
}