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
  getDocs,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { apiUrl } from '../config/api';
import { socket } from '../config/socket';
import Pagination from '../components/Pagination';
import LoadingPage from '../components/Dashboard/Loading';
import CreateTask from './createTask.jsx'
import { AnimatePresence, motion } from "framer-motion";
import AnimateModals from '../components/Dashboard/AnimateModals.jsx';
import useTaskfilter from '../Hooks/useTaskfilter.js'

export default function Tasks() {
  const [employees, setEmployees] =
    useState([]);

  const [tasks, setTasks] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [active, setActive] = useState("All");

  const buttons = ["All", "Hot", "Warm", "Cold", "Pending"];
  const q = search.toLowerCase();
  const selectedactive = buttons[active];

  const filterdata = useTaskfilter(tasks, search, active);
  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      const name = employee.name || employee.employeeName || employee.displayName || employee.email;
      if (employee._id) map[employee._id] = name;
      if (employee.uid) map[employee.uid] = name;
      if (employee.id) map[employee.id] = name;
      return map;
    }, {});
  }, [employees]);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const getDisplayName = (val, fallback = "Unassigned") => {
    if (!val) return fallback;
    if (typeof val === 'object' && val !== null) {
      return val.name || val.employeeName || val.displayName || val.email || fallback;
    }
    const strVal = String(val).trim();
    if (!strVal) return fallback;
    if (strVal.toLowerCase() === "admin") return "Admin";

    if (employeeMap[strVal]) {
      const matched = employeeMap[strVal];
      if (typeof matched === 'string' && matched) return matched;
      if (typeof matched === 'object' && matched !== null) {
        return matched.name || matched.employeeName || matched.displayName || matched.email || fallback;
      }
    }

    const lowerVal = strVal.toLowerCase();
    const found = (employees || []).find((emp) => {
      if (!emp) return false;
      const eId = String(emp._id || emp.id || emp.uid || "").toLowerCase();
      const eEmail = String(emp.email || "").toLowerCase();
      const eName = String(emp.employeeName || emp.name || emp.displayName || "").toLowerCase();
      return (
        (eId && eId === lowerVal) ||
        (eEmail && eEmail === lowerVal) ||
        (eEmail && lowerVal.includes(eEmail)) ||
        (eName && eName === lowerVal) ||
        (eName && lowerVal.includes(eName))
      );
    });

    if (found) {
      return found.employeeName || found.name || found.displayName || (found.email ? found.email.split("@")[0] : strVal);
    }

    if (strVal.includes("@")) {
      const prefix = strVal.split("@")[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    const isRawId = /^[0-9a-fA-F]{24}$/.test(strVal) || /^[A-Za-z0-9_-]{20,}$/.test(strVal);
    if (isRawId) {
      return fallback;
    }

    return strVal;
  };

  const currentFiles = filterdata.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filterdata.length / filesPerPage);

  const today = new Date();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const fetchTasksData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch(apiUrl('/tasks'));
      if (res.ok) {
        const data = await res.json();
        const taskList = (Array.isArray(data) ? data : []).map((t) => ({
          ...t,
          id: t._id || t.id,
        }));
        setTasks(taskList);
      }
    } catch (err) {
      console.error('Error fetching tasks from MongoDB API:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const fetchEmployeesData = async () => {
    let apiEmployees = [];
    try {
      const res = await fetch(apiUrl('/employees'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          apiEmployees = data;
        }
      }
    } catch (err) {
      console.log("Error fetching employees from API, using Firestore fallback:", err);
    }

    let firestoreEmployees = [];
    try {
      const snapshot = await getDocs(collection(db, 'employees'));
      snapshot.forEach((doc) => {
        firestoreEmployees.push({
          id: doc.id,
          _id: doc.id,
          uid: doc.data().uid || doc.id,
          name: doc.data().name || doc.data().employeeName || doc.data().email || "Employee",
          ...doc.data(),
        });
      });
    } catch (error) {
      console.log("Error fetching employees from Firestore:", error);
    }

    setEmployees([...apiEmployees, ...firestoreEmployees]);
  };

  useEffect(() => {
    fetchTasksData();
    fetchEmployeesData();

    if (socket) {
      const handleTaskUpdated = () => {
        fetchTasksData(true);
      };
      socket.on("taskUpdated", handleTaskUpdated);
      socket.on("taskCreated", handleTaskUpdated);
      return () => {
        socket.off("taskUpdated", handleTaskUpdated);
        socket.off("taskCreated", handleTaskUpdated);
      };
    }
  }, []);



  //SEARCH FILTER



  //STATS

  const inprogress = tasks.filter((task) =>
    task.status.toLowerCase() === "in progress"
  );
  const completed = tasks.filter((task) =>
    task.status.toLowerCase() === "completed"
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

  //SET CURRENT PRIORITY
  function handleactiveindex(activeindex) {
    setActive(activeindex);
  }



  const filteredTasks =
    tasks.filter((task) =>

      task.company
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||

      task.assignedEmployee
        ?.toLowerCase()
        .includes(search.toLowerCase())

    );


  return (
    <div className="w-full min-h-screen overflow-y-auto custom-scrollbar bg-gray-100 pb-12">

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="flex  items-center justify-between bg-white p-4 shadow-sm">

          <div>
            <h2 className="text-xl font-bold text-[#023167] ">Tasks Management</h2>
            <p className="text-[10px] ml-6 text-gray-500">
              Track and manage your Tasks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white rounded hover:scale-105 transition-transform duration-300"
            >
              <Plus size={16} />
              Add Tasks
            </button>

            <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
              <Filter size={18} className='text-white' />
            </button>

            <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
              <Bell size={18} className='text-white' />
            </button>

          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6 bg-[#f3f0eb]">

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
                <p className="text-sm text-gray-500">{s.label}</p>
                <h2 className="text-2xl font-bold text-[#0b2b57]">
                  {s.value}
                </h2>
              </motion.div>
            ))}

          </div>

          {/* TASK HEADER */}
          <div className="mt-6 bg-white p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className=" font-bold text-xl text-[#0b2b57]"  >
              <p>Tasks List</p>
            </div>

            <div className="flex gap-3">
              {buttons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => handleactiveindex(btn)}
                  className={`px-4  rounded-xl font-medium transition-all
                        ${active === btn
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
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 w-full outline-none text-sm bg-gray-200"
                placeholder="Search Lead.."
              />
            </div>

          </div>

          {/* TASK LIST */}
          <div className="space-y-5 mt-5">

            {loading ?
              <div className='h-screen '>
                <LoadingPage />
              </div> :
              currentFiles?.map((task, index) => {
                const employeename = employees.find(
                  (emp) => emp.uid === task.assignedEmployee
                );

                const employeeByname = employees.find(
                  (emp) => emp.uid === task.assignedBy
                );

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="
                    bg-white
                    border
                    border-gray-200
                    rounded-2xl
                    p-5 md:p-7"
                    onClick={() => navigate(`/taskDetails/${task.id}`)}>

                    {/* TOP */}

                    <div className="flex flex-row w-full justify-between lg:flex-row lg:items-center lg:justify-between gap-5">

                      {/* LEFT */}

                      <div>

                        <h1 className="text-sm md:text-xl font-bold text-[#082f57]">
                          {getDisplayName(task.assignedTo, "Unassigned")}
                        </h1>

                        <p className="mt-1 text-lg md:text-xl">
                          {task.title || " "}
                        </p>

                      </div>

                      {/* RIGHT */}

                      <div className="flex flex-col items-start xl:items-end gap-4">

                        <div className="flex items-center gap-3 flex-wrap">

                          <div
                            className={`
                            ${(task.status || '').toLowerCase() === "pending" ? "bg-red-200 text-red-600" : (task.status || '').toLowerCase() === "in progress" ? "bg-yellow-200 text-yellow-700" : "bg-green-200 text-green-800"}
                            
                            px-4
                            py-2
                            rounded-full
                            text-sm
                            bg-blue-100
                            text-blue-500
                          `}
                          >
                            ● {task.status || "Pending"}
                          </div>

                          <div
                            className={`
                            ${(task.priority || '').toLowerCase() === "hot" ? "bg-red-200 text-red-600" : (task.priority || '').toLowerCase() === "warm" ? "bg-yellow-200 text-yellow-700" : "bg-green-200 text-green-800"}
                            px-4
                            py-2
                            rounded-full
                            text-sm
                          
                          `}
                          >
                            ● {task.priority || "Medium"}
                          </div>

                        </div>
                        <div className='overflow-hidden w-[180px]'>
                          <p className="text-gray-500 text-md mr-2 overflow-hidden ">
                            Assigned by : {getDisplayName(task.assignedBy, "Admin")}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* PROGRESS */}

                    <div>

                      <div className="flex flex-col md:flex-row md:items-center gap-5">

                        <h1 className="text-xl text-yellow-600 min-w-fit">
                          Overall progress
                        </h1>

                        <div className="w-[500px] h-2 bg-gray-200 rounded-full overflow-hidden">

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

                    <div className="flex flex-wrap items-center justify-end gap-5 text-gray-500">

                      {(() => {
                        const hasDate = Boolean(task.dueDate);
                        const d = hasDate ? new Date(task.dueDate) : null;
                        const formattedDate = d && !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : (task.dueDate || "No Due Date");
                        const now = new Date();
                        now.setHours(0,0,0,0);
                        const overdueFlag = d && !isNaN(d.getTime()) && d < now && (task.status || '').toLowerCase() !== 'completed';

                        return (
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${overdueFlag ? "bg-red-50 border-red-300 text-red-600" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                              <Calendar1 size={16} />
                              <span>{formattedDate}</span>
                            </div>
                            {overdueFlag && (
                              <span className="bg-red-600 text-white text-xs px-2.5 py-1 rounded-md font-bold tracking-wide animate-pulse">
                                OVERDUE
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      <div className="flex items-center gap-2 text-lg">

                        <MessageSquareText size={18} />
                        4

                      </div>

                      <div className="flex items-center gap-2 text-lg">

                        <Paperclip size={18} />
                        2

                      </div>

                    </div>

                  </motion.div>

                )
              })}

          </div>
          {/**PAGINATION */}
          {loading ? " " :
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          }
        </div>
      </div>
      {/**ADD TASKS */}
      {open && (
        <AnimateModals>
          <CreateTask onClose={() => setOpen(false)} onSuccess={() => { setOpen(false); fetchTasksData(); }} />
        </AnimateModals>
      )}
    </div>
  );

};