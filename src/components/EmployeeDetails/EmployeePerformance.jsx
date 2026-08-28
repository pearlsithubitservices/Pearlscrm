import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiUrl } from "../../config/api";

export default function EmployeePerformancePage({ employee }) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const employeeId = employee?.uid || employee?._id || employee?.id;

  useEffect(() => {
    const fetchReview = async () => {
      if (!employeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(apiUrl(`/review/${encodeURIComponent(employeeId)}`));
        if (response.status === 404) {
          setReview(null);
          return;
        }
        if (!response.ok) throw new Error("Unable to load employee performance");

        const result = await response.json();
        setReview(result.data || null);
      } catch (error) {
        console.error("Error loading employee performance:", error);
        setReview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [employeeId]);

  const scores = review?.metrics?.length
    ? review.metrics.map((metric, index) => ({
      label: metric.title,
      value: Math.round((metric.score / 5) * 100),
      color: ["bg-green-500", "bg-blue-500", "bg-yellow-400", "bg-orange-500"][index % 4],
    }))
    : review
      ? [{
        label: "Overall Rating",
        value: Math.round((review.overallRating / 5) * 100),
        color: "bg-blue-500",
      }]
      : [];

  return (
    <div className="min-h-screen bg-[#efede8] flex  p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-[#efedeb] rounded-3xl shadow-xl overflow-hidden"
      >
        {/* BODY */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-4">
            SCORE BREAKDOWN
          </h2>

          {loading && <p className="text-sm text-gray-500">Loading performance...</p>}
          {!loading && scores.length === 0 && (
            <p className="text-sm text-gray-500">No performance review recorded yet.</p>
          )}
          {!loading && <div className="space-y-6">
            {scores.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium text-[#0b2b57]">
                    {item.label}
                  </h3>
                  <span className="text-[#0b2b57] font-medium">
                    {item.value} %
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>}
        </div>
      </motion.div>
    </div>
  );
}