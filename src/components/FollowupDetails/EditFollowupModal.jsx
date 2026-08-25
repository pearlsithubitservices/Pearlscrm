import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, User, Briefcase, Phone, Mail, Activity, Calendar, Clock, Check } from "lucide-react";
import toast from "react-hot-toast";
import useFollowups from "../../Hooks/useFollowups";
import useEmployees from "../../Hooks/useEmployees";

export default function EditFollowupModal({ followup, onClose, onRefresh }) {
  const { updateFollowup, loading } = useFollowups();
  const { employees } = useEmployees();

  const [formData, setFormData] = useState({
    clientName: followup?.clientName || "",
    companyName: followup?.companyName || "",
    phone: followup?.phone || "",
    email: followup?.email || "",
    status: followup?.status || "Pending",
    type: followup?.type || "Call",
    assignedTo: followup?.assignedTo || "",
    followupTime: followup?.followupTime || "",
    date: followup?.date || "",
    leadSchedule: followup?.leadSchedule || "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) {
      toast.error("Client Name is required");
      return;
    }

    try {
      const followupId = followup._id || followup.id;
      await updateFollowup(followupId, formData);
      toast.success("Follow-up updated successfully!");
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Error updating followup:", err);
      toast.error(err.message || "Failed to update follow-up");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0b2d59]">Edit Follow-Up</h2>
            <p className="text-xs text-gray-500 mt-1">Update client details and schedule status</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CLIENT & COMPANY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Client Name *
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <User size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="bg-transparent outline-none w-full text-sm font-medium text-gray-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Company Name
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Briefcase size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Tech Corp"
                  className="bg-transparent outline-none w-full text-sm font-medium text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* PHONE & EMAIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Phone size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="bg-transparent outline-none w-full text-sm font-medium text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Mail size={16} className="text-gray-400 mr-2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="client@email.com"
                  className="bg-transparent outline-none w-full text-sm font-medium text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* STATUS & TYPE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Status
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Activity size={16} className="text-gray-400 mr-2" />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="bg-transparent outline-none w-full text-sm font-medium text-gray-800 cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Type
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Activity size={16} className="text-gray-400 mr-2" />
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="bg-transparent outline-none w-full text-sm font-medium text-gray-800 cursor-pointer"
                >
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Website">Website</option>
                  <option value="Meeting">Meeting</option>
                </select>
              </div>
            </div>
          </div>

          {/* ASSIGNED TO & TIME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Assigned Employee
              </label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none w-full text-sm font-medium text-gray-800"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.uid || emp._id} value={emp.uid || emp._id || emp.name}>
                    {emp.name || emp.employeeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Follow-up Time
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Clock size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="followupTime"
                  value={formData.followupTime}
                  onChange={handleChange}
                  placeholder="e.g. 10:30 AM"
                  className="bg-transparent outline-none w-full text-sm font-medium text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* SCHEDULE DATE */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Scheduled Date
            </label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <Calendar size={16} className="text-gray-400 mr-2" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="bg-transparent outline-none w-full text-sm font-medium text-gray-800"
              />
            </div>
          </div>

          {/* SUBMIT BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-[#3167dc] hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Check size={16} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
