import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, FileText, Send, Trash2, Calendar, User, MessageSquare } from "lucide-react";
import { apiUrl } from "../../config/api.js";

export default function LeadNotesPage() {
  const { addNote, fetchLead, lead, deleteNote } = useLead();
  const { id } = useParams();

  // Existing notes list
  const [notes, setNotes] = useState([]);
  console.log(notes);

  // useEffect(() => {
  //   const fetchlead = async () => {
  //     try {
  //      const note = await fetchLead();
  //      conosole.log(note);
  //      setNotes(note.leadnotes);
  //     }
  //     catch (error) {
  //       console.log(error.message);
  //     }
  //   }
  //   fetchlead();

  // }, []);
  useEffect(() => {
    fetchleads();
  }, []);

  const fetchleads = async () => {
    try {
      const response = await fetch(
        "https://pearlscrm-1.onrender.com/api/leads",
      );

      const data = await response.json();

      console.log(data);
      setNotes(data);
    } catch (error) {
      console.log(error);
    }
  };
  // Form state
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

  const currentNotes = notes.find((item) => item._id == id);
  console.log(currentNotes?.leadnotes);
  // Add note

  const handleaddNote = async () => {
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
      const updatedLead = await deleteNote(id, noteId);

      // Update the lead in state
      await fetchleads();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note.");
    }
  };
  return (
    <div className="min-h-screen bg-[#f5f2ec] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto rounded-[30px] space-y-6"
      >
        <div className="px-5 mt-5">
          {/* INPUT SECTION */}

          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter title..."
              className="
              w-full
              bg-white
              rounded-2xl
              p-5
              outline-none
              "
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write detailed notes here..."
              className="w-full h-28 bg-gray-50 border border-gray-300 rounded-xl p-3 outline-none resize-none text-xs text-gray-800 font-medium focus:bg-white focus:border-[#2563a9] transition-all"
            />

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleaddNote}
                className="
                bg-blue-600
                text-white
                px-6
                py-3
                rounded-full
                "
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

          <div className="mt-10 relative">
            {/* Vertical line */}

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

            {currentNotes?.leadnotes?.length > 0 > 0 ? (
              currentNotes?.leadnotes?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    x: -30,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: index * 0.1,
                  }}
                  className="
                relative
                flex
                gap-6
                mb-10
                "
                >
                  <X
                    className="absolute top-2 right-2 text-red-600"
                    onClick={() => handleDeleteNote(item._id)}
                  />
                  {/* Dot */}

                  <div className="w-5 h-5 rounded-full bg-blue-600 mt-2 z-10"></div>

                  {/* Content */}

                  <div
                    className="
                bg-white
                p-5
                rounded-xl
                shadow-sm
                w-full
                "
                  >
                    <h1
                      className="
                  text-lg
                  font-bold
                  text-[#082f57]
                  "
                    >
                      {item.title}
                    </h1>

                    <p
                      className="
                  text-gray-500
                  mt-2
                  leading-7
                  "
                    >
                      {item.description}
                    </p>

                    <p
                      className="
                  text-sm
                  text-gray-400
                  mt-3
                  "
                    >
                      {item.date}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p>No notes</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
