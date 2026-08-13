import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Target,
  Clock,
  XCircle,
  Bell,
  Search,
} from "lucide-react";

const stats = [
  { title: "Total Lead", value: "1243", icon: Users, trend: "+8.4%", color: "green" },
  { title: "Hot Leads", value: "48", icon: Target, trend: "+8.4%", color: "green" },
  { title: "Pending Leads", value: "24", icon: Clock, trend: "-1.2%", color: "red" },
  { title: "Closed Leads", value: "20", icon: XCircle, trend: "-1.2%", color: "red" },
];

const leads = [
  {
    name: "Sarah Chen",
    company: "Nexigen Corp",
    status: "New",
    temp: "Warm",
    source: "LinkedIn",
    follow: "Today",
  },
  {
    name: "Vishnu",
    company: "TechFlow Solutions",
    status: "Pending",
    temp: "Hot",
    source: "Referral",
    follow: "Tomorrow",
  },
  {
    name: "Dhoni",
    company: "GreenPath Inc.",
    status: "Scheduled",
    temp: "Cold",
    source: "Website",
    follow: "Feb 14, 2025",
  },
  {
    name: "Ragavi",
    company: "Baltic Ventures",
    status: "Scheduled",
    temp: "Hot",
    source: "Cold Email",
    follow: "Feb 14, 2025",
  },
];

export default function LeadsPage() {
  const [filter, setFilter] = useState("All");

  const filteredLeads =
    filter === "All"
      ? leads
      : leads.filter((l) => l.temp.toLowerCase() === filter.toLowerCase());

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      

      {/* Main */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Leads Center</h1>
            <p className="text-gray-500">Manage all company leads</p>
          </div>
          <Bell className="bg-blue-600 text-white p-2 rounded-lg" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="bg-white p-4 rounded-xl shadow"
            >
              <div className="flex justify-between">
                <s.icon className="bg-gray-100 p-2 rounded" />
                <span
                  className={`text-sm ${
                    s.color === "green" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {s.trend}
                </span>
              </div>
              <p className="text-gray-500 mt-2">{s.title}</p>
              <h2 className="text-2xl font-bold">{s.value}</h2>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mt-8 bg-white p-4 rounded-xl shadow">
          <div className="flex gap-4">
            {["All", "Hot", "Warm", "Cold"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1 rounded-full ${
                  filter === f ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
            <Search size={16} />
            <input
              placeholder="Search Lead.."
              className="bg-transparent ml-2 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Lead</th>
                <th>Status</th>
                <th>Lead Temp</th>
                <th>Source</th>
                <th>Follow-Up</th>
              </tr>
            </thead>

            <tbody>
              {filteredLeads.map((lead, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b"
                >
                  <td className="p-3">
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.company}</p>
                  </td>

                  <td>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
                      {lead.status}
                    </span>
                  </td>

                  <td>
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs">
                      {lead.temp}
                    </span>
                  </td>

                  <td>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                      {lead.source}
                    </span>
                  </td>

                  <td className="text-sm">{lead.follow}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}