import { Building2, ChevronDown, FileText, Flag, Megaphone, X } from "lucide-react";
import React, { useState } from "react";
import useAnnouncement from "../../../Hooks/useAnnouncement";
import { useAuth } from "../../../context/AuthContext";
import { motion } from "framer-motion";

const AnnouncementForm = ({ onClose, fetchAnnouncements }) => {
  const { createAnnouncement } = useAnnouncement();
  const { user } = useAuth();

  const [form, setForm] = useState({
    priority: "Med",
    title: "",
    description: "",
    author: user?.uid,
    role: "",
    date: new Date().toLocaleDateString(),
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createAnnouncement(form); // ✅ correct payload
      await fetchAnnouncements();

      onClose(); // close modal after success

      setForm({
        priority: "Med",
        title: "",
        description: "",
        author: "",
        role: "",
        date: "",
      });

    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  return (
    <div className="relative max-h-screen overflow-y-auto no-scrollbar w-[700px] rounded-2xl shadow-xl p-6">

      {/* Header */}
      

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-5xl rounded-[32px] bg-[#F4F1EB] p-10 shadow-2xl no-scrollbar"
        >
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-8 top-8 rounded-lg p-2 hover:bg-white transition"
          >
            <X className="text-gray-600" />
          </button>

          {/* Heading */}
          <div className="flex items-center gap-4 mb-8">
            <span className="uppercase text-xs tracking-[3px] text-gray-400 whitespace-nowrap">
              New Announcement
            </span>

            <div className="flex-1 h-px bg-gray-400" />
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-[#173A63] font-bold text-xl mb-3">
              Announcement Title
            </label>

            <div className="relative">
              <Megaphone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. All Hands Meeting"
                required
                className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Department & Priority */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[#173A63] font-bold text-xl mb-3">
                Department
              </label>

              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  name="department"
                  value={form.role}
                  onChange={handleChange}
                  className="appearance-none w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-12 text-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>All</option>
                  <option>HR</option>
                  <option>Sales</option>
                  <option>Marketing</option>
                  <option>Development</option>
                </select>

                <ChevronDown
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#173A63] font-bold text-xl mb-3">
                Priority
              </label>

              <div className="relative">
                <Flag
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="appearance-none w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-12 text-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="High">High</option>
                  <option value="Med">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <ChevronDown
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <label className="text-[#173A63] font-bold text-xl">
                Description
              </label>

              <span className="text-gray-400 text-sm">
                {form.description.length}/500
              </span>
            </div>

            <div className="relative">
              <FileText
                size={18}
                className="absolute left-4 top-5 text-gray-400"
              />

              <textarea
                rows={5}
                maxLength={500}
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                placeholder="Describe the announcement..."
                className="w-full resize-none rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-5">
            <button
              type="button"
              onClick={onClose}
              className="w-40 rounded-2xl border border-gray-400 bg-white py-4 text-gray-600 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 rounded-2xl bg-[#1F66B2] py-4 text-white font-semibold text-lg hover:bg-[#16579C] transition"
            >
              Publish Announcement
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default AnnouncementForm;