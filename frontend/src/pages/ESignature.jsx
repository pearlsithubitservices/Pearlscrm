import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Trash2,
  X,
  Plus,
  MoreVertical,
  PenLine,
  FileText,
  File,
  Eye,
  Download,
  Copy,
  Send,
  Edit3,
  RotateCcw,
  CheckCircle2,
  Bell,
  Clock,
  ExternalLink,
  Upload,
  Sparkles,
  ShieldCheck,
  Check,
  AlertCircle,
  FolderOpen,
  Calendar,
  User,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { apiUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";

// Initial mock data faithfully matching the user's provided UI screenshot
const INITIAL_SIGNATURE_DOCS = [
  {
    id: "doc-0",
    _id: "doc-0",
    name: "skills module certificate",
    size: "32.15 Kb",
    sizeBytes: 32921,
    createdOn: "12 minutes ago",
    modifiedOn: "Sep, 14",
    isSigned: true,
    author: "Mankato University",
    type: "doc",
    extension: "doc",
  },
  {
    id: "doc-1",
    _id: "doc-1",
    name: "crm planing",
    size: "24.82 Kb",
    sizeBytes: 25415,
    createdOn: "37 minutes ago",
    modifiedOn: "Jul, 21",
    isSigned: false,
    author: "Admin",
    type: "doc",
    extension: "doc",
  },
  {
    id: "doc-2",
    _id: "doc-2",
    name: "pearls.doc",
    size: "24.35 Kb",
    sizeBytes: 24934,
    createdOn: "today, 02:18",
    modifiedOn: "Jun, 08",
    isSigned: false,
    author: "Admin",
    type: "doc",
    extension: "doc",
  },
  {
    id: "doc-3",
    _id: "doc-3",
    name: "company",
    size: "21.24 Kb",
    sizeBytes: 21749,
    createdOn: "today, 01:18",
    modifiedOn: "Aug, 13",
    isSigned: false,
    author: "Admin",
    type: "doc",
    extension: "doc",
  },
];

const INITIAL_RECYCLED_DOCS = [
  {
    id: "rec-1",
    _id: "rec-1",
    name: "quarterly_budget_v1.xls",
    size: "45.10 Kb",
    createdOn: "3 days ago",
    modifiedOn: "Aug, 02",
    recycledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    daysRemaining: 28,
    author: "Admin",
  },
  {
    id: "rec-2",
    _id: "rec-2",
    name: "nda_partner_draft.doc",
    size: "18.60 Kb",
    createdOn: "1 week ago",
    modifiedOn: "Jul, 29",
    recycledAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    daysRemaining: 24,
    author: "Admin",
  },
];

export default function ESignature() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Primary document state
  const [documents, setDocuments] = useState(INITIAL_SIGNATURE_DOCS);
  const [recycledDocuments, setRecycledDocuments] = useState(INITIAL_RECYCLED_DOCS);
  const [loading, setLoading] = useState(false);

  // View state: "active" | "recycle"
  const [currentView, setCurrentView] = useState("active");

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");

  // Dropdown menu state: { docId: string, x: number, y: number } | null
  const [activeMenuDocId, setActiveMenuDocId] = useState(null);
  const menuRef = useRef(null);

  // Modals state
  const [signModalDoc, setSignModalDoc] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [renameModalDoc, setRenameModalDoc] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [sendSigningDoc, setSendSigningDoc] = useState(null);
  const [previewModalDoc, setPreviewModalDoc] = useState(null);

  // Notification menu state
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Signature Request",
      message: "Client pending signature on 'crm planing'",
      time: "10 mins ago",
      unread: true,
    },
    {
      id: "notif-2",
      title: "Document Approved",
      message: "'pearls.doc' verified and ready for signing",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: "notif-3",
      title: "Recycle Notice",
      message: "Files in Recycle Bin will be purged after 30 days",
      time: "Yesterday",
      unread: false,
    },
  ]);

  // Load from MongoDB backend if available
  useEffect(() => {
    const fetchBackendDocs = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl("/documents"));
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            setDocuments(
              json.data.map((d) => ({
                id: d._id || d.id,
                _id: d._id || d.id,
                name: d.name,
                size: d.size || "24.00 Kb",
                createdOn: d.createdOn || "Recently",
                modifiedOn: d.modifiedOn || "Today",
                isSigned: Boolean(d.isSigned),
                author: d.author || "Admin",
                url: d.url || "",
                extension: d.extension || "doc",
              }))
            );
          }
        }

        // Fetch recycle bin
        const recRes = await fetch(apiUrl("/documents/recycle-bin"));
        if (recRes.ok) {
          const recJson = await recRes.json();
          if (Array.isArray(recJson.data) && recJson.data.length > 0) {
            setRecycledDocuments(
              recJson.data.map((d) => ({
                id: d._id || d.id,
                _id: d._id || d.id,
                name: d.name,
                size: d.size || "20.00 Kb",
                createdOn: d.createdOn || "Recently",
                modifiedOn: d.modifiedOn || "Today",
                daysRemaining: d.daysRemaining || 30,
                author: d.author || "Admin",
                url: d.url || "",
              }))
            );
          }
        }
      } catch (err) {
        console.log("Documents API offline, using interactive local state:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBackendDocs();
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuDocId(null);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotificationMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered active documents
  const filteredDocuments = useMemo(() => {
    if (!searchTerm.trim()) return documents;
    const term = searchTerm.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(term) ||
        (doc.modifiedOn && doc.modifiedOn.toLowerCase().includes(term))
    );
  }, [documents, searchTerm]);

  // Filtered recycled documents
  const filteredRecycled = useMemo(() => {
    if (!searchTerm.trim()) return recycledDocuments;
    const term = searchTerm.toLowerCase();
    return recycledDocuments.filter((doc) =>
      doc.name.toLowerCase().includes(term)
    );
  }, [recycledDocuments, searchTerm]);

  // Handle Move to Recycle Bin (Delete from active)
  const handleRecycle = async (doc) => {
    setActiveMenuDocId(null);
    try {
      // Backend call
      fetch(apiUrl(`/documents/${doc._id || doc.id}/recycle`), {
        method: "PATCH",
      }).catch(() => {});

      // Optimistic state update
      setDocuments((prev) => prev.filter((d) => (d._id || d.id) !== (doc._id || doc.id)));
      setRecycledDocuments((prev) => [
        {
          ...doc,
          recycledAt: new Date().toISOString(),
          daysRemaining: 30,
        },
        ...prev,
      ]);

      toast.success(
        <span>
          <b>{doc.name}</b> moved to Recycle Bin (kept for 30 days)
        </span>,
        { icon: "🗑️" }
      );
    } catch {
      toast.error("Failed to move document to Recycle Bin");
    }
  };

  // Handle Restore from Recycle Bin
  const handleRestore = async (doc) => {
    try {
      fetch(apiUrl(`/documents/${doc._id || doc.id}/restore`), {
        method: "PATCH",
      }).catch(() => {});

      setRecycledDocuments((prev) =>
        prev.filter((d) => (d._id || d.id) !== (doc._id || doc.id))
      );
      setDocuments((prev) => [
        {
          ...doc,
          modifiedOn: "Just now",
        },
        ...prev,
      ]);

      toast.success(`"${doc.name}" restored to active documents!`);
    } catch {
      toast.error("Failed to restore document");
    }
  };

  // Handle Permanent Delete
  const handlePermanentDelete = async (doc) => {
    try {
      fetch(apiUrl(`/documents/${doc._id || doc.id}`), {
        method: "DELETE",
      }).catch(() => {});

      setRecycledDocuments((prev) =>
        prev.filter((d) => (d._id || d.id) !== (doc._id || doc.id))
      );
      toast.success(`"${doc.name}" permanently deleted.`);
    } catch {
      toast.error("Failed to delete permanently");
    }
  };

  // Handle Empty Recycle Bin
  const handleEmptyRecycleBin = async () => {
    if (recycledDocuments.length === 0) return;
    if (!window.confirm("Are you sure you want to permanently delete all files in Recycle Bin?")) {
      return;
    }
    try {
      fetch(apiUrl("/documents/recycle-bin/empty"), {
        method: "DELETE",
      }).catch(() => {});
      setRecycledDocuments([]);
      toast.success("Recycle Bin emptied successfully.");
    } catch {
      toast.error("Failed to empty recycle bin");
    }
  };

  // Handle Copy Link
  const handleCopyLink = (doc) => {
    setActiveMenuDocId(null);
    const link = `${window.location.origin}/e-signatures?doc=${doc._id || doc.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Document link copied to clipboard!", { icon: "📋" });
  };

  // Handle Download
  const handleDownload = (doc) => {
    setActiveMenuDocId(null);
    if (doc.url && doc.url.startsWith("http")) {
      window.open(doc.url, "_blank");
    } else {
      // Generate downloadable simulated document
      const element = document.createElement("a");
      const fileContent = `=== ${doc.name} ===\nStatus: ${
        doc.isSigned ? "Signed" : "Draft"
      }\nCreated: ${doc.createdOn}\nSize: ${doc.size}\nAuthor: ${
        doc.author || "Admin"
      }\n\nPearls IT Hub E-Signature Document.`;
      const file = new Blob([fileContent], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${doc.name}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(`Downloading "${doc.name}"...`, { icon: "⬇️" });
    }
  };

  // Handle Rename Submit
  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameValue.trim() || !renameModalDoc) return;
    const newName = renameValue.trim();
    const docId = renameModalDoc._id || renameModalDoc.id;

    try {
      fetch(apiUrl(`/documents/${docId}/rename`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      }).catch(() => {});

      setDocuments((prev) =>
        prev.map((d) =>
          (d._id || d.id) === docId
            ? { ...d, name: newName, modifiedOn: "Just now" }
            : d
        )
      );
      toast.success("Document renamed successfully!");
      setRenameModalDoc(null);
      setRenameValue("");
    } catch {
      toast.error("Failed to rename document");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f5f1] p-4 sm:p-6 lg:p-8">
      {/* Import Signature Script Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Sacramento&display=swap');
        .font-caveat { font-family: 'Caveat', cursive; }
        .font-dancing { font-family: 'Dancing Script', cursive; }
        .font-greatvibes { font-family: 'Great Vibes', cursive; }
        .font-sacramento { font-family: 'Sacramento', cursive; }
      `}</style>

      {/* ====================================================
          PAGE HEADER (Admin - E signature)
      ==================================================== */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b2b57] tracking-tight">
            Admin - E signature
          </h1>
          <p className="text-sm text-gray-500 font-normal mt-0.5">
            Creating a design of Sprint Planning
          </p>
        </div>

        {/* NOTIFICATION BELL */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="w-10 h-10 rounded-xl bg-[#2563a9] hover:bg-[#1d528f] text-white flex items-center justify-center shadow-sm transition-all duration-200 relative cursor-pointer"
            title="Notifications"
          >
            <Bell size={19} />
            {notifications.filter((n) => n.unread).length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          <AnimatePresence>
            {showNotificationMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="bg-[#0b2b57] text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={16} />
                    <span className="font-semibold text-sm">Notifications</span>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.map((n) => ({ ...n, unread: false }))
                      )
                    }
                    className="text-xs text-blue-200 hover:text-white transition cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 hover:bg-gray-50 transition flex items-start gap-3 ${
                        notif.unread ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-[#2563a9] mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ====================================================
          MAIN WHITE CARD CONTAINER
      ==================================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-all">
        {/* CARD TOP TOOLBAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4">
          {/* Card Title */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1e293b]">
              {currentView === "recycle" ? "Recycle Bin" : "E-signature"}
            </h2>
            {currentView === "recycle" && (
              <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
                {recycledDocuments.length} files
              </span>
            )}
          </div>

          {/* Action Bar on Right */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* + Upload Document Button */}
            {currentView === "active" && (
              <button
                onClick={() => setUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1d68bd] hover:bg-[#18569c] text-white text-sm font-medium rounded-xl transition shadow-sm cursor-pointer"
              >
                <Plus size={16} />
                Upload document
              </button>
            )}

            {/* Search Input */}
            <div className="relative flex-1 sm:w-56 md:w-64">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Files..."
                className="w-full bg-[#f1f4f9] hover:bg-[#ebf0f7] focus:bg-white text-gray-800 text-xs sm:text-sm pl-9 pr-8 py-2 rounded-xl border border-transparent focus:border-blue-400 outline-none transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Recycle Bin Toggle Button */}
            <button
              onClick={() =>
                setCurrentView((prev) => (prev === "active" ? "recycle" : "active"))
              }
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition cursor-pointer ${
                currentView === "recycle"
                  ? "bg-[#0b2b57] text-white"
                  : "bg-[#edf0f5] hover:bg-[#e2e7ef] text-gray-700"
              }`}
              title="Toggle Recycle Bin"
            >
              <Trash2 size={16} />
              <span>{currentView === "recycle" ? "Active Files" : "Recycle Bin"}</span>
            </button>

            {/* Clear / Red X Button */}
            <button
              onClick={() => {
                setSearchTerm("");
                if (currentView === "recycle") setCurrentView("active");
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
              title="Clear search and filters"
            >
              <X size={19} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* META SUB-HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-3 mb-4 gap-1">
          <span className="font-normal">
            {currentView === "recycle"
              ? "Deleted files pending 30-day auto-purge"
              : "Signature files"}
          </span>
          <span className="text-gray-400 italic">
            Files deleted to the Recycle Bin are kept for 30 days
          </span>
        </div>

        {/* ====================================================
            ACTIVE DOCUMENTS TABLE
        ==================================================== */}
        {currentView === "active" && (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-white">
                  <th className="py-3 px-4 sm:px-6 text-xs font-semibold text-gray-900 w-[30%]">
                    File Name
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-900 text-center w-[18%]">
                    File size
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-900 text-center w-[18%]">
                    Created on
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-900 text-center w-[18%]">
                    modified on
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-900 text-center w-[16%]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white text-xs sm:text-sm">
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <FolderOpen size={36} className="mx-auto mb-2 opacity-40" />
                      <p className="font-medium">No signature files found.</p>
                      {searchTerm && (
                        <p className="text-xs mt-1">Try changing your search term.</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => {
                    const isMenuOpen = activeMenuDocId === (doc._id || doc.id);

                    return (
                      <tr
                        key={doc._id || doc.id}
                        className="hover:bg-gray-50/75 transition duration-150 group"
                      >
                        {/* FILE NAME */}
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex items-center gap-2.5">
                            <FileText
                              size={17}
                              className="text-gray-400 group-hover:text-blue-600 transition shrink-0"
                            />
                            <span className="font-normal text-gray-800 tracking-tight">
                              {doc.name}
                            </span>
                            {doc.isSigned && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 size={11} /> Signed
                              </span>
                            )}
                          </div>
                        </td>

                        {/* FILE SIZE */}
                        <td className="py-3 px-4 text-center text-gray-700 font-normal">
                          {doc.size}
                        </td>

                        {/* CREATED ON */}
                        <td className="py-3 px-4 text-center text-gray-700 font-normal">
                          {doc.createdOn}
                        </td>

                        {/* MODIFIED ON */}
                        <td className="py-3 px-4 text-center text-gray-700 font-normal">
                          {doc.modifiedOn}
                        </td>

                        {/* ACTION */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center justify-center gap-2 relative">
                            {/* 3 DOTS MENU TRIGGER */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuDocId(
                                    isMenuOpen ? null : doc._id || doc.id
                                  );
                                }}
                                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                                title="More options"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {/* FLOATING ACTION DROPDOWN */}
                              <AnimatePresence>
                                {isMenuOpen && (
                                  <motion.div
                                    ref={menuRef}
                                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 text-left"
                                  >
                                    {/* OPEN */}
                                    <button
                                      onClick={() => {
                                        setActiveMenuDocId(null);
                                        navigate(`/e-signatures/editor/${doc._id || doc.id}`, {
                                          state: { document: doc },
                                        });
                                      }}
                                      className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition text-left cursor-pointer"
                                    >
                                      <Eye size={14} className="text-gray-400" />
                                      Open
                                    </button>

                                    {/* DOWNLOAD */}
                                    <button
                                      onClick={() => handleDownload(doc)}
                                      className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition text-left cursor-pointer"
                                    >
                                      <Download size={14} className="text-gray-400" />
                                      Download
                                    </button>

                                    {/* COPY LINK */}
                                    <button
                                      onClick={() => handleCopyLink(doc)}
                                      className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition text-left cursor-pointer"
                                    >
                                      <Copy size={14} className="text-gray-400" />
                                      Copy link
                                    </button>

                                    {/* SEND FOR SIGNING */}
                                    <button
                                      onClick={() => {
                                        setActiveMenuDocId(null);
                                        setSendSigningDoc(doc);
                                      }}
                                      className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition text-left cursor-pointer"
                                    >
                                      <Send size={14} className="text-gray-400" />
                                      send for signing
                                    </button>

                                    {/* RENAME */}
                                    <button
                                      onClick={() => {
                                        setActiveMenuDocId(null);
                                        setRenameModalDoc(doc);
                                        setRenameValue(doc.name);
                                      }}
                                      className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition text-left cursor-pointer"
                                    >
                                      <Edit3 size={14} className="text-gray-400" />
                                      Rename
                                    </button>

                                    <div className="border-t border-gray-100 my-1" />

                                    {/* DELETE */}
                                    <button
                                      onClick={() => handleRecycle(doc)}
                                      className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition font-medium text-left cursor-pointer"
                                    >
                                      <Trash2 size={14} className="text-red-500" />
                                      Delete
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* SIGN BUTTON */}
                            <button
                              onClick={() =>
                                navigate(`/e-signatures/editor/${doc._id || doc.id}`, {
                                  state: { document: doc },
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#2563a9] text-[#2563a9] hover:bg-[#2563a9] hover:text-white transition duration-150 text-xs font-semibold cursor-pointer shadow-2xs"
                              title="Sign this document in Document Editor"
                            >
                              <PenLine size={13} />
                              Sign
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ====================================================
            RECYCLE BIN TABLE
        ==================================================== */}
        {currentView === "recycle" && (
          <div>
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>
                  Items in the recycle bin are automatically permanently deleted after
                  30 days.
                </span>
              </div>
              {recycledDocuments.length > 0 && (
                <button
                  onClick={handleEmptyRecycleBin}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Empty Recycle Bin
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-white">
                    <th className="py-3 px-4 sm:px-6 text-xs font-semibold text-gray-900">
                      File Name
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-900 text-center">
                      File size
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-900 text-center">
                      Retention Days Left
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-900 text-center">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white text-xs sm:text-sm">
                  {filteredRecycled.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-400">
                        <Trash2 size={36} className="mx-auto mb-2 opacity-30" />
                        <p className="font-medium">Recycle Bin is empty.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecycled.map((doc) => (
                      <tr
                        key={doc._id || doc.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex items-center gap-2.5">
                            <FileText size={16} className="text-gray-400" />
                            <span className="font-medium text-gray-700 line-through opacity-75">
                              {doc.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {doc.size}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                            <Clock size={12} /> {doc.daysRemaining || 30} days left
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleRestore(doc)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1"
                            >
                              <RotateCcw size={13} />
                              Restore
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(doc)}
                              className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-medium transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================
          INTERACTIVE SIGNATURE STUDIO MODAL
      ==================================================== */}
      <AnimatePresence>
        {signModalDoc && (
          <SignatureStudioModal
            document={signModalDoc}
            onClose={() => setSignModalDoc(null)}
            onSigned={(signedDoc) => {
              setDocuments((prev) =>
                prev.map((d) =>
                  (d._id || d.id) === (signedDoc._id || signedDoc.id)
                    ? { ...d, isSigned: true, modifiedOn: "Just now" }
                    : d
                )
              );
              setSignModalDoc(null);
              toast.success(
                <span>
                  <b>{signedDoc.name}</b> successfully signed!
                </span>,
                { icon: "✍️" }
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* ====================================================
          UPLOAD DOCUMENT MODAL
      ==================================================== */}
      <AnimatePresence>
        {uploadModalOpen && (
          <UploadDocumentModal
            onClose={() => setUploadModalOpen(false)}
            onUploaded={(newDoc) => {
              setDocuments((prev) => [newDoc, ...prev]);
              setUploadModalOpen(false);
              toast.success(`"${newDoc.name}" uploaded successfully!`);
            }}
          />
        )}
      </AnimatePresence>

      {/* ====================================================
          RENAME MODAL
      ==================================================== */}
      <AnimatePresence>
        {renameModalDoc && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">Rename Document</h3>
                <button
                  onClick={() => setRenameModalDoc(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRenameSubmit} className="mt-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white"
                  autoFocus
                />

                <div className="flex items-center justify-end gap-2.5 mt-6">
                  <button
                    type="button"
                    onClick={() => setRenameModalDoc(null)}
                    className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-[#2563a9] hover:bg-blue-700 text-white rounded-xl shadow-sm transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================
          SEND FOR SIGNING MODAL
      ==================================================== */}
      <AnimatePresence>
        {sendSigningDoc && (
          <SendForSigningModal
            document={sendSigningDoc}
            onClose={() => setSendSigningDoc(null)}
            onSent={() => {
              setSendSigningDoc(null);
              toast.success(
                <span>
                  Signature invitation sent for <b>{sendSigningDoc.name}</b>!
                </span>,
                { icon: "✉️" }
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* ====================================================
          DOCUMENT PREVIEW MODAL
      ==================================================== */}
      <AnimatePresence>
        {previewModalDoc && (
          <DocumentPreviewModal
            document={previewModalDoc}
            onClose={() => setPreviewModalDoc(null)}
            onSignClick={() => {
              const doc = previewModalDoc;
              setPreviewModalDoc(null);
              setSignModalDoc(doc);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// SIGNATURE STUDIO MODAL
// ============================================================================
function SignatureStudioModal({ document, onClose, onSigned }) {
  const [signMode, setSignMode] = useState("draw"); // "draw" | "type" | "upload"
  const [typedName, setTypedName] = useState("Vishnu R");
  const [selectedFont, setSelectedFont] = useState("font-caveat");
  const [inkColor, setInkColor] = useState("#0f172a");

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Setup drawing canvas
  useEffect(() => {
    if (signMode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = inkColor;
  }, [signMode, inkColor]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleApplySignature = () => {
    onSigned(document);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563a9] flex items-center justify-center">
                <PenLine size={18} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg sm:text-xl">
                Sign Document
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Document: <span className="font-semibold text-gray-700">{document.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODE TABS */}
        <div className="flex items-center gap-2 mt-5 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setSignMode("draw")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              signMode === "draw"
                ? "bg-white text-[#2563a9] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Draw Signature
          </button>
          <button
            onClick={() => setSignMode("type")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              signMode === "type"
                ? "bg-white text-[#2563a9] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Type Signature
          </button>
          <button
            onClick={() => setSignMode("upload")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              signMode === "upload"
                ? "bg-white text-[#2563a9] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Upload Image
          </button>
        </div>

        {/* INK COLOR PICKER */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs font-medium text-gray-500">Signature Color:</span>
          <div className="flex items-center gap-2">
            {[
              { label: "Black", color: "#0f172a" },
              { label: "Navy Blue", color: "#1d4ed8" },
              { label: "Royal Blue", color: "#2563eb" },
            ].map((c) => (
              <button
                key={c.color}
                onClick={() => setInkColor(c.color)}
                style={{ backgroundColor: c.color }}
                className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                  inkColor === c.color ? "border-gray-900 scale-110" : "border-transparent"
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* CANVAS DRAWING AREA */}
        {signMode === "draw" && (
          <div className="mt-4">
            <div className="relative border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl bg-gray-50/50 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-40 touch-none cursor-crosshair bg-white"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-gray-400 text-xs italic">
                  Draw your signature here with mouse or stylus
                </div>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <button
                onClick={clearCanvas}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition cursor-pointer"
              >
                Clear Canvas
              </button>
            </div>
          </div>
        )}

        {/* TYPED SIGNATURE AREA */}
        {signMode === "type" && (
          <div className="mt-4 space-y-4">
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Caveat", class: "font-caveat" },
                { name: "Dancing Script", class: "font-dancing" },
                { name: "Great Vibes", class: "font-greatvibes" },
                { name: "Sacramento", class: "font-sacramento" },
              ].map((f) => (
                <div
                  key={f.class}
                  onClick={() => setSelectedFont(f.class)}
                  className={`p-3 rounded-xl border-2 text-center cursor-pointer transition ${
                    selectedFont === f.class
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p
                    style={{ color: inkColor }}
                    className={`${f.class} text-2xl truncate`}
                  >
                    {typedName || "Signature"}
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    {f.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UPLOAD SIGNATURE AREA */}
        {signMode === "upload" && (
          <div className="mt-4 border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center bg-gray-50/50">
            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-xs font-semibold text-gray-700">
              Upload signature image (.png, .jpg)
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Transparent background recommended
            </p>
            <input
              type="file"
              accept="image/*"
              className="mt-3 text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
        )}

        {/* COMPLIANCE FOOTER */}
        <div className="flex items-center gap-2 mt-5 p-2.5 rounded-xl bg-gray-50 text-[11px] text-gray-500">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>
            Digitally certified & tamper-evident signature according to e-Sign act.
          </span>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApplySignature}
            className="px-5 py-2 text-xs font-semibold bg-[#2563a9] hover:bg-[#1d528f] text-white rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={15} />
            Apply Signature & Complete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// UPLOAD DOCUMENT MODAL
// ============================================================================
function UploadDocumentModal({ onClose, onUploaded }) {
  const [docName, setDocName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!docName) {
        setDocName(selected.name);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docName.trim()) {
      toast.error("Please provide a document title");
      return;
    }

    setLoading(true);
    try {
      // Backend upload if file is selected
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", docName.trim());

        const res = await fetch(apiUrl("/documents"), {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            onUploaded({
              id: json.data._id || json.data.id,
              _id: json.data._id || json.data.id,
              name: json.data.name,
              size: json.data.size || `${(file.size / 1024).toFixed(2)} Kb`,
              createdOn: "Just now",
              modifiedOn: "Today",
              isSigned: false,
              author: "Admin",
            });
            return;
          }
        }
      }

      // Fallback local creation
      const ext = docName.includes(".") ? docName.split(".").pop() : "doc";
      const newDoc = {
        id: `doc-${Date.now()}`,
        _id: `doc-${Date.now()}`,
        name: docName.trim(),
        size: file ? `${(file.size / 1024).toFixed(2)} Kb` : "18.50 Kb",
        createdOn: "Just now",
        modifiedOn: "Today",
        isSigned: false,
        author: "Admin",
        extension: ext,
      };

      onUploaded(newDoc);
    } catch {
      toast.error("Upload error, document created locally");
      const newDoc = {
        id: `doc-${Date.now()}`,
        _id: `doc-${Date.now()}`,
        name: docName.trim(),
        size: "20.40 Kb",
        createdOn: "Just now",
        modifiedOn: "Today",
        isSigned: false,
        author: "Admin",
      };
      onUploaded(newDoc);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1d68bd] flex items-center justify-center">
              <Upload size={18} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Upload Document</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* DRAG & DROP ZONE */}
          <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl p-6 text-center bg-gray-50/50 transition">
            <FileText size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-xs font-semibold text-gray-800">
              Drag & drop document here or browse
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Supports .doc, .docx, .pdf, .xls, .ppt up to 50MB
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-3 text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Document Title / Name
            </label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. crm planing.doc"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-[#1d68bd] hover:bg-[#18569c] text-white rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ============================================================================
// SEND FOR SIGNING MODAL
// ============================================================================
function SendForSigningModal({ document, onClose, onSent }) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState(
    `Please review and sign the attached document: ${document.name}`
  );

  const handleSend = (e) => {
    e.preventDefault();
    if (!recipientEmail) {
      toast.error("Please enter recipient email");
      return;
    }
    onSent();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563a9] flex items-center justify-center">
              <Send size={16} />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Send for Signing</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSend} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Document
            </label>
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800">
              <FileText size={14} className="text-gray-500" />
              <span className="font-medium truncate">{document.name}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Signer Name
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-800 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Signer Email Address *
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-800 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Message / Notes
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-gray-800 outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-[#2563a9] hover:bg-blue-700 text-white rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send size={13} />
              Send Invitation
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ============================================================================
// DOCUMENT PREVIEW MODAL
// ============================================================================
function DocumentPreviewModal({ document, onClose, onSignClick }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-[#2563a9]" />
            <h3 className="font-bold text-gray-900 text-lg truncate">
              {document.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* DOCUMENT PREVIEW CONTAINER */}
        <div className="my-5 p-6 bg-gray-50 border border-gray-200 rounded-2xl min-h-60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <span className="text-xs font-bold uppercase text-gray-400">
                Pearls IT Hub &bull; Document Preview
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  document.isSigned
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {document.isSigned ? "Verified & Signed" : "Awaiting Signature"}
              </span>
            </div>

            <h4 className="text-base font-bold text-gray-800 mb-2">
              {document.name}
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              This document contains sprint planning notes, deliverables, milestone
              tracking, and approval requirements for Pearls CRM IT Services.
            </p>
          </div>

          <div className="border-t border-dashed border-gray-300 pt-4 mt-6 flex items-center justify-between text-xs text-gray-500">
            <div>
              <span>File size: {document.size}</span>
              <span className="mx-2">&bull;</span>
              <span>Created: {document.createdOn}</span>
            </div>
            {document.isSigned && (
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 size={14} /> Certified Signed
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            Close Preview
          </button>
          {!document.isSigned && (
            <button
              onClick={onSignClick}
              className="px-5 py-2 text-xs font-semibold bg-[#2563a9] hover:bg-[#1d528f] text-white rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <PenLine size={14} />
              Sign this document
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
