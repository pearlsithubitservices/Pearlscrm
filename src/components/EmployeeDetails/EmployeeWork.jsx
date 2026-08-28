import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { apiUrl } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function AssignedWork({ employee, canManage = true }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const employeeId = employee?._id || employee?.uid || employee?.id;

  const fetchTasks = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      const response = await fetch(apiUrl("/tasks"));
      if (!response.ok) throw new Error("Unable to load assigned tasks");

      const data = await response.json();
      const employeeKeys = [
        String(employeeId).toLowerCase(),
        String(employee.email || "").toLowerCase(),
        String(employee.name || employee.employeeName || "").toLowerCase(),
      ].filter(Boolean);

      setTasks((Array.isArray(data) ? data : []).filter((task) => {
        const assignedTo = task.assignedTo;
        const assignedKey = typeof assignedTo === "object"
          ? assignedTo?._id || assignedTo?.uid || assignedTo?.id || assignedTo?.email || assignedTo?.name
          : assignedTo;
        return employeeKeys.includes(String(assignedKey || "").toLowerCase());
      }));
    } catch (error) {
      console.error("Error loading assigned tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [employeeId]);

  const addTask = async () => {
    const taskTitle = title.trim();
    if (!taskTitle || !employeeId) return;

    try {
      setAdding(true);
      const response = await fetch(apiUrl("/tasks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          assignedTo: employeeId,
          assignedBy: user?._id || user?.uid || user?.id || user?.email,
          priority: "Medium",
          status: "Pending",
          progress: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add task");
      }

      setTitle("");
      await fetchTasks();
    } catch (error) {
      console.error("Add assigned task error:", error);
      alert(error.message);
    } finally {
      setAdding(false);
    }
  };

  const removeTask = async (taskId) => {
    if (!taskId || !window.confirm("Remove this task?")) return;

    try {
      const response = await fetch(apiUrl(`/tasks/${taskId}`), { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to remove task");
      }

      setTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Remove assigned task error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="mt-6 space-y-8">

      {/* INPUT SECTION */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-xs font-semibold text-gray-500 mb-3">
          ASSIGNED WORK
        </h2>

        <textarea
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a task..."
          className="w-full h-28 resize-none outline-none text-sm"
        />

        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={addTask}
            disabled={adding || !title.trim() || !employeeId}
            className="flex items-center gap-1 px-4 py-1 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
          >
            <Plus size={14} />
            {adding ? "Adding..." : "Add to task"}
          </button>
        </div>
      </div>

      {/* TASK LIST */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-4">
          ASSIGNED TASKS & PROJECTS
        </h2>

        <div className="space-y-6 border-l-2 border-gray-300 pl-6">

          {loading && <p className="text-sm text-gray-500">Loading assigned tasks...</p>}
          {!loading && tasks.length === 0 && <p className="text-sm text-gray-500">No tasks assigned yet.</p>}
          {!loading && tasks.map((task, i) => (
            <motion.div
              key={task._id || i}
              whileHover={{ scale: 1.01 }}
              className="relative"
            >
              {/* DOT */}
              <div className="absolute -left-[34px] top-1 w-4 h-4 bg-blue-600 rounded-full" />

              {/* TITLE */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-base font-semibold text-gray-800">
                  {task.title}
                </h3>
                {canManage && <button
                  type="button"
                  onClick={() => removeTask(task._id)}
                  title="Remove task"
                  aria-label={`Remove ${task.title}`}
                  className="text-red-500 hover:text-red-700 disabled:opacity-40"
                  disabled={!task._id}
                >
                  <Trash2 size={16} />
                </button>}
              </div>

              {/* SUBTITLE */}
              <p className="text-sm text-gray-500">
                {task.status || "Pending"}{" "}
                <span className="ml-2">{task.progress || 0}%</span>
              </p>

              {/* PROGRESS BAR */}
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${task.progress || 0}%` }}
                />
              </div>
            </motion.div>
          ))}

        </div>
      </div>

    </div>
  );
}