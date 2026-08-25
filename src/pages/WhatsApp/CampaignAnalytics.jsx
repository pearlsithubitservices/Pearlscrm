import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Send,
  Eye,
  MousePointer,
  Target,
  MessageSquare,
  PauseCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import toast from "react-hot-toast";
import useWhatsApp from "../../Hooks/useWhatsApp";

const PERIOD_OPTIONS = [
  { id: 7, label: "7 Days" },
  { id: 30, label: "30 Days" },
  { id: 90, label: "90 Days" },
  { id: "all", label: "All Time" },
];

const MetricCard = ({ icon: Icon, label, value, trend, color }) => {
  const trendUp = trend > 0;
  const hasTrend = trend !== undefined && trend !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 p-5"
    >
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-gray-500">{label}</p>
        {hasTrend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              trendUp ? "text-green-600" : trend < 0 ? "text-red-500" : "text-gray-400"
            }`}
          >
            {trend !== 0 && (trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
    </motion.div>
  );
};

const exportToCsv = (data, periodLabel) => {
  const rows = [
    ["Metric", "Value"],
    ["Period", periodLabel],
    ["Delivery Rate", `${data.deliveryRate}%`],
    ["Read Rate", `${data.readRate}%`],
    ["Click Rate", `${data.clickRate}%`],
    ["Conversion Rate", `${data.conversionRate}%`],
    ["Total Responses", data.totalResponses],
    ["Total Sent", data.totalSent],
    ["Total Delivered", data.totalDelivered],
    ["Total Failed", data.totalFailed],
    ["Campaigns Paused", data.campaignsPaused],
    [],
    ["Campaign", "Sent", "Delivered", "Read", "Failed"],
    ...(data.campaignComparisons || []).map((c) => [
      c.name,
      c.sent,
      c.delivered,
      c.read,
      c.failed,
    ]),
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `whatsapp-analytics-${periodLabel.replace(/\s/g, "-").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function CampaignAnalytics() {
  const { analytics, fetchAnalytics, refreshAnalytics } = useWhatsApp();
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = useCallback(async (selectedPeriod) => {
    setLoading(true);
    await fetchAnalytics(selectedPeriod);
    setLoading(false);
  }, [fetchAnalytics]);

  useEffect(() => {
    loadAnalytics(period);
  }, [period, loadAnalytics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAnalytics(period);
      toast.success("Analytics refreshed");
    } catch {
      toast.error("Failed to refresh analytics");
    } finally {
      setRefreshing(false);
    }
  };

  const data = analytics || {};
  const periodLabel = PERIOD_OPTIONS.find((p) => p.id === period)?.label || "30 Days";

  const chartData = (data.campaignComparisons || []).map((c) => ({
    name: c.name?.slice(0, 18) || "Campaign",
    sent: c.sent || 0,
    delivered: c.delivered || 0,
    read: c.read || 0,
    failed: c.failed || 0,
  }));

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563a9]" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">
            Delivery, read and conversion performance
            {data.lastUpdated && (
              <span className="text-gray-400">
                {" "}· Updated {new Date(data.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => exportToCsv(data, periodLabel)}
            disabled={!data.hasData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setPeriod(opt.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              period === opt.id
                ? "bg-[#2563a9] text-white border-[#2563a9]"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {!data.hasData && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
          No message data for this period. Run a campaign to populate analytics — all metrics are calculated live from MessageLog records.
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <MetricCard
          icon={Send}
          label="Delivery Rate"
          value={`${data.deliveryRate ?? 0}%`}
          trend={data.trends?.deliveryRate}
          color="bg-blue-500"
        />
        <MetricCard
          icon={Eye}
          label="Read Rate"
          value={`${data.readRate ?? 0}%`}
          trend={data.trends?.readRate}
          color="bg-green-500"
        />
        <MetricCard
          icon={MousePointer}
          label="Click Rate"
          value={`${data.clickRate ?? 0}%`}
          trend={data.trends?.clickRate}
          color="bg-purple-500"
        />
        <MetricCard
          icon={Target}
          label="Conversion"
          value={`${data.conversionRate ?? 0}%`}
          trend={data.trends?.conversionRate}
          color="bg-orange-500"
        />
        <MetricCard
          icon={MessageSquare}
          label="Responses"
          value={(data.totalResponses ?? 0).toLocaleString()}
          trend={data.trends?.responses}
          color="bg-teal-500"
        />
        <MetricCard
          icon={PauseCircle}
          label="Campaigns Paused"
          value={data.campaignsPaused ?? 0}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Sent", value: data.totalSent ?? 0 },
          { label: "Delivered", value: data.totalDelivered ?? 0 },
          { label: "Read", value: data.totalRead ?? 0 },
          { label: "Failed", value: data.totalFailed ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-lg px-4 py-3 text-center">
            <p className="text-lg font-bold text-gray-800">{s.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-6">Campaign Comparison — Last 5 Campaigns</h2>
        {chartData.length === 0 || chartData.every((c) => c.sent === 0) ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            No campaign data yet. Run a campaign to see analytics.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="sent" fill="#2563a9" name="Sent" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delivered" fill="#22c55e" name="Delivered" radius={[4, 4, 0, 0]} />
              <Bar dataKey="read" fill="#8b5cf6" name="Read" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
