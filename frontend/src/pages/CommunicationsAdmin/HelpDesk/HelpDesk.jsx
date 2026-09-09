import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Clock, AlertCircle, Search, Paperclip, User } from "lucide-react";
import useTicket from "../../../Hooks/useTicket";
import useEmployees from "../../../Hooks/useEmployees";
import apiUrl from "../../../config/api";

export default function SupportTickets() {
  const { fetchTickets, tickets, updateTicketStatus } = useTicket();
  const { employees } = useEmployees();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const employeeMap = useMemo(() => {
    const map = {};
    (employees || []).forEach((emp) => {
      const name = emp.name || emp.employeeName || (emp.email ? emp.email.split('@')[0] : "Employee");
      if (emp.uid) map[emp.uid] = name;
      if (emp._id) map[emp._id] = name;
      if (emp.id) map[emp.id] = name;
    });
    return map;
  }, [employees]);

  const handleStatusChange = async (ticketId, newStatus) => {
    const updated = await updateTicketStatus(ticketId, { status: newStatus });
    await fetchTickets();

    try {
      window.dispatchEvent(
        new CustomEvent("ticketStatusUpdated", {
          detail: { ticketId, status: newStatus },
        })
      );
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTickets = (tickets || []).filter((item) => {
    const itemStatus = (item.status || "open").toLowerCase();
    if (statusFilter !== "all" && itemStatus !== statusFilter.toLowerCase()) {
      return false;
    }

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      (item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
      (item.issuedcategory && item.issuedcategory.toLowerCase().includes(q)) ||
      (item.subject && item.subject.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[600px]">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0b2b57]">
            Employee Support Tickets
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage and resolve all help desk tickets submitted by team members
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* SEARCH */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
          </div>

          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Statuses ({tickets.length})</option>
            <option value="open">Open / Pending</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved / Closed</option>
          </select>
        </div>
      </div>

      {/* TICKET LIST */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="py-20 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <AlertCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">No tickets found for the selected filter</p>
          </div>
        ) : (
          filteredTickets.map((item) => {
            const currentStatus = (item.status || "Open").toLowerCase();
            const attachmentUrl = item.attachment ? apiUrl(`/uploads/${item.attachment}`) : null;

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50/60 hover:bg-gray-50 rounded-2xl p-5 border border-gray-200/70 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* LEFT INFO */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-xl text-xs font-bold uppercase tracking-wider">
                      {item.issuedcategory || "General"}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-xl text-[11px] font-semibold border ${
                        item.priority?.toLowerCase() === "high"
                          ? "bg-red-50 text-red-600 border-red-200"
                          : item.priority?.toLowerCase() === "med" || item.priority?.toLowerCase() === "medium"
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : "bg-emerald-50 text-emerald-600 border-emerald-200"
                      }`}
                    >
                      {item.priority || "Normal"} Priority
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-[#0f172a]">
                    {item.subject || item.description}
                  </h2>

                  {item.subject && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-gray-700">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      {employeeMap[item.employeeId] || item.employeeName || "Employee"}
                    </span>
                    <span>•</span>
                    <span>Created: {new Date(item.createdAt).toLocaleDateString("en-GB")}</span>
                    {attachmentUrl && (
                      <>
                        <span>•</span>
                        <a
                          href={attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          View Attachment
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-gray-200">
                  <div className="flex flex-col items-end gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400">
                      Change Status
                    </label>
                    <select
                      value={item.status || "Open"}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold outline-none cursor-pointer border shadow-sm ${
                        currentStatus === "resolved" || currentStatus === "closed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : currentStatus === "in progress"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}