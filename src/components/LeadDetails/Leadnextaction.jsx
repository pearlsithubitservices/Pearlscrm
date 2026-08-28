import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Repeat,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiUrl } from "../../config/api.js";

export default function NextActionPage({ lead, fetchLead }) {
  const [nextAction, setNextAction] = useState(lead?.nextAction || "");
  const [nextActionDate, setNextActionDate] = useState(lead?.nextActionDate ? new Date(lead.nextActionDate).toISOString().slice(0, 10) : "");
  const [followUpCount, setFollowUpCount] = useState(lead?.followUpCount || 0);
  const [saving, setSaving] = useState(false);

  const saveNextAction = async () => {
    if (!lead?._id) return;
    setSaving(true);
    try {
      const response = await fetch(apiUrl(`/leads/${lead._id}/next-action`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextAction, nextActionDate, followUpCount }),
      });
      if (!response.ok) throw new Error("Failed to save next action");
      await fetchLead();
      toast.success("Next action saved");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const activities = Array.isArray(lead?.activities) ? lead.activities : [];

  const deleteActivity = async (activityId) => {
    if (!activityId || !window.confirm("Delete this activity?")) return;
    try {
      const response = await fetch(apiUrl(`/leads/${lead._id}/activities/${activityId}`), { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete activity");
      await fetchLead();
      toast.success("Activity deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f0eb] flex justify-center p-2 md:p-5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-7xl bg-[#f3f0eb] rounded-[35px] overflow-hidden"
      >
        {/* TOP HEADER */}
        

        {/* TABS */}
        

        {/* CONTENT */}
        <div className="p-5 md:p-8">

          <h2 className="font-bold text-gray-500 text-xl mb-6">
            NEXT ACTION
          </h2>

          {/* INPUT SECTION */}

          <div className="grid lg:grid-cols-2 gap-6">

            {/* Follow count */}

            <div>
              <label className="font-bold text-[#082f57] text-xl block mb-3">
                Follow-ups Count
              </label>

              <div className="bg-white rounded-xl p-4 flex items-center gap-3 border">

                <Repeat
                  size={18}
                  className="text-gray-400"
                />

                <input
                  type="number"
                  min="0"
                  value={followUpCount}
                  onChange={(e) => setFollowUpCount(e.target.value)}
                  placeholder="0"
                  className="outline-none w-full bg-transparent"
                />
              </div>
            </div>

            {/* Reschedule */}

            <div>
              <label className="font-bold text-[#082f57] text-xl block mb-3">
                Reschedule Follow Up
              </label>

              <div className="bg-white rounded-xl p-4 flex items-center gap-3 border">

                <CalendarDays
                  size={18}
                  className="text-gray-400"
                />

                <input
                  type="date"
                  value={nextActionDate}
                  onChange={(e) => setNextActionDate(e.target.value)}
                  className="outline-none w-full"
                />

              </div>
            </div>

          </div>

          {/* TEXTAREA */}

          <div className="mt-6">

            <textarea
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="Describe the next action..."
              className="
              w-full
              h-[140px]
              rounded-2xl
              bg-white
              border
              p-5
              resize-none
              outline-none
            "
            />

            <div className="flex justify-end mt-5">

              <button
                onClick={saveNextAction}
                disabled={saving}
                className="
                bg-blue-600
                text-white
                px-8
                py-2
                rounded-full
                font-medium
                hover:scale-105
                transition
              "
              >
                {saving ? "Saving..." : "Save"}
              </button>

            </div>
          </div>

          {/* TIMELINE */}

          <div className="mt-12 relative ml-3">

            <div className="absolute top-0 left-[9px] w-[2px] h-full bg-gray-300"></div>

            {activities.map((item, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: index * 0.2,
                }}
                className="relative pl-10 mb-12"
              >
                <div className="absolute left-[-1px] top-2 w-5 h-5 rounded-full bg-blue-600"></div>

                <h3 className="font-bold text-[#082f57] text-2xl">
                  {item.title}
                </h3>

                <p className="text-gray-500 text-lg mt-2 max-w-3xl">
                  {item.description}
                </p>

                <p className="text-gray-400 mt-2 text-lg">
                  {item.date} {item.empName ? `· ${item.empName}` : ""}
                </p>

                <button
                  onClick={() => deleteActivity(item._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>

              </motion.div>
            ))}

          </div>

        </div>
      </motion.div>
    </div>
  );
}