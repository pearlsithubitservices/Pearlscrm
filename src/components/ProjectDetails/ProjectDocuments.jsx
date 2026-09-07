import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Download,
  FileCode,
  FileImage,
  FileSpreadsheet,
  Plus,
  X,
  CheckCircle2,
  Paperclip
} from "lucide-react";
import { apiUrl } from "../../config/api";

export default function ProjectDocuments({ projects, project, fetchProjects, user, isLeader }) {
  const currentProject = project || (projects && projects[0]) || {};
  const documents = currentProject.documents || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [fileType, setFileType] = useState("document");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!docName) {
        setDocName(file.name);
      }
      
      const ext = file.name.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) {
        setFileType("image");
      } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
        setFileType("spreadsheet");
      } else if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
        setFileType("pdf");
      } else {
        setFileType("code");
      }

      // Convert file to base64 Data URL for local preview/storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docName.trim() || !docUrl.trim()) {
      alert("Please provide document title and select a file or enter a link.");
      return;
    }

    if (!currentProject._id) return;

    try {
      setUploading(true);
      const uploaderName = user?.displayName || user?.name || user?.employeeName || user?.email || "User";

      const res = await fetch(apiUrl(`/projects/${currentProject._id}/documents`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: docName.trim(),
          url: docUrl.trim(),
          type: fileType,
          size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : "Link",
          uploadedBy: uploaderName,
        }),
      });

      if (res.ok) {
        setDocName("");
        setDocUrl("");
        setSelectedFile(null);
        setIsModalOpen(false);
        if (fetchProjects) fetchProjects();
      } else {
        alert("Failed to upload document");
      }
    } catch (err) {
      console.error("Error adding document:", err);
      alert("Error uploading document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    if (!currentProject._id || !docId) return;

    try {
      const res = await fetch(apiUrl(`/projects/${currentProject._id}/documents/${docId}`), {
        method: "DELETE",
      });

      if (res.ok && fetchProjects) {
        fetchProjects();
      }
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image":
        return <FileImage size={24} className="text-purple-600" />;
      case "spreadsheet":
        return <FileSpreadsheet size={24} className="text-emerald-600" />;
      case "code":
        return <FileCode size={24} className="text-amber-600" />;
      case "pdf":
      default:
        return <FileText size={24} className="text-blue-600" />;
    }
  };

  return (
    <div className="w-full rounded-[28px] bg-[#F5F3EF] p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base md:text-lg font-bold text-[#0B2D57] flex items-center gap-2">
            <Paperclip size={20} className="text-[#2563a9]" />
            PROJECT DOCUMENTS & ATTACHMENTS ({documents.length})
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            View, upload, and share contracts, design specs, and project deliverables
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#2563a9] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
        >
          <Plus size={16} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Document List */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc, index) => (
            <motion.div
              key={doc._id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gray-100/80 shrink-0">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-sm text-[#0B2D57] truncate" title={doc.name}>
                      {doc.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {doc.size || "File"} • {doc.date || "Uploaded"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteDocument(doc._id)}
                  className="text-gray-400 hover:text-rose-500 p-1 transition"
                  title="Delete Document"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                <span className="text-gray-500 font-medium truncate max-w-[150px]">
                  By: <strong className="text-gray-700">{doc.uploadedBy || "User"}</strong>
                </span>

                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#2563a9] hover:underline font-bold"
                >
                  <span>Open / View</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl text-center border border-gray-200/80 space-y-3">
          <Paperclip size={36} className="mx-auto text-gray-300" />
          <p className="text-gray-500 font-medium text-sm">
            No documents uploaded to this project yet.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-50 text-[#2563a9] font-bold text-xs hover:bg-blue-100 transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Upload size={14} />
            <span>Upload First File</span>
          </button>
        </div>
      )}

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                <h3 className="font-bold text-lg text-[#0B2D57] flex items-center gap-2">
                  <Upload size={18} className="text-[#2563a9]" />
                  Upload Project Document
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-rose-500 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddDocument} className="space-y-4 text-xs font-semibold text-gray-700">
                <div>
                  <label className="block mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. Project Proposal / SRS / Design File"
                    className="w-full border rounded-xl p-3 outline-none font-normal bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block mb-1">Select Local File</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full border rounded-xl p-2 bg-gray-50 text-xs text-gray-600 outline-none file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#2563a9] hover:file:bg-blue-100"
                  />
                </div>

                <div className="text-center text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                  - OR ENTER URL DIRECTLY -
                </div>

                <div>
                  <label className="block mb-1">Document URL / Link</label>
                  <input
                    type="text"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or file link"
                    className="w-full border rounded-xl p-3 outline-none font-normal bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border text-gray-600 hover:bg-gray-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || (!docName || !docUrl)}
                    className="px-6 py-2.5 rounded-xl bg-[#2563a9] hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
                  >
                    {uploading ? (
                      <span>Uploading...</span>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Upload File</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
