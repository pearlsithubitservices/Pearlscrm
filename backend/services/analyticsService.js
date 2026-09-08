const MessageLog = require("../models/WhatsAppCampaign/MessageLog");
const Campaign = require("../models/WhatsAppCampaign/Campaign");
const Analytics = require("../models/WhatsAppCampaign/Analytics");

const SENT_STATUSES = ["sent", "delivered", "read", "clicked"];
const DELIVERED_STATUSES = ["delivered", "read", "clicked"];

const round1 = (n) => Math.round(n * 10) / 10;

const pctChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return round1(((current - previous) / previous) * 100);
};

const getDateRange = (periodDays) => {
  const end = new Date();
  const start = new Date();
  if (periodDays > 0) {
    start.setDate(start.getDate() - periodDays);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setFullYear(2000);
  }
  return { start, end };
};

const aggregateLogs = async (start, end) => {
  const query = { createdAt: { $gte: start, $lte: end } };
  const logs = await MessageLog.find(query).lean();

  const totalSent = logs.filter((l) => SENT_STATUSES.includes(l.status) || l.status === "failed").length;
  const successfulSent = logs.filter((l) => SENT_STATUSES.includes(l.status)).length;
  const totalDelivered = logs.filter((l) => DELIVERED_STATUSES.includes(l.status)).length;
  const totalRead = logs.filter((l) => l.status === "read").length;
  const totalClicked = logs.filter((l) => l.status === "clicked").length;
  const totalFailed = logs.filter((l) => l.status === "failed").length;

  const deliveryRate = successfulSent > 0 ? (totalDelivered / successfulSent) * 100 : 0;
  const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;
  const clickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;
  const conversionRate = successfulSent > 0 ? ((totalRead + totalClicked) / successfulSent) * 100 : 0;

  return {
    totalSent,
    successfulSent,
    totalDelivered,
    totalRead,
    totalClicked,
    totalFailed,
    totalResponses: totalRead + totalClicked,
    deliveryRate: round1(deliveryRate),
    readRate: round1(readRate),
    clickRate: round1(clickRate),
    conversionRate: round1(conversionRate),
  };
};

const getCampaignComparisons = async (limit = 5) => {
  const campaigns = await Campaign.find({
    status: { $in: ["completed", "running", "queued"] },
    "stats.sent": { $gt: 0 },
  })
    .sort({ completedAt: -1, createdAt: -1 })
    .limit(limit)
    .select("name stats status createdAt completedAt");

  if (campaigns.length >= limit) {
    return campaigns.map((c) => ({
      campaignId: c._id,
      name: c.name,
      sent: c.stats?.sent || 0,
      delivered: c.stats?.delivered || 0,
      read: c.stats?.read || 0,
      failed: c.stats?.failed || 0,
      clicked: c.stats?.clicked || 0,
      status: c.status,
      date: c.completedAt || c.createdAt,
    }));
  }

  const fallback = await Campaign.find({ status: { $in: ["completed", "running", "draft", "queued"] } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("name stats status createdAt completedAt");

  return fallback.map((c) => ({
    campaignId: c._id,
    name: c.name,
    sent: c.stats?.sent || 0,
    delivered: c.stats?.delivered || 0,
    read: c.stats?.read || 0,
    failed: c.stats?.failed || 0,
    clicked: c.stats?.clicked || 0,
    status: c.status,
    date: c.completedAt || c.createdAt,
  }));
};

const getDashboard = async (periodDays = 30) => {
  const { start, end } = getDateRange(periodDays);
  const current = await aggregateLogs(start, end);

  const prevEnd = new Date(start);
  const prevStart = new Date(start);
  if (periodDays > 0) {
    prevStart.setDate(prevStart.getDate() - periodDays);
  } else {
    prevStart.setFullYear(2000);
    prevEnd.setFullYear(2000);
  }
  const previous = await aggregateLogs(prevStart, prevEnd);

  const [campaignsPaused, campaignComparisons] = await Promise.all([
    Campaign.countDocuments({ status: "paused" }),
    getCampaignComparisons(5),
  ]);

  const trends = {
    deliveryRate: pctChange(current.deliveryRate, previous.deliveryRate),
    readRate: pctChange(current.readRate, previous.readRate),
    clickRate: pctChange(current.clickRate, previous.clickRate),
    conversionRate: pctChange(current.conversionRate, previous.conversionRate),
    responses: pctChange(current.totalResponses, previous.totalResponses),
  };

  return {
    periodDays: periodDays || "all",
    deliveryRate: current.deliveryRate,
    readRate: current.readRate,
    clickRate: current.clickRate,
    conversionRate: current.conversionRate,
    totalResponses: current.totalResponses,
    totalSent: current.totalSent,
    totalDelivered: current.totalDelivered,
    totalRead: current.totalRead,
    totalClicked: current.totalClicked,
    totalFailed: current.totalFailed,
    campaignsPaused,
    trends,
    campaignComparisons,
    hasData: current.totalSent > 0,
    lastUpdated: new Date().toISOString(),
  };
};

const saveDailySnapshot = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayEnd = new Date(today);
  dayEnd.setHours(23, 59, 59, 999);

  const metrics = await aggregateLogs(today, dayEnd);
  const campaignsPaused = await Campaign.countDocuments({ status: "paused" });
  const campaignComparisons = await getCampaignComparisons(5);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);
  const prevMetrics = await aggregateLogs(yesterday, yesterdayEnd);

  const trends = {
    deliveryRate: pctChange(metrics.deliveryRate, prevMetrics.deliveryRate),
    readRate: pctChange(metrics.readRate, prevMetrics.readRate),
    clickRate: pctChange(metrics.clickRate, prevMetrics.clickRate),
    conversionRate: pctChange(metrics.conversionRate, prevMetrics.conversionRate),
    responses: pctChange(metrics.totalResponses, prevMetrics.totalResponses),
  };

  return Analytics.findOneAndUpdate(
    { date: today },
    {
      date: today,
      ...metrics,
      campaignsPaused,
      trends,
      campaignComparisons,
    },
    { upsert: true, new: true }
  );
};

module.exports = {
  getDashboard,
  aggregateLogs,
  getCampaignComparisons,
  saveDailySnapshot,
  pctChange,
};
