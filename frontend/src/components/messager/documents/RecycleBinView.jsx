import React, { useState } from "react";
import { Search, Trash2, X, RefreshCw, AlertTriangle, Clock } from "lucide-react";

/**
 * Recycle Bin View (labeled "Recycle pin" in the PDF screenshot)
 * Features:
 * - Header with "Recycle pin", Search Files input, "Empty Recycle Bin" button, Close button
 * - Subheader labels: "Files" and "Files deleted to the Recycle Bin are kept for 30 days"
 * - Grid of recycled files (including the "Ai" / "ai img.jpg" purple circle badge card)
 * - Restore & permanent delete actions
 */
export default function RecycleBinView({
  recycledItems,
  onRestore,
  onPermanentDelete,
  onEmptyRecycleBin,
  onBackToDrive,
  isAdmin = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);

  // Filter items by search query
  const filteredItems = (recycledItems || []).filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmEmpty = () => {
    onEmptyRecycleBin && onEmptyRecycleBin();
    setShowConfirmEmpty(false);
  };

  return (
    <div className="w-full">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Left: Title & Search */}
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Recycle Bin
          </h2>

          {/* Search Files Input */}
          <div className="relative flex-1 max-w-xs min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Files..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100/90 border border-gray-200/80 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Right: Empty Recycle Bin Button (Admin Only) & Close */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowConfirmEmpty(true)}
              disabled={!recycledItems || recycledItems.length === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white shadow-sm transition ${
                !recycledItems || recycledItems.length === 0
                  ? "bg-gray-400 cursor-not-allowed opacity-70"
                  : "bg-[#0b4d8c] hover:bg-[#093d70] active:bg-[#072d54] cursor-pointer"
              }`}
            >
              <Trash2 size={16} />
              <span>Empty Recycle Bin</span>
            </button>
          )}

          {/* Close button '✕' to return to My Drive */}
          <button
            type="button"
            onClick={onBackToDrive}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
            title="Back to Documents"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Subheader Row: 'Files' & retention note */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-1 pb-4">
        <span className="font-semibold text-gray-500 tracking-wide">Files</span>
        <span className="italic">
          Files deleted to the Recycle Bin are kept for 30 days
        </span>
      </div>

      {/* Recycled Files Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-16 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
            <Trash2 size={26} />
          </div>
          <h4 className="text-base font-semibold text-gray-800">Recycle Bin is empty</h4>
          <p className="text-sm text-gray-500 mt-1">
            Files moved to the Recycle Bin will appear here for 30 days.
          </p>
          <button
            type="button"
            onClick={onBackToDrive}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 font-medium text-xs rounded-lg hover:bg-blue-100 transition"
          >
            Go to Documents
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200/90 rounded-2xl p-5 flex flex-col items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 group relative"
            >
              {/* Recycled Card Display - matching 'Ai' purple badge from PDF */}
              <div className="w-full flex flex-col items-center py-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner flex items-center justify-center mb-3">
                  {/* Purple circular badge with bold 'Ai' text */}
                  <div className="w-12 h-12 rounded-full bg-[#a21caf] flex items-center justify-center shadow-md text-white font-extrabold text-base tracking-tight">
                    {item.badgeText || "Ai"}
                  </div>
                </div>

                {/* File Title */}
                <span className="font-medium text-xs text-gray-700 truncate max-w-full text-center px-1">
                  {item.name}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  {item.size || "18.50 Kb"}
                </span>

                {/* 30 Days Auto-Removal Indicator */}
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full mt-2 shadow-2xs">
                  <Clock size={11} className="text-amber-600" />
                  {item.daysRemaining !== undefined
                    ? `${item.daysRemaining} days left`
                    : "30 days left"}
                </span>
              </div>

              {/* Action Buttons on Hover or Bottom Bar */}
              <div className="w-full pt-3 border-t border-gray-100 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onRestore && onRestore(item)}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                  title="Restore file to Documents"
                >
                  <RefreshCw size={13} />
                  <span>Restore</span>
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onPermanentDelete && onPermanentDelete(item)}
                    className="p-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Delete permanently (Admin only)"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Emptying Recycle Bin */}
      {showConfirmEmpty && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">
              Empty Recycle Bin?
            </h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              Are you sure you want to permanently delete all items in the Recycle Bin?
              This action cannot be undone.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowConfirmEmpty(false)}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEmpty}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition"
              >
                Empty Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
