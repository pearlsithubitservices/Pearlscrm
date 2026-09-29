import React from "react";
import { Search, Plus, FileText, Trash2, X, Filter, RefreshCw } from "lucide-react";

/**
 * Top Action Header for Documents view
 * Features:
 * - Documents Title
 * - + New Button
 * - Search input ("Search Files...")
 * - Format Filter dropdown (All, DOC, XLS, PPT, BOARD)
 * - View toggle buttons: "My Drive" (with file count & live refresh) and "Recycle Bin" (with badge)
 * - Close button "✕"
 * - Subheader labels: "Create" with live MongoDB cloud storage status & 30-day retention notice
 */
export default function DocumentHeader({
  searchTerm,
  onSearchChange,
  filterType = "all",
  onFilterChange,
  onNewClick,
  activeView,
  onViewChange,
  onClose,
  driveCount = 0,
  recycleCount = 0,
  storageStats = null,
  isRefreshing = false,
  onRefreshDrive,
}) {
  return (
    <div className="mb-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap sm:flex-nowrap">
        {/* Left Side: Title & Action & Search & Filter */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 flex-wrap sm:flex-nowrap">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight shrink-0">
            Documents
          </h2>

          {/* + New Button */}
          <button
            type="button"
            onClick={onNewClick}
            className="inline-flex items-center gap-1.5 bg-[#0b4d8c] hover:bg-[#093d70] text-white font-medium text-sm px-4 py-2 rounded-full shadow-sm transition-colors duration-150 shrink-0 cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New</span>
          </button>

          {/* Search Files Input */}
          <div className="relative flex-1 max-w-xs min-w-[150px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Files..."
              className="w-full pl-9 pr-3 py-2 bg-gray-100/90 border border-gray-200/80 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Format Filter Dropdown */}
          <div className="relative shrink-0">
            <div className="flex items-center gap-1.5 bg-gray-100/90 border border-gray-200/80 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-200/70 transition">
              <Filter size={14} className="text-gray-500 shrink-0" />
              <select
                value={filterType}
                onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-gray-700 focus:outline-none cursor-pointer pr-1"
                aria-label="Filter documents by format"
              >
                <option value="all">All Formats</option>
                <option value="doc">DOC / Word</option>
                <option value="xls">XLS / Sheets</option>
                <option value="ppt">PPT / Slides</option>
                <option value="board">BOARD / Visuals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Side: View Toggles & Close */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* My Drive Button (Active files from backend with count & live sync) */}
          <button
            type="button"
            onClick={() => {
              onViewChange("drive");
              if (onRefreshDrive) onRefreshDrive();
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition border cursor-pointer ${
              activeView === "drive"
                ? "bg-white text-gray-800 border-gray-300 shadow-sm"
                : "bg-gray-100/70 text-gray-600 border-transparent hover:bg-gray-200/70"
            }`}
            title="My Drive: View and refresh active documents from database"
          >
            <FileText size={15} className="text-gray-500" />
            <span>My Drive</span>
            {driveCount > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                {driveCount}
              </span>
            )}
            {isRefreshing && (
              <RefreshCw size={12} className="animate-spin text-blue-600 ml-0.5" />
            )}
          </button>

          {/* Recycle Bin Button */}
          <button
            type="button"
            onClick={() => onViewChange("recycle")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition border cursor-pointer ${
              activeView === "recycle"
                ? "bg-white text-gray-800 border-gray-300 shadow-sm"
                : "bg-gray-100/70 text-gray-600 border-transparent hover:bg-gray-200/70"
            }`}
            title="Recycle Bin: View deleted documents"
          >
            <Trash2 size={15} className="text-gray-500" />
            <span>Recycle Bin</span>
            {recycleCount > 0 && (
              <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">
                {recycleCount}
              </span>
            )}
          </button>

          {/* Close Action '✕' */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition ml-1 cursor-pointer"
            title="Close / Exit"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Subheader Row: retention notice */}
      <div className="flex items-center justify-end text-xs text-gray-400 pt-1 pb-2">
        <span className="italic">
          Files deleted to the Recycle Bin are kept for 30 days
        </span>
      </div>
    </div>
  );
}

