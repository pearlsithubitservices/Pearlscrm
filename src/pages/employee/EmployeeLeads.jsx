import React, { useEffect, useState } from "react";
import { apiUrl } from "../../config/api.js";
import {
  Search,
  Building2,
  UserRound,
  Phone,
  Mail,
  Globe,
  Save,
  Users,
  Clock3,
  CircleCheckBig,
  Bell,
  Filter,
  ArrowRightCircle,
  IndianRupee,
} from "lucide-react";
import { motion } from "framer-motion";

export default function EmployeeLeads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  const filterTabs = ["All", "Pending", "Closed"];

  useEffect(() => {
    fetchLeads();
  }, []);

  // FETCH LEADS FROM BACKEND MONGODB API
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/leads"));
      if (res.ok) {
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : []);
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
  };

  // UPDATE LEAD IN BACKEND DATABASE
  const updateLead = async (lead) => {
    const leadId = lead._id || lead.id;
    if (!leadId) return;

    try {
      const res = await fetch(apiUrl(`/leads/${leadId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: lead.name || lead.clientName || "",
          company: lead.company || "",
          phone: lead.phone || "",
          email: lead.email || "",
          website: lead.website || "",
          source: lead.source || "",
          budget: lead.budget || "",
          platform: lead.platform || "",
          nextAction: lead.nextAction || "",
          status: lead.status || "new",
          priority: lead.priority || "cold",
          notes: lead.notes || "",
        }),
      });

      if (res.ok) {
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

  // FILTER LEADS BY SEARCH & TAB
  const filteredLeads = leads.filter((lead) => {
    const clientName = lead.name || lead.clientName || "";
    const company = lead.company || "";
    const email = lead.email || "";

    const matchesSearch =
      company.toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());

    const isClosed =
      (lead.status || "").toLowerCase() === "closed" ||
      (lead.status || "").toLowerCase() === "converted";

    if (activeTab === "Pending") {
      return matchesSearch && !isClosed;
    }
    if (activeTab === "Closed") {
      return matchesSearch && isClosed;
    }
    return matchesSearch;
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
    { icon: Users, title: "Total Leads", value: leads.length },
    { icon: Clock3, title: "Pending Leads", value: pendingCount },
    { icon: CircleCheckBig, title: "Closed Leads", value: closedCount },
  ];

  return (
    <div className="flex max-h-screen overflow-y-auto custom-scrollbar bg-[#f3f0eb] min-h-screen flex-col">
      {/* TOPBAR */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#023167]">
            Leads Center
          </h1>
          <p className="text-[11px] md:text-xs text-gray-500">
            Manage and update assigned company leads in real time
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-105 transition-transform duration-200 shadow-xs">
            <Filter size={16} className="text-white" />
          </button>
          <button className="p-2 border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-105 transition-transform duration-200 shadow-xs">
            <Bell size={16} className="text-white" />
          </button>
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

        {/* FILTER BAR & SEARCH */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="font-bold text-base md:text-lg text-[#0b2b57]">
            <p>Lead List</p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all text-center ${
                  activeTab === tab
                    ? "bg-[#2563a9] text-white shadow-xs"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 w-full sm:w-72 md:w-80">
            <Search size={16} className="text-gray-500 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-2 w-full outline-none text-xs bg-transparent text-gray-800 placeholder-gray-400"
              placeholder="Search client, company or email..."
            />
          </div>
        </div>

        {/* MOBILE & TABLET CARD VIEW (Visible on small screens < lg) */}
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
              No leads found matching criteria.
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
                      <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                          handleChange(leadId, "name", e.target.value)
                        }
                        className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 w-full text-xs text-gray-800 font-bold focus:bg-white focus:border-[#2563a9] outline-none truncate"
                        placeholder="Lead name"
                      />
                    </div>

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
                  </div>

                  {/* INPUT FIELDS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {/* COMPANY */}
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

                    {/* PHONE */}
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

                    {/* EMAIL */}
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

                    {/* BUDGET */}
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

                    {/* NEXT ACTION */}
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

                    <button
                      onClick={() => updateLead(lead)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2563a9] hover:bg-[#1d4ed8] text-white font-semibold text-xs shadow-xs hover:scale-105 transition-all"
                    >
                      <Save size={13} />
                      <span>Save Lead</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DESKTOP TABLE VIEW (Visible on large screens >= lg) */}
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
                    No leads found matching criteria.
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
                          <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                              handleChange(leadId, "name", e.target.value)
                            }
                            className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 w-full text-xs text-gray-800 font-medium focus:bg-white focus:border-[#2563a9] outline-none"
                            placeholder="Lead name"
                          />
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
                        <button
                          onClick={() => updateLead(lead)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563a9] hover:bg-[#1d4ed8] text-white font-semibold text-xs shadow-xs hover:scale-105 transition-all"
                        >
                          <Save size={13} />
                          <span>Save</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}