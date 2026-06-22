import { X } from "lucide-react";
import React, { useState } from "react";
import useAnnouncement from "../../../Hooks/useAnnouncement";

const AnnouncementForm = ({ onClose,fetchAnnouncements }) => {
  const { createAnnouncement } = useAnnouncement();

  const [form, setForm] = useState({
    priority: "Med",
    title: "",
    description: "",
    author: "",
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
    <div className="relative max-h-screen overflow-y-auto bg-white w-[500px] rounded-2xl shadow-xl p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-[#0B2B57]">
          Create Announcement
        </h2>

        <X
          size={20}
          className="cursor-pointer"
          onClick={onClose}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Priority */}
        <div>
          <label className="text-sm font-medium">Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
          >
            <option value="High">High</option>
            <option value="Med">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            className="w-full border p-2 rounded-lg"
            required
          />
        </div>

        {/* Author */}
        <div>
          <label className="text-sm font-medium">Author</label>
          <input
            type="text"
            name="author"
            value={form.author}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* Role */}
        <div>
          <label className="text-sm font-medium">Role</label>
          <input
            type="text"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* Date (optional — better to remove in backend later) */}
        <div>
          <label className="text-sm font-medium">Date</label>
          <input
            type="text"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-[#0B2B57] text-white rounded-lg"
          >
            Create
          </button>
        </div>

      </form>
    </div>
  );
};

export default AnnouncementForm;