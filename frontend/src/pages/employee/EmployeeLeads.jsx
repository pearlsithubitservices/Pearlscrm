import React, { useEffect, useState, useRef, useMemo } from "react";
import { apiUrl } from "../../config/api.js";
import {
  Search,
  Building2,
  UserRound,
  Phone,
  Mail,
  Save,
  Users,
  Clock3,
  CircleCheckBig,
  Bell,
  ArrowRightCircle,
  IndianRupee,
  Trash2,
  X,
  MessageSquare,
  Globe,
  Calendar,
  Pencil,
  NotebookTabs,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import socket from "../../config/socket.js";

export default function EmployeeLeads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_emp_dismissed_lead_notifs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("crm_emp_dismissed_lead_notifs", JSON.stringify(dismissedNotifIds));
    } catch (e) {
      console.error("Error saving employee dismissed lead notifications to localStorage:", e);
    }
  }, [dismissedNotifIds]);

  const [selectedLead, setSelectedLead] = useState(null);

  const { user } = useAuth();
  const notifRef = useRef(null);

  const employeeId = user?.uid || user?.id || user?._id;
  const userEmail = (user?.email || "").toLowerCase().trim();
  const userName = (user?.displayName || user?.name || user?.employeeName || "").toLowerCase().trim();
  const userIds = [user?.uid, user?.id, user?._id].filter(Boolean).map((id) => String(id).toLowerCase().trim());

  // FETCH LEADS FROM BACKEND MONGODB API
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/leads"));
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : [];

        const isAssignedToUser = (val) => {
          if (!val) return false;
          if (typeof val === "object" && val !== null) {
            const vId = String(val._id || val.id || val.uid || "").toLowerCase().trim();
            const vEmail = String(val.email || "").toLowerCase().trim();
            const vName = String(val.name || val.employeeName || val.displayName || "").toLowerCase().trim();

            return (
              userIds.some((id) => id === vId) ||
              (userEmail && vEmail === userEmail) ||
              (userName && vName && (vName === userName || vName.includes(userName) || userName.includes(vName)))
            );
          } else {
            const strVal = String(val).toLowerCase().trim();
            if (!strVal) return false;
            return (
              userIds.some((id) => id === strVal) ||
              (userEmail && strVal === userEmail) ||
              (userName && (strVal === userName || strVal.includes(userName) || userName.includes(strVal)))
            );
          }
        };

        const assignedLeads = rawList.filter((lead) => {
          if (!lead) return false;
          return isAssignedToUser(lead.assignedTo) || isAssignedToUser(lead.assignedEmployee);
        });

        setLeads(assignedLeads);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.error("Error fetching employee leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [employeeId, userEmail, userName]);

  // SOCKET REALTIME LISTENERS
  useEffect(() => {
    if (socket) {
      const handleSync = () => {
        fetchLeads();
      };
      socket.on("leadCreated", handleSync);
      socket.on("leadUpdated", handleSync);
      socket.on("leadDeleted", handleSync);
      return () => {
        socket.off("leadCreated", handleSync);
        socket.off("leadUpdated", handleSync);
        socket.off("leadDeleted", handleSync);
      };
    }
  }, []);

  // CLOSE NOTIFICATIONS ON CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // MEMOIZE NOTIFICATIONS FOR EMPLOYEE
  const notifications = useMemo(() => {
    const list = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    leads.forEach((lead) => {
      if (!lead) return;
      const statusLower = (lead.status || "").toLowerCase();
      const priorityLower = (lead.priority || "").toLowerCase();
      const isClosed = statusLower === "closed" || statusLower === "converted" || statusLower === "won" || statusLower === "lost";

      const followUpDateStr = lead.nextActionDate || lead.follow || lead.followUpDate;
      let isOverdue = false;
      let followUpDate = null;

      if (followUpDateStr) {
        followUpDate = new Date(followUpDateStr);
        if (!isNaN(followUpDate.getTime()) && followUpDate < now && !isClosed) {
          isOverdue = true;
        }
      }

      const ovId = `ov-${lead._id || lead.id}`;
      const hotId = `hot-${lead._id || lead.id}`;
      const newId = `new-${lead._id || lead.id}`;

      if (isOverdue && !dismissedNotifIds.includes(ovId)) {
        list.push({
          id: ovId,
          type: "overdue",
          title: "Overdue Follow Up Warning",
          message: `Follow-up date for "${lead.name || lead.clientName || "Lead"}" is overdue!`,
          time: followUpDate ? followUpDate.toLocaleDateString("en-IN") : "Overdue",
          lead,
        });
      } else if (priorityLower === "hot" && !isClosed && !dismissedNotifIds.includes(hotId)) {
        list.push({
          id: hotId,
          type: "hot",
          title: "Hot Lead Requires Action",
          message: `Your lead "${lead.name || lead.clientName || "Lead"}" (${lead.company || "Company"}) is marked HOT.`,
          time: lead.status || "Hot Priority",
          lead,
        });
      } else if (statusLower === "new" && !dismissedNotifIds.includes(newId)) {
        list.push({
          id: newId,
          type: "new",
          title: "New Lead Assigned",
          message: `New lead "${lead.name || lead.clientName || "Lead"}" assigned to you.`,
          time: "New Status",
          lead,
        });
      }
    });

    return list;
  }, [leads, dismissedNotifIds]);

  const handleClearAllNotifs = (e) => {
    e.stopPropagation();
    const allNotifIds = notifications.map((n) => n.id);
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, ...allNotifIds])));
  };

  const handleNotifClick = (e, notif) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notif.id])));
    setShowNotifications(false);
    setSelectedLead(notif.lead);
  };

  const handleDismissNotif = (e, notifId) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notifId])));
  };

  // HANDLE INLINE INPUT CHANGE
  const handleChange = (id, field, value) => {
    setLeads((prev) =>
      prev.map((lead) => {
        const currentId = lead._id || lead.id;
        return currentId === id
          ? {
              ...lead,
              [field]: value,
            }
          : lead;
      })
    );

    if (selectedLead && (selectedLead._id === id || selectedLead.id === id)) {
      setSelectedLead((prev) => ({ ...prev, [field]: value }));
    }
  };

  // UPDATE LEAD IN BACKEND DATABASE
  const updateLead = async (leadToUpdate) => {
    const targetLead = leadToUpdate || selectedLead;
    const leadId = targetLead?._id || targetLead?.id;
    if (!leadId) return;

    try {
      const res = await fetch(apiUrl(`/leads/${leadId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: targetLead.name || targetLead.clientName || "",
          company: targetLead.company || "",
          phone: targetLead.phone || "",
          email: targetLead.email || "", 
          website: targetLead.website || "",
          source: targetLead.source || "",
          budget: targetLead.budget || "",
          platform: targetLead.platform || "",
          nextAction: targetLead.nextAction || "",
          status: targetLead.status || "new",
          priority: targetLead.priority || "cold",
          notes: targetLead.notes || "",
        }),
      });

      if (res.ok) {
        // If employee provided notes, sync to leadnotes timeline
        if (targetLead.notes && targetLead.notes.trim()) {
          await fetch(apiUrl(`/leads/${leadId}/notes`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: `Employee Note (${userName || "Staff"})`,
              description: targetLead.notes,
            }),
          }).catch(() => {});
        }

        alert("Lead updated successfully!");
        fetchLeads();
      } else {
        alert("Failed to update lead.");
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead.");
    }
  };

  const deleteLead = async (leadId) => {
    if (!leadId || !window.confirm("Delete this lead permanently?")) return;
    try {
      const response = await fetch(apiUrl(`/leads/${leadId}`), { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete lead");
      setLeads((previous) => previous.filter((lead) => (lead._id || lead.id) !== leadId));
      if (selectedLead && (selectedLead._id === leadId || selectedLead.id === leadId)) {
        setSelectedLead(null);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // CONTACT ACTIONS
  const handleCall = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert("No phone number available.");
    }
  };

  const handleEmail = (email) => {
    if (email) {
      window.location.href = `mailto:${email}`;
    } else {
      alert("No email address available.");
    }
  };

  const handleWhatsApp = (phone) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${cleanPhone}`, "_blank");
    } else {
      alert("No phone number available for WhatsApp.");
    }
  };

  // FILTER LEADS BY SEARCH
  const filteredLeads = leads.filter((lead) => {
    const clientName = lead.name || lead.clientName || "";
    const company = lead.company || "";
    const email = lead.email || "";
    const phone = lead.phone || "";
    const q = search.toLowerCase();

    return (
      company.toLowerCase().includes(q) ||
      clientName.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      phone.toLowerCase().includes(q)
    );
  });

  const pendingCount = leads.filter(
    (lead) =>
      (lead.status || "").toLowerCase() !== "closed" &&
      (lead.status || "").toLowerCase() !== "converted"
  ).length;

  const closedCount = leads.filter(
    (lead) =>
      (lead.status || "").toLowerCase() === "closed" ||
      (lead.status || "").toLowerCase() === "converted"
  ).length;

  const stats = [
    { icon: Users, title: "Total Assigned Leads", value: leads.length },
    { icon: Clock3, title: "Pending Leads", value: pendingCount },
    { icon: CircleCheckBig, title: "Closed Leads", value: closedCount },
  ];

  const getInitials = (name) => {
    if (!name) return "LD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex max-h-screen overflow-y-auto no-scrollbar bg-[#f3f0eb] min-h-screen flex-col">
      {/* TOPBAR */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-3.5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#023167]">
            Leads Center
          </h1>
          <p className="text-[11px] md:text-xs text-gray-500">
            Manage and update assigned leads in real time
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* NOTIFICATION BUTTON & POPOVER */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:bg-[#1d4ed8] transition-all cursor-pointer relative"
              aria-label="View lead notifications"
              title="View lead notifications"
            >
              <Bell size={18} className="text-white" />
              {notifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 bg-[#0b2b57] text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Bell size={16} />
                    <span className="font-bold text-sm">Lead Alerts & Reminders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAllNotifs}
                        className="text-[10px] bg-red-500/80 hover:bg-red-600 text-white px-2 py-0.5 rounded font-semibold transition cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                    <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {notifications.length} Active
                    </span>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-xs">
                      🎉 No active lead notifications right now.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={(e) => handleNotifClick(e, item)}
                        className={`p-3.5 hover:bg-gray-50 transition-colors flex items-start justify-between gap-3 text-xs cursor-pointer ${
                          item.type === "overdue"
                            ? "border-l-4 border-l-red-500 bg-red-50/30"
                            : item.type === "hot"
                            ? "border-l-4 border-l-orange-500 bg-orange-50/30"
                            : "border-l-4 border-l-blue-500 bg-blue-50/30"
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-gray-900">{item.title}</p>
                            <button
                              onClick={(e) => handleDismissNotif(e, item.id)}
                              className="text-gray-400 hover:text-red-500 p-0.5 rounded hover:bg-gray-100 transition"
                              title="Dismiss Notification"
                            >
                              <X size={13} />
                            </button>
                          </div>
                          <p className="text-gray-600 text-[11px] leading-snug">{item.message}</p>
                          <span className="text-[10px] font-medium text-gray-400 block">{item.time}</span>
                        </div>

                        <button
                          onClick={(e) => handleNotifClick(e, item)}
                          className="bg-[#2563a9] hover:bg-[#1d4ed8] text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer shadow-xs hover:scale-105 transition-transform"
                        >
                          View Details
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 flex-1">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.01 }}
              className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {s.title}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#0b2b57] mt-0.5">
                  {s.value}
                </h2>
              </div>
              <div className="bg-gray-100 p-2.5 sm:p-3 rounded-xl border border-gray-200 shrink-0">
                <s.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#2563a9]" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="font-bold text-base md:text-lg text-[#0b2b57]">
            <p>Assigned Leads</p>
          </div>

          <div className="flex items-center border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 w-full sm:w-80 md:w-96">
            <Search size={16} className="text-gray-500 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-2 w-full outline-none text-xs bg-transparent text-gray-800 placeholder-gray-400"
              placeholder="Search client, company, phone or email..."
            />
          </div>
        </div>

        {/* MOBILE & TABLET CARD VIEW */}
        <div className="block lg:hidden space-y-3">
          {loading ? (
            <div className="bg-white p-8 text-center rounded-xl border border-gray-200 text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#2563a9] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Loading leads...</span>
              </div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-xl border border-gray-200 text-gray-400 italic text-xs">
              No leads assigned to you.
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const leadId = lead._id || lead.id;
              const name = lead.name || lead.clientName || "";
              const company = lead.company || "";
              const phone = lead.phone || "";
              const email = lead.email || "";
              const budget = lead.budget || "";
              const nextAction = lead.nextAction || "";
              const priority = (lead.priority || "cold").toLowerCase();
              const status = (lead.status || "new").toLowerCase();

              return (
                <div
                  key={leadId}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3"
                >
                  {/* CARD HEADER */}
                  <div className="flex items-center justify-between gap-2 border-b pb-2.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <UserRound size={16} className="text-purple-600 shrink-0" />
                      <span
                        onClick={() => setSelectedLead(lead)}
                        className="font-bold text-xs text-[#0b2b57] truncate cursor-pointer hover:underline"
                      >
                        {name || "Unnamed Lead"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={priority}
                        onChange={(e) =>
                          handleChange(leadId, "priority", e.target.value)
                        }
                        className={`px-2 py-1 rounded-md text-[10px] font-bold border outline-none uppercase shrink-0 ${
                          priority === "hot"
                            ? "bg-red-100 text-red-700 border-red-300"
                            : priority === "warm"
                            ? "bg-orange-100 text-orange-700 border-orange-300"
                            : "bg-gray-100 text-gray-700 border-gray-300"
                        }`}
                      >
                        <option value="hot">HOT</option>
                        <option value="warm">WARM</option>
                        <option value="cold">COLD</option>
                        <option value="cool">COOL</option>
                      </select>

                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-1.5 bg-blue-50 text-[#2563a9] rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>

                  {/* INPUT FIELDS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="text-[10px] text-gray-500 font-semibold uppercase block mb-1">Company</label>
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-blue-600 shrink-0" />
                        <input
                          type="text"
                          value={company}
                          onChange={(e) =>
                            handleChange(leadId, "company", e.target.value)
                          }
                          className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 w-full text-xs text-gray-800 focus:bg-white focus:border-[#2563a9] outline-none"
                          placeholder="Company name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-semibold uppercase block mb-1">Phone</label>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-orange-600 shrink-0" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) =>
                            handleChange(leadId, "phone", e.target.value)
                          }
                          className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 w-full text-xs text-gray-800 focus:bg-white focus:border-[#2563a9] outline-none"
                          placeholder="Phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-semibold uppercase block mb-1">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-pink-600 shrink-0" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) =>
                            handleChange(leadId, "email", e.target.value)
                          }
                          className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 w-full text-xs text-gray-800 focus:bg-white focus:border-[#2563a9] outline-none"
                          placeholder="Email address"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-semibold uppercase block mb-1">Budget</label>
                      <div className="flex items-center gap-2">
                        <IndianRupee size={14} className="text-emerald-600 shrink-0" />
                        <input
                          type="text"
                          value={budget}
                          onChange={(e) =>
                            handleChange(leadId, "budget", e.target.value)
                          }
                          className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 w-full text-xs text-gray-800 focus:bg-white focus:border-[#2563a9] outline-none"
                          placeholder="Budget"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-gray-500 font-semibold uppercase block mb-1">Next Action</label>
                      <div className="flex items-center gap-2">
                        <ArrowRightCircle size={14} className="text-indigo-600 shrink-0" />
                        <input
                          type="text"
                          value={nextAction}
                          onChange={(e) =>
                            handleChange(leadId, "nextAction", e.target.value)
                          }
                          className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 w-full text-xs text-gray-800 focus:bg-white focus:border-[#2563a9] outline-none"
                          placeholder="Next action"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD FOOTER */}
                  <div className="flex items-center justify-between pt-2 border-t gap-2">
                    <select
                      value={status}
                      onChange={(e) =>
                        handleChange(leadId, "status", e.target.value)
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer capitalize ${
                        status === "closed" || status === "converted"
                          ? "bg-green-100 text-green-700 border-green-300"
                          : status === "in progress"
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-orange-100 text-orange-700 border-orange-300"
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="closed">Closed</option>
                      <option value="converted">Converted</option>
                    </select>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateLead(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563a9] hover:bg-[#1d4ed8] text-white font-semibold text-xs shadow-xs hover:scale-105 transition-all cursor-pointer"
                      >
                        <Save size={13} />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteLead(leadId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DESKTOP TABLE VIEW */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden lg:block bg-white rounded-xl overflow-x-auto custom-scrollbar border border-gray-200 shadow-xs"
        >
          <table className="w-full text-xs text-left min-w-[1200px]">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Company</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Budget</th>
                <th className="p-3.5">Next Action</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#2563a9] border-t-transparent rounded-full animate-spin" />
                      <span>Loading leads...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-400 italic">
                    No leads assigned to you.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const leadId = lead._id || lead.id;
                  const name = lead.name || lead.clientName || "";
                  const company = lead.company || "";
                  const phone = lead.phone || "";
                  const email = lead.email || "";
                  const budget = lead.budget || "";
                  const nextAction = lead.nextAction || "";
                  const priority = (lead.priority || "cold").toLowerCase();
                  const status = (lead.status || "new").toLowerCase();

                  return (
                    <tr
                      key={leadId}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      {/* NAME */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <UserRound size={15} className="text-purple-600 shrink-0" />
                          <span
                            onClick={() => setSelectedLead(lead)}
                            className="font-bold text-xs text-[#0b2b57] cursor-pointer hover:underline truncate max-w-[150px]"
                            title="Click to view full details"
                          >
                            {name || "Unnamed Lead"}
                          </span>
                        </div>
                      </td>

                      {/* COMPANY */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Building2 size={15} className="text-blue-600 shrink-0" />
                          <input
                            type="text"
                            value={company}
                            onChange={(e) =>
                              handleChange(leadId, "company", e.target.value)
                            }
                            className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 w-full text-xs text-gray-800 font-medium focus:bg-white focus:border-[#2563a9] outline-none"
                            placeholder="Company"
                          />
                        </div>
                      </td>

                      {/* PHONE */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Phone size={15} className="text-orange-600 shrink-0" />
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) =>
                              handleChange(leadId, "phone", e.target.value)
                            }
                            className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 w-full text-xs text-gray-800 font-medium focus:bg-white focus:border-[#2563a9] outline-none"
                            placeholder="Phone number"
                          />
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Mail size={15} className="text-pink-600 shrink-0" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                              handleChange(leadId, "email", e.target.value)
                            }
                            className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 w-full text-xs text-gray-800 font-medium focus:bg-white focus:border-[#2563a9] outline-none"
                            placeholder="Email address"
                          />
                        </div>
                      </td>

                      {/* BUDGET */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <IndianRupee size={15} className="text-emerald-600 shrink-0" />
                          <input
                            type="text"
                            value={budget}
                            onChange={(e) =>
                              handleChange(leadId, "budget", e.target.value)
                            }
                            className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 w-full text-xs text-gray-800 font-medium focus:bg-white focus:border-[#2563a9] outline-none"
                            placeholder="Budget"
                          />
                        </div>
                      </td>

                      {/* NEXT ACTION */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <ArrowRightCircle size={15} className="text-indigo-600 shrink-0" />
                          <input
                            type="text"
                            value={nextAction}
                            onChange={(e) =>
                              handleChange(leadId, "nextAction", e.target.value)
                            }
                            className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 w-full text-xs text-gray-800 font-medium focus:bg-white focus:border-[#2563a9] outline-none"
                            placeholder="Next action"
                          />
                        </div>
                      </td>

                      {/* PRIORITY */}
                      <td className="p-3">
                        <select
                          value={priority}
                          onChange={(e) =>
                            handleChange(leadId, "priority", e.target.value)
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer uppercase ${
                            priority === "hot"
                              ? "bg-red-100 text-red-700 border-red-300"
                              : priority === "warm"
                              ? "bg-orange-100 text-orange-700 border-orange-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }`}
                        >
                          <option value="hot">HOT</option>
                          <option value="warm">WARM</option>
                          <option value="cold">COLD</option>
                          <option value="cool">COOL</option>
                        </select>
                      </td>

                      {/* STATUS */}
                      <td className="p-3">
                        <select
                          value={status}
                          onChange={(e) =>
                            handleChange(leadId, "status", e.target.value)
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer capitalize ${
                            status === "closed" || status === "converted"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : status === "in progress"
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : "bg-orange-100 text-orange-700 border-orange-300"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="pending">Pending</option>
                          <option value="in progress">In Progress</option>
                          <option value="closed">Closed</option>
                          <option value="converted">Converted</option>
                        </select>
                      </td>

                      {/* ACTION */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563a9] font-semibold text-xs border border-blue-200 transition-all cursor-pointer"
                            title="View lead details"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => updateLead(lead)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2563a9] hover:bg-[#1d4ed8] text-white font-semibold text-xs shadow-xs hover:scale-105 transition-all cursor-pointer"
                          >
                            <Save size={13} />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteLead(leadId)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* LEAD DETAILS MODAL (OPENED FROM NOTIFICATION OR VIEW BUTTON) */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-6 relative"
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setSelectedLead(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 hover:bg-red-500 hover:text-white text-gray-500 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* MODAL HEADER */}
              <div className="flex items-center gap-4 border-b pb-5 pr-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 border border-blue-200 text-[#2563a9] font-extrabold text-xl flex items-center justify-center shrink-0">
                  {getInitials(selectedLead.name || selectedLead.clientName)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-bold text-[#082f57]">
                      {selectedLead.name || selectedLead.clientName || "Unnamed Lead"}
                    </h2>
                    <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      {selectedLead.company || "No Company"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Source: <span className="font-semibold text-gray-700">{selectedLead.source || "Direct"}</span> • Assigned Lead
                  </p>
                </div>
              </div>

              {/* QUICK CONTACT ACTION BUTTONS */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => handleCall(selectedLead.phone)}
                  className="px-4 py-2 rounded-xl bg-green-50 hover:bg-green-600 text-green-700 hover:text-white border border-green-200 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Phone size={15} />
                  <span>Call ({selectedLead.phone || "N/A"})</span>
                </button>

                <button
                  onClick={() => handleEmail(selectedLead.email)}
                  className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Mail size={15} />
                  <span>E-Mail ({selectedLead.email || "N/A"})</span>
                </button>

                <button
                  onClick={() => handleWhatsApp(selectedLead.phone)}
                  className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <MessageSquare size={15} />
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* LEAD INFORMATION GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* NAME */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Lead Name</label>
                  <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-gray-50">
                    <UserRound size={16} className="text-purple-600 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={selectedLead.name || selectedLead.clientName || ""}
                      onChange={(e) => handleChange(selectedLead._id || selectedLead.id, "name", e.target.value)}
                      className="w-full bg-transparent outline-none text-gray-800 font-medium"
                    />
                  </div>
                </div>

                {/* COMPANY */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Company</label>
                  <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-gray-50">
                    <Building2 size={16} className="text-blue-600 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={selectedLead.company || ""}
                      onChange={(e) => handleChange(selectedLead._id || selectedLead.id, "company", e.target.value)}
                      className="w-full bg-transparent outline-none text-gray-800 font-medium"
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
                  <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-gray-50">
                    <Phone size={16} className="text-orange-600 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={selectedLead.phone || ""}
                      onChange={(e) => handleChange(selectedLead._id || selectedLead.id, "phone", e.target.value)}
                      className="w-full bg-transparent outline-none text-gray-800 font-medium"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Email Address</label>
                  <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-gray-50">
                    <Mail size={16} className="text-pink-600 mr-2 shrink-0" />
                    <input
                      type="email"
                      value={selectedLead.email || ""}
                      onChange={(e) => handleChange(selectedLead._id || selectedLead.id, "email", e.target.value)}
                      className="w-full bg-transparent outline-none text-gray-800 font-medium"
                    />
                  </div>
                </div>

                {/* BUDGET */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Budget Value</label>
                  <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-gray-50">
                    <IndianRupee size={16} className="text-emerald-600 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={selectedLead.budget || ""}
                      onChange={(e) => handleChange(selectedLead._id || selectedLead.id, "budget", e.target.value)}
                      className="w-full bg-transparent outline-none text-gray-800 font-medium"
                    />
                  </div>
                </div>

                {/* NEXT ACTION */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Next Action Required</label>
                  <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-gray-50">
                    <ArrowRightCircle size={16} className="text-indigo-600 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={selectedLead.nextAction || ""}
                      onChange={(e) => handleChange(selectedLead._id || selectedLead.id, "nextAction", e.target.value)}
                      className="w-full bg-transparent outline-none text-gray-800 font-medium"
                    />
                  </div>
                </div>

                {/* PRIORITY / TEMPERATURE */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Priority Level</label>
                  <select
                    value={(selectedLead.priority || "cold").toLowerCase()}
                    onChange={(e) => handleChange(selectedLead._id || selectedLead.id, "priority", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-gray-50 outline-none text-gray-800 font-bold uppercase cursor-pointer"
                  >
                    <option value="hot">HOT (High Priority)</option>
                    <option value="warm">WARM (Medium Priority)</option>
                    <option value="cold">COLD (Low Priority)</option>
                    <option value="cool">COOL</option>
                  </select>
                </div>

                {/* STATUS */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Lead Status</label>
                  <select
                    value={(selectedLead.status || "new").toLowerCase()}
                    onChange={(e) => handleChange(selectedLead._id || selectedLead.id, "status", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-gray-50 outline-none text-gray-800 font-bold capitalize cursor-pointer"
                  >
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="closed">Closed</option>
                    <option value="converted">Converted</option>
                  </select>
                </div>

                {/* NOTES / DESCRIPTION */}
                <div className="md:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">Lead Notes & Description</label>
                  <textarea
                    rows="4"
                    value={selectedLead.notes || ""}
                    onChange={(e) => handleChange(selectedLead._id || selectedLead.id, "notes", e.target.value)}
                    placeholder="Enter lead activity notes or updates..."
                    className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 outline-none text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex justify-between items-center pt-4 border-t gap-3">
                <button
                  type="button"
                  onClick={() => deleteLead(selectedLead._id || selectedLead.id)}
                  className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={15} />
                  <span>Delete Lead</span>
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 text-xs cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => updateLead(selectedLead)}
                    className="px-6 py-2.5 rounded-xl bg-[#2563a9] hover:bg-[#1d4ed8] text-white font-semibold text-xs flex items-center gap-2 shadow-xs hover:scale-105 transition-all cursor-pointer"
                  >
                    <Save size={15} />
                    <span>Save Lead Updates</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}