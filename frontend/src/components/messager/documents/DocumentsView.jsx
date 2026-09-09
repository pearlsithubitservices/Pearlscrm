import React, { useState, useEffect, useMemo } from "react";
import { CheckSquare, Trash2, X } from "lucide-react";
import DocumentHeader from "./DocumentHeader";
import DocumentTemplates from "./DocumentTemplates";
import DocumentTable from "./DocumentTable";
import RecycleBinView from "./RecycleBinView";
import CreateDocumentModal from "./CreateDocumentModal";
import DocumentPreviewModal from "./DocumentPreviewModal";
import { INITIAL_DOCUMENTS, INITIAL_RECYCLE_BIN } from "./documentData";
import {
  fetchDocuments,
  fetchRecycledItems,
  fetchDriveStats,
  createDocument,
  renameDocument,
  recycleDocument,
  restoreDocument,
  deleteDocumentPermanently,
  emptyRecycleBin,
} from "./documentService";
import { apiUrl } from "../../../config/api.js";
import { useAuth } from "../../../context/AuthContext";

/**
 * Main Documents View component
 * Perfectly matches the PDF design for:
 * 1. Documents (My Drive) with 4 template cards (DOC, XLS, PPT, BOARD) & file table
 * 2. Recycle Bin ("Recycle pin") view with Empty Recycle Bin & deleted items
 * Connected to MongoDB backend with real-time optimistic sync.
 */
