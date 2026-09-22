import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Edit2,
  FileText,
  FileSpreadsheet,
  Presentation,
  LayoutGrid,
  File,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

/**
 * Helper to select the appropriate icon for file types
 */
function getFileIcon(type, ext) {
  const normalizedType = (type || ext || "").toLowerCase();

  if (normalizedType.includes("ppt")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
        <Presentation size={18} />
      </div>
    );
  }
  if (normalizedType.includes("doc") || normalizedType.includes("word")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
        <FileText size={18} />
      </div>
    );
  }
  if (normalizedType.includes("xls") || normalizedType.includes("sheet")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
        <FileSpreadsheet size={18} />
      </div>
    );
  }
  if (normalizedType.includes("board")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
        <LayoutGrid size={18} />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 flex items-center justify-center shrink-0">
      <File size={18} />
    </div>
  );
}

/**
 * File list table displaying documents with columns:
 * [Checkbox] | File Name | File size | Created on | modified on | Action
 * Supports sorting on all metadata columns and multi-row selection.
 */
export default function DocumentTable({
  documents,
  sortField = "name",
  sortDirection = "asc",
  onSort,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onPreview,
  onDownload,
  onRename,
  onDelete,
  isAdmin = false,
  currentUserId = "",
  currentUserName = "",
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Helper for sort indicators
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown
          size={13}
          className="text-gray-400 opacity-60 group-hover/col:opacity-100 transition"
        />
      );
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={13} className="text-blue-600" />
    ) : (
      <ArrowDown size={13} className="text-blue-600" />
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!documents || documents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/90 p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
          <FileText size={24} />
        </div>
        <h4 className="text-base font-semibold text-gray-800">No documents found</h4>
        <p className="text-sm text-gray-500 mt-1">
          Create a new document from the templates above or search with a different keyword.
        </p>
      </div>
    );
  }

  // Calculate files current user is authorized to select
  const selectableDocs = isAdmin
    ? documents
    : documents.filter((d) => {
        const isOwner =
          (d.authorId && currentUserId && String(d.authorId) === String(currentUserId)) ||
          (d.author && currentUserName && d.author.trim().toLowerCase() === currentUserName.trim().toLowerCase());
        return isOwner;
      });

  const isAllSelected =
    selectableDocs.length > 0 && selectableDocs.every((d) => selectedIds.includes(d.id));

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-sm overflow-visible">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold text-gray-600 bg-white">
              {/* Checkbox Column */}
              <th className="py-3.5 pl-4 pr-1 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  aria-label="Select all visible files"
                />
              </th>

              {/* File Name */}
              <th
                onClick={() => onSort && onSort("name")}
                className="py-3.5 px-4 font-semibold cursor-pointer select-none hover:bg-gray-50 transition group/col"
                title="Click to sort by File Name"
              >
                <div className="flex items-center gap-1.5">
                  <span>File Name</span>
                  {renderSortIcon("name")}
                </div>
              </th>

              {/* Author / Uploaded By */}
              <th
                onClick={() => onSort && onSort("author")}
                className="py-3.5 px-4 font-semibold text-center sm:text-left cursor-pointer select-none hover:bg-gray-50 transition group/col"
                title="Click to sort by Author"
              >
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>Author</span>
                  {renderSortIcon("author")}
                </div>
              </th>

              {/* File Size */}
              <th
                onClick={() => onSort && onSort("size")}
                className="py-3.5 px-4 font-semibold text-center sm:text-left cursor-pointer select-none hover:bg-gray-50 transition group/col"
                title="Click to sort by File Size"
              >
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>File size</span>
                  {renderSortIcon("size")}
                </div>
              </th>

              {/* Created On */}
              <th
                onClick={() => onSort && onSort("created")}
                className="py-3.5 px-4 font-semibold text-center sm:text-left cursor-pointer select-none hover:bg-gray-50 transition group/col"
                title="Click to sort by Created Date"
              >
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>Created on</span>
                  {renderSortIcon("created")}
                </div>
              </th>

              {/* Modified On */}
              <th
                onClick={() => onSort && onSort("modified")}
                className="py-3.5 px-4 font-semibold text-center sm:text-left cursor-pointer select-none hover:bg-gray-50 transition group/col"
                title="Click to sort by Modified Date"
              >
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>modified on</span>
                  {renderSortIcon("modified")}
                </div>
              </th>

              {/* Action Menu */}
              <th className="py-3.5 px-4 font-semibold text-center w-20">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {documents.map((doc) => {
              const isMenuOpen = openMenuId === doc.id;
              const isSelected = selectedIds.includes(doc.id);
              const isOwner =
                (doc.authorId && currentUserId && String(doc.authorId) === String(currentUserId)) ||
                (doc.author && currentUserName && doc.author.trim().toLowerCase() === currentUserName.trim().toLowerCase());
              const canManage = Boolean(isAdmin || isOwner);

              return (
                <tr
                  key={doc.id}
                  onClick={() => onPreview && onPreview(doc)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected ? "bg-blue-50/70" : "hover:bg-blue-50/50"
                  }`}
                >
                  {/* Row Checkbox */}
                  <td
                    className="py-3.5 pl-4 pr-1 w-10 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!canManage}
                      onChange={() => canManage && onToggleSelect && onToggleSelect(doc.id)}
                      className={
                        canManage
                          ? "w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                          : "w-4 h-4 rounded text-gray-300 border-gray-200 cursor-not-allowed opacity-40"
                      }
                      title={!canManage ? "Only file owner or admin can manage this document" : `Select ${doc.name}`}
                      aria-label={`Select ${doc.name}`}
                    />
                  </td>

                  {/* File Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.type, doc.extension)}
                      <span className="font-medium text-gray-900 group-hover:text-blue-600 transition truncate max-w-xs sm:max-w-md">
                        {doc.name}
                      </span>
                    </div>
                  </td>

                  {/* Author / Uploaded By */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 uppercase">
                        {(doc.author || "Admin").charAt(0)}
                      </span>
                      <span
                        className="font-medium text-gray-700 truncate max-w-[120px]"
                        title={doc.author || "Admin"}
                      >
                        {doc.author || "Admin"}
                      </span>
                    </div>
                  </td>

                  {/* File Size */}
                  <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap text-center sm:text-left text-xs sm:text-sm">
                    {doc.size || "0 Kb"}
                  </td>

                  {/* Created On */}
                  <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap text-center sm:text-left text-xs sm:text-sm">
                    {doc.createdOn ||
                      (doc.createdAt
                        ? new Date(doc.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                          })
                        : "Recently")}
                  </td>

                  {/* Modified On */}
                  <td className="py-3.5 px-6 text-gray-600 whitespace-nowrap text-center sm:text-left text-xs sm:text-sm">
                    {doc.modifiedOn ||
                      (doc.updatedAt
                        ? new Date(doc.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                          })
                        : "Recently")}
                  </td>

                  {/* Action Menu (Vertical Three Dots) */}
                  <td
                    className="py-3.5 px-4 text-center relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : doc.id);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition inline-flex items-center justify-center cursor-pointer"
                      title="More actions"
                    >
                      <MoreVertical size={17} />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        ref={menuRef}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-6 top-10 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-30 text-left text-sm animate-in fade-in zoom-in-95 duration-100"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            onPreview && onPreview(doc);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-gray-700 transition cursor-pointer"
                        >
                          <Eye size={15} className="text-gray-400" />
                          <span>View Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            onDownload && onDownload(doc);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-gray-700 transition cursor-pointer"
                        >
                          <Download size={15} className="text-gray-400" />
                          <span>Download</span>
                        </button>

                        {/* Admin or Document Owner can Rename & Move to Recycle Bin */}
                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                onRename && onRename(doc);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-gray-700 transition cursor-pointer"
                            >
                              <Edit2 size={15} className="text-gray-400" />
                              <span>Rename</span>
                            </button>

                            <div className="h-px bg-gray-100 my-1" />

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                onDelete && onDelete(doc);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-red-50 text-red-600 transition cursor-pointer"
                            >
                              <Trash2 size={15} />
                              <span>Move to Recycle Bin</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
