import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  X,
  Calendar,
  Layers,
  ChevronRight,
  Filter
} from "lucide-react";
import { apiUrl } from "../../config/api";
import { socket } from "../../config/socket";
import useEmployees from "../../Hooks/useEmployees";

export default function ProjectTasks({ projects, project, fetchProjects, user, isLeader }) {
  const currentProject = project || (projects && projects[0]) || {};
  const { employees } = useEmployees();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "High",
    dueDate: "",
  });

  const fetchProjectTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl("/tasks"));
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching tasks for project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectTasks();

    if (socket) {
      const handleSync = () => fetchProjectTasks();
      socket.on("taskCreated", handleSync);
      socket.on("taskUpdated", handleSync);
      return () => {
        socket.off("taskCreated", handleSync);
        socket.off("taskUpdated", handleSync);
      };
    }
  }, [currentProject._id]);

  // Filter tasks belonging to this specific project
  const projectTasks = useMemo(() => {
    if (!currentProject._id) return [];
    const pId = String(currentProject._id);
    const pTitle = (currentProject.title || "").toLowerCase();

    return tasks.filter((t) => {
      if (t.projectId && String(t.projectId) === pId) return true;
      // Fallback matching if task description or notes contain project title
      if (pTitle && t.description && t.description.toLowerCase().includes(pTitle)) return true;
      if (pTitle && t.title && t.title.toLowerCase().includes(`[${pTitle}]`)) return true;
      return false;
    });
  }, [tasks, currentProject]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    try {
      const uploaderName = user?.displayName || user?.name || user?.employeeName || "Admin";

      const res = await fetch(apiUrl("/tasks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.title.trim(),
          description: newTask.description,
          assignedTo: newTask.assignedTo || "Unassigned",
          assignedBy: uploaderName,
          priority: newTask.priority,
          status: "Pending",
          dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
          projectId: currentProject._id,
        }),
      });

      if (res.ok) {
        setNewTask({
          title: "",
          description: "",
          assignedTo: "",
          priority: "High",
          dueDate: "",
        });
        setIsModalOpen(false);
        fetchProjectTasks();
      } else {
        alert("Failed to create task");
      }
    } catch (err) {
      console.error("Error creating project task:", err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetch(apiUrl(`/tasks/${taskId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchProjectTasks();
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const completedCount = projectTasks.filter((t) => (t.status || "").toLowerCase() === "completed").length;

  return (
    <div className="w-full rounded-[28px] bg-[#F5F3EF] p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base md:text-lg font-bold text-[#0B2D57] flex items-center gap-2">
            <CheckSquare size={20} className="text-[#2563a9]" />
            PROJECT TASKS ({completedCount} / {projectTasks.length} COMPLETED)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Track, assign, and manage team tasks linked to this project
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#2563a9] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Project Task</span>
        </button>
      </div>

      {/* Task List Cards */}
      {projectTasks.length > 0 ? (
        <div className="space-y-3">
          {projectTasks.map((t, index) => {
            const isCompleted = (t.status || "").toLowerCase() === "completed";
            const empName = typeof t.assignedTo === "object"
              ? (t.assignedTo?.name || t.assignedTo?.employeeName)
              : (t.assignedTo || "Unassigned");

            return (
              <motion.div
                key={t._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`bg-white p-4 md:p-5 rounded-2xl border transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted ? "border-gray-200 bg-gray-50/50" : "border-gray-200/80 hover:border-blue-300"
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => handleStatusChange(t._id, isCompleted ? "Pending" : "Completed")}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition cursor-pointer ${
                      isCompleted ? "bg-emerald-600 text-white" : "border-2 border-gray-300 hover:border-blue-500"
                    }`}
                  >
                    {isCompleted && <CheckCircle2 size={16} />}
                  </button>

                  <div className="space-y-1 flex-1">
                    <h3 className={`font-bold text-sm md:text-base ${isCompleted ? "line-through text-gray-400" : "text-[#0B2D57]"}`}>
                      {t.title}
                    </h3>
                    {t.description && (
                      <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                        {t.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 pt-1 flex-wrap text-xs text-gray-500">
                      <span className="flex items-center gap-1 font-medium">
                        <User size={14} className="text-gray-400" />
                        <span>Assigned: <strong className="text-gray-700">{empName}</strong></span>
                      </span>

                      {t.dueDate && (
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar size={14} className="text-gray-400" />
                          <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold ${
                      (t.priority || "").toLowerCase() === "hot" || (t.priority || "").toLowerCase() === "high"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {t.priority || "Normal"} Priority
                  </span>

                  <select
                    value={t.status || "Pending"}
                    onChange={(e) => handleStatusChange(t._id, e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-xl border bg-gray-50 text-gray-700 font-bold outline-none cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl text-center border border-gray-200/80 space-y-3">
          <CheckSquare size={36} className="mx-auto text-gray-300" />
          <p className="text-gray-500 font-medium text-sm">
            No specific tasks created for this project yet.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-50 text-[#2563a9] font-bold text-xs hover:bg-blue-100 transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Create First Task</span>
          </button>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto modal-scrollbar"
            >
              <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                <h3 className="font-bold text-lg text-[#0B2D57] flex items-center gap-2">
                  <CheckSquare size={18} className="text-[#2563a9]" />
                  Add New Project Task
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-rose-500 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-semibold text-gray-700">
                <div>
                  <label className="block mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g. Design UI Mockups / Build API Endpoint"
                    className="w-full border rounded-xl p-3 outline-none font-normal bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block mb-1">Task Description</label>
                  <textarea
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Details about task requirements..."
                    className="w-full border rounded-xl p-3 outline-none font-normal bg-gray-50 focus:bg-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Assign To Member</label>
                    <select
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      className="w-full border rounded-xl p-3 outline-none font-normal bg-gray-50"
                    >
                      <option value="">Select Employee...</option>
                      {employees.map((emp) => {
                        const eId = emp._id || emp.uid || emp.id;
                        const eName = emp.name || emp.employeeName || emp.email;
                        return (
                          <option key={eId} value={eId}>
                            {eName}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full border rounded-xl p-3 outline-none font-normal bg-gray-50"
                    >
                      <option value="High">⚡ High</option>
                      <option value="Medium">⚡ Medium</option>
                      <option value="Low">🌱 Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full border rounded-xl p-3 outline-none font-normal bg-gray-50"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border text-gray-600 hover:bg-gray-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#2563a9] hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Plus size={14} />
                    <span>Create Task</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
