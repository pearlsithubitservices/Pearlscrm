import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Bell,
  Plus,
  Users2,
  Clock2,
  CheckCheck,
  PhoneMissed,
  User,
  Calendar,
  Download,
} from "lucide-react";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Pagination from "../components/Pagination";
import AnimateModals from "../components/Dashboard/AnimateModals";
import LoadingPage from "../components/Dashboard/Loading";
import CreateFollowups from "./CreateFollowups";
import useFollowups from "../Hooks/useFollowups";
import useEmployees from "../Hooks/useEmployees";
import { socket } from "../config/socket";
import toast from "react-hot-toast";

export default function FollowUps() {
  const { getFollowups } = useFollowups();
  const [followups, setFollowups] = useState([]);
  const { employees } = useEmployees();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateFilter, setDateFilter] = useState("All");

  const fetchdata = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const data = await getFollowups();
      setFollowups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching followups:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchdata();

    if (socket) {
      const handleSync = () => fetchdata(true);
      const handleReminder = (data) => {
        toast((t) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-blue-900">{data.title || "⏰ Follow-up Reminder"}</span>
            <span className="text-xs text-gray-700">{data.message || "You have a scheduled follow-up due!"}</span>
          </div>
        ), { icon: "⏰", duration: 6000 });
        fetchdata(true);
      };

      socket.on("followupUpdated", handleSync);
      socket.on("followupCreated", handleSync);
      socket.on("followupReminder", handleReminder);

      return () => {
        socket.off("followupUpdated", handleSync);
        socket.off("followupCreated", handleSync);
        socket.off("followupReminder", handleReminder);
      };
    }
  }, []);

  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      const name = employee.name || employee.employeeName;
      if (employee.uid) map[employee.uid] = name;
      if (employee._id) map[employee._id] = name;
      return map;
    }, {});
  }, [employees]);

  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [openFollowup, setOpenfollowup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const buttons = ["All", "Pending", "In Progress", "Completed"];

  const pending = followups.filter(
    (item) => (item.status || "").toLowerCase() === "pending"
  );
  const completed = followups.filter(
    (item) => (item.status || "").toLowerCase() === "completed"
  );

  const stats = [
    { icon: Users2, title: "Total FollowUps", value: followups.length },
    { icon: PhoneMissed, title: "Pending Calls", value: pending.length },
    { icon: Clock2, title: "Scheduled", value: followups.length - completed.length },
    { icon: CheckCheck, title: "Completed", value: completed.length },
  ];

  /* FILTER DATA BY STATUS, SEARCH, EMPLOYEE & DATE */
  const filteredData = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return followups.filter((item) => {
      const matchesSearch =
        (item.clientName || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.companyName || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        active === 0 ||
        (item.status || "").toLowerCase() === buttons[active].toLowerCase();

      const matchesEmployee =
        !selectedEmployee ||
        String(item.assignedTo) === String(selectedEmployee);

      let matchesDate = true;
      if (dateFilter === "Today") {
        matchesDate = item.date === todayStr || (item.leadSchedule || "").toLowerCase().includes("today");
      } else if (dateFilter === "Overdue") {
        matchesDate = item.status !== "Completed" && item.date && item.date < todayStr;
      }

      return matchesSearch && matchesStatus && matchesEmployee && matchesDate;
    });
  }, [search, active, selectedEmployee, dateFilter, followups]);

  /* PAGINATION */
  const filesPerPage = 5;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = filteredData.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredData.length / filesPerPage) || 1;

  const handleExportCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("No follow-up data to export");
      return;
    }

    const headers = ["Client Name", "Company Name", "Phone", "Email", "Type", "Status", "Assigned Employee", "Scheduled Date", "Scheduled Time"];
    const csvRows = [headers.join(",")];

    filteredData.forEach((item) => {
      const assignedName = employeeMap[item.assignedTo] || item.assignedTo || "Unassigned";
      const row = [
        `"${(item.clientName || "").replace(/"/g, '""')}"`,
        `"${(item.companyName || "").replace(/"/g, '""')}"`,
        `"${(item.phone || "").replace(/"/g, '""')}"`,
        `"${(item.email || "").replace(/"/g, '""')}"`,
        `"${(item.type || "Call").replace(/"/g, '""')}"`,
        `"${(item.status || "Pending").replace(/"/g, '""')}"`,
        `"${(assignedName || "").replace(/"/g, '""')}"`,
        `"${(item.date || "").replace(/"/g, '""')}"`,
        `"${(item.followupTime || "").replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Followups_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Follow-up CSV exported successfully!");
  };

  const handleTestNotification = async () => {
    try {
      await fetch(apiUrl("/followups/test-reminder"), { method: "POST" });
    } catch (e) {
      console.error("Test notification error:", e);
    }
  };

  return (
    <div className="h-screen w-full bg-[#f3f0eb] overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
      <div className="flex-1 flex flex-col w-full min-h-screen">
        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#023167] tracking-tight">
              FOLLOWUPS
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Track client FollowUps, reminders, and lead conversion
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer shadow-2xs"
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
              onClick={() => setOpenfollowup(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[#2563a9] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer shadow-2xs"
            >
              <Plus size={16} />
              Add Followup
            </button>

            <button
              onClick={handleTestNotification}
              title="Click to test live reminder notification"
              className="flex items-center gap-1.5 p-2.5 rounded-xl bg-[#2563a9] hover:bg-[#1d4ed8] text-white transition hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
            >
              <Bell size={18} />
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="p-4 md:p-6 lg:p-8 flex-1 space-y-6">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200/80 shadow-2xs"
              >
                <div className="bg-blue-50 text-[#2563a9] rounded-xl w-10 h-10 flex items-center justify-center mb-3">
                  <s.icon size={20} />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {s.title}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#0b2b57] mt-1">
                  {s.value}
                </h2>
              </motion.div>
            ))}
          </div>

          {/* FILTER BAR WITH ELEGANT ALIGNMENT */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200/80 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between gap-4 shadow-2xs">
            {/* LEFT: TITLE & STATUS PILLS */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h1 className="font-bold text-lg md:text-xl text-[#0b2b57] tracking-tight shrink-0">
                FOLLOW-UP SCHEDULE
              </h1>

              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                {buttons.map((btn, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActive(index);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      active === index
                        ? "bg-[#2563a9] text-white shadow-2xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: SEARCH */}
            <div className="flex items-center bg-gray-100 rounded-xl px-3.5 py-2 text-xs border border-gray-200/60 min-w-[240px]">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Lead or Client..."
                className="ml-2 bg-transparent outline-none w-full text-xs text-gray-800"
              />
            </div>
          </div>

          {/* TABLE CONTAINER WITH CUSTOM SCROLLBAR */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl overflow-x-auto custom-scrollbar border border-gray-200/80 shadow-2xs"
          >
            <table className="min-w-[800px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase tracking-wider border-b border-gray-200">
                <tr>
                  {["LEAD / CLIENT", "TYPE", "ASSIGNED TO", "SCHEDULED TIME", "STATUS", "ACTION"].map(
                    (head, i) => (
                      <th key={i} className="p-4 text-left">
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12">
                      <LoadingPage />
                    </td>
                  </tr>
                ) : currentFiles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500 text-sm">
                      No follow-up records found matching filter.
                    </td>
                  </tr>
                ) : (
                  currentFiles.map((item) => {
                    const assignedName =
                      employeeMap[item?.assignedTo] ||
                      item?.assignedTo ||
                      "Unassigned";

                    return (
                      <tr
                        key={item?._id}
                        onClick={() => navigate(`/followupDetails/${item._id}`)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-bold text-[#082f57]">
                            {item?.clientName || "Unknown Client"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item?.companyName || "No Company"}
                          </p>
                        </td>

                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full text-xs">
                            {item?.type || "Call"}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="bg-amber-50 text-amber-700 font-semibold px-3 py-1 rounded-full text-xs">
                            {assignedName}
                          </span>
                        </td>

                        <td className="p-4 text-xs font-medium text-gray-600">
                          {item?.followupTime || "00:00"}{" "}
                          {item?.date ? `(${item.date})` : ""}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 font-bold rounded-full text-xs inline-block ${
                              item?.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : item?.status === "In Progress"
                                ? "bg-cyan-100 text-cyan-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item?.status || "Pending"}
                          </span>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/followupDetails/${item?._id || item?.id}`);
                            }}
                            className="text-xs font-bold text-[#2563a9] hover:underline cursor-pointer bg-transparent border-0 p-0 outline-none"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </motion.div>

          {/* PAGINATION */}
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </div>

      {/* CREATE MODAL */}
      {openFollowup && (
        <AnimateModals>
          <CreateFollowups
            onClose={() => setOpenfollowup(false)}
            fetchdata={fetchdata}
          />
        </AnimateModals>
      )}
    </div>
  );
}