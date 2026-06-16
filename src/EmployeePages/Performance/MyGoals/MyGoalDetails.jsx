import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  TrendingUp,
  X,
} from "lucide-react";
import GoalOverview from "./GoalOverview";
import { useNavigate, useParams } from "react-router-dom";
import GoalProgress from "./GoalProgress";
import useGoals from "../../../Hooks/useGoals";

export default function MyGoalDetails() {
  const [activeTab, setActiveTab] = useState("overview");
  const [goals, setGoals] = useState(null);


  const navigate = useNavigate();
  const { getGoalById } = useGoals();
  const { id } = useParams();

  useEffect(() => {
 if (id) {
      fetchGoals();
    }
  }, [id]);

  const fetchGoals = async () => {
    try {


      const data = await getGoalById(id);

      console.log("Goal API Response:", data);

      setGoals(data || null);
    } catch (err) {
      console.log(err);
    }
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: FileText,
    },
    {
      id: "progress",
      label: "Update Progress",
      icon: TrendingUp,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#F5F3EE] max-h-screen overflow-y-auto no-scrollbar p-6"
    >
      <div className="max-w-6xl mx-auto bg-[#F2F0EB] rounded-[32px] overflow-hidden shadow-sm">

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <h1 className="text-[42px] font-bold text-[#0B2B57]">
                {goals?.title || "Goal Details"}
              </h1>

              <p className="mt-3 text-[20px] font-semibold text-black">
                Aligned to :
                <span className="text-[#4F7EEA] ml-2">
                  {goals?.alignedTo || "-"}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center h-fit items-center">
              <span className="bg-[#D9F7D9] text-[#2E8B57] h-fit px-6 py-2 rounded-full font-medium text-lg">
                {goals?.status?.trim() || "On Track"}
              </span>

              <span>
                <X
                  size={18}
                  className="bg-red-700 text-white rounded cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => navigate(-1)}
                />
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-b border-[#D8D4CC]">
          <div className="grid grid-cols-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-6 font-semibold text-lg transition-all flex items-center justify-center gap-2
                    ${activeTab === tab.id
                      ? "text-[#4F7EEA]"
                      : "text-gray-400"
                    }`}
                >
                  <Icon size={18} />

                  {tab.label}

                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#4F7EEA]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div>
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <GoalOverview goals={goals} />
            )}

            {activeTab === "progress" && (
              <GoalProgress goals={goals}
                setGoals={setGoals}
                fetchGoals={fetchGoals} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}