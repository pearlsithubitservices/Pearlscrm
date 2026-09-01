import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiUrl } from "../../config/api";

const formatPercent = (value) => `${Math.round(value)}%`;

const getMonthlyTrendFromTasks = (taskList = []) => {
  const months = [];
  const now = new Date();

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleString("en-US", { month: "short" });

    let total = 0;
    let completed = 0;

    taskList.forEach((task) => {
      const taskDate = task?.createdAt ? new Date(task.createdAt) : null;
      if (!taskDate || Number.isNaN(taskDate.getTime())) return;

      if (`${taskDate.getFullYear()}-${taskDate.getMonth()}` !== monthKey) return;

      total += 1;
      if (String(task.status || "").toLowerCase() === "completed") completed += 1;
    });

    months.push({
      label,
      value: total ? Math.min(100, Math.max(0, (completed / total) * 100)) : 0,
      total,
      completed,
    });
  }

  return months;
};

const getPerformanceLevel = (rating) => {
  const value = Number(rating) || 0;

  if (value >= 4.5) {
    return { label: "Excellent", color: "#16a34a", badge: "bg-emerald-100 text-emerald-700" };
  }
  if (value >= 4.0) {
    return { label: "Very Good", color: "#2563eb", badge: "bg-blue-100 text-blue-700" };
  }
  if (value >= 3.5) {
    return { label: "Good", color: "#f4b942", badge: "bg-amber-100 text-amber-700" };
  }
  if (value >= 2.5) {
    return { label: "Average", color: "#f59e0b", badge: "bg-orange-100 text-orange-700" };
  }

  return { label: "Needs Improvement", color: "#ef4444", badge: "bg-red-100 text-red-700" };
};

