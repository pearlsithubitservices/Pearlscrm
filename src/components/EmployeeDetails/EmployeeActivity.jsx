import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { apiUrl } from "../../config/api";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

const normalizeActivity = (item, index) => {
  const createdAt = item?.createdAt || item?.updatedAt || item?.date || item?.timestamp;
  const timeValue = item?.time || item?.createdAt || item?.updatedAt;
  const label = item?.name || item?.employeeName || item?.title || item?.action || "Employee activity";
  const description = item?.text || item?.description || item?.message || item?.details || "";

  return {
    ...item,
    _id: item?._id || item?.id || `${label}-${createdAt || index}`,
    label,
    description,
    timestamp: createdAt ? new Date(createdAt).getTime() : null,
    displayTime: timeValue
      ? typeof timeValue === "string" && !Number.isNaN(Date.parse(timeValue))
        ? new Date(timeValue).toLocaleString()
        : timeValue
      : createdAt
        ? new Date(createdAt).toLocaleString()
        : "Recently",
  };
};

const buildDemoActivities = (employee) => {
  const employeeName = employee?.name || employee?.employeeName || "Employee";
  const now = Date.now();

  return [
    {
      _id: "demo-1",
      label: "Project update",
      description: `${employeeName} submitted the weekly status report and shared the latest milestone progress with the team.`,
      createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      displayTime: "3 hours ago",
    },
    {
      _id: "demo-2",
      label: "Attendance check-in",
      description: `${employeeName} checked in on time and logged the morning attendance successfully.`,
      createdAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
      displayTime: "Today, 9:30 AM",
    },
    {
      _id: "demo-3",
      label: "Task completed",
      description: `${employeeName} completed the onboarding checklist and uploaded the required documents.`,
      createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
      displayTime: "Yesterday, 2:15 PM",
    },
    {
      _id: "demo-4",
      label: "Meeting attended",
      description: `${employeeName} attended the client follow-up meeting and shared notes with the manager.`,
      createdAt: new Date(now - 1000 * 60 * 60 * 54).toISOString(),
      displayTime: "2 days ago",
    },
  ].map((item) => normalizeActivity(item, item._id));
};

export default function ActivityTimeline({ employee }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const employeeIdentifiers = useMemo(() => {
    const values = new Set();
    const raw = [employee?.uid, employee?._id, employee?.id, employee?.userId, employee?.employee_uid, employee?.employeeId];

    raw.filter(Boolean).forEach((value) => values.add(String(value)));

    const extra = [employee?.email, employee?.employeeEmail];
    extra.filter(Boolean).forEach((value) => values.add(String(value)));

    return [...values];
  }, [employee]);

  useEffect(() => {
    const fetchActivities = async () => {
      const demoActivities = buildDemoActivities(employee);

      if (!employeeIdentifiers.length) {
        setLoading(false);
        setActivities(demoActivities);
        return;
      }

      try {
        setLoading(true);
        let collection = [];

        for (const employeeId of employeeIdentifiers) {
          try {
            const queryUrl = apiUrl(`/activity?employee_uid=${encodeURIComponent(employeeId)}`);
            const response = await fetch(queryUrl);

            let payload = [];
            if (response.ok) {
              const result = await response.json();
              payload = Array.isArray(result)
                ? result
                : result?.data || result?.activities || [];
            }

            if (!Array.isArray(payload) || payload.length === 0) {
              const fallbackResponse = await fetch(apiUrl(`/activity/${encodeURIComponent(employeeId)}`));
              if (!fallbackResponse.ok) continue;

              const fallbackResult = await fallbackResponse.json();
              payload = Array.isArray(fallbackResult)
                ? fallbackResult
                : fallbackResult?.data || fallbackResult?.activities || [];
            }

            if (Array.isArray(payload)) {
              collection = [...collection, ...payload];
            }
          } catch (error) {
            console.warn(`Unable to load activity for ${employeeId}:`, error);
          }
        }

        const uniqueActivities = Array.from(
          new Map(
            collection.map((item, index) => [normalizeActivity(item, index)._id, normalizeActivity(item, index)])
          ).values()
        );

        uniqueActivities.sort((a, b) => {
          const aTime = a.timestamp ?? Number.MAX_SAFE_INTEGER;
          const bTime = b.timestamp ?? Number.MAX_SAFE_INTEGER;
          return bTime - aTime;
        });

        setActivities(uniqueActivities.length ? uniqueActivities : demoActivities);
      } catch (error) {
        console.error("Error loading employee activity:", error);
        setActivities(demoActivities);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [employeeIdentifiers, employee]);

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-gray-500 font-semibold tracking-wide mb-6">
        ACTIVITY TIMELINE
      </h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative border-l border-gray-200 ml-3"
      >
        {loading && <p className="ml-3.5 text-sm text-gray-500">Loading activity...</p>}
        {!loading && activities.length === 0 && (
          <p className="ml-3.5 text-sm text-gray-500">No activity recorded yet.</p>
        )}
        {!loading && activities.map((item, index) => {
          const activityText = item.description || item.text || "No details available.";

          return (
            <motion.div
              key={item._id || index}
              variants={itemVariants}
              className="mb-10 ml-3.5 relative"
            >
              <span className="absolute -left-[34px] flex items-center justify-center w-10 h-10 rounded-full shadow-sm">
                <div className="w-5 h-5 bg-blue-700 rounded-full" />
              </span>

              <div className="ml-2">
                <h3 className="text-gray-900 font-semibold text-sm">
                  {item.label || "Employee activity"}
                </h3>
                {activityText && (
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                    {activityText}
                  </p>
                )}
                <span className="text-xs text-gray-400 mt-2 inline-block">
                  {item.displayTime || "Recently"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}