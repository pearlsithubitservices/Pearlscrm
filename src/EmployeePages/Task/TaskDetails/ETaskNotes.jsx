import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NotebookTabs, Send, Trash2 } from "lucide-react";
import { apiUrl } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";

export default function ETasksNotes({ task, tasks, onRefresh }) {
  const { user } = useAuth();
  const currentTask = task || (Array.isArray(tasks) ? tasks[0] : tasks) || {};
  const taskId = currentTask?._id || currentTask?.id;

  const [notesList, setNotesList] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentTask && currentTask.notes) {
      const blocks = currentTask.notes.split(/\n\n(?=\[)/g);
      const parsed = blocks.map((block) => {
        const match = block.match(/^\[(.*?) - (.*?)\]:\s*([\s\S]*)$/);
        if (match) {
          return {
            date: match[1],
            author: match[2],
            description: match[3],
          };
        }
        return {
          date: currentTask.updatedAt
            ? new Date(currentTask.updatedAt).toLocaleDateString()
            : new Date().toLocaleDateString(),
          author: "Note",
          description: block,
        };
      });
      setNotesList(parsed.reverse());
    } else {
      setNotesList([]);
    }
  }, [currentTask]);

  const authorName =
    user?.displayName ||
    user?.name ||
    user?.employeeName ||
    (user?.email ? user.email.split("@")[0] : "Employee");

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      alert("Please enter a note.");
      return;
    }
    if (!taskId) {
      alert("Task not selected.");
      return;
    }

    setSubmitting(true);
    try {
      const formattedNote = `[${new Date().toLocaleDateString()} - ${authorName}]: ${newNote}`;
      const updatedNotes = currentTask?.notes
        ? `${currentTask.notes}\n\n${formattedNote}`
        : formattedNote;

      const res = await fetch(apiUrl(`/tasks/${taskId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: updatedNotes,
        }),
      });

      if (res.ok) {
        setNewNote("");
        alert("Note added successfully!");
        if (onRefresh) onRefresh();
      } else {
        alert("Failed to add note.");
      }
    } catch (err) {
      console.error("Error adding note:", err);
      alert("Failed to add note.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (indexToDelete) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    if (!taskId) return;

    try {
      const updatedList = notesList.filter((_, idx) => idx !== indexToDelete);
      const stringNotes = updatedList
        .slice()
        .reverse()
        .map((item) => `[${item.date} - ${item.author}]: ${item.description}`)
        .join("\n\n");

      const res = await fetch(apiUrl(`/tasks/${taskId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: stringNotes }),
      });

      if (res.ok) {
        setNotesList(updatedList);
        alert("Note deleted successfully!");
        if (onRefresh) onRefresh();
      } else {
        alert("Failed to delete note.");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Failed to delete note.");
    }
  };

  return (
    <div className="bg-[#f5f2ec] p-4 md:p-8 min-h-[500px]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* INPUT SECTION */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-[#082f57] text-base flex items-center gap-2">
            <NotebookTabs size={18} className="text-[#2563a9]" />
            Add Task Notes
          </h3>

          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Type notes or progress remarks..."
            className="w-full h-28 bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none text-sm text-gray-800 focus:border-[#2563a9] transition-all resize-none"
          />

          <div className="flex justify-end">
            <button
              disabled={submitting}
              onClick={handleAddNote}
              className="bg-[#2563a9] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send size={14} />
              {submitting ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>

        {/* NOTES LIST SECTION */}
        <div className="space-y-4 pt-2">
          <h2 className="font-bold text-gray-600 text-sm uppercase tracking-wider">
            Previous Task Notes
          </h2>

          {notesList.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
              No notes recorded yet for this task.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 border-l-2 border-blue-200 mt-4">
              {notesList.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2"
                >
                  <div className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-[#2563a9] border-2 border-white" />

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="font-bold text-[#082f57]">{item.author}</span>
                    <div className="flex items-center gap-3">
                      <span>{item.date}</span>
                      <button
                        onClick={() => handleDeleteNote(index)}
                        title="Delete Note"
                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}