import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Building2,
  Calendar,
  Clock,
  CircleDollarSign,
  UserCheck,
  Activity,
  FileText
} from "lucide-react";
import useEmployees from "../../Hooks/useEmployees";

export default function ProjectDetailsPage({ projects }) {
  const { employees } = useEmployees();

  const currentProject = projects[0] || {};
  const progressVal = Number(currentProject.progress) || 0;

  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      const eKey = employee._id || employee.uid || employee.id;
      if (eKey) map[eKey] = employee.name || employee.employeeName || employee.email;
      return map;
    }, {});
  }, [employees]);

  const leaderName = typeof currentProject.leader === 'object' 
    ? (currentProject.leader?.name || currentProject.leader?.employeeName)
    : (employeeMap[currentProject.leader] || currentProject.leader || "Not Assigned");

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString('en-GB');
  };

  const infoCards = [
    {
      label: "CLIENT",
      value: currentProject.company || "N/A",
      icon: Building2,
      color: "text-blue-600 bg-blue-50"
    },
    {
      label: "STATUS",
      value: currentProject.status || "Active",
      icon: Activity,
      color: "text-emerald-600 bg-emerald-50"
    },
    {
      label: "ASSIGNED DATE",
      value: formatDate(currentProject.assignedDate),
      icon: Calendar,
      color: "text-purple-600 bg-purple-50"
    },
    {
      label: "DUE DATE",
      value: formatDate(currentProject.dueDate),
      icon: Clock,
      color: "text-amber-600 bg-amber-50"
    },
    {
      label: "BUDGET",
      value: currentProject.budget ? `$${currentProject.budget}` : "N/A",
      icon: CircleDollarSign,
      color: "text-indigo-600 bg-indigo-50"
    },
    {
      label: "TEAM LEADER",
      value: leaderName,
      icon: UserCheck,
      color: "text-rose-600 bg-rose-50"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-6xl mx-auto bg-[#F5F3EF] rounded-2xl md:rounded-[28px] overflow-hidden p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8"
    >
      {/* Project Description */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-[#2563a9]" />
          <h2 className="text-xs sm:text-sm md:text-base font-bold text-gray-500 uppercase tracking-wider">
            PROJECT DESCRIPTION
          </h2>
        </div>

        <div className="border border-gray-300/80 rounded-2xl bg-white/80 backdrop-blur-xs p-4 sm:p-6 md:p-8 shadow-2xs">
          <p className="text-[#0B2D57] text-sm sm:text-base md:text-lg leading-relaxed font-medium">
            {currentProject.description || "No project description provided."}
          </p>
        </div>
      </div>

      {/* Project Information */}
      <div>
        <h2 className="text-xs sm:text-sm md:text-base font-bold text-gray-500 uppercase tracking-wider mb-4">
          PROJECT INFORMATION
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {infoCards.map((item, index) => (
            <motion.div
              whileHover={{ y: -3 }}
              key={index}
              className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200/80 shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {item.label}
                </span>
                <div className={`p-2 rounded-xl ${item.color}`}>
                  <item.icon size={18} />
                </div>
              </div>

              <p className="text-[#0B2D57] font-bold text-base sm:text-lg md:text-xl truncate">
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Progress */}
      <div>
        <h2 className="text-xs sm:text-sm md:text-base font-bold text-gray-500 uppercase tracking-wider mb-4">
          PROJECT PROGRESS
        </h2>

        <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[#0B2D57] text-base sm:text-lg font-bold">
                Project Completion: {progressVal}%
              </p>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                {progressVal === 100 ? "Project is fully completed!" : "In active development milestone phase"}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <CheckCircle2
                size={28}
                className={progressVal === 100 ? "text-emerald-500" : "text-[#2563a9]"}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3.5 sm:h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200/60 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressVal}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-2xs"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}