import React from "react";
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  Presentation,
  LayoutGrid,
  File,
} from "lucide-react";

/**
 * Clean & Simple Document Download Modal
 * Displays file icon, name, format, size, author, and direct Download button.
 */
export default function DocumentPreviewModal({ document, isOpen, onClose, onDownload }) {
  if (!isOpen || !document) return null;

  const docType = (document.type || document.extension || "").toLowerCase();
  const ext = (document.extension || document.name.split(".").pop() || "").toLowerCase();

  // File type icon styling
  const renderIcon = () => {
    if (docType.includes("ppt") || ext.includes("ppt")) {
      return (
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shadow-xs">
          <Presentation size={32} />
        </div>
      );
    }
    if (docType.includes("doc") || docType.includes("word") || ext.includes("doc")) {
      return (
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
          <FileText size={32} />
        </div>
      );
    }
    if (
      docType.includes("xls") ||
      docType.includes("sheet") ||
      ext.includes("xls") ||
      ext.includes("csv")
    ) {
      return (
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
          <FileSpreadsheet size={32} />
        </div>
      );
    }
    if (
      docType.includes("board") ||
      docType.includes("ai") ||
      ["png", "jpg", "jpeg", "svg", "webp"].includes(ext)
    ) {
      return (
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shadow-xs">
          <LayoutGrid size={32} />
        </div>
      );
    }
    return (
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 text-gray-600 flex items-center justify-center shadow-xs">
        <File size={32} />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Close Button Top-Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Center File Icon & Title */}
        <div className="flex flex-col items-center text-center mt-2">
          {renderIcon()}

          <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-4 break-words max-w-full px-2">
            {document.name}
          </h3>

          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide font-medium">
            {document.type || ext} &bull; {document.size || "0 Kb"}
          </p>
        </div>

        {/* File Metadata Info Box */}
        <div className="bg-gray-50 rounded-xl p-3.5 mt-5 border border-gray-100 text-xs text-gray-600 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Author</span>
            <span className="font-semibold text-gray-800">{document.author || "Admin"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Modified</span>
            <span className="font-semibold text-gray-800">
              {document.modifiedOn ||
                (document.updatedAt
                  ? new Date(document.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                    })
                  : "Recently")}
            </span>
          </div>
        </div>

        {/* Action Button: Download File only */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => onDownload && onDownload(document)}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#0b4d8c] hover:bg-[#093d70] active:bg-[#072d54] text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
          >
            <Download size={18} />
            <span>Download File</span>
          </button>
        </div>
      </div>
    </div>
  );
}
