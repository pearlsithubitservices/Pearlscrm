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
  Paperclip,
  Eye
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

  // State for Image / Document Lightbox Preview Modal
  const [previewModal, setPreviewModal] = useState(null); // { url, name, uploadedBy, type }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!docName) {
        setDocName(file.name);
      }
      
      const ext = file.name.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
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

  // Helper to determine full executable file URL
  const getFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
      return url;
    }
    const serverBase = apiUrl("").replace(/\/api\/?$/, "");
    return `${serverBase}${url}`;
  };

  // Helper to check if a document is an image
  const checkIsImage = (doc) => {
    if (doc.type === "image") return true;
    const url = doc.url || "";
    if (url.startsWith("data:image")) return true;
    const nameOrUrl = doc.name || url;
    return /\.(jpg|jpeg|png|gif|webp|svg)/i.test(nameOrUrl);
  };

  // Helper for safe file downloading (handles Base64 Data URIs without browser blocks)
  const handleDownload = (e, doc) => {
    e.stopPropagation();
    const url = getFileUrl(doc.url);
    const fileName = doc.name || "downloaded-file";

    if (url.startsWith("data:")) {
      try {
        const arr = url.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        return;
      } catch (err) {
        console.error("Data URI download error:", err);
      }
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          {documents.map((doc, index) => {
            const isImage = checkIsImage(doc);
            const fileUrl = getFileUrl(doc.url);

            return (
              <motion.div
                key={doc._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -3 }}
                className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between space-y-3 overflow-hidden"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-gray-100/80 shrink-0">
                      {getFileIcon(isImage ? "image" : doc.type)}
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
                    className="text-gray-400 hover:text-rose-500 p-1 transition cursor-pointer shrink-0"
                    title="Delete Document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* IMAGE PREVIEW THUMBNAIL */}
                {isImage && fileUrl && (
                  <div
                    onClick={() => setPreviewModal({ url: fileUrl, name: doc.name, uploadedBy: doc.uploadedBy, type: "image" })}
                    className="relative h-40 w-full overflow-hidden rounded-xl bg-gray-900 border border-gray-200 cursor-pointer group shadow-inner"
                  >
                    <img
                      src={fileUrl}
                      alt={doc.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-[2px]">
                      <Eye size={16} />
                      <span>Click to View Image</span>
                    </div>
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <span className="text-gray-500 font-medium truncate max-w-[130px]">
                    By: <strong className="text-gray-700">{doc.uploadedBy || "User"}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {/* View / Preview Button */}
                    <button
                      onClick={() => {
                        if (isImage) {
                          setPreviewModal({ url: fileUrl, name: doc.name, uploadedBy: doc.uploadedBy, type: "image" });
                        } else {
                          window.open(fileUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                      className="flex items-center gap-1 text-[#2563a9] hover:underline font-bold cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>{isImage ? "View" : "Open"}</span>
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={(e) => handleDownload(e, doc)}
                      className="flex items-center gap-1 text-emerald-600 hover:underline font-bold cursor-pointer ml-1"
                      title="Download file"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
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

      {/* FULLSCREEN IMAGE LIGHTBOX / PREVIEW MODAL */}
      <AnimatePresence>
        {previewModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl space-y-0"
            >
              {/* Lightbox Header */}
              <div className="p-4 bg-[#0B2D57] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileImage size={18} className="text-blue-300" />
                  <h3 className="font-bold text-sm truncate max-w-md">{previewModal.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleDownload(e, previewModal)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setPreviewModal(null)}
                    className="p-1 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Lightbox Image View */}
              <div className="p-4 bg-gray-950 flex items-center justify-center max-h-[75vh] overflow-auto">
                <img
                  src={previewModal.url}
                  alt={previewModal.name}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-lg"
                />
              </div>

              {/* Lightbox Footer */}
              <div className="p-3 bg-gray-50 border-t text-xs text-gray-500 flex justify-between items-center">
                <span>Uploaded by: <strong className="text-gray-700">{previewModal.uploadedBy || "User"}</strong></span>
                <span className="text-gray-400">Click anywhere outside or press ESC to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer"
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
                  <label className="block mb-1">Select Local File (Images, PDF, Docs, CSV)</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full border rounded-xl p-2 bg-gray-50 text-xs text-gray-600 outline-none file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#2563a9] hover:file:bg-blue-100 cursor-pointer"
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
                    className="px-5 py-2.5 rounded-xl border text-gray-600 hover:bg-gray-100 font-bold cursor-pointer"
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
