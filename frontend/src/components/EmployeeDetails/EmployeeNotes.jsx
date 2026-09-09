import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trash2, FileText, Send, Calendar, Clock } from "lucide-react";
import { apiUrl } from "../../config/api.js";
import api from "../../lib/api.js";

export const normalizeNotes = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    // Plain text fallback
  }

  const str = String(value).trim();
  if (!str) return [];

  return [
    {
      title: "Employee Note",
      description: str,
      date: new Date().toLocaleString(),
    },
  ];
};

export default function EmployeeNotes({ employee, employeeId, onNoteUpdated }) {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);

  const rawNotes = useMemo(() => {
    return (
      employee?.notes ||
      employee?.description ||
      employee?.profile?.description ||
      employee?.profile?.notes ||
      ""
    );
  }, [employee]);

  useEffect(() => {
    setNotes(normalizeNotes(rawNotes));
  }, [rawNotes]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const syncNotesToBackend = async (updatedNotes) => {
    const empId = employeeId || employee?._id || employee?.id || employee?.uid;
    if (!empId) throw new Error("Employee ID not found");

    const serializedNotes = JSON.stringify(updatedNotes);

    // 1. Try updating via auth/users description endpoint
    let saved = false;
    try {
      await api.put(`/auth/users/${empId}/description`, { description: serializedNotes });
      saved = true;
    } catch (_) {}

    // 2. Also try updating via /employees endpoint
    try {
      const res = await fetch(apiUrl(`/employees/${empId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: serializedNotes, description: serializedNotes }),
      });
      if (res.ok) saved = true;
    } catch (_) {}

    if (!saved) {
      throw new Error("Unable to save note to server");
    }
  };

  async function handleAddNote() {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please enter both a title and note description.");
      return;
    }

    const newNote = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedNotes = [newNote, ...notes];

    try {
      setLoading(true);
      await syncNotesToBackend(updatedNotes);
      setNotes(updatedNotes);
      setFormData({ title: "", description: "" });
      if (onNoteUpdated) onNoteUpdated();
    } catch (error) {
      console.error("Error adding note:", error);
      alert(error.message || "Failed to save note");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteNote(indexToDelete) {
    const confirmed = window.confirm("Are you sure you want to delete this note?");
    if (!confirmed) return;

    const updatedNotes = notes.filter((_, index) => index !== indexToDelete);

    try {
      setLoading(true);
      await syncNotesToBackend(updatedNotes);
      setNotes(updatedNotes);
      if (onNoteUpdated) onNoteUpdated();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert(error.message || "Failed to delete note");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#efede8] p-5 rounded-2xl">
      <div className="max-w-7xl mx-auto">
        {/* ADD NOTE SECTION */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-[#082f57] mb-4 flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            Add Employee Note
          </h3>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Note title (e.g., Performance Review, Onboarding Feedback, Follow-up)..."
              className="w-full rounded-xl border border-gray-200 p-3.5 text-sm text-[#082f57] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter note details or observations..."
              className="w-full resize-y rounded-xl border border-gray-200 p-3.5 text-sm text-[#082f57] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />

            <div className="flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddNote}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
              >
                <Send size={15} />
                {loading ? "Saving..." : "Add Note"}
              </motion.button>
            </div>
          </div>
        </div>

        {/* TIMELINE / PREVIOUS NOTES */}
        <div className="mt-8">
          <h3 className="font-bold text-gray-500 text-lg mb-6 tracking-wide">
            PREVIOUS NOTES ({notes.length})
          </h3>

          <div className="relative pl-4">
            {notes.length > 0 && (
              <div className="absolute top-3 left-[23px] h-[calc(100%-24px)] w-[2px] bg-gray-200" />
            )}

            {notes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-200 shadow-sm">
                <FileText size={36} className="mx-auto mb-2 opacity-40 text-gray-400" />
                <p className="text-base font-semibold text-gray-600">No notes recorded for this employee yet.</p>
                <p className="text-xs text-gray-400 mt-1">Use the form above to add an observation or update.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {notes.map((item, index) => (
                  <motion.div
                    key={`${item.title}-${index}`}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex gap-5 items-start"
                  >
                    {/* Dot */}
                    <div className="w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-sm mt-3 shrink-0 z-10" />

                    {/* Note Card */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex-1 hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-base font-bold text-[#082f57]">
                            {item.title || "Employee Note"}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <Clock size={12} />
                            {item.date || "Recorded recently"}
                          </span>
                        </div>

                        <button
                          type="button"
                          title="Delete note"
                          disabled={loading}
                          onClick={() => handleDeleteNote(index)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mt-3 leading-relaxed whitespace-pre-wrap">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
