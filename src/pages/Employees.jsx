import React, {
  useState,
  useEffect,
  useMemo,
} from "react";

import {
  Plus,
  Search,
  X,
  Activity,
  TrendingUp,
  UserMinus,
  UserCheck,
  RefreshCw,
  Edit3,
  Download,
  Filter,
} from "lucide-react";

import {
  motion,
  easeOut,
} from "framer-motion";

import { useNavigate } from "react-router-dom";

import Pagination from "../components/Pagination";
import LoadingPage from "../components/Dashboard/Loading";
import Createemployee from "./Createemployee";
import EditEmployeeModal from "../components/EditEmployeeModal";
import AnimateModals from "../components/Dashboard/AnimateModals";
import useEmployees from "../Hooks/useEmployees";
import { apiUrl } from "../config/api";

export default function Employees() {
  const [active, setActive] = useState(0);
  const [statusFilter, setStatusFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    employees,
    loading: employeesLoading,
    deleteEmployee,
    toggleEmployeeStatus,
    refetch,
  } = useEmployees();

  const navigate = useNavigate();

  // LIVE METRICS DATA
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true);
      const [tasksRes, leavesRes] = await Promise.allSettled([
        fetch(apiUrl("/tasks")),
        fetch(apiUrl("/leave")),
      ]);

      if (tasksRes.status === "fulfilled" && tasksRes.value.ok) {
        const taskData = await tasksRes.value.json();
        setTasks(Array.isArray(taskData) ? taskData : (taskData?.data || []));
      }

      if (leavesRes.status === "fulfilled" && leavesRes.value.ok) {
        const leaveData = await leavesRes.value.json();
        setLeaves(Array.isArray(leaveData) ? leaveData : (leaveData?.data || []));
      }
    } catch (err) {
      console.warn("Error fetching employee metrics:", err);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // DYNAMIC DEPARTMENT TABS
  const buttons = useMemo(() => {
    const depts = new Set();
    (employees || []).forEach((emp) => {
      const profile = emp.profile || {};
      const dept = emp.department || profile.department || emp.employeeDepartment;
      if (dept && typeof dept === "string" && dept.trim()) {
        depts.add(dept.trim());
      }
    });
    return ["All", ...Array.from(depts)];
  }, [employees]);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 8;

  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;

  // FILTER EMPLOYEES
  const filteredEmployees = useMemo(() => {
    return (employees || []).filter((employee) => {
      const profile = employee.profile || {};

      const name =
        employee.name ||
        employee.employeeName ||
        "";

      const employeeId =
        profile.empId ||
        employee.empId ||
        employee.displayEmpId ||
        employee.id ||
        employee._id ||
        "";

      const role =
        employee.role ||
        employee.employeeRole ||
        profile.designation ||
        "";

      const department =
        employee.department ||
        profile.department ||
        employee.employeeDepartment ||
        "";

      const status =
        employee.status ||
        "Active";

      const matchesSearch = [
        name,
        employeeId,
        role,
        department,
        employee.email,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const selectedDept = buttons[active] || "All";
      const matchesDepartment =
        active === 0 ||
        selectedDept === "All" ||
        department.toLowerCase() === selectedDept.toLowerCase();

      const matchesStatus =
        statusFilter === "All" ||
        status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchTerm, active, buttons, statusFilter]);

  const currentFiles = filteredEmployees.slice(
    firstIndex,
    lastIndex
  );

  const totalPages = Math.ceil(
    filteredEmployees.length / filesPerPage
  );

  // CALCULATE LIVE STATS
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => (e.status || "Active") === "Active").length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => String(t.status || "").toLowerCase() === "completed").length;
  const activeTasks = tasks.filter((t) => String(t.status || "").toLowerCase() !== "completed").length;

  const avgPerformance = totalTasks > 0
    ? `${Math.round((completedTasks / totalTasks) * 100)}%`
    : "100%";

  const today = new Date().toISOString().split("T")[0];
  const onLeaveToday = leaves.filter((leave) => {
    const isApproved = String(leave.status || "").toLowerCase() === "approved" || !leave.status;
    if (!isApproved) return false;
    const from = leave.leaveFrom ? new Date(leave.leaveFrom).toISOString().split("T")[0] : null;
    const to = leave.leaveTo ? new Date(leave.leaveTo).toISOString().split("T")[0] : null;
    if (!from || !to) return false;
    return today >= from && today <= to;
  }).length;

  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees,
      badge: `${activeEmployees} Active`,
      badgeColor: "bg-green-100 text-green-700",
      icon: UserCheck,
    },
    {
      title: "Avg Performance",
      value: avgPerformance,
      badge: `${completedTasks}/${totalTasks} Tasks`,
      badgeColor: "bg-blue-100 text-blue-700",
      icon: TrendingUp,
    },
    {
      title: "Active Tasks",
      value: activeTasks,
      badge: "In Progress",
      badgeColor: "bg-amber-100 text-amber-700",
      icon: Activity,
    },
    {
      title: "On Leave Today",
      value: onLeaveToday,
      badge: onLeaveToday > 0 ? "Away" : "All In Office",
      badgeColor: onLeaveToday > 0 ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700",
      icon: UserMinus,
    },
  ];

  // EXPORT TO CSV
  const exportToCSV = () => {
    if (!filteredEmployees.length) {
      alert("No employees to export.");
      return;
    }

    const headers = ["Employee ID", "Name", "Email", "Department", "Role", "Status", "Contact", "Location", "SME"];
    const rows = filteredEmployees.map((emp) => {
      const p = emp.profile || {};
      const id = p.empId || emp.empId || emp.id || emp._id || "";
      const name = `"${(emp.name || emp.employeeName || "").replace(/"/g, '""')}"`;
      const email = emp.email || "";
      const dept = emp.department || p.department || emp.employeeDepartment || "General";
      const role = emp.role || emp.employeeRole || "Employee";
      const status = emp.status || "Active";
      const contact = `"${emp.contact || emp.phone || p.phone || ""}"`;
      const location = `"${emp.location || p.workLocation || ""}"`;
      const sme = emp.sme || p.sme ? "Yes" : "No";

      return [id, name, email, dept, role, status, contact, location, sme].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `employees_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-black max-h-screen overflow-y-auto no-scrollbar">

      {/* TOPBAR */}
      <div className="w-full bg-white border-b border-black/10 px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

        {/* LEFT */}
        <div>
          <h1 className="text-2xl text-[#023167] font-bold">
            Employee Management
          </h1>

          <p className="text-gray-400 mt-1 text-sm">
            Track and manage your company employees, departments, and activities
          </p>
        </div>

        {/* RIGHT ACTION */}
        <div className="flex items-center gap-3">
          {/* EXPORT CSV */}
          <button
            type="button"
            onClick={exportToCSV}
            title="Export Employees CSV"
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-gray-700 hover:text-blue-700 bg-gray-100 hover:bg-blue-50 border border-gray-200 rounded-lg transition font-medium text-xs cursor-pointer"
          >
            <Download size={15} />
            Export CSV
          </button>

          {/* REFRESH */}
          <button
            type="button"
            onClick={() => {
              refetch();
              fetchMetrics();
            }}
            title="Refresh employees"
            className="p-2.5 text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded-lg transition cursor-pointer"
          >
            <RefreshCw size={18} className={employeesLoading || metricsLoading ? "animate-spin" : ""} />
          </button>

          {/* ADD EMPLOYEE */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2563a9] text-white rounded-lg hover:bg-[#1d4f88] transition shadow-sm font-medium text-sm cursor-pointer"
          >
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="p-8 bg-[#f3f0eb] min-h-screen">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
                delay: i * 0.08,
                ease: easeOut,
              }}
              whileHover={{
                scale: 1.02,
              }}
              className="bg-white border border-black/10 p-5 rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="bg-gray-100 rounded-xl w-11 h-11 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#0b2b57]" />
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              <p className="text-sm text-gray-500 font-medium">
                {item.title}
              </p>

              <h2 className="text-3xl font-bold text-[#0b2b57] mt-1">
                {item.value}
              </h2>
            </motion.div>
          ))}
        </div>

        {/* EMPLOYEE SECTION HEADER */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mt-8 mb-4 border border-gray-200 bg-white p-3.5 rounded-xl gap-4 shadow-sm">

          {/* TITLE & COUNT */}
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#0b2b57]">
              Employee List
            </h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
              {filteredEmployees.length}
            </span>
          </div>

          {/* DYNAMIC DEPARTMENT TABS */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto max-w-full">
            {buttons.map((btn, index) => (
              <button
                key={btn}
                onClick={() => {
                  setActive(index);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  active === index
                    ? "bg-[#2563a9] text-white shadow-sm"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* CONTROLS: STATUS FILTER & SEARCH */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* STATUS FILTER */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-100 border border-gray-200 text-gray-700 text-xs rounded-lg px-3 py-2 outline-none font-medium cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Suspended">Suspended Only</option>
            </select>

            {/* SEARCH */}
            <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg w-full lg:w-[260px]">
              <Search
                size={16}
                className="text-gray-500"
              />
              <input
                placeholder="Search name, ID, role..."
                className="w-full outline-none text-sm bg-transparent placeholder-gray-400"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* EMPLOYEE TABLE */}
        {employeesLoading ? (
          <div className="w-full py-20 flex justify-center items-center bg-white rounded-2xl border border-gray-200">
            <LoadingPage />
          </div>
        ) : (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="overflow-x-auto bg-white border border-black/10 rounded-2xl shadow-sm"
          >
            <table className="w-full min-w-[760px] text-left text-black">

              {/* TABLE HEADER */}
              <thead className="bg-[#2563a9] text-white text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-4 text-white font-semibold">
                    Name
                  </th>
                  <th className="px-5 py-4 text-white font-semibold">
                    Emp ID
                  </th>
                  <th className="px-5 py-4 text-white font-semibold">
                    Department
                  </th>
                  <th className="px-5 py-4 text-white font-semibold">
                    Role
                  </th>
                  <th className="px-5 py-4 text-white font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-4 text-white font-semibold">
                    SME
                  </th>
                  <th className="px-5 py-4 text-right text-white font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y divide-gray-100 text-sm">
                {currentFiles.map((employee) => {
                  const profile = employee.profile || {};

                  const employeeId =
                    profile.empId ||
                    employee.empId ||
                    employee.displayEmpId ||
                    employee.id ||
                    employee._id;

                  const status =
                    employee.status ||
                    "Active";

                  const role =
                    employee.role ||
                    employee.employeeRole ||
                    profile.designation ||
                    "Employee";

                  const department =
                    employee.department ||
                    profile.department ||
                    employee.employeeDepartment ||
                    "General";

                  const sme =
                    employee.sme ||
                    employee.isSME ||
                    employee.subjectMatterExpert ||
                    profile.sme;

                  return (
                    <tr
                      key={employee.id || employee._id}
                      className="hover:bg-blue-50/60 cursor-pointer transition-colors"
                      onClick={() =>
                        navigate(
                          `/employeeDetails/${
                            employee.id ||
                            employee._id
                          }`
                        )
                      }
                    >
                      {/* NAME & EMAIL */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#0b2b57]">
                          {employee.name ||
                            employee.employeeName ||
                            "No Name"}
                        </div>
                        {employee.email && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {employee.email}
                          </div>
                        )}
                      </td>

                      {/* EMP ID */}
                      <td className="px-5 py-4 text-gray-600 font-mono text-xs">
                        {employeeId || "Not assigned"}
                      </td>

                      {/* DEPARTMENT */}
                      <td className="px-5 py-4 text-gray-700 font-medium">
                        {department}
                      </td>

                      {/* ROLE */}
                      <td className="px-5 py-4 text-gray-600">
                        {role}
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            status === "Active"
                              ? "bg-green-100 text-green-700"
                              : status === "Suspended"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* SME */}
                      <td className="px-5 py-4 text-gray-600">
                        {sme ? (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                            SME
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No</span>
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {/* EDIT BUTTON */}
                          <button
                            type="button"
                            title="Edit Employee"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100/70 rounded-md transition cursor-pointer"
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditingEmployee(employee);
                            }}
                          >
                            <Edit3 size={16} />
                          </button>

                          {/* SUSPEND / ACTIVATE */}
                          <button
                            type="button"
                            className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition cursor-pointer ${
                              status === "Suspended"
                                ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                                : "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100"
                            }`}
                            onClick={async (event) => {
                              event.stopPropagation();
                              if (
                                window.confirm(
                                  `${
                                    status === "Suspended"
                                      ? "Activate"
                                      : "Suspend"
                                  } this employee?`
                                )
                              ) {
                                try {
                                  await toggleEmployeeStatus(
                                    employee.id || employee._id
                                  );
                                } catch (error) {
                                  alert(error.message);
                                }
                              }
                            }}
                          >
                            {status === "Suspended"
                              ? "Activate"
                              : "Suspend"}
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition cursor-pointer"
                            aria-label={`Delete ${
                              employee.name || "employee"
                            }`}
                            onClick={async (event) => {
                              event.stopPropagation();
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this employee?"
                                )
                              ) {
                                await deleteEmployee(
                                  employee.id || employee._id
                                );
                              }
                            }}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>

            {!currentFiles.length && (
              <div className="p-12 text-center text-gray-500">
                <p className="text-base font-medium text-gray-600">No employees found.</p>
                <p className="text-xs text-gray-400 mt-1">Try clearing filters or search term.</p>
              </div>
            )}

          </motion.div>
        )}

        {/* PAGINATION */}
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>

      </div>

      {/* ADD EMPLOYEE MODAL */}
      {open && (
        <AnimateModals>
          <Createemployee
            onClose={() => setOpen(false)}
            onSuccess={() => {
              refetch();
              fetchMetrics();
              setOpen(false);
            }}
          />
        </AnimateModals>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {editingEmployee && (
        <AnimateModals>
          <EditEmployeeModal
            employee={editingEmployee}
            onClose={() => setEditingEmployee(null)}
            onSuccess={() => {
              refetch();
              fetchMetrics();
              setEditingEmployee(null);
            }}
          />
        </AnimateModals>
      )}

    </div>
  );
}