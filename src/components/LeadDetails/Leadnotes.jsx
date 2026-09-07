import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, FileText, Send, Trash2, Calendar, User, MessageSquare } from "lucide-react";
import { apiUrl } from "../../config/api.js";

export default function LeadNotesPage({ lead, fetchLead }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const notesList = Array.isArray(lead?.leadnotes) ? lead.leadnotes : [];
  const employeeDescription = lead?.notes || "";

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const handleAddNote = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please enter both Title and Note description.");
      return;
    }

    const leadId = lead?._id || lead?.id;
    if (!leadId) {
      alert("Lead ID not found.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(apiUrl(`/leads/${leadId}/notes`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      if (response.ok) {
        setFormData({ title: "", description: "" });
        await fetchLead?.();
      } else {
        alert("Failed to save note.");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const leadId = lead?._id || lead?.id;
    if (!leadId || !noteId || !window.confirm("Delete this note?")) return;

    try {
      const response = await fetch(apiUrl(`/leads/${leadId}/notes/${noteId}`), {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchLead?.();
      } else {
        alert("Failed to delete note.");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note.");
    }
  };

  return (
    <div className="bg-[#f5f2ec] p-4 md:p-8 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto rounded-[30px] space-y-6"
      >
        <div className="px-2 md:px-5 space-y-6">
          {/* EMPLOYEE LEAD DESCRIPTION / SUMMARY CARD */}
          {employeeDescription ? (
            <div className="bg-amber-50/80 border border-amber-200 p-5 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm border-b border-amber-200/60 pb-2">
                <MessageSquare size={16} className="text-amber-600 shrink-0" />
                <span>Employee Lead Description / Update</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed whitespace-pre-line font-medium">
                {employeeDescription}
              </p>
            </div>
          ) : (
            <div className="bg-white/60 border border-gray-200 p-4 rounded-2xl text-xs text-gray-500 italic">
              No employee description note added yet for this lead.
            </div>
          )}

          {/* INPUT FORM SECTION */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-xs border border-gray-200 space-y-4">
            <h2 className="font-bold text-[#082f57] text-base md:text-lg flex items-center gap-2 border-b pb-3">
              <PlusCircle size={18} className="text-[#2563a9]" />
              <span>Add Admin / Staff Note</span>
            </h2>

            <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-gray-50">
              <FileText size={16} className="text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Note Title (e.g. Call Summary, Requirement Notes)..."
                className="w-full bg-transparent outline-none text-xs text-gray-800 font-medium"
              />
            </div>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write detailed notes here..."
              className="w-full h-28 bg-gray-50 border border-gray-300 rounded-xl p-3 outline-none resize-none text-xs text-gray-800 font-medium focus:bg-white focus:border-[#2563a9] transition-all"
            />

            <div className="flex justify-end pt-1">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddNote}
                disabled={saving}
                className="bg-[#2563a9] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Save Note</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* NOTES LIST */}
          <h2 className="font-bold text-[#082f57] text-lg mt-8 mb-6 flex items-center gap-2">
            <span>PREVIOUS NOTES TIMELINE</span>
            <span className="text-xs bg-blue-100 text-[#2563a9] px-2.5 py-0.5 rounded-full font-bold">
              {notesList.length}
            </span>
          </h2>

          <div className="mt-4 relative pl-3">
            <div className="absolute top-2 left-[19px] bottom-4 w-[2px] bg-blue-200"></div>

            {notesList.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center text-gray-400 italic text-xs">
                No saved notes in timeline for this lead yet.
              </div>
            ) : (
              notesList.map((item, index) => (
                <motion.div
                  key={item._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex gap-4 mb-6"
                >
                  <div className="w-4 h-4 rounded-full bg-[#2563a9] mt-2.5 z-10 shrink-0 ring-4 ring-blue-100" />

                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs w-full space-y-2 relative">
                    <div className="flex items-center justify-between border-b pb-2 pr-8">
                      <h3 className="text-sm font-bold text-[#082f57]">
                        {item.title || "Untitled Note"}
                      </h3>
                      {item.createdAt && (
                        <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(item.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>

                    <button
                      type="button"
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      onClick={() => handleDeleteNote(item._id)}
                      aria-label="Delete note"
                      title="Delete note"
                    >
                      <Trash2 size={16} />
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