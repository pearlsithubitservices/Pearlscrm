import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  Upload,
  Trash2,
  Download,
  FolderOpen,
  FileCode,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiUrl } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";

export default function ETaskDocuments({ task, tasks }) {
  const { user } = useAuth();
  const currentTask = task || (Array.isArray(tasks) ? tasks[0] : tasks) || {};
  const taskId = currentTask?._id || currentTask?.id;

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const authorName =
    user?.displayName ||
    user?.name ||
    user?.employeeName ||
    (user?.email ? user.email.split("@")[0] : "Employee");

  const fetchDocuments = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/task-documents?taskId=${taskId}`));
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching employee task documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [taskId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!taskId) {
      toast.error("Task not selected");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("taskId", taskId);
      formData.append("uploadedBy", authorName);

      const res = await fetch(apiUrl("/task-documents"), {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Document uploaded successfully!");
        setSelectedFile(null);
        fetchDocuments();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to upload document");
      }
    } catch (error) {
      console.error("Employee upload error:", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(apiUrl(`/task-documents/${docId}`), {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Document deleted successfully");
        fetchDocuments();
      } else {
        toast.error("Failed to delete document");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete document");
    }
  };

  const getFileIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(t)) {
      return { Icon: FileImage, bg: "bg-purple-100", color: "text-purple-600" };
    }
    if (["csv", "xls", "xlsx"].includes(t)) {
      return { Icon: FileSpreadsheet, bg: "bg-green-100", color: "text-green-600" };
    }
    if (["js", "ts", "json", "html", "css"].includes(t)) {
      return { Icon: FileCode, bg: "bg-blue-100", color: "text-blue-600" };
    }
    return { Icon: FileText, bg: "bg-gray-100", color: "text-gray-600" };
  };

  return (
    <div className="bg-[#f5f2ec] p-4 md:p-8 min-h-[500px]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* UPLOAD HEADER SECTION */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl text-[#2563a9]">
              <FolderOpen size={24} />
            </div>
            <div>
              <h2 className="font-bold text-[#082f57] text-base">Task Documents & Attachments</h2>
              <p className="text-xs text-gray-500">Upload work files, attachments, or deliverable docs</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <input
              type="file"
              onChange={handleFileChange}
              id="emp-task-file-input"
              className="hidden"
            />
            <label
              htmlFor="emp-task-file-input"
              className="cursor-pointer border border-gray-300 bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 truncate max-w-[200px]"
            >
              {selectedFile ? selectedFile.name : "Choose File..."}
            </label>

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="bg-[#2563a9] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Upload size={14} />
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </div>
        </div>

        {/* DOCUMENTS LIST */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-600 text-xs uppercase tracking-wider">
            Uploaded Documents ({documents.length})
          </h3>

          {loading ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
              Loading task documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
              No documents uploaded yet for this task.
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const { Icon, bg, color } = getFileIcon(doc.type);
                const downloadUrl = apiUrl(doc.url);

                return (
                  <motion.div
                    key={doc._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between gap-4 hover:border-blue-200 transition"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} shrink-0`}>
                        <Icon className={color} size={20} />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-[#082f57] text-sm truncate">{doc.name}</h4>
                        <p className="text-xs text-gray-400">
                          {doc.type} • {doc.size} • Uploaded by {doc.uploadedBy} on{" "}
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Download / View Document"
                      >
                        <Download size={18} />
                      </a>

                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}