import React from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import useFeedback from "../../../Hooks/useFeedback";

export default function Feedbackadmin() {
  const { feedbacks } = useFeedback();

  // Dynamic Calculation of Category Feedback Stats
  const categoryMap = {
    "Work Culture": { count: 0, sumRating: 0, color: "bg-fuchsia-500" },
    "IT & Tools": { count: 0, sumRating: 0, color: "bg-pink-600" },
    "HR Policies": { count: 0, sumRating: 0, color: "bg-emerald-500" },
    "Cafeteria": { count: 0, sumRating: 0, color: "bg-orange-500" },
    "Transport": { count: 0, sumRating: 0, color: "bg-amber-500" },
  };

  (feedbacks || []).forEach((fb) => {
    let rawCat = fb.feedbackType || fb.type || "Work Culture";
    const lower = rawCat.toLowerCase();
    let cat = "Work Culture";

    if (lower.includes("culture") || lower.includes("experience")) {
      cat = "Work Culture";
    } else if (lower.includes("hr") || lower.includes("policy")) {
      cat = "HR Policies";
    } else if (lower.includes("it") || lower.includes("tool")) {
      cat = "IT & Tools";
    } else if (lower.includes("cafe")) {
      cat = "Cafeteria";
    } else if (lower.includes("trans")) {
      cat = "Transport";
    }

    const rating = Number(fb.rating) || 4;
    categoryMap[cat].count += 1;
    categoryMap[cat].sumRating += rating;
  });

  const totalFeedbacks = feedbacks.length || 1;

  const categories = Object.keys(categoryMap).map((key) => {
    const item = categoryMap[key];
    const avgRating = item.count > 0 ? (item.sumRating / item.count).toFixed(1) : "0.0";
    const percentage = item.count > 0 ? Math.min(Math.round((item.count / totalFeedbacks) * 100), 100) : 0;

    return {
      title: key,
      value: `${percentage}%`,
      avgRating: avgRating,
      count: item.count,
      width: `${percentage}%`,
      color: item.color,
    };
  });

  return (
    <div className="bg-[#F8F5EF] p-4 sm:p-6 rounded-3xl mb-6">
      {/* Feedback Categories */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b pb-4 border-gray-100">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Feedback Categories Analytics
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Real-time employee satisfaction & category distribution
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl text-xs font-bold border border-blue-100 flex items-center gap-2">
              <MessageSquare size={16} /> Total Feedbacks: {feedbacks.length}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {categories.map((item) => (
            <div key={item.title}>
              <div className="flex justify-between items-center text-sm font-semibold mb-2 text-slate-800">
                <span className="flex items-center gap-2">
                  {item.title}
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                    ★ {item.avgRating} / 5.0
                  </span>
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {item.count} Submissions ({item.value})
                </span>
              </div>

              <div className="h-4 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: item.width }}
                  transition={{ duration: 1 }}
                  className={`h-full rounded-full ${item.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}