export default function DocumentsView({ onClose }) {
  // Current logged in user & role permissions
  const { user, role, isAdmin: authIsAdmin } = useAuth();
  const isAdmin = Boolean(
    authIsAdmin ||
    (typeof role === "string" && role.trim().toLowerCase() === "admin") ||
    (user?.role && String(user.role).trim().toLowerCase() === "admin")
  );
  const currentUserId = user?._id || user?.id || user?.uid || "";
  const currentUserName =
    user?.name ||
    user?.employeeName ||
    user?.displayName ||
    user?.username ||
    (user?.email ? user.email.split("@")[0] : "");

  // View toggle: "drive" (default) or "recycle"
  const [activeView, setActiveView] = useState("drive");

  // Search & format filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Column sorting
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Multi-row selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Documents list & Recycle Bin list
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [recycledItems, setRecycledItems] = useState(INITIAL_RECYCLE_BIN);
  const [storageStats, setStorageStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplateForCreate, setSelectedTemplateForCreate] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Function to refresh My Drive directly from MongoDB backend
  const refreshDriveData = async () => {
    setIsRefreshing(true);
    try {
      const [docsData, statsData] = await Promise.all([
        fetchDocuments(),
        fetchDriveStats(),
      ]);

      if (docsData && docsData.length > 0) {
        setDocuments(docsData.map((d) => ({ ...d, id: d._id || d.id })));
      }
      if (statsData) {
        setStorageStats(statsData);
      }
    } catch (err) {
      console.warn("Backend My Drive sync error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Sync data with MongoDB backend on mount
  useEffect(() => {
    let isMounted = true;
    const loadBackendData = async () => {
      setLoading(true);
      try {
        const [docsData, recycledData, statsData] = await Promise.all([
          fetchDocuments(),
          fetchRecycledItems(),
          fetchDriveStats(),
        ]);

        if (isMounted) {
          if (docsData && docsData.length > 0) {
            setDocuments(docsData.map((d) => ({ ...d, id: d._id || d.id })));
          }
          if (recycledData && recycledData.length > 0) {
            setRecycledItems(recycledData.map((d) => ({ ...d, id: d._id || d.id })));
          }
          if (statsData) {
            setStorageStats(statsData);
          }
        }
      } catch (err) {
        console.warn("Backend documents sync error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers for Templates & Creation
  const handleSelectTemplate = (template) => {
    setSelectedTemplateForCreate(template);
    setIsCreateModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setSelectedTemplateForCreate(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateDocument = async (newDoc) => {
    // 1. Optimistic UI update
    setDocuments((prev) => [newDoc, ...prev]);

    // 2. Persist to MongoDB backend
    let payload = newDoc;
    if (newDoc.file) {
      const formData = new FormData();
      formData.append("file", newDoc.file);
      formData.append("name", newDoc.name);
      formData.append("type", newDoc.type || "file");
      formData.append("author", newDoc.author || currentUserName || (isAdmin ? "Admin" : "Employee"));
      formData.append("authorId", newDoc.authorId || currentUserId);
      payload = formData;
    }

    const savedDoc = await createDocument(payload);
    if (savedDoc) {
      setDocuments((prev) =>
        prev.map((d) => (d.id === newDoc.id ? { ...savedDoc, id: savedDoc._id || savedDoc.id } : d))
      );
      fetchDriveStats().then((stats) => {
        if (stats) setStorageStats(stats);
      });
    }
  };

  // Handlers for File Actions
  const handlePreview = (doc) => {
    setPreviewDoc(doc);
  };

  // Real Direct Download: Triggers download attachment to local disk
  const handleDownload = (doc) => {
    if (!doc) return;
    const downloadId = doc._id || doc.id;

    // 1. If document is saved in backend MongoDB, download through attachment endpoint
    if (downloadId && !String(downloadId).startsWith("doc-")) {
      const downloadUrl = apiUrl(`/documents/${downloadId}/download`);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", doc.name || "download");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 2. If it has a url (e.g. uploaded file or direct link)
    if (doc.url) {
      const targetUrl = doc.url.startsWith("http") ? doc.url : apiUrl(doc.url);
      const link = document.createElement("a");
      link.href = targetUrl;
      link.setAttribute("download", doc.name || "download");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 3. Fallback for mock/template seeded files: create downloadable octet-stream blob
    const blob = new Blob([doc.content || `Content of ${doc.name}`], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name || "document.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRename = async (doc) => {
    const newName = window.prompt("Enter new file name:", doc.name);
    if (newName && newName.trim() && newName.trim() !== doc.name) {
      const trimmed = newName.trim();
      // 1. Optimistic UI update
      setDocuments((prev) =>
        prev.map((item) =>
          item.id === doc.id ? { ...item, name: trimmed, modifiedOn: "Just now" } : item
        )
      );

      // 2. Backend update if ID is Mongo ObjectId
      if (doc._id || (doc.id && !doc.id.startsWith("doc-"))) {
        const updated = await renameDocument(doc._id || doc.id, trimmed);
        if (updated) {
          setDocuments((prev) =>
            prev.map((item) =>
              item.id === doc.id || item._id === doc._id
                ? { ...item, ...updated, id: updated._id || updated.id }
                : item
            )
          );
        }
      }
    }
  };

  const handleDelete = async (doc) => {
    // 1. Optimistic UI update: move from documents to recycledItems
    setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
    const recycledDoc = {
      ...doc,
      deletedOn: "Just now",
      badgeText: doc.name.split(".").pop().toUpperCase().slice(0, 2),
      daysRemaining: 30,
    };
    setRecycledItems((prev) => [recycledDoc, ...prev]);

    // 2. Backend update
    if (doc._id || (doc.id && !doc.id.startsWith("doc-"))) {
      await recycleDocument(doc._id || doc.id);
      fetchDriveStats().then((stats) => {
        if (stats) setStorageStats(stats);
      });
    }
  };

  // Handlers for Recycle Bin
  const handleRestore = async (item) => {
    // 1. Optimistic UI update
    setRecycledItems((prev) => prev.filter((r) => r.id !== item.id));
    const restoredDoc = {
      ...item,
      modifiedOn: "Just now",
    };
    setDocuments((prev) => [restoredDoc, ...prev]);

    // 2. Backend update
    if (item._id || (item.id && !item.id.startsWith("recycle-"))) {
      await restoreDocument(item._id || item.id);
      fetchDriveStats().then((stats) => {
        if (stats) setStorageStats(stats);
      });
    }
  };

  const handlePermanentDelete = async (item) => {
    if (window.confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) {
      // 1. Optimistic UI update
      setRecycledItems((prev) => prev.filter((r) => r.id !== item.id));

      // 2. Backend update
      if (item._id || (item.id && !item.id.startsWith("recycle-"))) {
        await deleteDocumentPermanently(item._id || item.id);
      }
    }
  };

  const handleEmptyRecycleBin = async () => {
    // 1. Optimistic UI update
    setRecycledItems([]);

    // 2. Backend update
    await emptyRecycleBin();
  };

  // Sorting helpers
  const parseSizeToBytes = (doc) => {
    if (typeof doc.sizeBytes === "number" && doc.sizeBytes > 0) return doc.sizeBytes;
    if (!doc.size || typeof doc.size !== "string") return 0;
    const parts = doc.size.trim().split(" ");
    const num = parseFloat(parts[0]) || 0;
    const unit = (parts[1] || "kb").toLowerCase();
    if (unit.includes("mb")) return num * 1024 * 1024;
    if (unit.includes("gb")) return num * 1024 * 1024 * 1024;
    return num * 1024;
  };

  const parseDocDate = (doc, field) => {
    if (field === "created") {
      if (doc.createdAt) return new Date(doc.createdAt).getTime();
      if (doc.createdOn && doc.createdOn.toLowerCase().includes("today")) return Date.now() - 3600000;
      if (doc.createdOn && doc.createdOn.toLowerCase().includes("yesterday")) return Date.now() - 86400000;
      return 0;
    }
    if (field === "modified") {
      if (doc.updatedAt) return new Date(doc.updatedAt).getTime();
      if (doc.modifiedOn) {
        const parsed = Date.parse(`${doc.modifiedOn} ${new Date().getFullYear()}`);
        if (!isNaN(parsed)) return parsed;
      }
      return 0;
    }
    return 0;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Multi-select handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const selectableDocs = isAdmin
      ? filteredAndSortedDocuments
      : filteredAndSortedDocuments.filter((d) => {
          const isOwner =
            (d.authorId && currentUserId && String(d.authorId) === String(currentUserId)) ||
            (d.author && currentUserName && d.author.trim().toLowerCase() === currentUserName.trim().toLowerCase());
          return isOwner;
        });

    const visibleIds = selectableDocs.map((d) => d.id);
    const isAllSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleIds);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkRecycle = async () => {
    // Only recycle files current user is authorized to manage
    const docsToRecycle = documents.filter((d) => {
      if (!selectedIds.includes(d.id)) return false;
      if (isAdmin) return true;
      const isOwner =
        (d.authorId && currentUserId && String(d.authorId) === String(currentUserId)) ||
        (d.author && currentUserName && d.author.trim().toLowerCase() === currentUserName.trim().toLowerCase());
      return isOwner;
    });

    if (docsToRecycle.length === 0) {
      setSelectedIds([]);
      return;
    }

    const recycledDocIds = docsToRecycle.map((d) => d.id);

    // 1. Optimistic UI update
    setDocuments((prev) => prev.filter((item) => !recycledDocIds.includes(item.id)));
    const newRecycled = docsToRecycle.map((doc) => ({
      ...doc,
      deletedOn: "Just now",
      badgeText: (doc.name.split(".").pop() || "doc").toUpperCase().slice(0, 2),
      daysRemaining: 30,
    }));
    setRecycledItems((prev) => [...newRecycled, ...prev]);
    setSelectedIds([]);

    // 2. Parallel backend sync
    await Promise.all(
      docsToRecycle.map((doc) => {
        if (doc._id || (doc.id && !doc.id.startsWith("doc-"))) {
          return recycleDocument(doc._id || doc.id).catch((err) =>
            console.warn("Bulk recycle error for doc:", doc.id, err)
          );
        }
        return Promise.resolve();
      })
    );
    fetchDriveStats().then((stats) => {
      if (stats) setStorageStats(stats);
    });
  };

  // Filtered & Sorted documents
  const filteredAndSortedDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // 1. Search term match
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        // 2. Format filter
        if (filterType === "all") return true;
        const docType = (doc.type || doc.extension || "").toLowerCase();
        if (filterType === "doc") return docType.includes("doc") || docType.includes("word");
        if (filterType === "xls") return docType.includes("xls") || docType.includes("sheet") || docType.includes("csv");
        if (filterType === "ppt") return docType.includes("ppt");
        if (filterType === "board") {
          return (
            docType.includes("board") ||
            docType.includes("canvas") ||
            docType.includes("ai") ||
            ["png", "jpg", "jpeg", "svg", "pdf", "json"].includes(docType)
          );
        }
        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === "name") {
          comparison = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        } else if (sortField === "author") {
          const authorA = (a.author || "Admin").toLowerCase();
          const authorB = (b.author || "Admin").toLowerCase();
          comparison = authorA.localeCompare(authorB, undefined, { sensitivity: "base" });
        } else if (sortField === "size") {
          comparison = parseSizeToBytes(a) - parseSizeToBytes(b);
        } else if (sortField === "created") {
          comparison = parseDocDate(a, "created") - parseDocDate(b, "created");
        } else if (sortField === "modified") {
          comparison = parseDocDate(a, "modified") - parseDocDate(b, "modified");
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [documents, searchTerm, filterType, sortField, sortDirection]);

  return (
    <div className="flex-1 min-h-0 w-full bg-[#f4f2ec] overflow-y-auto page-scroll p-6 lg:p-8">

      {activeView === "drive" ? (
        /* Documents (My Drive) View */
        <div className="max-w-7xl mx-auto">
          {/* Header Action Bar */}
          <DocumentHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterType={filterType}
            onFilterChange={setFilterType}
            onNewClick={handleOpenNewModal}
            activeView={activeView}
            onViewChange={setActiveView}
            onClose={onClose}
            driveCount={documents.length}
            recycleCount={recycledItems.length}
            storageStats={storageStats}
            isRefreshing={isRefreshing}
            onRefreshDrive={refreshDriveData}
          />

          {/* 4 Template Cards (DOC, XLS, PPT, BOARD) */}
          <DocumentTemplates onSelectTemplate={handleSelectTemplate} />

          {/* Bulk Action Bar (when rows are selected) */}
          {selectedIds.length > 0 && (
            <div className="mb-4 bg-[#0b4d8c] text-white px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckSquare size={16} />
                <span>
                  {selectedIds.length} file{selectedIds.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkRecycle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Move to Recycle Bin</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                  title="Clear selection"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Files List Table */}
          <DocumentTable
            documents={filteredAndSortedDocuments}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onPreview={handlePreview}
            onDownload={handleDownload}
            onRename={handleRename}
            onDelete={handleDelete}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        </div>
      ) : (
        /* Recycle Bin ("Recycle pin") View */
        <div className="max-w-7xl mx-auto">
          <RecycleBinView
            recycledItems={recycledItems}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
            onEmptyRecycleBin={handleEmptyRecycleBin}
            onBackToDrive={() => setActiveView("drive")}
            isAdmin={isAdmin}
          />
        </div>
      )}

      {/* Create / Upload Modal */}
      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        initialTemplate={selectedTemplateForCreate}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateDocument}
      />

      {/* Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}
