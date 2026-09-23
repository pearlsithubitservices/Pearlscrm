import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
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
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { apiUrl } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import SignatureStudioModal from "../../components/SignatureStudioModal";
import SendDocumentModal from "../../components/SendDocumentModal";

// Clean document states initialized dynamically from database
const INITIAL_SIGNATURE_DOCS = [];
const INITIAL_RECYCLED_DOCS = [];

export default function EmpESignature() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Primary document state (dynamic from MongoDB)
  const [documents, setDocuments] = useState([]);
  const [recycledDocuments, setRecycledDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // View state: "active" | "recycle"
  const [currentView, setCurrentView] = useState("active");

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");

  // Portal Dropdown menu state: { doc, top, left, openUpwards } | null
  const [activeMenu, setActiveMenu] = useState(null);

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
  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_dismissed_emp_esign_notifs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("crm_dismissed_emp_esign_notifs", JSON.stringify(dismissedNotifIds));
    } catch (e) {
      console.error("Error saving dismissed emp esign notifications:", e);
    }
  }, [dismissedNotifIds]);

  // Dynamic notifications generator matching Tasks.jsx and Admin ESignature
  const notifications = useMemo(() => {
    const list = [];

    // 1. Pending Signature Notifications (unsigned documents)
    (Array.isArray(documents) ? documents : []).forEach((doc) => {
      const docId = doc._id || doc.id;
      const notifId = `pending-sig-${docId}`;
      if (!doc.isSigned && !dismissedNotifIds.includes(notifId)) {
        list.push({
          id: notifId,
          type: "pending",
          title: "Signature Required",
          message: `Document "${doc.name}" is awaiting your signature (Created by ${doc.author || "Admin"}).`,
          time: doc.createdOn || "Pending",
          document: doc,
        });
      }
    });

    // 2. Signed & Certified Notifications
    (Array.isArray(documents) ? documents : []).forEach((doc) => {
      const docId = doc._id || doc.id;
      const notifId = `signed-${docId}`;
      if (doc.isSigned && !dismissedNotifIds.includes(notifId)) {
        list.push({
          id: notifId,
          type: "signed",
          title: "Document Signed & Certified",
          message: `"${doc.name}" has been completed and verified with electronic signature.`,
          time: doc.modifiedOn || "Signed",
          document: doc,
        });
      }
    });

    // 3. Recycle Bin Retention Warnings
    (Array.isArray(recycledDocuments) ? recycledDocuments : []).forEach((doc) => {
      const docId = doc._id || doc.id;
      const notifId = `recycle-${docId}`;
      if (!dismissedNotifIds.includes(notifId)) {
        const days = doc.daysRemaining !== undefined ? doc.daysRemaining : 30;
        list.push({
          id: notifId,
          type: "recycle",
          title: "Recycle Bin Warning",
          message: `"${doc.name}" will be permanently purged in ${days} day${days === 1 ? "" : "s"}.`,
          time: `${days}d remaining`,
          document: doc,
          isRecycled: true,
        });
      }
    });

    return list;
  }, [documents, recycledDocuments, dismissedNotifIds]);

  const handleClearAllNotifs = (e) => {
    e.stopPropagation();
    const allNotifIds = notifications.map((n) => n.id);
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, ...allNotifIds])));
  };

  const handleNotifClick = (e, notif) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notif.id])));
    setShowNotificationMenu(false);
    if (notif.isRecycled) {
      setCurrentView("recycle");
    } else {
      navigate(`/employee/e-signatures/editor/${notif.document._id || notif.document.id}`, {
        state: { document: notif.document },
      });
    }
  };

  const handleDismissNotif = (e, notifId) => {
    e.stopPropagation();
    setDismissedNotifIds((prev) => Array.from(new Set([...prev, notifId])));
  };

  // Load from MongoDB backend on mount
  useEffect(() => {
    const fetchBackendDocs = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl("/documents"));
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) {
            setDocuments(
              json.data.map((d) => ({
                id: d._id || d.id,
                _id: d._id || d.id,
                name: d.name,
                size: d.size || "24.00 Kb",
                createdOn: d.createdOn || "Recently",
                modifiedOn: d.modifiedOn || "Today",
                isSigned: Boolean(d.isSigned),
                status: d.status || (d.isSigned ? "completed" : "waiting"),
                signedAt: d.signedAt || null,
                signedBy: d.signedBy || "",
                placedFields: d.placedFields || [],
                signers: d.signers || [],
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
          if (Array.isArray(recJson.data)) {
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
        console.log("Documents API offline, using local state:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBackendDocs();

    const handleDocSaved = () => {
      fetchBackendDocs();
    };
    window.addEventListener("pearls_document_saved", handleDocSaved);
    window.addEventListener("focus", handleDocSaved);
    return () => {
      window.removeEventListener("pearls_document_saved", handleDocSaved);
      window.removeEventListener("focus", handleDocSaved);
    };
  }, []);

  // Handle doc query param if present (e.g. from copy link or notifications)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const docId = params.get("doc");
      if (docId && documents.length > 0) {
        const found = documents.find((d) => (d._id || d.id) === docId);
        if (found) {
          setPreviewModalDoc(found);
        }
      }
    }
  }, [documents]);

  // Dismiss dropdown or notifications when clicking outside, scrolling, or pressing Escape
  useEffect(() => {
    const handleDocumentMouseDown = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotificationMenu(false);
      }
      if (
        (e.target.closest && e.target.closest("[data-esignature-dropdown]")) ||
        (e.target.closest && e.target.closest("[data-esignature-trigger]"))
      ) {
        return;
      }
      setActiveMenu(null);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
        setShowNotificationMenu(false);
      }
    };

    const handleWindowResize = () => {
      setActiveMenu(null);
    };

    const handleWindowScroll = (e) => {
      if (e.target && e.target.closest && e.target.closest("[data-esignature-dropdown]")) {
        return;
      }
      setActiveMenu(null);
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("scroll", handleWindowScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("scroll", handleWindowScroll, true);
    };
  }, []);

  // Toggle floating action dropdown menu with smart upward/downward auto-positioning
  const handleToggleMenu = (e, doc) => {
    e.stopPropagation();
    const docId = doc._id || doc.id;
    if (activeMenu && (activeMenu.doc._id || activeMenu.doc.id) === docId) {
      setActiveMenu(null);
      return;
    }

    const trigger = e.currentTarget;
    const rect = trigger.getBoundingClientRect();
    const menuWidth = 196;
    const menuHeight = 250;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

    let top = openUpwards ? rect.top - menuHeight - 6 : rect.bottom + 6;
    let left = rect.right - menuWidth;

    if (left < 12) left = 12;
    if (left + menuWidth > window.innerWidth - 12) {
      left = window.innerWidth - menuWidth - 12;
    }
    if (top < 10) top = 10;

    setActiveMenu({
      doc,
      top,
      left,
      openUpwards,
    });
  };

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

  // Handle Move to Recycle Bin
  const handleRecycle = async (doc) => {
    setActiveMenu(null);
    try {
      fetch(apiUrl(`/documents/${doc._id || doc.id}/recycle`), {
        method: "PATCH",
      }).catch(() => {});

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
    setActiveMenu(null);
    const docId = doc._id || doc.id || "";
    const link = `${window.location.origin}/e-signatures/editor/${docId}?mode=signer`;
    navigator.clipboard.writeText(link);
    toast.success("Document signing link copied to clipboard!", { icon: "📋" });
  };

  // Handle Download
  const handleDownload = (doc) => {
    setActiveMenu(null);
    const docId = doc._id || doc.id;
    if (doc.placedFields?.length > 0 || doc.isSigned || docId) {
      toast.success(`Preparing "${doc.name}" with all signatures...`, { icon: "📥" });
      navigate(`/e-signatures/editor/${docId}?autoDownload=true`, {
        state: { document: doc },
      });
      return;
    }
    if (doc.url && doc.url.startsWith("http")) {
      window.open(doc.url, "_blank");
    } else if (doc.url && doc.url.startsWith("/uploads/")) {
      window.open(apiUrl(doc.url), "_blank");
    } else {
      const element = document.createElement("a");
      const fileContent = `=== ${doc.name} ===\nStatus: ${
        doc.isSigned ? "Signed" : "Draft"
      }\nCreated: ${doc.createdOn}\nSize: ${doc.size}\nAuthor: ${
        doc.author || user?.name || "Employee"
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
    <div className="min-h-screen bg-[#f6f5f1] p-3 sm:p-5 md:p-6 lg:p-8">
      {/* Import Signature Script Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Sacramento&display=swap');
        .font-caveat { font-family: 'Caveat', cursive; }
        .font-dancing { font-family: 'Dancing Script', cursive; }
        .font-greatvibes { font-family: 'Great Vibes', cursive; }
        .font-sacramento { font-family: 'Sacramento', cursive; }
      `}</style>

      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* ====================================================
            PAGE HEADER (Employee - E signature)
        ==================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 sm:mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0b2b57] tracking-tight">
              {user?.role && user.role.toLowerCase() === "designer" ? "Designer - E signature" : "Employee - E signature"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
              {user?.role && user.role.toLowerCase() === "designer"
                ? "Manage, review design briefs, and sign digital creative documents"
                : "Manage and sign your digital documents & sprint approvals"}
            </p>
          </div>

          {/* NOTIFICATION BELL & TASK-STYLE INTERACTIVE DROPDOWN */}
          <div className="relative self-end sm:self-auto" ref={notifRef}>
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="w-10 h-10 rounded-xl bg-[#2563a9] hover:bg-[#1d528f] text-white flex items-center justify-center shadow-sm transition-all duration-200 relative cursor-pointer"
              title="E-Signature Notifications"
            >
              <Bell size={19} />
              {notifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* NOTIFICATION MENU POPUP */}
            <AnimatePresence>
              {showNotificationMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-88 md:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 text-xs overflow-hidden"
                >
                  <div className="bg-[#0b2b57] text-white px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={16} />
                      <h3 className="font-bold text-sm">Document Notifications</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearAllNotifs}
                          className="text-[10px] bg-red-500/80 hover:bg-red-600 text-white px-2 py-0.5 rounded font-semibold transition cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                      <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {notifications.length} Active
                      </span>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500 opacity-80" />
                        <p className="font-bold text-gray-700">All documents on track!</p>
                        <p className="text-xs text-gray-400 mt-0.5">No pending signatures or alerts.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={(e) => handleNotifClick(e, n)}
                          className={`p-3.5 hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer ${
                            n.type === "pending"
                              ? "bg-amber-50/40"
                              : n.type === "recycle"
                              ? "bg-rose-50/30"
                              : "bg-emerald-50/30"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                              n.type === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : n.type === "recycle"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {n.type === "pending" ? (
                              <PenLine size={16} />
                            ) : n.type === "recycle" ? (
                              <AlertCircle size={16} />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-gray-900 text-xs truncate mr-2">{n.title}</h4>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-gray-400 font-medium">{n.time}</span>
                                <button
                                  onClick={(e) => handleDismissNotif(e, n.id)}
                                  className="text-gray-400 hover:text-red-500 p-0.5 rounded hover:bg-gray-100 transition cursor-pointer"
                                  title="Dismiss Notification"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5 leading-snug break-words">{n.message}</p>

                            <div className="mt-2 flex items-center gap-2">
                              {n.type === "pending" ? (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNotifClick(e, n);
                                    }}
                                    className="px-2.5 py-1 bg-[#2563a9] hover:bg-[#1d528f] text-white rounded-lg font-bold text-[10px] transition shadow-xs cursor-pointer flex items-center gap-1"
                                  >
                                    <PenLine size={11} /> Sign Now
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNotifClick(e, n);
                                    }}
                                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-[10px] transition cursor-pointer"
                                  >
                                    Open in Editor
                                  </button>
                                </>
                              ) : n.type === "recycle" ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestore(n.document);
                                    handleDismissNotif(e, n.id);
                                  }}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] transition shadow-xs cursor-pointer flex items-center gap-1"
                                >
                                  <RotateCcw size={11} /> Restore File
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotifClick(e, n);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition shadow-xs cursor-pointer flex items-center gap-1"
                                >
                                  <Eye size={11} /> View Document
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ====================================================
            MAIN WHITE CARD CONTAINER
        ==================================================== */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-gray-100/90 p-4 sm:p-6 lg:p-8 transition-all w-full">
          {/* CARD TOP TOOLBAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4">
            {/* Left: Card Title & Count Badge */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1e293b] tracking-tight">
                {currentView === "recycle" ? "Recycle Bin" : "E-signature"}
              </h2>
              {currentView === "recycle" && (
                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
                  {recycledDocuments.length} files
                </span>
              )}
            </div>

            {/* Right: Actions Group */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto">
              {/* + Upload Document Button */}
              {currentView === "active" && (
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#1d68bd] hover:bg-[#18569c] text-white text-xs sm:text-sm font-medium rounded-xl transition shadow-xs cursor-pointer shrink-0"
                >
                  <Plus size={16} />
                  <span>Upload document</span>
                </button>
              )}

              {/* Search Input */}
              <div className="relative flex-1 min-w-[150px] sm:w-52 md:w-60">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Files..."
                  className="w-full bg-[#f1f4f9] hover:bg-[#ebf0f7] focus:bg-white text-gray-800 text-xs sm:text-sm pl-8 pr-7 py-2 rounded-xl border border-transparent focus:border-blue-400 outline-none transition placeholder:text-gray-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Recycle Bin Toggle Button */}
              <button
                type="button"
                onClick={() =>
                  setCurrentView((prev) => (prev === "active" ? "recycle" : "active"))
                }
                className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition cursor-pointer shrink-0 ${
                  currentView === "recycle"
                    ? "bg-[#0b2b57] text-white"
                    : "bg-[#edf0f5] hover:bg-[#e2e7ef] text-gray-700"
                }`}
                title="Toggle Recycle Bin"
              >
                <Trash2 size={15} />
                <span>{currentView === "recycle" ? "Active Files" : "Recycle Bin"}</span>
              </button>

              {/* Clear / Red X Button */}
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  if (currentView === "recycle") setCurrentView("active");
                }}
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer shrink-0"
                title="Clear search and filters"
              >
                <X size={18} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* META SUB-HEADER BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-3 mb-4 gap-1.5">
            <span className="font-normal text-gray-600">
              {currentView === "recycle"
                ? "Deleted files pending 30-day auto-purge"
                : "Signature files"}
            </span>
            <span className="text-gray-400 italic text-[11px] sm:text-xs">
              Files deleted to the Recycle Bin are kept for 30 days
            </span>
          </div>

          {/* ====================================================
              ACTIVE DOCUMENTS TABLE
          ==================================================== */}
          {currentView === "active" && (
            <div className="overflow-x-auto rounded-xl border border-gray-200/90 shadow-2xs">
              <table className="w-full min-w-[620px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-white">
                    <th className="py-3 px-4 sm:px-6 text-xs font-semibold text-gray-900 w-[35%]">
                      File Name
                    </th>
                    <th className="py-3 px-3 sm:px-4 text-xs font-semibold text-gray-900 text-center w-[16%]">
                      File size
                    </th>
                    <th className="py-3 px-3 sm:px-4 text-xs font-semibold text-gray-900 text-center w-[16%]">
                      Created on
                    </th>
                    <th className="py-3 px-3 sm:px-4 text-xs font-semibold text-gray-900 text-center w-[16%]">
                      modified on
                    </th>
                    <th className="py-3 px-3 sm:px-4 text-xs font-semibold text-gray-900 text-center w-[17%]">
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
                      const isMenuOpen =
                        activeMenu?.doc &&
                        (activeMenu.doc._id || activeMenu.doc.id) === (doc._id || doc.id);

                      return (
                        <tr
                          key={doc._id || doc.id}
                          className="hover:bg-gray-50/75 transition duration-150 group"
                        >
                          {/* FILE NAME */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText
                                size={18}
                                className="text-gray-400 group-hover:text-[#1d68bd] transition shrink-0"
                              />
                              <span
                                onClick={() => {
                                  navigate(`/employee/e-signatures/editor/${doc._id || doc.id}`, {
                                    state: { document: doc },
                                  });
                                }}
                                className="font-normal text-gray-800 tracking-tight truncate max-w-[180px] sm:max-w-[280px] lg:max-w-md hover:text-[#1d68bd] cursor-pointer"
                                title={doc.name}
                              >
                                {doc.name}
                              </span>
                              {doc.isSigned && (
                                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 size={11} /> Signed
                                </span>
                              )}
                            </div>
                          </td>

                          {/* FILE SIZE */}
                          <td className="py-3.5 px-3 sm:px-4 text-center text-gray-700 font-normal whitespace-nowrap">
                            {doc.size}
                          </td>

                          {/* CREATED ON */}
                          <td className="py-3.5 px-3 sm:px-4 text-center text-gray-700 font-normal whitespace-nowrap">
                            {doc.createdOn}
                          </td>

                          {/* MODIFIED ON */}
                          <td className="py-3.5 px-3 sm:px-4 text-center text-gray-700 font-normal whitespace-nowrap">
                            {doc.modifiedOn}
                          </td>

                          {/* ACTION */}
                          <td className="py-3.5 px-3 sm:px-4 text-center">
                            <div className="inline-flex items-center justify-center gap-2">
                              {/* 3 DOTS MENU TRIGGER */}
                              <button
                                type="button"
                                data-esignature-trigger="true"
                                onClick={(e) => handleToggleMenu(e, doc)}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  isMenuOpen
                                    ? "bg-blue-100 text-[#1d68bd]"
                                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                }`}
                                title="More options"
                                aria-label="More options"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {/* SIGN BUTTON */}
                              <button
                                type="button"
                                onClick={() => setSignModalDoc(doc)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#2563a9] text-[#2563a9] hover:bg-[#2563a9] hover:text-white transition duration-150 text-xs font-semibold cursor-pointer shadow-2xs whitespace-nowrap"
                                title="Sign this document"
                              >
                                <PenLine size={13} />
                                <span>Sign</span>
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

              <div className="overflow-x-auto rounded-xl border border-gray-200/90 shadow-2xs">
                <table className="w-full min-w-[600px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-white">
                      <th className="py-3 px-4 sm:px-6 text-xs font-semibold text-gray-900 w-[38%]">
                        File Name
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-900 text-center w-[18%]">
                        File size
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-900 text-center w-[22%]">
                        Retention Days Left
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-900 text-center w-[22%]">
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
      </div>

      {/* ====================================================
          INTERACTIVE SIGNATURE STUDIO MODAL
      ==================================================== */}
      <AnimatePresence>
        {signModalDoc && (
          <SignatureStudioModal
            document={signModalDoc}
            onClose={() => setSignModalDoc(null)}
            onSigned={async (signedDoc, sigData) => {
              const docId = signedDoc._id || signedDoc.id;
              try {
                await fetch(apiUrl(`/documents/${docId}/sign`), {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    signedBy: sigData?.text || user?.name || user?.displayName || user?.email || "Employee",
                    signatureData: sigData,
                  }),
                });
              } catch (err) {
                console.warn("Could not persist signature to server:", err);
              }

              setDocuments((prev) =>
                prev.map((d) =>
                  (d._id || d.id) === docId
                    ? { ...d, isSigned: true, status: "completed", modifiedOn: "Just now" }
                    : d
                )
              );
              setSignModalDoc(null);
              toast.success(
                <span>
                  <b>{signedDoc.name}</b> successfully signed & saved!
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
            currentUser={user}
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
          SEND FOR SIGNING MODAL (EMAIL DISPATCH)
      ==================================================== */}
      <AnimatePresence>
        {sendSigningDoc && (
          <SendDocumentModal
            document={sendSigningDoc}
            onClose={() => setSendSigningDoc(null)}
            onAssigned={(payload) => {
              setSendSigningDoc(null);
              toast.success(
                <span>
                  Document invitation sent to <b>{payload.email}</b>!
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

      {/* ====================================================
          PORTAL FLOATING ACTION DROPDOWN
      ==================================================== */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {activeMenu && (
              <motion.div
                key={`emp-portal-menu-${activeMenu.doc._id || activeMenu.doc.id}`}
                data-esignature-dropdown="true"
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: activeMenu.openUpwards ? 6 : -6,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: activeMenu.openUpwards ? 6 : -6,
                }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  top: `${activeMenu.top}px`,
                  left: `${activeMenu.left}px`,
                  width: "196px",
                  zIndex: 99999,
                }}
                className="bg-white rounded-2xl shadow-2xl border border-gray-200/90 py-1.5 text-left divide-y divide-gray-100 select-none pointer-events-auto"
              >
                <div className="py-1">
                  {/* OPEN IN EDITOR */}
                  <button
                    type="button"
                    onClick={() => {
                      const doc = activeMenu.doc;
                      setActiveMenu(null);
                      navigate(`/employee/e-signatures/editor/${doc._id || doc.id}`, {
                        state: { document: doc },
                      });
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50/80 hover:text-[#1d68bd] flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <Eye size={14} className="text-gray-400 shrink-0" />
                    <span>Open in Editor</span>
                  </button>

                  {/* PREVIEW */}
                  <button
                    type="button"
                    onClick={() => {
                      const doc = activeMenu.doc;
                      setActiveMenu(null);
                      setPreviewModalDoc(doc);
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50/80 hover:text-[#1d68bd] flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <FileText size={14} className="text-gray-400 shrink-0" />
                    <span>Preview Document</span>
                  </button>

                  {/* SIGN */}
                  <button
                    type="button"
                    onClick={() => {
                      const doc = activeMenu.doc;
                      setActiveMenu(null);
                      setSignModalDoc(doc);
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50/80 hover:text-[#1d68bd] flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <PenLine size={14} className="text-[#1d68bd] shrink-0" />
                    <span>Sign document</span>
                  </button>

                  {/* DOWNLOAD */}
                  <button
                    type="button"
                    onClick={() => {
                      const doc = activeMenu.doc;
                      setActiveMenu(null);
                      handleDownload(doc);
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50/80 hover:text-[#1d68bd] flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <Download size={14} className="text-gray-400 shrink-0" />
                    <span>Download</span>
                  </button>

                  {/* COPY LINK */}
                  <button
                    type="button"
                    onClick={() => {
                      const doc = activeMenu.doc;
                      setActiveMenu(null);
                      handleCopyLink(doc);
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50/80 hover:text-[#1d68bd] flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <Copy size={14} className="text-gray-400 shrink-0" />
                    <span>Copy link</span>
                  </button>

                  {/* SEND FOR SIGNING */}
                  <button
                    type="button"
                    onClick={() => {
                      const doc = activeMenu.doc;
                      setActiveMenu(null);
                      setSendSigningDoc(doc);
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50/80 hover:text-[#1d68bd] flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <Send size={14} className="text-gray-400 shrink-0" />
                    <span>send for signing</span>
                  </button>

                  {/* RENAME */}
                  <button
                    type="button"
                    onClick={() => {
                      const doc = activeMenu.doc;
                      setActiveMenu(null);
                      setRenameModalDoc(doc);
                      setRenameValue(doc.name);
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50/80 hover:text-[#1d68bd] flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <Edit3 size={14} className="text-gray-400 shrink-0" />
                    <span>Rename</span>
                  </button>
                </div>

                <div className="py-1">
                  {/* DELETE */}
                  <button
                    type="button"
                    onClick={() => {
                      const doc = activeMenu.doc;
                      setActiveMenu(null);
                      handleRecycle(doc);
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <Trash2 size={14} className="text-red-500 shrink-0" />
                    <span>Delete</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

// ============================================================================
// UPLOAD DOCUMENT MODAL (Employee side)
// ============================================================================
function UploadDocumentModal({ currentUser, onClose, onUploaded }) {
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
    const authorName = currentUser?.name || currentUser?.displayName || currentUser?.email || "Employee";
    const authorId = currentUser?._id || currentUser?.id || "";

    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", docName.trim());
        formData.append("author", authorName);
        if (authorId) formData.append("authorId", authorId);

        const res = await fetch(apiUrl("/documents"), {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const uploadedDoc = {
              id: json.data._id || json.data.id,
              _id: json.data._id || json.data.id,
              name: json.data.name,
              size: json.data.size || `${(file.size / 1024).toFixed(2)} Kb`,
              createdOn: "Just now",
              modifiedOn: "Today",
              isSigned: false,
              author: authorName,
              url: json.data.url,
              fileUrl: json.data.url,
              type: json.data.type,
              extension: json.data.extension,
            };
            try {
              localStorage.setItem(`pearls_doc_${uploadedDoc._id}`, JSON.stringify(uploadedDoc));
            } catch (_) {}
            onUploaded(uploadedDoc);
            return;
          }
        }
      }

      // JSON creation
      const ext = docName.includes(".") ? docName.split(".").pop().toLowerCase() : "doc";
      const res = await fetch(apiUrl("/documents"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: docName.trim(),
          type: ext,
          extension: ext,
          author: authorName,
          authorId: authorId,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const uploadedDoc = {
            id: json.data._id || json.data.id,
            _id: json.data._id || json.data.id,
            name: json.data.name,
            size: json.data.size || "18.50 Kb",
            createdOn: "Just now",
            modifiedOn: "Today",
            isSigned: false,
            author: authorName,
            type: ext,
            extension: ext,
            url: json.data.url || "",
            fileUrl: json.data.url || "",
          };
          try {
            localStorage.setItem(`pearls_doc_${uploadedDoc._id}`, JSON.stringify(uploadedDoc));
          } catch (_) {}
          onUploaded(uploadedDoc);
          return;
        }
      }

      // Fallback local creation
      const localUrl = file ? URL.createObjectURL(file) : "";
      const newDoc = {
        id: `doc-${Date.now()}`,
        _id: `doc-${Date.now()}`,
        name: docName.trim(),
        size: file ? `${(file.size / 1024).toFixed(2)} Kb` : "18.50 Kb",
        createdOn: "Just now",
        modifiedOn: "Today",
        isSigned: false,
        author: authorName,
        extension: ext,
        type: ext,
        url: localUrl,
        fileUrl: localUrl,
      };
      try {
        localStorage.setItem(`pearls_doc_${newDoc._id}`, JSON.stringify(newDoc));
      } catch (_) {}
      onUploaded(newDoc);
    } catch {
      toast.error("Upload error, document created locally");
      const localUrl = file ? URL.createObjectURL(file) : "";
      const ext = docName.includes(".") ? docName.split(".").pop().toLowerCase() : "doc";
      const newDoc = {
        id: `doc-${Date.now()}`,
        _id: `doc-${Date.now()}`,
        name: docName.trim(),
        size: file ? `${(file.size / 1024).toFixed(2)} Kb` : "20.40 Kb",
        createdOn: "Just now",
        modifiedOn: "Today",
        isSigned: false,
        author: authorName,
        extension: ext,
        type: ext,
        url: localUrl,
        fileUrl: localUrl,
      };
      try {
        localStorage.setItem(`pearls_doc_${newDoc._id}`, JSON.stringify(newDoc));
      } catch (_) {}
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
              Supports .pdf, .png, .jpg, .doc, .docx, .xls, .ppt up to 50MB
            </p>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
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
              placeholder="e.g. project sprint report.doc"
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
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Document</span>
              )}
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
  const navigate = useNavigate();
  const docUrl = document?.url ? apiUrl(document.url) : "";
  const docExt = (
    document?.extension ||
    (document?.name?.includes(".") ? document.name.split(".").pop() : "") ||
    (document?.url?.includes(".") ? document.url.split(".").pop() : "") ||
    document?.type ||
    "doc"
  ).toLowerCase();

  const isImg = ["png", "jpg", "jpeg", "webp", "svg", "gif"].includes(docExt) ||
    Boolean(docUrl && /\.(png|jpe?g|webp|svg|gif)($|\?)/i.test(docUrl));

  const isPdf = docExt === "pdf" ||
    Boolean(docUrl && /\.pdf($|\?)/i.test(docUrl));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
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
        <div className="my-5 p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-2xl flex-1 overflow-y-auto flex flex-col justify-between">
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

            {/* PREVIEW CONTENT */}
            {isImg && docUrl ? (
              <div className="flex justify-center items-center my-3 bg-white p-2 rounded-xl border border-gray-200">
                <img
                  src={docUrl}
                  alt={document.name}
                  className="max-h-72 object-contain rounded-lg"
                />
              </div>
            ) : isPdf && docUrl ? (
              <div className="my-3 rounded-xl overflow-hidden border border-gray-200 bg-white">
                <iframe
                  src={`${docUrl}#toolbar=0`}
                  title={document.name}
                  className="w-full h-72 border-0"
                />
              </div>
            ) : (
              <div className="p-4 bg-white rounded-xl border border-gray-200 my-2">
                <h4 className="text-base font-bold text-gray-800 mb-1">
                  {document.name}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  Electronic signature document managed by Pearls CRM. Prepared by{" "}
                  <strong>{document.author || "Employee"}</strong>.
                </p>
                {docUrl && (
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    View / Download Uploaded File
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-gray-300 pt-4 mt-4 flex items-center justify-between text-xs text-gray-500">
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

        <div className="flex items-center justify-between pt-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            Close Preview
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                navigate(`/employee/e-signatures/editor/${document._id || document.id}`, {
                  state: { document },
                });
              }}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
            >
              Open in Editor
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
        </div>
      </motion.div>
    </div>
  );
}
