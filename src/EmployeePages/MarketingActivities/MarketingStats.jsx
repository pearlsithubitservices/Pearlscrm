import React from "react";
import {
  Users,
  PhoneCall,
  UserCheck,
  CalendarDays,
} from "lucide-react";

const MarketingStats = ({
  totalLeads = 0,
  callsToday = 0,
  interestedLeads = 0,
  followUps = 0,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {/* Total Leads */}

      <div className="bg-blue-50 rounded-3xl p-6 shadow-sm border">
        <div className="flex justify-between items-center">

          <div>
            <p className="text-sm text-gray-500">
              Total Leads
            </p>

            <h2 className="text-4xl font-bold text-[#0f172a] mt-2">
              {totalLeads}
            </h2>
          </div>

          <Users
            size={38}
            className="text-blue-600"
          />

        </div>
      </div>

      {/* Calls Today */}

      <div className="bg-green-50 rounded-3xl p-6 shadow-sm border">
        <div className="flex justify-between items-center">

          <div>
            <p className="text-sm text-gray-500">
              Calls Today
            </p>

            <h2 className="text-4xl font-bold text-[#0f172a] mt-2">
              {callsToday}
            </h2>
          </div>

          <PhoneCall
            size={38}
            className="text-green-600"
          />

        </div>
      </div>

      {/* Interested Leads */}

      <div className="bg-purple-50 rounded-3xl p-6 shadow-sm border">
        <div className="flex justify-between items-center">

          <div>
            <p className="text-sm text-gray-500">
              Interested Leads
            </p>

            <h2 className="text-4xl font-bold text-[#0f172a] mt-2">
              {interestedLeads}
            </h2>
          </div>

          <UserCheck
            size={38}
            className="text-purple-600"
          />

        </div>
      </div>

      {/* Follow Ups */}

      <div className="bg-orange-50 rounded-3xl p-6 shadow-sm border">
        <div className="flex justify-between items-center">

          <div>
            <p className="text-sm text-gray-500">
              Pending Follow Ups
            </p>

            <h2 className="text-4xl font-bold text-[#0f172a] mt-2">
              {followUps}
            </h2>
          </div>

          <CalendarDays
            size={38}
            className="text-orange-600"
          />

        </div>
      </div>

    </div>
  );
};

export default MarketingStats;