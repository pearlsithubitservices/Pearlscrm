import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ChevronDown,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function EmployeeFeedback() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Types");
  const [status, setStatus] = useState("All Status");

  const feedbacks = [
    {
      id: "PIH-1042",
      name: "Valeria Reyes",
      type: "Work Culture",
      subject: "Office ergonomics chairs",
      rating: 4,
      date: "Jul 20, 2026",
      status: "Pending",
    },
    {
      id: "PIH-1043",
      name: "Arjun Mehta",
      type: "IT & Tools",
      subject: "Slow VPN connection",
      rating: 4,
      date: "Jul 18, 2026",
      status: "Resolved",
    },
    {
      id: "PIH-1044",
      name: "Priya Nair",
      type: "HR Policies",
      subject: "WFH policy clarity",
      rating: 3,
      date: "Jul 17, 2026",
      status: "Pending",
    },
    {
      id: "PIH-1045",
      name: "Daniel Osei",
      type: "Onboarding",
      subject: "Joining kit incomplete",
      rating: 2,
      date: "Jul 10, 2026",
      status: "Pending",
    },
    {
      id: "PIH-1046",
      name: "Meera Iyer",
      type: "Transport",
      subject: "Late night cab policy",
      rating: 4,
      date: "Jun 20, 2026",
      status: "Resolved",
    },
    {
      id: "PIH-1047",
      name: "Carlos Fernandez",
      type: "Work Culture",
      subject: "Team outing frequency",
      rating: 1,
      date: "Jun 02, 2026",
      status: "Resolved",
    },
    {
      id: "PIH-1048",
      name: "Aisha Khan",
      type: "HR Policies",
      subject: "Leave approval delays",
      rating: 3,
      date: "Jun 01, 2026",
      status: "Resolved",
    },
  ];

  const filtered = useMemo(() => {
    return feedbacks.filter((item) => {
      const searchMatch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());

      const typeMatch =
        type === "All Types" || item.type === type;

      const statusMatch =
        status === "All Status" || item.status === status;

      return searchMatch && typeMatch && statusMatch;
    });
  }, [search, type, status]);

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={18}
          className={
            i <= rating
              ? "fill-blue-500 text-blue-500"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f2eb] p-6">

      {/* Header */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border px-6 py-4 flex items-center justify-between"
      >
        <h1 className="text-4xl font-bold text-slate-800">
          Employee Feedback
        </h1>

        <div className="flex gap-4">

          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-3.5 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name or ID..."
              className="w-72 pl-12 pr-4 h-12 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="appearance-none w-44 h-12 rounded-xl border px-4 outline-none"
            >
              <option>All Types</option>
              <option>Work Culture</option>
              <option>IT & Tools</option>
              <option>HR Policies</option>
              <option>Onboarding</option>
              <option>Transport</option>
            </select>

            <ChevronDown
              className="absolute right-3 top-3.5 text-gray-500"
              size={18}
            />

          </div>

          <div className="relative">

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="appearance-none w-44 h-12 rounded-xl border px-4 outline-none"
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Resolved</option>
            </select>

            <ChevronDown
              className="absolute right-3 top-3.5 text-gray-500"
              size={18}
            />

          </div>

        </div>

      </motion.div>

      {/* Table */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white mt-6 rounded-2xl border shadow-sm overflow-hidden"
      >
        <table className="w-full">

          <thead className="bg-gray-50">

            <tr className="text-slate-700">

              <th className="border p-5 text-left">EMP NAME</th>

              <th className="border p-5 text-left">TYPE</th>

              <th className="border p-5 text-left">SUBJECT</th>

              <th className="border p-5 text-center">RATING</th>

              <th className="border p-5 text-center">
                SUBMITTED DATE
              </th>

              <th className="border p-5 text-center">
                STATUS
              </th>

            </tr>

          </thead>

          <tbody>
            {filtered.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-blue-50 transition-colors"
              >
                <td className="border px-6 py-5">
                  <div>
                    <h2 className="font-semibold text-slate-800">
                      {item.name}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {item.id}
                    </p>
                  </div>
                </td>

                <td className="border px-6 py-5">
                  {item.type}
                </td>

                <td className="border px-6 py-5">
                  {item.subject}
                </td>

                <td className="border px-6 py-5 text-center">
                  <div className="flex justify-center">
                    {renderStars(item.rating)}
                  </div>
                </td>

                <td className="border px-6 py-5 text-center">
                  {item.date}
                </td>

                <td className="border px-6 py-5 text-center">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${item.status === "Resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {item.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}

        <div className="flex items-center justify-between px-6 py-5 bg-white border-t">

          <p className="text-gray-500">
            Showing <b>{filtered.length}</b> results
          </p>

          <div className="flex items-center gap-2">

            <button className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100 transition">
              <ChevronLeft size={18} />
            </button>

            <button className="w-10 h-10 rounded-lg bg-blue-600 text-white font-semibold">
              1
            </button>

            <button className="w-10 h-10 rounded-lg border hover:bg-gray-100 transition">
              2
            </button>

            <button className="w-10 h-10 rounded-lg border hover:bg-gray-100 transition">
              3
            </button>

            <button className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100 transition">
              <ChevronRight size={18} />
            </button>

          </div>

        </div>

      </motion.div>

    </div>
  );
}