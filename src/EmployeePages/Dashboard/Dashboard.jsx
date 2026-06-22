import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckSquare,
  Clock3,
  CheckCheck,
  CalendarDays,
} from "lucide-react";
import RecentTask from "./RecentTask";
import RecentFollowups from "./RecentFollowups";
import useTasks from "../../Hooks/useTaskid";
import useFollowups from "../../Hooks/useFollowups";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("tasks");
  const { tasks } = useTasks();
  const { getFollowups } = useFollowups();
  const { user } = useAuth();
  const [followups, setFollowups] = useState([]);
  const pending = tasks.filter((item) => item?.status.toLowerCase() == "pending");
  const completed = tasks.filter((item) => item?.status.toLowerCase() == "completed");

  const followupsbyid=followups.filter((item)=>item.assignedTo == user?.uid);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await getFollowups();
        const res = data.filter((item) =>
          item.assignedTo == user?.uid)
        setFollowups(res);
        console.log(res);
      }
      catch (err) {
        console.log(err);
      }
    }
    fetchdata();
  }, []);

  const stats = [
    {
      title: "Total Tasks",
      value: tasks.length,
      icon: CheckSquare,
    },
    {
      title: "Pending Tasks",
      value: pending.length,
      icon: Clock3,
    },
    {
      title: "Completed Tasks",
      value: completed.length,
      icon: CheckCheck,
    },
    {
      title: "Follow-ups Today",
      value: followupsbyid.length,
      icon: CalendarDays,
    },
  ];





  const renderTabContent = () => {
    if (activeTab === "tasks") {
      return (
        <div className="space-y-5 mt-5">

          <motion.div

            whileHover={{ y: -3 }}
            className=" rounded-2xl border border-gray-200 p-6"
          >
            <RecentTask />
          </motion.div>

        </div>
      );
    }

    return (
      <div className="space-y-5 mt-5">

        <motion.div

          whileHover={{ y: -3 }}
          className=" rounded-2xl p-1"
        >
          <RecentFollowups />
        </motion.div>

      </div>
    );
  };

  return (
    <div className="bg-[#f3f0eb] max-h-screen overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="bg-white px-10 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[#082d5b]">
            Employee Dashboard
          </h1>

          <p className="text-gray-500 mt-2 text-lg">
            Monday, 12 May 2025 - overview
          </p>
        </div>

        <button className="w-14 h-14 bg-[#2563eb] rounded-xl flex items-center justify-center">
          <Bell className="text-white" size={24} />
        </button>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <item.icon size={24} />
                </div>

                <span className="bg-green-100 text-green-500 px-3 py-1 rounded-full text-sm font-medium">
                  ↑ 8.4%
                </span>
              </div>

              <p className="text-gray-500 mt-4 text-md">
                {item.title}
              </p>

              <h2 className="text-2xl font-bold text-[#082d5b] mt-2">
                {item.value}
              </h2>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 bg-white border rounded-2xl  flex">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex-1 py-4 rounded-xl text-xl font-semibold transition-all ${activeTab === "tasks"
              ? "bg-[#2563eb] text-white"
              : "text-black"
              }`}
          >
            Recent Tasks
          </button>

          <button
            onClick={() => setActiveTab("followups")}
            className={`flex-1  rounded-xl text-xl font-semibold transition-all ${activeTab === "followups"
              ? "bg-[#2563eb] text-white"
              : "text-black"
              }`}
          >
            Recent Followups
          </button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}