import React, {
  useState,
} from "react";

import {
  Plus,
  Search,
  X,
  Activity,
  TrendingUp,
  UserMinus,
  UserCheck,
} from "lucide-react";

import {
  motion,
  easeOut,
} from "framer-motion";

import { useNavigate } from "react-router-dom";

import Pagination from "../components/Pagination";
import LoadingPage from "../components/Dashboard/Loading";
import Createemployee from "./Createemployee";
import AnimateModals from "../components/Dashboard/AnimateModals";
import useEmployees from "../Hooks/useEmployees";

export default function ClientManagement() {
  const [active, setActive] = useState(0);
  const [loading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const buttons = [
    "All",
    "Sales",
    "Engineering",
    "Design",
  ];

  const {
    employees,
    deleteEmployee,
    toggleEmployeeStatus,
  } = useEmployees();

  const navigate = useNavigate();

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;

  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;

  // FILTER EMPLOYEES
  const filteredEmployees = (employees || []).filter(
    (employee) => {
      const profile = employee.profile || {};

      const name =
        employee.name ||
        employee.employeeName ||
        "";

      const employeeId =
        profile.empId ||
        employee.empId ||
        employee.id ||
        "";

      const role =
        employee.role ||
        employee.employeeRole ||
        profile.designation ||
        "";

      const department =
        employee.department ||
        profile.department ||
        "";

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

      const matchesDepartment =
        active === 0 ||
        department.toLowerCase() ===
          buttons[active].toLowerCase();

      return (
        matchesSearch &&
        matchesDepartment
      );
    }
  );

  const currentFiles = filteredEmployees.slice(
    firstIndex,
    lastIndex
  );

  const totalPages = Math.ceil(
    filteredEmployees.length / filesPerPage
  );

  // STATS
  const stats = [
    {
      title: "Total Employees",
      value: employees.length,
      icon: UserCheck,
    },
    {
      title: "Employee Performance",
      value: "48%",
      icon: TrendingUp,
    },
    {
      title: "Active Tasks",
      value: "12",
      icon: Activity,
    },
    {
      title: "ON Leave",
      value: "20",
      icon: UserMinus,
    },
  ];

  return (
    <div className="text-black max-h-screen overflow-y-auto no-scrollbar">

      {/* TOPBAR */}
      <div className="w-full bg-white border-b border-black/10 px-8 py-6 flex items-center justify-between">

        {/* LEFT */}
        <div>
          <h1 className="text-2xl text-[#023167] font-bold">
            Employee Management
          </h1>

          <p className="text-gray-400 mt-1 text-sm">
            Track and manage your Employee
          </p>
        </div>

        {/* RIGHT ACTION */}
        <div className="flex items-center gap-4">

          {/* ADD EMPLOYEE */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white rounded hover:scale-105 transition-transform duration-300"
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
                y: 50,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                ease: easeOut,
              }}
              whileHover={{
                scale: 1.03,
              }}
              className="bg-white border border-black/10 p-4 rounded-xl"
            >

              <div className="flex items-center justify-between mb-3">

                <div className="bg-gray-100 rounded w-10 h-10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#0b2b57]" />
                </div>

                <span className="text-green-500 bg-green-100 px-2 py-1 rounded text-xs font-semibold">
                  ↑ 8.4%
                </span>

              </div>

              <p className="text-sm text-gray-500">
                {item.title}
              </p>

              <h2 className="text-3xl font-bold text-[#0b2b57]">
                {item.value}
              </h2>

            </motion.div>
          ))}

        </div>

        {/* EMPLOYEE SECTION HEADER */}
        <div className="flex items-center justify-between mt-8 mb-4 border bg-white p-2 rounded">

          {/* TITLE */}
          <div>
            <h2 className="text-lg font-bold text-[#0b2b57]">
              Employee List
            </h2>
          </div>

          {/* DEPARTMENT TABS */}
          <div className="flex gap-3">

            {buttons.map((btn, index) => (
              <button
                key={index}
                onClick={() => {
                  setActive(index);
                  setCurrentPage(1);
                }}
                className={`px-4 rounded-xl font-medium transition-all ${
                  active === index
                    ? "bg-[#2563a9] text-white"
                    : "text-gray-400 hover:bg-[#2563a9] hover:text-white"
                }`}
              >
                {btn}
              </button>
            ))}

          </div>

          {/* SEARCH */}
          <div className="flex items-center gap-2 bg-gray-200 border px-3 py-2 rounded w-full lg:w-[300px]">

            <Search
              size={16}
              className="text-black"
            />

            <input
              placeholder="Search employees..."
              className="w-full outline-none text-sm bg-gray-200"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />

          </div>

        </div>

        {/* EMPLOYEE TABLE */}
        {loading ? (
          <div className="w-full h-screen items-center">
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
            className="overflow-x-auto bg-white border border-black/10 rounded"
          >

            <table className="w-full min-w-[760px] text-left text-white">

              {/* TABLE HEADER */}
              <thead className="bg-[#2563a9] text-white text-xs uppercase tracking-wide">

                <tr>

                  <th className="px-5 py-4 text-white">
                    Name
                  </th>

                  <th className="px-5 py-4 text-white">
                    Emp ID
                  </th>

                  <th className="px-5 py-4 text-white">
                    Activity
                  </th>

                  <th className="px-5 py-4 text-white">
                    Role
                  </th>

                  <th className="px-5 py-4 text-white">
                    SME
                  </th>

                  <th className="px-5 py-4 text-right text-white">
                    Action
                  </th>

                </tr>

              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y divide-gray-100">

                {currentFiles.map(
                  (employee) => {

                    const profile =
                      employee.profile || {};

                    const employeeId =
                      profile.empId ||
                      employee.empId ||
                      employee.id ||
                      employee._id;

                    const status =
                      employee.status ||
                      "Active";

                    const activity =
                      employee.isOnline
                        ? "Online"
                        : status;

                    const role =
                      employee.role ||
                      employee.employeeRole ||
                      profile.designation ||
                      "Employee";

                    const sme =
                      employee.sme ||
                      employee.isSME ||
                      employee.subjectMatterExpert ||
                      profile.sme;

                    return (
                      <tr
                        key={
                          employee.id ||
                          employee._id
                        }
                        className="hover:bg-blue-50 cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/employeeDetails/${
                              employee.id ||
                              employee._id
                            }`
                          )
                        }
                      >

                        {/* NAME */}
                        <td className="px-5 py-4 font-semibold text-[#0b2b57]">
                          {employee.name ||
                            employee.employeeName ||
                            "No Name"}
                        </td>

                        {/* EMP ID */}
                        <td className="px-5 py-4 text-gray-600">
                          {employeeId ||
                            "Not assigned"}
                        </td>

                        {/* ACTIVITY */}
                        <td className="px-5 py-4">

                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              activity === "Online" ||
                              activity === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {activity}
                          </span>

                        </td>

                        {/* ROLE */}
                        <td className="px-5 py-4 text-gray-600">
                          {role}
                        </td>

                        {/* SME */}
                        <td className="px-5 py-4 text-gray-600">
                          {typeof sme === "boolean"
                            ? sme
                              ? "Yes"
                              : "No"
                            : sme ||
                              "Not assigned"}
                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-4 text-right">

                          <div className="flex justify-end gap-3">

                            {/* SUSPEND / ACTIVATE */}
                            <button
                              type="button"
                              className={`text-xs font-semibold ${
                                status === "Suspended"
                                  ? "text-green-700"
                                  : "text-orange-700"
                              }`}
                              onClick={async (
                                event
                              ) => {
                                event.stopPropagation();

                                if (
                                  window.confirm(
                                    `${
                                      status ===
                                      "Suspended"
                                        ? "Activate"
                                        : "Suspend"
                                    } this employee?`
                                  )
                                ) {
                                  try {
                                    await toggleEmployeeStatus(
                                      employee.id ||
                                        employee._id
                                    );
                                  } catch (
                                    error
                                  ) {
                                    alert(
                                      error.message
                                    );
                                  }
                                }
                              }}
                            >
                              {status ===
                              "Suspended"
                                ? "Activate"
                                : "Suspend"}
                            </button>

                            {/* DELETE */}
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-800"
                              aria-label={`Delete ${
                                employee.name ||
                                "employee"
                              }`}
                              onClick={async (
                                event
                              ) => {
                                event.stopPropagation();

                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this employee?"
                                  )
                                ) {
                                  await deleteEmployee(
                                    employee.id ||
                                      employee._id
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
                  }
                )}

              </tbody>

            </table>

            {!currentFiles.length && (
              <p className="p-8 text-center text-gray-500">
                No employees found.
              </p>
            )}

          </motion.div>
        )}

        {/* PAGINATION */}
        <div>
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
          />
        </AnimateModals>
      )}

    </div>
  );
}