import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Mail, MapPin, Phone, Building2, User, Loader2 } from "lucide-react";
import EmployeeDetails from "./EmployeeDetails";
import useEmployees from "../../../Hooks/useEmployees";

export default function CompanyDirectory() {
  const { employees, loading } = useEmployees();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const departments = [
    { name: "All Departments", value: "all" },
    { name: "Engineering", value: "engineering" },
    { name: "Design", value: "design" },
    { name: "HR Department", value: "hr" },
    { name: "Finance", value: "finance" },
    { name: "Sales & Marketing", value: "sales" },
    { name: "Operations", value: "operations" },
  ];

  // Filter employees dynamically based on Search & Department
  const filteredEmployees = employees.filter((emp) => {
    const empDept = (emp.dept || emp.department || "").toLowerCase();
    const matchesDept =
      selectedDept === "all" || empDept.includes(selectedDept.toLowerCase());

    if (!searchQuery.trim()) return matchesDept;

    const q = searchQuery.toLowerCase();
    const empName = (emp.name || emp.employeeName || "").toLowerCase();
    const empRole = (emp.role || emp.employeeRole || "").toLowerCase();
    const empEmail = (emp.email || "").toLowerCase();

    const matchesSearch =
      empName.includes(q) ||
      empRole.includes(q) ||
      empDept.includes(q) ||
      empEmail.includes(q);

    return matchesDept && matchesSearch;
  });

  const handleOpenDetails = (emp) => {
    setSelectedEmployee(emp);
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen bg-[#efede8] p-3 rounded-2xl">
      <main className="flex-1">
        <div className="bg-[#efede8] rounded-2xl space-y-6">
          {/* HEADER & CONTROLS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
            <div>
              <h2 className="text-2xl font-bold text-[#0b2b57]">
                Company Directory
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Explore and connect with team members across the organization ({filteredEmployees.length} members)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* SEARCH INPUT */}
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-200/60 focus-within:ring-2 focus-within:ring-blue-500 transition">
                <Search size={17} className="text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, role, email..."
                  className="bg-transparent outline-none text-xs text-slate-800 w-48 sm:w-60 placeholder-slate-400"
                />
              </div>

              {/* DEPARTMENT SELECTOR */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="rounded-xl bg-slate-100 border border-slate-200/60 px-3.5 py-2.5 text-xs text-slate-700 font-semibold outline-none cursor-pointer hover:bg-slate-200 transition"
              >
                {departments.map((dept, i) => (
                  <option key={i} value={dept.value}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 bg-white rounded-2xl border border-slate-200/80">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
              <p className="text-sm font-medium">Fetching directory from database...</p>
            </div>
          ) : filteredEmployees.length > 0 ? (
            /* DIRECTORY CARDS GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEmployees.map((emp, i) => {
                const displayName = emp.name || emp.employeeName || emp.displayName || "Employee";
                const displayRole = emp.role || emp.employeeRole || emp.designation || "Team Member";
                const displayDept = emp.dept || emp.department || "Company Wide";
                const displayEmail = emp.email || "N/A";
                const displayLocation = emp.location || emp.city || "Chennai, TN";
                const empInitial = displayName.charAt(0).toUpperCase();
                const empIdCode = emp._id ? String(emp._id).slice(-5).toUpperCase() : "EMP";

                return (
                  <motion.div
                    key={emp.id || emp._id || i}
                    whileHover={{ y: -4 }}
                    onClick={() => handleOpenDetails(emp)}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* CARD HEADER */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="relative">
                          <span className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-md">
                            {empInitial}
                          </span>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-500" />
                        </div>
                      </div>

                      {/* NAME & ROLE */}
                      <h3 className="text-lg font-bold text-[#0b2b57] line-clamp-1">
                        {displayName}
                      </h3>

                      <p className="text-xs font-semibold text-blue-600 mt-0.5">
                        {displayRole}
                      </p>

                      <span className="inline-block mt-2 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {displayDept}
                      </span>

                      {/* CONTACT INFO */}
                      <div className="space-y-2 mt-4 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Mail size={14} className="shrink-0 text-slate-400" />
                          <span className="truncate">{displayEmail}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="shrink-0 text-slate-400" />
                          <span className="truncate">{displayLocation}</span>
                        </div>
                      </div>
                    </div>

                    {/* CARD ACTION BUTTONS */}
                    <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100">
                      <a
                        href={`mailto:${displayEmail}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 text-center bg-blue-50 text-blue-700 font-semibold py-2 rounded-xl text-xs hover:bg-blue-100 transition"
                      >
                        Email
                      </a>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(emp);
                        }}
                        className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2 rounded-xl text-xs hover:bg-slate-50 transition"
                      >
                        Profile
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
              <User className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <h3 className="text-base font-bold text-slate-700">No Employees Found</h3>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search or department filter.</p>
            </div>
          )}

          {/* EMPLOYEE DETAILS MODAL */}
          {showDetails && selectedEmployee && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <EmployeeDetails
                empId={selectedEmployee}
                onClose={() => setShowDetails(false)}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
