import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiUrl } from "../../config/api.js";
import { PlusCircle, Clock, User, FileText, Send } from "lucide-react";
import { X } from "lucide-react";

export default function LeadActivity({ lead, fetchLead }) {
  const [activities, setActivities] = useState([]);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time: "",
    empName: "",
  });

  const handleDeleteActivity = async (activityId) => {
    if (!lead?._id || !activityId || !window.confirm("Delete this activity?")) return;
    try {
      const response = await fetch(apiUrl(`/leads/${lead._id}/activities/${activityId}`), {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete activity");
      const updatedLead = await response.json();
      setActivities(updatedLead.activities || []);
      fetchLead?.();
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (lead?.activities && Array.isArray(lead.activities)) {
      setActivities(lead.activities);
    } else {
      setActivities([]);
    }
  }, [lead]);

  // Handle input change
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // Add activity and sync to Backend MongoDB
  async function handleActivity() {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in both Title and Description");
      return;
    }

    const leadId = lead?._id || lead?.id;
    if (!leadId) {
      alert("Lead ID not found");
      return;
    }

    const newActivity = {
      title: formData.title,
      description: formData.description,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: formData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      empName: formData.empName || "Admin",
    };

    const updatedActivities = [newActivity, ...activities];

    setSaving(true);
    try {
      const res = await fetch(apiUrl(`/leads/${leadId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activities: updatedActivities,
        }),
      });

      if (res.ok) {
        setActivities(updatedActivities);
        setFormData({
          title: "",
          description: "",
          time: "",
          empName: "",
        });
      } else {
        alert("Failed to save activity to backend");
      }
    } catch (error) {
      console.error("Error saving activity:", error);
      alert("Failed to save activity to backend");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-[#f5f2ec] p-4 md:p-8 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto rounded-[30px]"
      >
        <div className="px-2 md:px-5">
          {/* INPUT SECTION */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-xs border border-gray-200 space-y-4">
            <h2 className="font-bold text-[#082f57] text-base md:text-lg flex items-center gap-2 border-b pb-3">
              <PlusCircle size={18} className="text-[#2563a9]" />
              <span>Log New Lead Activity</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-gray-50">
                <FileText size={16} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Activity Title (e.g. Budget Confirmed)..."
                  className="w-full bg-transparent outline-none text-xs text-gray-800 font-medium"
                />
              </div>

              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-gray-50">
                <Clock size={16} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="Duration (e.g. 15 mins)..."
                  className="w-full bg-transparent outline-none text-xs text-gray-800 font-medium"
                />
              </div>

              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-gray-50">
                <User size={16} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  name="empName"
                  value={formData.empName}
                  onChange={handleChange}
                  placeholder="Logged By (Employee Name)..."
                  className="w-full bg-transparent outline-none text-xs text-gray-800 font-medium"
                />
              </div>
            </div>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add activity details and discussion notes..."
              className="w-full h-24 bg-gray-50 border border-gray-300 rounded-xl p-3 outline-none resize-none text-xs text-gray-800 font-medium focus:bg-white focus:border-[#2563a9] transition-all"
            />

            <div className="flex justify-end pt-1">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleActivity}
                disabled={saving}
                className="bg-[#2563a9] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-xs disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Add Activity</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* NOTES TIMELINE */}
          <h2 className="font-bold text-[#082f57] text-lg mt-8 mb-6 flex items-center gap-2">
            <span>ACTIVITY TIMELINE</span>
            <span className="text-xs bg-blue-100 text-[#2563a9] px-2.5 py-0.5 rounded-full font-bold">
              {activities.length}
            </span>
          </h2>

          <div className="mt-4 relative pl-3">
            {/* Vertical line */}
            <div className="absolute top-2 left-[19px] bottom-4 w-[2px] bg-blue-200"></div>

            {activities.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center text-gray-400 italic text-xs">
                No logged activities found for this lead yet.
              </div>
            ) : (
              activities.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex gap-4 mb-6"
                >
                  {/* Dot */}
                  <div className="w-4 h-4 rounded-full bg-[#2563a9] mt-2.5 z-10 shrink-0 ring-4 ring-blue-100" />

                  {/* Content */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs w-full space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                      <h3 className="text-sm font-bold text-[#082f57]">
                        {item.title}{" "}
                        {item.time && (
                          <span className="text-xs font-normal text-blue-600">
                            • {item.time}
                          </span>
                        )}
                      </h3>
                      <span className="text-[11px] text-gray-400 font-medium  bg-gray-50 px-10 py-0.5 rounded-md border border-gray-100">
                        {item.date}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="text-[11px] text-gray-500 font-medium pt-1 flex items-center gap-1">
                      <User size={12} className="text-[#2563a9]" />
                      <span>Logged by: {item.empName || "Staff"}</span>
                    </div>
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-red-600"
                      onClick={() => handleDeleteActivity(item._id)}
                      aria-label="Delete activity"
                    >
                      <X size={16} />
                    </button>
                  </div>
              
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}