import React, { useState } from "react";
import { motion } from "framer-motion";

import LeaveOverview from "./LeaveOverview";
import LeaveBalance from "./LeaveBalance";
import LeaveHistory from "./LeaveHistory";
import LeaveRequest from "./LeaveRequest";
import AvailabilityCalendar from "./AvailabilityCalendar";
import TeamLeaveCalendar from "./TeamLeaveCalendar";
import CompanyHolidays from "./companyHolidays";

const Leave = () => {
  const handleApplyLeave = () => {
    console.log("Apply Leave Clicked");
  };

  const [formDetails, setFormDetails] = useState([]);
  const [editingRequest, setEditingRequest] = useState(null);
  console.log(formDetails);

  const handleDeleteRequest = (id) => {
    setFormDetails((prev) => prev.filter((req) => req.id !== id));
    setEditingRequest(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-h-screen  bg-[#F5F2EC] overflow-y-auto no-scrollbar"
    >
      {/* Header */}
      <div>
        <LeaveOverview onApplyLeave={handleApplyLeave}
        setFormDetails={setFormDetails}
        setEditingRequest={setEditingRequest}
        editingRequest={editingRequest} />
      </div>
      {/* Main Content */}
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="xl:col-span-2 space-y-6">

            <LeaveBalance />



            <TeamLeaveCalendar />

          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            <LeaveRequest 
            formDetails={formDetails}
            onEdit={setEditingRequest}
            onCancel={handleDeleteRequest} />

            <AvailabilityCalendar />

            <CompanyHolidays />

          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Leave;