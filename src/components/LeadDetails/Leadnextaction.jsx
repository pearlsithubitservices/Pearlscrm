import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Repeat,
  Save,
  Trash2,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiUrl } from "../../config/api.js";

export default function NextActionPage({ lead, fetchLead }) {
  const [nextAction, setNextAction] = useState(lead?.nextAction || "");
  const [nextActionDate, setNextActionDate] = useState(
    lead?.nextActionDate ? new Date(lead.nextActionDate).toISOString().slice(0, 10) : ""
  );
  const [followUpCount, setFollowUpCount] = useState(lead?.followUpCount || 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setNextAction(lead.nextAction || "");
      setNextActionDate(
        lead.nextActionDate ? new Date(lead.nextActionDate).toISOString().slice(0, 10) : ""
      );
      setFollowUpCount(lead.followUpCount || 0);
    }
  }, [lead]);

  const saveNextAction = async () => {
    const leadId = lead?._id || lead?.id;
    if (!leadId) {
      toast.error("Lead ID not found.");
      return;
    }

    setSaving(true);
    try {
      const validDateStr = nextActionDate && String(nextActionDate).trim() !== "" ? nextActionDate : null;

      const payload = {
        nextAction: nextAction || "",
        nextActionDate: validDateStr,
        followUpCount: Number(followUpCount) || 0,
      };

      // 1. Try PUT /leads/:id/next-action
      let response = await fetch(apiUrl(`/leads/${leadId}/next-action`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 2. Fallback to general PUT /leads/:id if needed
      if (!response.ok) {
        response = await fetch(apiUrl(`/leads/${leadId}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save next action");
      }

      // Also log activity if description provided
      if (nextAction.trim()) {
        const newActivity = {
          title: `Next Action: ${nextAction.slice(0, 30)}${nextAction.length > 30 ? "..." : ""}`,
          description: nextAction,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString("en-IN"),
          empName: "Admin",
        };
        const currentActivities = Array.isArray(lead?.activities) ? lead.activities : [];
        await fetch(apiUrl(`/leads/${leadId}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activities: [newActivity, ...currentActivities] }),
        }).catch(() => {});
      }

      await fetchLead?.();
      toast.success("Next action & follow-up schedule saved!");
    } catch (error) {
      console.error("Save next action error:", error);
      toast.error(error.message || "Failed to save next action");
    } finally {
      setSaving(false);
    }
  };

  const activities = Array.isArray(lead?.activities) ? lead.activities : [];

  const deleteActivity = async (activityId) => {
    const leadId = lead?._id || lead?.id;
    if (!leadId || !activityId || !window.confirm("Delete this activity log?")) return;

    try {
      const response = await fetch(apiUrl(`/leads/${leadId}/activities/${activityId}`), {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete activity");
      await fetchLead?.();
      toast.success("Activity deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-[#f3f0eb] min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* HEADER & FORM CARD */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-xs border border-gray-200 space-y-5">
          <h2 className="font-bold text-[#082f57] text-base md:text-lg flex items-center gap-2 border-b pb-3">
            <CalendarDays size={18} className="text-[#2563a9]" />
            <span>Schedule Next Action & Follow-Up</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Follow-ups count */}
            <div>
              <label className="font-bold text-gray-700 text-xs block mb-1.5 uppercase">
                Follow-ups Count
              </label>
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-300">
                <Repeat size={16} className="text-gray-400 shrink-0" />
                <input
                  type="number"
                  min="0"
                  value={followUpCount}
                  onChange={(e) => setFollowUpCount(e.target.value)}
                  placeholder="0"
                  className="outline-none w-full bg-transparent text-xs text-gray-800 font-bold"
                />
              </div>
            </div>

            {/* Reschedule Date */}
            <div>
              <label className="font-bold text-gray-700 text-xs block mb-1.5 uppercase">
                Follow Up Target Date
              </label>
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-300">
                <CalendarDays size={16} className="text-gray-400 shrink-0" />
                <input
                  type="date"
                  value={nextActionDate}
                  onChange={(e) => setNextActionDate(e.target.value)}
                  className="outline-none w-full bg-transparent text-xs text-gray-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* NEXT ACTION DESCRIPTION TEXTAREA */}
          <div>
            <label className="font-bold text-gray-700 text-xs block mb-1.5 uppercase">
              Next Action Description
            </label>
            <textarea
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="Describe the upcoming task, call target, proposal delivery, or next step for this lead..."
              className="w-full h-28 rounded-xl bg-gray-50 border border-gray-300 p-3 text-xs text-gray-800 font-medium outline-none resize-none focus:bg-white focus:border-[#2563a9] transition-all"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveNextAction}
              disabled={saving}
              className="bg-[#2563a9] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Schedule...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save Next Action</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RECENT ACTION TIMELINE */}
        <div className="space-y-4">
          <h2 className="font-bold text-[#082f57] text-lg flex items-center gap-2">
            <span>ACTION LOG HISTORY</span>
            <span className="text-xs bg-blue-100 text-[#2563a9] px-2.5 py-0.5 rounded-full font-bold">
              {activities.length}
            </span>
          </h2>

          {activities.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center text-gray-400 italic text-xs">
              No historical action log found for this lead.
            </div>
          ) : (
            <div className="relative pl-3">
              <div className="absolute top-2 left-[19px] bottom-4 w-[2px] bg-blue-200"></div>

              {activities.map((item, index) => (
                <motion.div
                  key={item._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex gap-4 mb-5"
                >
                  <div className="w-4 h-4 rounded-full bg-[#2563a9] mt-2.5 z-10 shrink-0 ring-4 ring-blue-100" />

                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs w-full space-y-1.5 relative pr-10">
                    <div className="flex items-center justify-between border-b pb-1.5">
                      <h3 className="text-xs font-bold text-[#082f57]">
                        {item.title || "Action Item"}
                      </h3>
                      {item.date && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          {item.date} {item.time ? `• ${item.time}` : ""}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {item.description}
                    </p>

                    {item.empName && (
                      <p className="text-[10px] text-gray-400 font-medium pt-1">
                        By: <span className="text-gray-700">{item.empName}</span>
                      </p>
                    )}

                    <button
                      onClick={() => deleteActivity(item._id)}
                      className="absolute top-2.5 right-2.5 text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete log"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}