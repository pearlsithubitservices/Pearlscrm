import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Flag,
  MessageCircleMore,
  Users,
  BadgeCheck,
  Target,
} from "lucide-react";

import MyGoals from "./MyGoals/MyGoals";
import AddGoalForm from "./MyGoals/AddGoal";
 import TrainingLearning from "./Training&Learning/Dashboard";
// import PerformanceReviews from "./PerformanceReviews";
// import SkillsCertifications from "./SkillsCertifications";

const stats = [
  {
    icon: Flag,
    title: "Goals on track",
    value: "05",
    badge: "3 Active",
  },
  {
    icon: MessageCircleMore,
    title: "Last Review Score",
    value: "4.2 / 5",
    badge: "4.2 ⭐",
  },
  {
    icon: Users,
    title: "Courses Completed",
    value: "02",
    badge: "2 in progress",
  },
  {
    icon: BadgeCheck,
    title: "Certifications",
    value: "05",
    badge: "2 in progress",
  },
];

export default function PerformanceGrowth() {
  const [showModel, setShowModel] = useState("mygoals");
  const [goalform, setGoalform] = useState(false);

  const tabs = [
    {
      id: "mygoals",
      label: "My Goals",
    },
    {
      id: "training",
      label: "Training & Learning",
    },
    {
      id: "reviews",
      label: "Performance Reviews",
    },
    {
      id: "skills",
      label: "Skills & Certifications",
    },
  ];

  return (
    <div className="max-h-screen overflow-y-auto no-scrollbar bg-[#F5F2EC]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start mb-8 bg-white p-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#0b2b57]">
            Performance & Growth
          </h1>

          <p className="text-gray-500 mt-2 text-sm">
            Manage and track employee performance through goals
          </p>
        </div>

        <button className="w-12 h-12 rounded-xl bg-[#0b5db5] text-white flex items-center justify-center shadow-md">
          <Bell size={20} />
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8 px-4">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex justify-between mb-6">
                <div className="w-12 h-12 rounded-xl border bg-gray-50 flex items-center justify-center">
                  <Icon size={22} />
                </div>

                <span className="bg-green-100 text-green-600 px-3 flex items-center h-[25px] rounded-full text-sm font-medium">
                  {item.badge}
                </span>
              </div>

              <p className="text-gray-500">
                {item.title}
              </p>

              <h3 className="text-3xl font-bold text-[#0b2b57] mt-2">
                {item.value}
              </h3>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl mx-6 border border-gray-200 p-4 mb-8 flex flex-wrap justify-between items-center gap-4"
      >
        <div className="flex flex-wrap gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setShowModel(tab.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-transform duration-1000 ${showModel === tab.id
                ? "bg-[#0b5db5] text-white"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button className="bg-gray-100 px-6 py-3 rounded-xl flex items-center gap-2 text-gray-700 font-medium hover:bg-gray-200 transition"
          onClick={() => setGoalform(true)}>
          <Target size={18} />
          Add Goal
        </button>
      </motion.div>

      {/* Content */}
      <motion.div
        key={showModel}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className=" pb-2"
      >
        {showModel === "mygoals" && <MyGoals />}

        {showModel === "training" && (
         
           <TrainingLearning />
        )}

        {showModel === "reviews" && (
          <p>Reviews</p>
          //<PerformanceReviews />
        )}

        {showModel === "skills" && (
          <p>Skills</p>
          //<SkillsCertifications />
        )}
      </motion.div>
      {goalform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <AddGoalForm
              onClose={() => setGoalform(false)}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}