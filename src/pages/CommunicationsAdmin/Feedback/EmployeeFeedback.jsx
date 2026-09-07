import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ChevronDown,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  User,
} from "lucide-react";
import useFeedback from "../../../Hooks/useFeedback";
import useEmployees from "../../../Hooks/useEmployees";

export default function EmployeeFeedback() {
  const { feedbacks } = useFeedback();
  const { employees } = useEmployees();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Types");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Helper to resolve real employee name dynamically from employees DB
  const getEmployeeDisplayName = (item) => {
    if (item.anonymous || item.employeeName === "Anonymous" || item.employeeName === "Anonymous Employee") {
      return "Employee";
    }

    if (item.employeeName && item.employeeName.trim()) {
      return item.employeeName;
    }

    // Cross-match employeeId with employees fetched from database
    const matched = (employees || []).find(
      (emp) =>
        (emp._id && String(emp._id) === String(item.employeeId)) ||
        (emp.id && String(emp.id) === String(item.employeeId)) ||
        (emp.uid && String(emp.uid) === String(item.employeeId)) ||
        (emp.email && item.employeeId && String(emp.email).toLowerCase() === String(item.employeeId).toLowerCase())
    );

    if (matched) {
      return matched.name || matched.employeeName || (matched.email ? matched.email.split("@")[0] : "Employee");
    }

    return item.name || "Employee";
  };

  const filtered = useMemo(() => {
    return (feedbacks || []).filter((item) => {
      const empName = getEmployeeDisplayName(item).toLowerCase();
      const subject = (item.subject || item.message || item.comments || "").toLowerCase();
      const fbType = item.feedbackType || item.type || "General";

      const q = search.toLowerCase();
      const searchMatch = !search.trim() || empName.includes(q) || subject.includes(q);
      const typeMatch = type === "All Types" || fbType.toLowerCase() === type.toLowerCase();

      return searchMatch && typeMatch;
    });
  }, [feedbacks, employees, search, type]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const renderStars = (rating = 4) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          className={
            i <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );

  return (
    <div className="bg-[#f6f2eb] p-4 sm:p-6 rounded-3xl">
      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Employee Feedback Submissions
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Review feedback submitted by organization employees ({filtered.length} items)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* SEARCH */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search Name or Subject..."
              className="w-56 pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>

          {/* TYPE FILTER */}
          <div className="relative">
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setCurrentPage(1); }}
              className="appearance-none w-44 text-xs font-semibold rounded-xl border border-gray-200 px-3 py-2 outline-none bg-gray-50 cursor-pointer"
            >
              <option>All Types</option>
              <option>Workplace Experience</option>
              <option>Work Culture</option>
              <option>IT & Tools</option>
              <option>HR Policies</option>
              <option>Cafeteria</option>
              <option>Transport</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white mt-6 rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="p-4">Employee Username / Name</th>
                <th className="p-4">Category / Type</th>
                <th className="p-4">Subject / Message</th>
                <th className="p-4 text-center">Rating</th>
                <th className="p-4 text-center">Submitted Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => {
                  const empName = getEmployeeDisplayName(item);
                  const empIdCode = item._id ? String(item._id).slice(-5).toUpperCase() : "FB";
                  const fbType = item.feedbackType || item.type || "General";
                  const fbSubject = item.subject || item.message || item.comments || "Feedback Submission";
                  const fbRating = Number(item.rating) || 4;
                  const fbDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "Recent";

                  return (
                    <motion.tr
                      key={item._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                            {empName.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <h2 className="font-bold text-slate-800 text-sm">
                              {empName}
                            </h2>
                            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              #{empIdCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100">
                          {fbType}
                        </span>
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="font-medium text-slate-800 truncate">
                          {fbSubject}
                        </p>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          {renderStars(fbRating)}
                        </div>
                      </td>

                      <td className="p-4 text-center text-gray-500 font-medium">
                        {fbDate}
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400">
                    <AlertCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-sm">No feedback submissions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100 text-xs">
          <p className="text-gray-500">
            Showing <b>{paginatedData.length}</b> of <b>{filtered.length}</b> results
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 py-1 font-bold text-blue-600 bg-blue-50 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}