export default function EmployeePerformancePage({ employee }) {
  const [review, setReview] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const employeeId = employee?.uid || employee?._id || employee?.id;

  useEffect(() => {
    const fetchReview = async () => {
      if (!employeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
              const response = await fetch(apiUrl(`/review/${encodeURIComponent(employeeId)}`));
        if (response.status === 404) {
          setReview(null);
          return;
        }
        if (!response.ok) throw new Error("Unable to load employee performance");

        const result = await response.json();
        setReview(result.data || null);
      } catch (error) {
        console.error("Error loading employee performance:", error);
        setReview(null);
      }
    };

    const fetchTasks = async () => {
      if (!employeeId) {
        setTasks([]);
        return;
      }

      try {
        const response = await fetch(apiUrl("/tasks"));
        if (!response.ok) throw new Error("Unable to load assigned tasks");

        const data = await response.json();
        const taskList = Array.isArray(data) ? data : [];
        const employeeKeys = [
          String(employeeId).toLowerCase(),
          String(employee?.email || "").toLowerCase(),
          String(employee?.name || employee?.employeeName || "").toLowerCase(),
        ].filter(Boolean);

        const assignedTasks = taskList.filter((task) => {
          const assignedTo = task.assignedTo;
          const assignedKey = typeof assignedTo === "object"
            ? assignedTo?._id || assignedTo?.uid || assignedTo?.id || assignedTo?.email || assignedTo?.name
            : assignedTo;

          return employeeKeys.includes(String(assignedKey || "").toLowerCase());
        });

        setTasks(assignedTasks);
      } catch (error) {
        console.error("Error loading employee tasks:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
    fetchTasks();
  }, [employeeId, employee?.email, employee?.name, employee?.employeeName]);

  const totalAssignedTasks = tasks.length;
  const completedTasks = tasks.filter((task) => String(task.status || "").toLowerCase() === "completed").length;
  const pendingTasks = tasks.filter((task) => {
    const status = String(task.status || "").toLowerCase();
    return status === "pending" || status === "in progress" || status === "new";
  }).length;
  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || String(task.status || "").toLowerCase() === "completed") return false;
    const dueDate = new Date(task.dueDate);
    return !Number.isNaN(dueDate.getTime()) && dueDate < new Date();
  }).length;
  const tasksCompletionPercent = totalAssignedTasks ? (completedTasks / totalAssignedTasks) * 100 : 0;
  const fallbackRating = totalAssignedTasks ? (tasksCompletionPercent / 100) * 5 : 0;
  const overallRating = review?.overallRating ? Number(review.overallRating) : fallbackRating;
  const overallPercent = Math.min(100, Math.max(0, review?.overallRating ? (overallRating / 5) * 100 : tasksCompletionPercent));
  const performanceLevel = getPerformanceLevel(overallRating);
  const employeeName = employee?.employeeName || employee?.name || "Employee";
  const employeeRole = employee?.employeeDepartment || employee?.role || "Employee";
  const monthlyTrend = getMonthlyTrendFromTasks(tasks);
  const monthLabels = monthlyTrend.map((item) => item.label);
  const trendValues = monthlyTrend.map((item) => item.value);
  const latestPerformance = trendValues[trendValues.length - 1] || 0;
  const priorPerformance = trendValues[trendValues.length - 2] ?? latestPerformance;
  const performanceDelta = latestPerformance - priorPerformance;
  const bestPerformanceEntry = monthlyTrend.reduce((best, current) => (current.value > best.value ? current : best), { value: -1, label: "N/A" });
  const bestPerformanceDay = tasks.length
    ? (tasks
        .filter((task) => String(task.status || "").toLowerCase() === "completed")
        .map((task) => task.completedAt || task.updatedAt || task.createdAt)
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a))[0] || tasks[0]?.createdAt)
    : null;
  const displayPerformancePercent = Math.min(100, Math.max(0, review?.overallRating ? overallPercent : tasksCompletionPercent));

  const metricCards = [
    { label: "Tasks Assigned", value: totalAssignedTasks },
    { label: "Tasks Completed", value: formatPercent(tasksCompletionPercent) },
    { label: "Pending Tasks", value: pendingTasks },
    { label: "Overdue Tasks", value: overdueTasks },
  ];

  const scoreBreakdown = review?.metrics?.length
    ? review.metrics.map((metric, index) => ({
        label: metric.title,
        value: Math.round(((Number(metric.score) || 0) / 5) * 100),
        color: ["#2F80ED", "#27AE60", "#F2994A", "#56CCF2"][index % 4],
      }))
    : [
        { label: "Productivity", value: Math.round((completedTasks / Math.max(totalAssignedTasks, 1)) * 100 || 0), color: "#2F80ED" },
        { label: "Communication", value: Math.round(Math.max(0, 100 - overdueTasks * 10) || 0), color: "#3ECF8E" },
        { label: "Quality", value: Math.round(Math.min(100, Math.max(0, displayPerformancePercent)) || 0), color: "#F6B73C" },
      ];

  const targetAchievement = review?.targetAchievement ?? Math.min(100, tasksCompletionPercent);
  const targetValue = review?.targetValue ?? Math.max(totalAssignedTasks, 1);
  const achievedTarget = review?.achievedTarget ?? completedTasks;

  const chartWidth = 480;
  const chartHeight = 170;
  const min = 0;
  const max = 100;

  const points = trendValues.map((value, index) => {
    const x = (index / (trendValues.length - 1)) * chartWidth;
    const y = chartHeight - ((value - min) / (max - min)) * (chartHeight - 30) - 15;
    return { x, y, value };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  return (
    <div className="min-h-screen bg-[#f3efe9] p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-6xl rounded-[28px] border border-[#e8e2db] bg-[#f5f2ee] p-4 sm:p-5 shadow-[0_10px_30px_rgba(32,39,55,0.08)]"
      >
        <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="rounded-[24px] bg-[#f7f7f8] p-5 shadow-sm ring-1 ring-[#ece8e3]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#201d5d] to-[#3a82f7] text-lg font-bold text-white shadow-md">
                  {employeeName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1d2c4d]">{employeeName}</h3>
                  <p className="text-sm text-gray-500">{employeeRole}</p>
                </div>
              </div>
              <button className="rounded-lg border border-[#dfe8f1] bg-white px-2.5 py-1 text-xs font-medium text-[#1d2c4d] shadow-sm">
                Active
              </button>
            </div>

            <div className="flex items-center justify-center py-6">
              <div
                className="relative flex h-36 w-36 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#1e7afc 0 ${overallPercent}%, #dfeaf7 ${overallPercent}% 100%)`,
                }}
              >
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#f7f7f8] text-center shadow-inner">
                  <span className="text-3xl font-bold text-[#0c254a]">{Math.round(overallPercent)}%</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xl font-bold text-[#1d2c4d]" style={{ color: performanceLevel.color }}>
                {performanceLevel.label}
              </p>
              <div className="mt-2 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= Math.round(overallRating) ? "text-[#f4b942]" : "text-[#d8d9dc]"}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[18px] border border-[#ebe7e2] bg-white p-4 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3fe] text-[#2a69d8]">
                      <span className="text-base font-semibold">{item.label.charAt(0)}</span>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                      {item.label === "Tasks Completed" ? "Good" : "Live"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-[#0f2447]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[22px] border border-[#ece7e2] bg-white p-4 sm:p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-bold text-[#1d2c4d]">Target vs Achievement</h3>
                <div className="text-sm text-gray-500">
                  {achievedTarget} / {targetValue} tasks
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Monthly Target</span>
                <span>{targetValue} Tasks</span>
              </div>

              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[#e9edf6]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, targetAchievement)}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#4f9cf3]"
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs font-medium text-[#1d2c4d]">
                <span>Achieved</span>
                <span>{Math.round(targetAchievement)}%</span>
              </div>
            </div>

            <div className="rounded-[22px] border border-[#ece7e2] bg-white p-4 sm:p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-[#1d2c4d]">Monthly Performance Trend</h3>
                <div className="rounded-full bg-[#ecf7ef] px-2.5 py-1 text-xs font-semibold text-green-700">
                  {performanceDelta >= 0 ? "+" : ""}{Math.round(performanceDelta)}% vs last month
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
                <div className="rounded-2xl bg-[#fafafd] p-3">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-44 w-full overflow-visible">
                    {[0, 25, 50, 75, 100].map((gridValue) => {
                      const y = chartHeight - ((gridValue - min) / (max - min)) * (chartHeight - 30) - 15;
                      return (
                        <g key={gridValue}>
                          <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#e6ecf5" strokeDasharray="4 5" />
                          <text x="0" y={y - 8} fontSize="10" fill="#8a93a8">{gridValue}%</text>
                        </g>
                      );
                    })}

                    <path d={linePath} fill="none" stroke="#2d6df6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                    {points.map((point, index) => (
                      <g key={index}>
                        <circle cx={point.x} cy={point.y} r="4.5" fill="#ffffff" stroke="#2d6df6" strokeWidth="2.5" />
                        <text x={point.x} y={chartHeight - 2} textAnchor="middle" fontSize="10" fill="#6b7280">{monthLabels[index]}</text>
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="space-y-4 rounded-2xl bg-[#f8f9fb] p-4">
                  <div>
                    <p className="text-sm text-gray-500">Performance Summary</p>
                    <p className="mt-1 text-3xl font-bold text-[#0b2b57]">{Math.round(displayPerformancePercent)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Best Performance Day</p>
                    <p className="mt-1 font-semibold text-[#0b2b57]">
                      {bestPerformanceDay ? new Date(bestPerformanceDay).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "No completed task"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Daily Performance</p>
                    <p className="mt-1 text-lg font-bold text-[#0b2b57]">{Math.round(trendValues.reduce((acc, val) => acc + val, 0) / Math.max(trendValues.length, 1))}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Working Days</p>
                    <p className="mt-1 text-lg font-bold text-[#0b2b57]">{Math.max(1, trendValues.length)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Score Improvement</p>
                    <p className="mt-1 text-lg font-bold text-[#0b2b57]">
                      {performanceDelta >= 0 ? "+" : ""}{Math.round(performanceDelta)}% vs last month
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-[#ece7e2] bg-white p-4 shadow-sm">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-[#1d2c4d]">Score breakdown</h3>
              </div>

              <div className="space-y-5">
                {scoreBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-[#1d2c4d]">{item.label}</span>
                      <span className="text-sm font-semibold text-[#1d2c4d]">{item.value}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#edf0f5]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 0.9 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}