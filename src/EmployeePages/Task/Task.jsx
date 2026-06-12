import React, { useState } from "react";

import {
  Search,
  User2,
  Bell,
  CheckCheck,
  CalendarArrowDown,
  Calendar1,
  MessageSquareText,
  Paperclip,
  Clock2,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination.jsx";
import LoadingPage from "../../components/Dashboard/Loading";
import { motion } from "framer-motion";
import AnimateModals from "../../components/Dashboard/AnimateModals.jsx";

import useTaskfilter from "../../Hooks/useTaskfilter.js";
import useTasks from "../../Hooks/useTaskid.js";
import useEmployees from "../../Hooks/useEmployees.js";

import { useAuth } from "../../context/AuthContext.jsx";

import TaskContribution from "./TaskContribution.jsx";
import TaskActivity from "./TaskActivity.jsx";

export default function Tasks() {

  const { user } = useAuth();
  const userId="LNcFHaGpEjOFFyav5qLQ42qZWyf2"
  const { tasks } = useTasks(userId);
  const { employees } = useEmployees();
  console.log(employees);
  const [search, setSearch] =
    useState('');

  const [active, setActive] = useState("All");

  const buttons = ["All", "Hot", "Warm", "Cold"];
  const filterdata = useTaskfilter(tasks, search, active);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 3;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = filterdata?.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filterdata?.length / filesPerPage);
  const today = new Date();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);


  console.log(tasks);
  console.log(employees);

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
    { icon: User2, label: "Total Tasks", value: tasks.length || "0" },
    { icon: Clock2, label: "Pending", value: inprogress.length || "0" },
    { icon: CheckCheck, label: "Completed", value: completed.length || "0" },
    { icon: CalendarArrowDown, label: "Overdue", value: overdue.length || "0" },
  ];

  //SET CURRENT PRIORITY
  function handleactiveindex(activeindex) {
    setActive(activeindex);
  }


  return (
    <div className="flex max-h-screen bg-gray-100 overflow-y-auto no-scrollbar">

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="flex  items-center justify-between bg-white p-4 shadow-sm">

          <div>
            <h2 className="text-xl font-bold text-[#023167] ">My Tasks</h2>
            <p className="text-[10px]  text-gray-500">
              Manage and update Your  tasks here
            </p>
          </div>
          <div className="flex items-center gap-3">


            <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
              <Bell size={18} className='text-white' />
            </button>
            <button className="p-2  border border-gray-200 rounded-lg bg-red-600 text-white hover:scale-110 transition-transform duration-300">
              <X size={18} className='text-white' onClick={() => navigate(-1)} />
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
              currentFiles.length == 0 ? <div className='font-bold bg-white h-[250px] flex justify-center items-center'>
                <h3>No Data</h3></div> : currentFiles.map((task, index) => {
                  const employeename = employees.find(
                    (emp) => emp.id === task.assignedTo
                  );
                  console.log(employeename);
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
                      onClick={() => navigate(`/employee/taskDetails/${task.uid}`)}>

                      {/* TOP */}

                      <div className="flex flex-row w-full justify-between lg:flex-row lg:items-center lg:justify-between gap-5">

                        {/* LEFT */}

                        <div>

                          <h1 className="text-sm md:text-xl font-normal text-[#082f57]">
                            <span className="font-bold tracking-tighter">Project Name: </span>{task.assignedEmployee || " Ragavi"}
                          </h1>

                          <p className="mt-1 text-lg md:text-xl text-[#082f57]">
                            <span className="font-semibold tracking-tighter"> Task Title: </span> {task.title || " Redesign onboarding flow for enterprise clients"}
                          </p>

                        </div>

                        {/* RIGHT */}

                        <div className="flex flex-col items-start xl:items-end gap-4">

                          <div className="flex items-center gap-3 flex-wrap">

                            <div
                              className={`
                            ${task.status.toLowerCase() === "pending" ? "bg-red-200 text-red-600" : task.status.toLowerCase() === "in progress" ? "bg-yellow-200 text-yellow-700" : "bg-green-200 text-green-800"}
                            
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
                            ${task.priority.toLowerCase() === "hot" ? "bg-red-200 text-red-600" : task.priority.toLowerCase() === "warm" ? "bg-yellow-200 text-yellow-700" : "bg-green-200 text-green-800"}
                            px-4
                            py-2
                            rounded-full
                            text-sm
                          
                          `}
                            >
                              ● {task.priority || "Medium"}
                            </div>

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

                      <div className="flex flex-wrap items-center justify-end gap-5  text-gray-500">

                        <div
                          className={`
                        flex items-center gap-2 text-lg
                        ${new Date(task.dueDate) < new Date(today)
                              ? "text-orange-500"
                              : "text-gray-500"
                            }
                      `}
                        >

                          <Calendar1 size={18} />
                          {task.dueDate || "0000-00-00"}

                        </div>

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
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch '>
            <div className='h-full'>
              <TaskContribution />
            </div>
            <div className='h-full mt-4'>
              <TaskActivity />
            </div>
          </div>
        </div>
      </div>
      {/**ADD TASKS */}
      {open && (
        <AnimateModals>
          <CreateTask onClose={() => setOpen(false)} />
        </AnimateModals>
      )}
    </div>
  );

};