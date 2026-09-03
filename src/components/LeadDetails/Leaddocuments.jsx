import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  FileImage,
  Upload,
  Trash2,
  Download,
  FileCode,
  Paperclip,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiUrl } from "../../config/api.js";

export default function LeadDocuments({ lead, fetchLead }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const documents = Array.isArray(lead?.documents) ? lead.documents : [];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    const leadId = lead?._id || lead?.id;
    if (!leadId) {
      toast.error("Lead ID not found.");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(apiUrl(`/leads/${leadId}/documents`), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      await fetchLead?.();
      toast.success("Document uploaded successfully!");
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.message || "Upload Failed");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    const leadId = lead?._id || lead?.id;
    if (!leadId || !documentId || !window.confirm("Delete this document permanently?")) return;

    try {
      const response = await fetch(apiUrl(`/leads/${leadId}/documents/${documentId}`), {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete document");
      await fetchLead?.();
      toast.success("Document deleted!");
    } catch (error) {
      toast.error(error.message || "Failed to delete document");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="bg-[#f5f2ec] min-h-screen py-6 px-3 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* HEADER & FILE UPLOAD CARD */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-xs border border-gray-200 space-y-4">
          <h2 className="font-bold text-[#082f57] text-base md:text-lg flex items-center gap-2 border-b pb-3">
            <Paperclip size={18} className="text-[#2563a9]" />
            <span>Upload Lead Document</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="file"
              onChange={handleFileChange}
              className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-700 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#2563a9] hover:file:bg-blue-100 cursor-pointer"
            />

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="bg-[#2563a9] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 transition-all cursor-pointer shrink-0"
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Upload Document</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* DOCUMENTS LIST */}
        <div className="space-y-4">
          <h2 className="font-bold text-[#082f57] text-lg flex items-center gap-2">
            <span>LEAD DOCUMENTS</span>
            <span className="text-xs bg-blue-100 text-[#2563a9] px-2.5 py-0.5 rounded-full font-bold">
              {documents.length}
            </span>
          </h2>

          {documents.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-400 italic text-xs">
              No documents uploaded for this lead yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {documents.map((doc, index) => {
                const typeStr = (doc.type || "").toLowerCase();
                const isImage = typeStr.includes("png") || typeStr.includes("jpg") || typeStr.includes("jpeg") || typeStr.includes("image");
                const Icon = isImage ? FileImage : FileText;

                const serverBase = apiUrl("").replace(/\/api\/?$/, "");
                const fileUrl = doc.url ? (doc.url.startsWith("http") ? doc.url : `${serverBase}${doc.url}`) : "#";

                return (
                  <motion.div
                    key={doc._id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-4 md:p-5 border border-gray-200 shadow-xs flex items-center justify-between gap-4 hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <Icon className="text-[#2563a9]" size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-[#082f57] truncate" title={doc.name}>
                          {doc.name || "Untitled File"}
                        </h3>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {doc.type || "FILE"} • {formatFileSize(doc.size)} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-IN") : "Uploaded"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doc.url && (
                        <a
                          href={fileUrl}
                          download={doc.name || true}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-[#2563a9] rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                          title="Download or view document"
                        >
                          <Download size={14} />
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc._id)}
                        className="p-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg border border-red-200 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}