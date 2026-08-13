import React from "react";
import { motion } from "framer-motion";
import { exportLeaveHistoryPDF } from "./LeaveExport";
import {
  Plane,
  BriefcaseMedical,
  PartyPopper,
  Download,
  Bell,
} from "lucide-react";
import useLeave from "../../Hooks/useLeave";
import { useAuth } from "../../context/AuthContext";


const LeaveHistory = () => {
  const { leaves } = useLeave();
  const { user } = useAuth();
  console.log(leaves);

  const currentUser = leaves.filter(
    (item) => item.employeeId === user.uid
  );
  console.log(currentUser);
  const today = new Date().toDateString()

  const approvedLeaves = currentUser.filter((item) => {
    return (
      item.status?.toLowerCase() === "approved" );
  });

  console.log(approvedLeaves);


  const leaveHistoryData = [
    {
      id: 1,
      title: "Summer Vacation",
      date: "Aug 12 - Aug 18, 2024",
      days: "5 Days",
      status: "APPROVED",
      icon: Plane,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      id: 2,
      title: "Medical Checkup",
      date: "Jul 04, 2024",
      days: "1 Day",
      status: "APPROVED",
      icon: BriefcaseMedical,
      bg: "bg-orange-100",
      color: "text-orange-600",
    },
    {
      id: 3,
      title: "Family Wedding",
      date: "Jul 04, 2024",
      days: "1 Day",
      status: "APPROVED",
      icon: PartyPopper,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      id="leave-history-table"
      className="bg-white rounded-3xl border border-black/10 h-[430px] overflow-y-auto no-scrollbar p-6 lg:p-8"
    >
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-3xl font-bold text-[#0B2B57]">
          Leave History
        </h2>

        <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-all px-4 py-2 rounded-full text-sm font-medium text-[#0B2B57]"
          onClick={() => exportLeaveHistoryPDF(approvedLeaves?.length ? leaveHistoryData : "")}
        >

          <Download size={16} />

          Export PDF
        </button>
      </div>

      {/* History List */}

      <div className="space-y-5">
        {approvedLeaves.length > 0 ? approvedLeaves?.map((item) => {


          return (
            <motion.div
              key={item._id}

              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 * 0.15 }}
              className="flex items-center justify-between border-b border-gray-100 pb-5 last:border-none"
            >
              {/* Left */}

              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${item.leaveType?.toLowerCase() == "personal leave" ? "bg-green-400 text-green-600 " : item.leaveType?.toLowerCase() == "sick leave" ? "bg-red-400 text-red-600" : "bg-rose-300 text-rose-600"}`}
                >
                  <Bell
                    size={22}

                  />
                </div>

                <div>
                  <h3 className="font-bold text-xl text-[#0B2B57]">
                    {item.leaveTitle}
                  </h3>

                  <p className="text-gray-400 text-sm mt-1 flex">
                    {new Date(item.leaveFrom).toLocaleDateString("en-GB")} -{" "}
                    {new Date(item.leaveTo).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>

              {/* Right */}

              <div className="text-right">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  {item.status}
                </span>

                <p className="text-gray-700 mt-2 font-medium">
                  {item.leaveDays}  days
                </p>
              </div>
            </motion.div>
          );
        }) :
          <p className="flex mt-40 justify-center font-medium text-xl text-black w-full h-full">No Leaves in History</p>}
      </div>

    </motion.div>
  );
};

export default LeaveHistory;