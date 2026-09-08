import React from "react";
import {
  Users,
  Phone,
  UserCheck,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

const MarketingDashboard = ({ leads = [], callLogs = [] }) => {
  const totalLeads = leads.length;

  const interestedLeads = leads.filter(
    (lead) => lead.status === "Interested"
  ).length;

  const followUps = leads.filter(
    (lead) => lead.status === "Follow Up"
  ).length;

  const callsToday = callLogs.filter((log) => {
    const today = new Date().toDateString();

    return (
      new Date(log.callDate).toDateString() === today
    );
  }).length;

  return (
    <div className="p-6">

      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0b2b57]">
          Marketing Activities
        </h1>

        <p className="text-gray-500 mt-2">
          Manage leads, calls and follow ups
        </p>
      </div>

      {/* STATS */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-white rounded-3xl p-6 shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">
                Total Leads
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {totalLeads}
              </h2>
            </div>

            <Users
              size={40}
              className="text-blue-600"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">
                Calls Today
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {callsToday}
              </h2>
            </div>

            <Phone
              size={40}
              className="text-green-600"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">
                Interested
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {interestedLeads}
              </h2>
            </div>

            <UserCheck
              size={40}
              className="text-purple-600"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">
                Follow Ups
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {followUps}
              </h2>
            </div>

            <CalendarDays
              size={40}
              className="text-orange-600"
            />
          </div>
        </div>

      </div>

      {/* PERFORMANCE */}

      <div className="bg-white rounded-3xl p-6 mt-6 border shadow-sm">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#0b2b57]">
            Performance Overview
          </h2>

          <TrendingUp className="text-green-600" />
        </div>

        <div className="space-y-5">

          <div>
            <div className="flex justify-between mb-2">
              <span>Total Leads Target</span>
              <span>{totalLeads}/100</span>
            </div>

            <div className="h-3 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${Math.min(
                    (totalLeads / 100) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span>Conversion Progress</span>
              <span>{interestedLeads}</span>
            </div>

            <div className="h-3 bg-gray-200 rounded-full">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${Math.min(
                    (interestedLeads /
                      (totalLeads || 1)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default MarketingDashboard;