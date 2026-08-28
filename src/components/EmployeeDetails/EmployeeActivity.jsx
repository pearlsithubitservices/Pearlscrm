import React, { useEffect, useState } from "react";
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

export default function ActivityTimeline({ employee }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const employeeId = employee?.uid || employee?._id || employee?.id;

  useEffect(() => {
    const fetchActivities = async () => {
      if (!employeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(apiUrl(`/activity/${encodeURIComponent(employeeId)}`));
        if (!response.ok) throw new Error("Unable to load employee activity");

        const result = await response.json();
        setActivities(Array.isArray(result) ? result : result.data || []);
      } catch (error) {
        console.error("Error loading employee activity:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [employeeId]);

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
          return (
            <motion.div
              key={item._id || index}
              variants={itemVariants}
              className="mb-10 ml-3.5 relative"
            >
              {/* Dot */}
              <span className="absolute -left-[34px] flex items-center justify-center w-10 h-10   rounded-full shadow-sm">
                <div className="w-5  h-5 bg-blue-700 rounded-full"> </div>
              </span>

              {/* Content */}
              <div className="ml-2">
                <h3 className="text-gray-900 font-semibold text-sm">
                  {item.name || "Employee activity"}
                </h3>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                  {item.text}
                </p>
                <span className="text-xs text-gray-400 mt-2 inline-block">
                  {item.time || (item.createdAt && new Date(item.createdAt).toLocaleString())}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}