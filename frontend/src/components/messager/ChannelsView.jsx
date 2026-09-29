import React, { useState } from "react";
import { Megaphone, Users, Hash, Plus, MessageSquare } from "lucide-react";

export default function ChannelsView() {
  const [channels] = useState([
    {
      id: "ch-1",
      name: "general-announcements",
      topic: "Company-wide updates, news & announcements",
      membersCount: 42,
      lastActive: "10 mins ago",
    },
    {
      id: "ch-2",
      name: "development-team",
      topic: "Tech discussions, deployment sync & sprint updates",
      membersCount: 18,
      lastActive: "1 hour ago",
    },
    {
      id: "ch-3",
      name: "marketing-growth",
      topic: "Campaign brainstorming, client feedback, leads updates",
      membersCount: 12,
      lastActive: "Today, 09:30",
    },
  ]);

  return (
    <div className="flex-1 flex flex-col bg-[#f4f2ec] p-6 lg:p-8 min-h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Channels</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Topic-based broadcast and team channels for all departments
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-[#0b4d8c] hover:bg-[#093d70] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition"
          >
            <Plus size={16} />
            <span>Create Channel</span>
          </button>
        </div>

        {/* Channels grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Hash size={20} />
                  </div>
                  <span className="text-xs text-gray-400">{ch.lastActive}</span>
                </div>
                <h4 className="font-bold text-gray-900 text-base mb-1">
                  #{ch.name}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">{ch.topic}</p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-gray-400" />
                  {ch.membersCount} members
                </span>
                <span className="font-semibold text-blue-600 hover:text-blue-700">
                  Open Channel &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
