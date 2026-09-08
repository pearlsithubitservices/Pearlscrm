import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Zap, Cpu, HardDrive, Activity } from "lucide-react";
import useWhatsApp from "../../Hooks/useWhatsApp";

const ProgressBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-800">{value}%</span>
    </div>
    <div className="bg-gray-100 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default function LiveQueue() {
  const { liveQueue, fetchLiveQueue } = useWhatsApp();

  useEffect(() => {
    fetchLiveQueue();
    const interval = setInterval(fetchLiveQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = liveQueue || {};
  const queue = stats.queue || {};

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Real-Time Sending Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {queue.campaignName || "No active campaign"} — Live message queue
          </p>
        </div>
        {stats.isLive && (
          <span className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live — Broadcasting
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Messages Sent", value: stats.messagesSent || 0, icon: Send, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Delivered", value: `${stats.deliveryRate || 0}%`, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
          { label: "Failed", value: `${stats.failRate || 0}%`, icon: Zap, color: "text-red-500", bg: "bg-red-50" },
          { label: "Active Workers", value: stats.activeWorkers || 0, icon: Activity, color: "text-purple-500", bg: "bg-purple-50" },
        ].map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-100 p-5"
          >
            <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Queue Progress</h2>
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{(stats.total || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Queue</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{queue.messagesPerMinute || 0}</p>
              <p className="text-xs text-gray-500">Messages / min</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{queue.activeWorkers || 0}</p>
              <p className="text-xs text-gray-500">Active Workers</p>
            </div>
          </div>
          <div className="space-y-4">
            <ProgressBar label="Delivery Queue" value={queue.queues?.delivery || 0} color="bg-blue-500" />
            <ProgressBar label="Processing Queue" value={queue.queues?.processing || 0} color="bg-orange-400" />
            <ProgressBar label="Retry Queue" value={queue.queues?.retry || 0} color="bg-yellow-400" />
            <ProgressBar label="Batch Queue" value={queue.queues?.batch || 0} color="bg-teal-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> System Load
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">CPU Usage</p>
                <p className="text-xl font-bold">62%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">RAM Usage</p>
                <p className="text-xl font-bold">4.1 / 8 GB</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">API Calls / min</p>
                <p className="text-xl font-bold">{queue.messagesPerMinute ? Math.floor(queue.messagesPerMinute * 1.3) : 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Live Logs</h2>
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 h-40 overflow-y-auto space-y-1">
          {(queue.liveLogs || []).length === 0 ? (
            <p className="text-gray-500">Waiting for campaign activity...</p>
          ) : (
            queue.liveLogs.map((log, i) => (
              <p key={i}>
                <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
