import React, { useState } from "react";
import {
  X,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Presentation,
  LayoutGrid,
  Check,
  AlertCircle,
} from "lucide-react";
import { DOCUMENT_TEMPLATES, isFileTypeAllowed } from "./documentData";
import { useAuth } from "../../../context/AuthContext";

/**
 * Modal to create a new Document or upload a file
 * Enforces strict format validation:
 * - DOC: only .doc, .docx, .odt, .txt, .rtf
 * - XLS: only .xls, .xlsx, .csv, .ods
 * - PPT: only .ppt, .pptx, .odp
 * - BOARD: only .board, .json, .canvas, .pdf, .png, .jpg, .svg
 */
export default function CreateDocumentModal({
  isOpen,
  initialTemplate,
  onClose,
  onCreate,
}) {
  const { user } = useAuth();
  const currentAuthorName =
    user?.name ||
    user?.employeeName ||
    user?.displayName ||
    user?.username ||
    (user?.email ? user.email.split("@")[0] : "Admin");

  const [docName, setDocName] = useState("");
  const [selectedType, setSelectedType] = useState(
    initialTemplate?.type || "doc"
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");

  // Sync selectedType when initialTemplate changes
  React.useEffect(() => {
    if (initialTemplate) {
      setSelectedType(initialTemplate.type);
      setFileError("");
    }
  }, [initialTemplate]);

  if (!isOpen) return null;

  // Active template metadata (badge, title, allowedExtensions, accept string, hint)
  const activeTemplate =
    DOCUMENT_TEMPLATES.find((t) => t.type === selectedType) ||
    DOCUMENT_TEMPLATES[0];

  // Handle format button switch
  const handleSelectFormat = (type) => {
    setSelectedType(type);
    // If a file was already selected, check if it matches the new format
    if (selectedFile) {
      if (!isFileTypeAllowed(selectedFile.name, type)) {
        setSelectedFile(null);
        const targetTpl = DOCUMENT_TEMPLATES.find((t) => t.type === type);
        setFileError(
          `Previous file removed: It does not match the ${targetTpl?.label || type.toUpperCase()} format.`
        );
      } else {
        setFileError("");
      }
    } else {
      setFileError("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict file type validation
    if (!isFileTypeAllowed(file.name, selectedType)) {
      setSelectedFile(null);
      setFileError(
        `Invalid file! For ${activeTemplate.label}, only ${activeTemplate.fileHint} can be uploaded.`
      );
      e.target.value = ""; // Reset file input
      return;
    }

    // Valid file
    setFileError("");
    setSelectedFile(file);
    if (!docName.trim()) {
      setDocName(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Secondary strict validation
    if (selectedFile && !isFileTypeAllowed(selectedFile.name, selectedType)) {
      setFileError(
        `Cannot upload: File does not match ${activeTemplate.label} format (${activeTemplate.fileHint}).`
      );
      return;
    }

    const finalName = docName.trim() || (selectedFile ? selectedFile.name : `Untitled Document`);

    // Determine extension
    let extension = selectedType;
    if (selectedType === "board") extension = "brd";
    if (selectedFile) {
      const parts = selectedFile.name.split(".");
      if (parts.length > 1) extension = parts.pop().toLowerCase();
    }

    const fullFileName = finalName.includes(".") ? finalName : `${finalName}.${extension}`;

    const now = new Date();
    const formattedCreated = `today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const formattedModified = now.toLocaleDateString("en-US", { month: "short", day: "2-digit" });

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: fullFileName,
      type: selectedType,
      size: selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} Kb` : "12.40 Kb",
      sizeBytes: selectedFile ? selectedFile.size : 12400,
      createdOn: formattedCreated,
      modifiedOn: formattedModified,
      author: currentAuthorName,
      authorId: user?._id || user?.id || "",
      extension,
      file: selectedFile || null,
    };

    onCreate && onCreate(newDoc);
    setDocName("");
    setSelectedFile(null);
    setFileError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Create New Document</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Choose a format and upload only matching file types
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Format selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              1. Select Document Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DOCUMENT_TEMPLATES.map((tpl) => {
                const isSelected = selectedType === tpl.type;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectFormat(tpl.type)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg ${tpl.badgeBg} text-white font-bold text-xs flex items-center justify-center shadow-xs`}
                    >
                      {tpl.badgeText}
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {tpl.title.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              2. Document Name
            </label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. project_proposal, sprint_tasks"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              autoFocus
            />
          </div>

          {/* Upload File option with strict type restriction */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                3. Upload Local File (Optional)
              </label>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                Format: {activeTemplate.label}
              </span>
            </div>

            <label
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition ${
                fileError
                  ? "border-red-300 bg-red-50/30 hover:border-red-400"
                  : selectedFile
                  ? "border-emerald-300 bg-emerald-50/30 hover:border-emerald-400"
                  : "border-gray-200 hover:border-blue-400 bg-gray-50/40 hover:bg-blue-50/20"
              }`}
            >
              <UploadCloud
                size={26}
                className={`mb-1.5 ${
                  fileError
                    ? "text-red-500"
                    : selectedFile
                    ? "text-emerald-600"
                    : "text-gray-400"
                }`}
              />
              <span className="text-xs text-gray-700 font-semibold text-center">
                {selectedFile
                  ? selectedFile.name
                  : `Select a ${activeTemplate.label} file to upload`}
              </span>
              <span className="text-[11px] text-gray-500 mt-1 text-center">
                Allowed: <span className="font-semibold text-gray-700">{activeTemplate.fileHint}</span>
              </span>

              <input
                type="file"
                className="hidden"
                accept={activeTemplate.accept}
                onChange={handleFileChange}
              />
            </label>

            {/* Error banner if non-matching file attempted */}
            {fileError && (
              <div className="mt-2.5 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
                <span className="font-medium flex-1">{fileError}</span>
              </div>
            )}

            {/* Success indicator if valid file selected */}
            {selectedFile && !fileError && (
              <div className="mt-2.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold truncate">{selectedFile.name}</span>
                  <span className="text-[10px] text-emerald-600 uppercase bg-emerald-100/80 px-1.5 py-0.5 rounded font-bold">
                    Matched {activeTemplate.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setFileError("");
                  }}
                  className="text-xs text-gray-400 hover:text-red-600 font-medium ml-2 shrink-0 transition"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-[#0b4d8c] hover:bg-[#093d70] text-white font-medium text-sm rounded-xl shadow-sm transition"
            >
              Create Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
