import React, { useState } from "react";

import MarketingDashboard from "./MarketingDashboard";
import LeadsTable from "./LeadsTable";
import CallLogs from "./CallLogs";

const MarketingActivities = () => {
  const [leads, setLeads] = useState([]);
  const [callLogs, setCallLogs] = useState([]);

  return (
    <div className="bg-[#f4f1eb] min-h-screen p-4">

      <MarketingDashboard
        leads={leads}
        callLogs={callLogs}
      />

      <div className="mt-6">
        <LeadsTable
          leads={leads}
          setLeads={setLeads}
        />
      </div>

      <div className="mt-6">
        <CallLogs
          callLogs={callLogs}
          setCallLogs={setCallLogs}
        />
      </div>

    </div>
  );
};

export default MarketingActivities;