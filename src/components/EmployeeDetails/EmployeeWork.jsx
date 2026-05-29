import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function AssignedWork() {
  const [tasks] = useState([
    {
      title: "Stripe billing integration",
      subtitle: "In Progress",
      progress: 67,
    },
    {
      title: "Data pipeline migration",
      subtitle: "Data Infra",
      progress: 67,
    },
    {
      title: "Mobile app API layer",
      subtitle: "Mobile App",
      progress: 67,
    },
    {
      title: "Analytics dashboard v2",
      subtitle: "Analytics",
      progress: 67,
    },
  ]);

  return (
    <div className="mt-6 space-y-8">

      {/* INPUT SECTION */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-xs font-semibold text-gray-500 mb-3">
          ASSIGNED WORK
        </h2>

        <textarea
          placeholder="Add a task..."
          className="w-full h-28 resize-none outline-none text-sm"
        />

        <div className="flex justify-end mt-3">
          <button className="flex items-center gap-1 px-4 py-1 bg-blue-600 text-white rounded-md text-sm">
            <Plus size={14} />
            Add to task
          </button>
        </div>
      </div>

      {/* TASK LIST */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-4">
          ASSIGNED TASKS & PROJECTS
        </h2>

        <div className="space-y-6 border-l-2 border-gray-300 pl-6">

          {tasks.map((task, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.01 }}
              className="relative"
            >
              {/* DOT */}
              <div className="absolute -left-[34px] top-1 w-4 h-4 bg-blue-600 rounded-full" />

              {/* TITLE */}
              <h3 className="text-base font-semibold text-gray-800">
                {task.title}
              </h3>

              {/* SUBTITLE */}
              <p className="text-sm text-gray-500">
                {task.subtitle}{" "}
                <span className="ml-2">{task.progress}%</span>
              </p>

              {/* PROGRESS BAR */}
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </motion.div>
          ))}

        </div>
      </div>

    </div>
  );
}