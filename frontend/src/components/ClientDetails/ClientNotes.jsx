import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiUrl } from "../../config/api.js";

const normalizeNotes = (value) => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    // ignore JSON parsing errors and fall back to plain text note
  }

  return [
    {
      title: "Client Note",
      description: String(value),
      date: new Date().toLocaleString(),
    },
  ];
};

export default function ClientNotes({ client }) {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!client?._id) {
      setNotes([]);
      return;
    }

    setNotes(normalizeNotes(client.projectnotes));
  }, [client]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleNote() {
    if (!client?._id) return;

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill all fields");
      return;
    }

    const newNote = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: new Date().toLocaleString(),
    };

    const updatedNotes = [newNote, ...notes];

    try {
      setLoading(true);
      const response = await fetch(apiUrl(`/clients/${client._id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectnotes: JSON.stringify(updatedNotes) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save note");
      }

      setNotes(updatedNotes);
      setFormData({ title: "", description: "" });
    } catch (error) {
      console.error("Error saving client note:", error);
      alert(error.message || "Failed to save note");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f2ec] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto rounded-[30px]"
      >
        <div className="px-5 mt-5">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter title..."
              className="w-full bg-white rounded-2xl p-5 outline-none"
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add a new note..."
              className="w-full h-[120px] bg-white rounded-2xl p-5 outline-none resize-none"
            />

            <div className="flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNote}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-full disabled:opacity-60"
              >
                {loading ? "Saving..." : "Add Note"}
              </motion.button>
            </div>
          </div>

          <h2 className="font-bold text-gray-500 text-xl mt-10">PREVIOUS NOTES</h2>

          <div className="mt-10 relative">
            <div className="absolute top-0 left-[10px] h-full w-[2px] bg-gray-300"></div>

            {notes.length === 0 ? (
              <div className="bg-white p-5 rounded-xl shadow-sm text-gray-500">
                No notes added for this client yet.
              </div>
            ) : (
              notes.map((item, index) => (
                <motion.div
                  key={`${item.title}-${index}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex gap-6 mb-10"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 mt-2 z-10"></div>

                  <div className="bg-white p-5 rounded-xl shadow-sm w-full">
                    <h1 className="text-lg font-bold text-[#082f57]">{item.title || "Client Note"}</h1>
                    <p className="text-gray-500 mt-2 leading-7">{item.description}</p>
                    <p className="text-sm text-gray-400 mt-3">{item.date || "Just now"}</p>
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