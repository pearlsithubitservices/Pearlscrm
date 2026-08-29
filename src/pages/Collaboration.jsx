import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Share2, MessageSquare, Lock, Zap, Eye } from "lucide-react";

const Collaboration = () => {
  const [activeTab, setActiveTab] = useState("Overview");

  const stats = [
    { icon: Users, label: "Active Teams", value: "12" },
    { icon: Share2, label: "Shared Projects", value: "28" },
    { icon: MessageSquare, label: "Active Discussions", value: "45" },
    { icon: Zap, label: "Pending Reviews", value: "8" },
  ];

  const tabs = ["Overview", "Teams", "Projects", "Activities"];

  const teams = [
    { id: 1, name: "Sales Team", members: 8, projects: 5 },
    { id: 2, name: "Development", members: 12, projects: 8 },
    { id: 3, name: "Marketing", members: 6, projects: 4 },
    { id: 4, name: "HR", members: 4, projects: 2 },
  ];

  const collaborationProjects = [
    { id: 1, name: "Q4 Campaign", team: "Marketing", status: "In Progress", progress: 65 },
    { id: 2, name: "Mobile App v2", team: "Development", status: "In Progress", progress: 40 },
    { id: 3, name: "Client Portal", team: "Development", status: "Review", progress: 85 },
    { id: 4, name: "Annual Report", team: "Sales", status: "Planning", progress: 20 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                      <Icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Collaborations</h3>
              <div className="space-y-3">
                {collaborationProjects.slice(0, 3).map((proj) => (
                  <div
                    key={proj.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{proj.name}</p>
                      <p className="text-sm text-gray-500">{proj.team}</p>
                    </div>
                    <div className="w-32">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{proj.status}</span>
                        <span>{proj.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case "Teams":
        return (
          <motion.div
            key="teams"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{team.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {team.members} members • {team.projects} projects
                    </p>
                  </div>
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm font-medium">
                    View Team
                  </button>
                  <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm font-medium">
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        );

      case "Projects":
        return (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {collaborationProjects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{proj.name}</h3>
                    <p className="text-sm text-gray-500">{proj.team}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    proj.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : proj.status === "Review"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  }`}>
                    {proj.status}
                  </span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{proj.progress}% Complete</p>
              </div>
            ))}
          </motion.div>
        );

      case "Activities":
        return (
          <motion.div
            key="activities"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Project Review Started</p>
                  <p className="text-sm text-gray-500">Client Portal - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Files Shared</p>
                  <p className="text-sm text-gray-500">Q4 Campaign - 5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Comment Added</p>
                  <p className="text-sm text-gray-500">Mobile App v2 - 1 day ago</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Collaboration Management
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Manage teams, projects, and cross-functional collaboration
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-8 px-6 pt-3 bg-white border-b border-gray-200 text-sm">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Collaboration;
