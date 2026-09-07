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
  Pencil,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination.jsx";
import LoadingPage from "../../components/Dashboard/Loading";
import { motion } from "framer-motion";
import AnimateModals from "../../components/Dashboard/AnimateModals.jsx";
import { apiUrl } from "../../config/api.js";

import useTaskfilter from "../../Hooks/useTaskfilter.js";
import useTasks from "../../Hooks/useTaskid.js";
import useEmployees from "../../Hooks/useEmployees.js";

import { useAuth } from "../../context/AuthContext.jsx";

import TaskContribution from "./TaskContribution.jsx";
import TaskActivity from "./TaskActivity.jsx";

export default function Tasks() {

  const { user } = useAuth();
  const { tasks, refetch } = useTasks();
  const { employees } = useEmployees();
  const [search, setSearch] = useState('');
  const [active, setActive] = useState("All");

  const [updatingTask, setUpdatingTask] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    status: "Pending",
    priority: "Cold",
    notes: "",
  });
  const [updating, setUpdating] = useState(false);

  const openUpdateModal = (e, taskItem) => {
    e.stopPropagation();
    setUpdatingTask(taskItem);
    setUpdateFormData({
      status: taskItem.status || "Pending",
      priority: taskItem.priority || "Cold",
      notes: taskItem.notes || "",
    });
  };

  const handleUpdateSave = async () => {
    if (!updatingTask) return;
    const taskId = updatingTask._id || updatingTask.id || updatingTask.uid;
    setUpdating(true);
    try {
      const res = await fetch(apiUrl(`/tasks/${taskId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateFormData),
      });

      if (res.ok) {
        alert("Task updated successfully!");
        setUpdatingTask(null);
        if (refetch) refetch();
      } else {
        alert("Failed to update task.");
      }
    } catch (err) {
      console.error("Error updating task status/priority:", err);
      alert("Failed to update task.");
    } finally {
      setUpdating(false);
    }
  };

  const buttons = ["All", "Hot", "Warm", "Cold", "Pending"];
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

  const inprogress = (tasks || []).filter(
    (task) => (task?.status || "").toLowerCase() === "pending" || (task?.status || "").toLowerCase() === "in progress"
  );
  const completed = (tasks || []).filter(
    (task) => (task?.status || "").toLowerCase() === "completed"
  );

  const overdue = (tasks || []).filter(
    (task) => task?.dueDate && new Date(task.dueDate) < new Date() && (task?.status || "").toLowerCase() !== "completed"
  );

  const stats = [
    { icon: User2, label: "Total Tasks", value: tasks?.length || "0" },
    { icon: Clock2, label: "Pending", value: inprogress.length || "0" },
    { icon: CheckCheck, label: "Completed", value: completed.length || "0" },
    { icon: CalendarArrowDown, label: "Overdue", value: overdue.length || "0" },
  ];

  //SET CURRENT PRIORITY
  function handleactiveindex(activeindex) {
    setActive(activeindex);
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 overflow-y-auto custom-scrollbar pb-12">

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
                  const getPersonName = (val, defaultName = "Unassigned") => {
                    if (!val) return defaultName;
                    if (typeof val === 'object' && val !== null) {
                      return val.name || val.employeeName || val.displayName || val.email || defaultName;
                    }
                    const strVal = String(val).trim();
                    if (!strVal) return defaultName;
                    if (strVal.toLowerCase() === "admin") return "Admin";

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
                      return defaultName;
                    }

                    return strVal;
                  };

                  const assignedToName = getPersonName(task?.assignedTo, "Employee");
                  const assignerName = getPersonName(task?.assignedBy || task?.assignedFrom, "Admin");
                  const taskStatus = task?.status || "Pending";
                  const taskPriority = task?.priority || "Medium";

                  const getStatusBadge = (st) => {
                    const lower = (st || '').toLowerCase();
                    if (lower === 'completed') return 'bg-green-100 text-green-700 border border-green-300';
                    if (lower === 'in progress') return 'bg-blue-100 text-blue-700 border border-blue-300';
                    if (lower === 'pending') return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
                    return 'bg-purple-100 text-purple-700 border border-purple-300';
                  };

                  const getPriorityBadge = (pr) => {
                    const lower = (pr || '').toLowerCase();
                    if (lower === 'hot' || lower === 'high' || lower === 'urgent') return 'bg-red-100 text-red-700 border border-red-300 font-bold';
                    if (lower === 'warm' || lower === 'medium') return 'bg-orange-100 text-orange-700 border border-orange-300';
                    if (lower === 'cold' || lower === 'low') return 'bg-sky-100 text-sky-700 border border-sky-300';
                    return 'bg-gray-100 text-gray-700 border border-gray-300';
                  };

                  return (
                    <motion.div
                      key={task?.id || index}
                      initial={{ opacity: 0, y: 25 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="
                    bg-white
                    border
                    border-gray-200
                    rounded-2xl
                    p-5 md:p-7 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/employee/taskDetails/${task._id || task.id || task.uid}`)}>

                      {/* TOP */}

                      <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-5">

                        {/* LEFT */}

                        <div>

                          <div className="flex flex-wrap items-center gap-4 text-[#082f57]">
                            <h1 className="text-sm md:text-base font-normal">
                              <span className="font-bold tracking-tighter">Assigned To: </span>
                              <span className="font-semibold text-blue-700">{assignedToName}</span>
                            </h1>
                            <span className="text-gray-300">|</span>
                            <h1 className="text-sm md:text-base font-normal">
                              <span className="font-bold tracking-tighter">Assigned By: </span>
                              <span className="font-semibold text-purple-700">{assignerName}</span>
                            </h1>
                          </div>

                          <p className="mt-2 text-lg md:text-xl text-[#082f57]">
                            <span className="font-semibold tracking-tighter"> Task Title: </span> {task.title || "Redesign onboarding flow"}
                          </p>

                        </div>

                        {/* RIGHT */}

                        <div className="flex flex-col items-start xl:items-end gap-4">

                          <div className="flex items-center gap-3 flex-wrap">

                            <div
                              className={`
                              ${getStatusBadge(taskStatus)}
                              px-4
                              py-1.5
                              rounded-full
                              text-sm
                              font-medium
                              flex items-center gap-1.5
                            `}
                            >
                              ● {taskStatus}
                            </div>

                            <div
                              className={`
                              ${getPriorityBadge(taskPriority)}
                              px-4
                              py-1.5
                              rounded-full
                              text-sm
                              font-medium
                              flex items-center gap-1.5
                            `}
                            >
                              ● {taskPriority}
                            </div>

                            <button
                              onClick={(e) => openUpdateModal(e, task)}
                              className="border border-[#2563a9] bg-blue-50 text-[#2563a9] hover:bg-[#2563a9] hover:text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <Pencil size={12} />
                              Update Status
                            </button>

                          </div>

                        </div>

                      </div>

                      {/* PROGRESS */}

                      <div>

                        <div className="flex flex-col md:flex-row md:items-center gap-5">

                          <h1 className="text-xl text-yellow-600 min-w-fit ">
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

      {/** UPDATE STATUS MODAL */}
      {updatingTask && (
        <AnimateModals>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h2 className="text-base font-bold text-[#082f57]">Update Task Status & Priority</h2>
                <button
                  onClick={() => setUpdatingTask(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
                  <select
                    value={updateFormData.status}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Priority</label>
                  <select
                    value={updateFormData.priority}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, priority: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Progress Remarks / Notes</label>
                  <textarea
                    value={updateFormData.notes}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, notes: e.target.value })}
                    rows={3}
                    placeholder="Add progress notes or remarks..."
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setUpdatingTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={updating}
                  onClick={handleUpdateSave}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#2563a9] hover:bg-[#1d4ed8] rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Update"}
                </button>
              </div>
            </div>
          </div>
        </AnimateModals>
      )}
    </div>
  );

};