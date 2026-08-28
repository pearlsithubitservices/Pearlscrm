import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Check } from "lucide-react";
import toast from "react-hot-toast";
import useEmployees from "../../../Hooks/useEmployees";
import useFollowups from "../../../Hooks/useFollowups";

const EmpFollowupOverview = ({ followups, fetchfollowups }) => {
  const { employees } = useEmployees();
  const { updateFollowup } = useFollowups();
  const [updating, setUpdating] = useState(false);

  // Dynamically map assignedTo to Employee Name from Firebase & MongoDB employees hook
  const employeeName = useMemo(() => {
    if (!followups?.assignedTo) return "Unassigned";
    const found = employees.find(
      (emp) =>
        String(emp.uid) === String(followups.assignedTo) ||
        String(emp._id) === String(followups.assignedTo) ||
        String(emp.id) === String(followups.assignedTo) ||
        (emp.email && emp.email.toLowerCase() === String(followups.assignedTo).toLowerCase()) ||
        (emp.name && emp.name.toLowerCase() === String(followups.assignedTo).toLowerCase())
    );
    return found?.name || found?.employeeName || followups.assignedTo;
  }, [employees, followups]);

  const handleMarkDone = async () => {
    const followupId = followups?._id || followups?.id;
    if (!followupId) return;

    setUpdating(true);
    try {
      await updateFollowup(followupId, {
        status: "Completed",
        isCompleted: true,
        newNote: "Marked as Completed by Employee",
        author: "Employee",
      });
      toast.success("Follow-up marked as Completed!");
      if (fetchfollowups) fetchfollowups();
    } catch (err) {
      console.error("Error marking followup completed:", err);
      toast.error("Failed to mark completed");
    } finally {
      setUpdating(false);
    }
  };

  const isCompleted = followups?.status === "Completed" || followups?.isCompleted;

  const info = [
    ["EMAIL", followups?.email || "Not specified", true],
    ["PHONE", followups?.phone || "Not specified"],
    ["TYPE", followups?.type || "Call"],
    ["ASSIGNED TO", employeeName],
    ["SCHEDULED DATE", followups?.date || followups?.leadSchedule || "Today"],
    ["FOLLOW-UP COUNT", followups?.followupCount ?? 1],
    ["FOLLOW-UP TIME", followups?.followupTime || "Not scheduled"],
    ["STATUS", followups?.status || "Pending"],
  ];

  return (
    <div className="p-6">
      <h1 className="text-xs font-bold tracking-wide text-[#999] uppercase">
        FOLLOW-UP INFORMATION
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {info.map(([title, value, blue], i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-5 border border-[#ebe7df] shadow-xs"
          >
            <p className="text-xs font-bold text-[#999] uppercase tracking-wider">
              {title}
            </p>
            <h1
              className={`mt-2 text-xl font-semibold ${
                blue ? "text-[#3167dc]" : "text-[#0b2d59]"
              }`}
            >
              {value}
            </h1>
          </motion.div>
        ))}
      </div>

      {/* DYNAMIC REMINDER */}
      <div className="mt-10">
        <h1 className="text-xs font-bold tracking-wide text-[#999] uppercase">
          FOLLOW-UP REMINDER
        </h1>

        <motion.div
          whileHover={{ y: -2 }}
          className="mt-4 bg-white rounded-xl border border-[#ebe7df] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isCompleted ? "bg-green-100 text-green-600" : "bg-blue-50 text-[#3167dc]"
              }`}
            >
              {isCompleted ? <CheckCircle2 size={24} /> : <Clock size={24} />}
            </div>

            <div>
              <h1 className="text-xl font-bold text-[#0b2d59]">
                {followups?.type || "Call"} · {followups?.date || "Scheduled Date"} ·{" "}
                {followups?.followupTime || "Time"}
              </h1>
              <p className="text-sm text-[#8c8c8c] mt-1">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    isCompleted ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {followups?.status || "Pending"}
                </span>
              </p>
            </div>
          </div>

          {!isCompleted ? (
            <button
              disabled={updating}
              onClick={handleMarkDone}
              className="px-6 py-3 rounded-xl bg-[#3167dc] hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              <Check size={16} />
              {updating ? "Updating..." : "Mark as Done"}
            </button>
          ) : (
            <span className="px-5 py-2.5 rounded-xl bg-green-100 text-green-700 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> Completed
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EmpFollowupOverview;