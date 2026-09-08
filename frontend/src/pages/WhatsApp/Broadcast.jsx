import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWhatsApp from "../../Hooks/useWhatsApp";
import StatusBadge from "./components/StatusBadge";

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function Broadcast() {
  const { broadcasts, fetchBroadcasts, loading } = useWhatsApp();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broadcast</h1>
          <p className="text-gray-500 text-sm mt-1">Scheduled and recurring broadcast lists</p>
        </div>
        <button
          onClick={() => navigate("/whatsapp/campaign")}
          className="flex items-center gap-2 px-5 py-2 bg-[#2563a9] text-white rounded-lg text-sm font-medium hover:bg-[#1e5090]"
        >
          <Plus className="w-4 h-4" /> New Broadcast
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {["Broadcast", "Audience", "Schedule", "Status"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : broadcasts.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No broadcasts yet. Create a campaign to get started.</td></tr>
            ) : (
              broadcasts.map((b) => (
                <motion.tr
                  key={b._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">{b.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {b.audienceLabel || `${(b.audienceCount || 0).toLocaleString()} contacts`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {b.recurring?.enabled
                      ? `Recurring ${b.recurring.frequency || "Weekly"}`
                      : b.scheduleLabel || formatDate(b.scheduledAt)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
