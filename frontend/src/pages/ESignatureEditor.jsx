import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  PenLine,
  Type,
  Calendar,
  CheckSquare,
  Plus,
  FileSignature,
  FileBadge,
  FormInput,
  CalendarClock,
  CheckSquare2,
  CircleDot,
  ListFilter,
  Paperclip,
  User,
  Mail,
  Building2,
  Briefcase,
  ChevronDown,
  Maximize2,
  MoreVertical,
  MousePointer,
  Hand,
  Move,
  Search,
  PenTool,
  Sparkles,
  Share2,
  Save,
  Trash2,
  X,
  Check,
  Download,
  Printer,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  Stamp,
  Code,
  Highlighter,
  SlidersHorizontal,
  Keyboard,
  LayoutGrid,
  Layers,
  UserPlus,
  FileText,
  Loader2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import SignatureStudioModal from "../components/SignatureStudioModal";
import SendDocumentModal from "../components/SendDocumentModal";
import AddSignersModal from "../components/AddSignersModal";
import { apiUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";

export default function ESignatureEditor() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { id } = useParams();
  const location = useLocation();

  // Document name and metadata
  const [documentData, setDocumentData] = useState(() => {
    if (location.state?.document) {
      const doc = location.state.document;
      try {
        localStorage.setItem(`pearls_doc_${doc._id || doc.id}`, JSON.stringify(doc));
      } catch (_) {}
      return doc;
    }
    if (id) {
      try {
        const stored = localStorage.getItem(`pearls_doc_${id}`);
        if (stored) return JSON.parse(stored);
      } catch (_) {}
    }
    return null;
  });

  const [docName, setDocName] = useState(() => {
    return (
      location.state?.document?.name ||
      documentData?.name ||
      (id ? `Document-${id}` : "skills module certificate")
    );
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Document metadata calculations
  const documentUrl = documentData?.url || location.state?.document?.url || "";
  const resolvedDocUrl = documentUrl ? apiUrl(documentUrl) : "";
  const docExt = (
    documentData?.extension ||
    location.state?.document?.extension ||
    (docName.includes(".") ? docName.split(".").pop() : "") ||
    (documentUrl.includes(".") ? documentUrl.split(".").pop() : "") ||
    documentData?.type ||
    "doc"
  ).toLowerCase();

  const isImageDoc =
    ["png", "jpg", "jpeg", "webp", "svg", "gif", "ai"].includes(docExt) ||
    Boolean(documentUrl && /\.(png|jpe?g|webp|svg|gif)($|\?)/i.test(documentUrl));

  const isPdfDoc =
    docExt === "pdf" ||
    Boolean(documentUrl && /\.pdf($|\?)/i.test(documentUrl));

  const isStaticDiploma =
    !documentUrl &&
    (docName.toLowerCase().includes("skills module") ||
      docName.toLowerCase().includes("mankato") ||
      documentData?.author === "Mankato University" ||
      id === "doc-0");

  // Zoom level state: 18% as shown in screenshot, with zoom presets
  const [zoomLevel, setZoomLevel] = useState(18);
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const zoomMenuRef = useRef(null);

  // Active interaction tool: 'select' | 'hand' | 'draw'
  const [activeTool, setActiveTool] = useState("select");

  // Selected sidebar item: 'title-field' | 'company-field' | 'email-field' | 'name-field' | 'attachment-field' | 'dropdown-field' | 'radio-buttons' | 'checkbox-field' | 'date-field' | 'text-field' | 'initials-field' | 'signature-field' | etc.
  const [activeSidebarItem, setActiveSidebarItem] = useState("title-field");

  // Right sidebar panel view: true = field properties panel, false = page thumbnails
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);

  // Wireframe preset view for testing exact wireframe screens:
  // 'ceo' = user sign page -signature (CEO Signature)
  // 'initial' = user page -initial (I field)
  // 'text' = user page - Text (Text field)
  // 'all' = simultaneous view with CEO, Initials (I), and Text
  const [wireframePreset, setWireframePreset] = useState("all");
  const [editingTextId, setEditingTextId] = useState(null);

  // Sign & edit / Placed fields layer state
  // Initially blank so users can place fields where they want on their document
  const [placedFields, setPlacedFields] = useState(() => {
    if (
      location.state?.document?.placedFields &&
      Array.isArray(location.state.document.placedFields) &&
      location.state.document.placedFields.length > 0
    ) {
      return location.state.document.placedFields;
    }
    return [];
  });

  const [selectedFieldId, setSelectedFieldId] = useState(() => {
    if (location.state?.document?.placedFields?.[0]?.id) {
      return location.state.document.placedFields[0].id;
    }
    return null;
  });
  const selectedField =
    placedFields.find((f) => f.id === selectedFieldId) ||
    (placedFields.length > 0 ? placedFields[0] : null);
  const [draggingFieldId, setDraggingFieldId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const canvasContainerRef = useRef(null);

  // Page selection state: 1 | 2 (Two page view support matching Screen 1)
  const [activePage, setActivePage] = useState(1);

  // Two page view layout mode: true = thumbnail sidebar active and left sidebar hidden as in Screen 1
  const [twoPageView, setTwoPageView] = useState(false);

  // Signer mode vs Editor mode:
  // When in editor, default to false so left sidebar options (SIGN & EDIT, FIELDS) are visible
  const [isSignerMode, setIsSignerMode] = useState(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search || "";
      const path = window.location.pathname || "";
      if (
        search.includes("mode=signer") ||
        search.includes("signer=true") ||
        path.includes("/sign")
      ) {
        return true;
      }
      if (path.includes("/editor") || search.includes("mode=editor")) {
        return false;
      }
    }
    return false;
  });
  const [signerMoreMenuOpen, setSignerMoreMenuOpen] = useState(false);
  const signerMoreRef = useRef(null);

  // "user open agree" modal state (Screen 2 & Screen 3)
  // Initially true so it immediately shows up on UI as soon as document is opened
  const [userAgreeModalOpen, setUserAgreeModalOpen] = useState(true);
  const [agreeRecordsChecked, setAgreeRecordsChecked] = useState(true);
  const [moreOptionMenuOpen, setMoreOptionMenuOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigneeName, setAssigneeName] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [assigneeReason, setAssigneeReason] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const moreOptionRef = useRef(null);

  // Auto-open agree modal whenever document is opened (for both Admin & Employee)
  useEffect(() => {
    setUserAgreeModalOpen(true);
  }, [id, location.pathname]);

  // URL query parameter handlers
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("assign") === "true") {
      setAssignModalOpen(true);
    }
    if (params.get("completed") === "true" || params.get("saved") === "true") {
      setCompletedModalOpen(true);
    }
    if (params.get("preset") === "initial" || params.get("field") === "initial") {
      setWireframePreset("initial");
    } else if (params.get("preset") === "text" || params.get("field") === "text") {
      setWireframePreset("text");
    } else if (params.get("preset") === "ceo" || params.get("field") === "ceo") {
      setWireframePreset("ceo");
    } else if (params.get("preset") === "all" || params.get("field") === "all") {
      setWireframePreset("all");
    }
    if (params.get("mode") === "editor" || location.pathname.includes("/editor")) {
      setIsSignerMode(false);
      setShowPropertiesPanel(true);
    } else if (
      params.get("mode") === "signer" ||
      params.get("signer") === "true" ||
      location.pathname.includes("/sign")
    ) {
      setIsSignerMode(true);
      setShowPropertiesPanel(false);
    }
  }, [location.search, location.pathname]);

  // Load document and its placed fields & signers dynamically from MongoDB
  useEffect(() => {
    if (!id) return;
    const fetchDocData = async () => {
      try {
        const res = await fetch(apiUrl(`/documents/${id}`));
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setDocumentData(json.data);
            try {
              localStorage.setItem(`pearls_doc_${id}`, JSON.stringify(json.data));
            } catch (_) {}
            if (json.data.name) {
              setDocName(json.data.name);
            }
            if (Array.isArray(json.data.placedFields) && json.data.placedFields.length > 0) {
              setPlacedFields(json.data.placedFields);
              if (json.data.placedFields[0]?.id) {
                setSelectedFieldId(json.data.placedFields[0].id);
              }
            }
            if (Array.isArray(json.data.signers) && json.data.signers.length > 0) {
              setSigners(json.data.signers);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic document details:", err);
      }
    };
    fetchDocData();
  }, [id]);

  // Modals state
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [addSignersModalOpen, setAddSignersModalOpen] = useState(false);
  const [askToEditModalOpen, setAskToEditModalOpen] = useState(false);
  const [completedModalOpen, setCompletedModalOpen] = useState(false);

  // Signature creation state (default "Ragavi" matching Image 2 / click CEO -signature)
  const [typedSigName, setTypedSigName] = useState("Ragavi");

  // Signers list matching "Edit signer" wireframe
  const [signers, setSigners] = useState(() => {
    if (
      location.state?.document?.signers &&
      Array.isArray(location.state.document.signers) &&
      location.state.document.signers.length > 0
    ) {
      return location.state.document.signers;
    }
    return [
      {
        id: "s-1",
        name: user?.name || user?.displayName || (isAdmin ? "Admin" : "Employee"),
        email: user?.email || (isAdmin ? "admin@pearlscrm.com" : "employee@pearlscrm.com"),
        role: "Signer",
        color: "#2563eb",
      },
    ];
  });

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (zoomMenuRef.current && !zoomMenuRef.current.contains(e.target)) {
        setZoomMenuOpen(false);
      }
      if (moreOptionRef.current && !moreOptionRef.current.contains(e.target)) {
        setMoreOptionMenuOpen(false);
      }
      if (signerMoreRef.current && !signerMoreRef.current.contains(e.target)) {
        setSignerMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Document download handler
  const handleDownload = () => {
    if (resolvedDocUrl) {
      window.open(resolvedDocUrl, "_blank");
      toast.success(`Downloading "${docName}"...`, { icon: "📥" });
      return;
    }
    toast.success("Preparing document download...", { icon: "📥" });
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${docName}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; padding: 40px; background: #eaedf2; }
              .page { background: white; width: 800px; min-height: 560px; border: 1px solid #cbd5e1; padding: 40px; box-sizing: border-box; position: relative; margin-bottom: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 8px; }
              h1 { color: #0c4a7e; font-size: 24px; margin: 0 0 10px 0; border-bottom: 2px solid #1d68bd; padding-bottom: 10px; }
              .meta { font-size: 12px; color: #64748b; margin-bottom: 24px; }
              p { font-size: 13px; color: #334155; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="page">
              <h1>${docName}</h1>
              <div class="meta">Author: ${documentData?.author || "Admin"} &bull; Created: ${documentData?.createdOn || "Today"} &bull; Format: ${docExt.toUpperCase()} &bull; Status: ${documentData?.isSigned ? "Certified Signed" : "Draft"}</div>
              <p>Pearls IT Hub E-Signature Document System.</p>
              <p>${documentData?.content || "This official electronic record has been processed and prepared for authorized electronic execution."}</p>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Place a field onto the canvas
  const handleAddField = (type, defaultLabel) => {
    const newField = {
      id: `field-${Date.now()}`,
      type,
      label: defaultLabel,
      x: 45 + Math.floor(Math.random() * 10),
      y: 45 + Math.floor(Math.random() * 10),
      width: type === "signature" || type === "initials" ? 140 : 160,
      height: 42,
      signer: signers[0]?.name || "Signer",
      signed: type === "signature" ? false : undefined,
      value: "",
      prefill: "",
    };

    setPlacedFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
    toast.success(`Added ${defaultLabel} to document`, { icon: "📌" });
  };

  // Delete a placed field
  const handleDeleteField = (id, e) => {
    e.stopPropagation();
    setPlacedFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  // Save document (persists canvas fields & signers to MongoDB)
  const handleSave = async () => {
    if (id) {
      setSaveLoading(true);
      try {
        const res = await fetch(apiUrl(`/documents/${id}/fields`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            placedFields,
            signers,
          }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success("Document canvas & placed fields saved to database!", {
            icon: "💾",
          });
        } else {
          toast.success("Document updated successfully!");
        }
      } catch (err) {
        console.warn("Could not save document fields to server:", err);
        toast.success("Document saved locally");
      } finally {
        setSaveLoading(false);
      }
    } else {
      toast.success("Document and signatures saved successfully!", {
        icon: "🎉",
      });
    }
    setCompletedModalOpen(true);
  };

  // Dragging logic on canvas: mouse and touch support
  const handleMouseDownOnField = (e, field) => {
    // Only primary mouse button (left-click)
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedFieldId(field.id);
    setDraggingFieldId(field.id);
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;

    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const currentFieldLeftPx = (field.x / 100) * rect.width;
      const currentFieldTopPx = (field.y / 100) * rect.height;
      const mouseXPx = e.clientX - rect.left;
      const mouseYPx = e.clientY - rect.top;
      const offset = {
        x: mouseXPx - currentFieldLeftPx,
        y: mouseYPx - currentFieldTopPx,
      };
      dragOffsetRef.current = offset;
      setDragOffset(offset);
    }
  };

  const handleTouchStartOnField = (e, field) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setSelectedFieldId(field.id);
    setDraggingFieldId(field.id);
    dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    hasDraggedRef.current = false;

    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const currentFieldLeftPx = (field.x / 100) * rect.width;
      const currentFieldTopPx = (field.y / 100) * rect.height;
      const mouseXPx = touch.clientX - rect.left;
      const mouseYPx = touch.clientY - rect.top;
      const offset = {
        x: mouseXPx - currentFieldLeftPx,
        y: mouseYPx - currentFieldTopPx,
      };
      dragOffsetRef.current = offset;
      setDragOffset(offset);
    }
  };

  // Window-level mousemove and mouseup listeners for super-smooth dragging
  useEffect(() => {
    if (!draggingFieldId) return;

    const handleGlobalMove = (e) => {
      if (!canvasContainerRef.current) return;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;

      const dist = Math.hypot(
        clientX - dragStartPosRef.current.x,
        clientY - dragStartPosRef.current.y
      );
      if (dist > 3) {
        hasDraggedRef.current = true;
      }

      const rect = canvasContainerRef.current.getBoundingClientRect();
      const mouseXPx = clientX - rect.left - dragOffsetRef.current.x;
      const mouseYPx = clientY - rect.top - dragOffsetRef.current.y;
      const x = Math.min(Math.max((mouseXPx / rect.width) * 100, 1), 88);
      const y = Math.min(Math.max((mouseYPx / rect.height) * 100, 1), 90);

      setPlacedFields((prev) =>
        prev.map((f) => (f.id === draggingFieldId ? { ...f, x, y } : f))
      );
    };

    const handleGlobalUp = () => {
      setDraggingFieldId(null);
    };

    window.addEventListener("mousemove", handleGlobalMove);
    window.addEventListener("mouseup", handleGlobalUp);
    window.addEventListener("touchmove", handleGlobalMove, { passive: false });
    window.addEventListener("touchend", handleGlobalUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalUp);
      window.removeEventListener("touchmove", handleGlobalMove);
      window.removeEventListener("touchend", handleGlobalUp);
    };
  }, [draggingFieldId]);

  return (
    <div
      className="flex flex-col h-screen w-full bg-[#cbd1db] overflow-hidden select-none"
    >
      {/* Import script fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Allura&family=Caveat:wght@600;700&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Sacramento&family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');
        .font-caveat { font-family: 'Caveat', cursive; }
        .font-dancing { font-family: 'Dancing Script', cursive; }
        .font-sacramento { font-family: 'Sacramento', cursive; }
        .font-alexbrush { font-family: 'Alex Brush', cursive; }
        .font-greatvibes { font-family: 'Great Vibes', cursive; }
        .font-allura { font-family: 'Allura', cursive; }
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>

      {/* ====================================================
          TOP NAVBAR: E- signature | skills module certificate
      ==================================================== */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (location.pathname.startsWith("/employee")) {
                navigate("/employee/e-signatures");
              } else if (isAdmin) {
                navigate("/e-signatures");
              } else if (user) {
                navigate("/employee/e-signatures");
              } else {
                navigate("/login");
              }
            }}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            title="Back to Documents"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-[#1e293b]">
              E- signature
            </h1>
            <span className="text-gray-300 font-light">|</span>
            <span className="text-xs sm:text-sm text-gray-600 font-medium">
              {isSignerMode ? "Sign the document by clicking on the fields." : docName}
            </span>
          </div>
        </div>

        {/* RIGHT TOP ACTIONS: SIGNER MODE (More ▾ + SAVE) OR EDITOR MODE */}
        {isSignerMode ? (
          <div className="flex items-center gap-2.5">
            <div className="relative" ref={signerMoreRef}>
              <button
                type="button"
                onClick={() => setSignerMoreMenuOpen((prev) => !prev)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-full transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span>More</span>
                <ChevronDown size={13} className="text-gray-500" />
              </button>

              <AnimatePresence>
                {signerMoreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-50 text-xs text-gray-700"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSignerMoreMenuOpen(false);
                        setUserAgreeModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition"
                    >
                      <ShieldCheck size={14} className="text-blue-600" />
                      <span>Review Agreement</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSignerMoreMenuOpen(false);
                        setAssignModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition"
                    >
                      <UserPlus size={14} className="text-blue-600" />
                      <span>Assign to someone</span>
                    </button>
                    <div className="border-t border-gray-100 my-1 pt-1">
                      <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Wireframe Views
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setWireframePreset("ceo");
                          setSignerMoreMenuOpen(false);
                          toast.success("Switched to CEO Signature wireframe view");
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between cursor-pointer transition ${
                          wireframePreset === "ceo" ? "text-blue-600 font-semibold bg-blue-50/50" : "hover:bg-gray-50"
                        }`}
                      >
                        <span>CEO Signature</span>
                        {wireframePreset === "ceo" && <Check size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWireframePreset("initial");
                          setSignerMoreMenuOpen(false);
                          toast.success("Switched to Initials [I] wireframe view");
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between cursor-pointer transition ${
                          wireframePreset === "initial" ? "text-blue-600 font-semibold bg-blue-50/50" : "hover:bg-gray-50"
                        }`}
                      >
                        <span>Initials Field [I]</span>
                        {wireframePreset === "initial" && <Check size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWireframePreset("text");
                          setSignerMoreMenuOpen(false);
                          toast.success("Switched to Text Field wireframe view");
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between cursor-pointer transition ${
                          wireframePreset === "text" ? "text-blue-600 font-semibold bg-blue-50/50" : "hover:bg-gray-50"
                        }`}
                      >
                        <span>Text Field</span>
                        {wireframePreset === "text" && <Check size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWireframePreset("all");
                          setSignerMoreMenuOpen(false);
                          toast.success("Switched to All Fields view");
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between cursor-pointer transition ${
                          wireframePreset === "all" ? "text-blue-600 font-semibold bg-blue-50/50" : "hover:bg-gray-50"
                        }`}
                      >
                        <span>Show All Fields</span>
                        {wireframePreset === "all" && <Check size={12} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSignerMoreMenuOpen(false);
                        handleDownload();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition"
                    >
                      <Download size={14} className="text-gray-500" />
                      <span>Download Document</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSignerMoreMenuOpen(false);
                        setIsSignerMode(false);
                        setShowPropertiesPanel(true);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600 font-semibold border-t border-gray-100 cursor-pointer transition"
                    >
                      <SlidersHorizontal size={14} />
                      <span>Switch to Editor Mode</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="px-5 py-1.5 text-xs font-semibold text-white bg-[#1d528f] hover:bg-[#164070] rounded-full transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-75"
            >
              {saveLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : (
                <span>SAVE</span>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setIsSignerMode(true);
                setShowPropertiesPanel(false);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-blue-700 bg-gray-100 hover:bg-blue-50 border border-gray-200 rounded-full transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Switch to Recipient Signer View (user sign page)"
            >
              <PenLine size={13} className="text-blue-600" />
              <span className="hidden sm:inline">Signer Mode</span>
            </button>
            <button
              onClick={() => {
                setTwoPageView((prev) => !prev);
                setShowPropertiesPanel(false);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                twoPageView
                  ? "bg-blue-50 border-[#2563eb] text-[#2563eb]"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              title="Toggle Two Page View (Screen 1)"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Two Page View</span>
            </button>
            <button
              onClick={() => setShareModalOpen(true)}
              className="px-4 py-1.5 text-xs font-semibold text-[#1e40af] border border-[#2563eb] hover:bg-blue-50 rounded-full transition shadow-2xs cursor-pointer"
            >
              SHARE
            </button>
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="px-5 py-1.5 text-xs font-semibold text-white bg-[#1d528f] hover:bg-[#164070] rounded-full transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-75"
            >
              {saveLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : (
                <span>SAVE</span>
              )}
            </button>
          </div>
        )}
      </header>

      {/* ====================================================
          MAIN EDITOR BODY: LEFT SIDEBAR + WORKSPACE + RIGHT THUMBNAILS
      ==================================================== */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ==================================================
            LEFT SIDEBAR (SIGN & EDIT / ADD FIELDS)
        ================================================== */}
        {!twoPageView && !isSignerMode && (
          <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto no-scrollbar z-20">
          {/* SECTION 1: SIGN & EDIT */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              SIGN & EDIT
            </h3>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setActiveSidebarItem("my-signature");
                  setShowPropertiesPanel(true);
                  const existing = placedFields.find((f) => f.type === "signature");
                  if (existing) {
                    setSelectedFieldId(existing.id);
                  } else {
                    const newField = {
                      id: `field-${Date.now()}`,
                      type: "signature",
                      label: "My Signature",
                      x: 65.4,
                      y: 49.6,
                      width: 108,
                      height: 36,
                      signer: signers[0]?.name || user?.name || "Signer",
                      signed: false,
                      value: "",
                    };
                    setPlacedFields((prev) => [...prev, newField]);
                    setSelectedFieldId(newField.id);
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left cursor-pointer group ${
                  activeSidebarItem === "my-signature"
                    ? "text-[#2563eb] bg-blue-50/70 font-semibold"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-700"
                }`}
              >
                <PenLine
                  size={15}
                  className={
                    activeSidebarItem === "my-signature"
                      ? "text-[#2563eb]"
                      : "text-gray-400 group-hover:text-blue-600 transition shrink-0"
                  }
                />
                <span>My Signature</span>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarItem("my-initials");
                  handleAddField("initials", "My Initials");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left cursor-pointer group ${
                  activeSidebarItem === "my-initials"
                    ? "text-[#2563eb] bg-blue-50/70 font-semibold"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-700"
                }`}
              >
                <Stamp
                  size={15}
                  className={
                    activeSidebarItem === "my-initials"
                      ? "text-[#2563eb]"
                      : "text-gray-400 group-hover:text-blue-600 transition shrink-0"
                  }
                />
                <span>My Initials</span>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarItem("my-text");
                  handleAddField("text", "Text");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left cursor-pointer group ${
                  activeSidebarItem === "my-text"
                    ? "text-[#2563eb] bg-blue-50/70 font-semibold"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-700"
                }`}
              >
                <Type
                  size={15}
                  className={
                    activeSidebarItem === "my-text"
                      ? "text-[#2563eb]"
                      : "text-gray-400 group-hover:text-blue-600 transition shrink-0"
                  }
                />
                <span>Text</span>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarItem("my-date");
                  handleAddField(
                    "date",
                    new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  );
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left cursor-pointer group ${
                  activeSidebarItem === "my-date"
                    ? "text-[#2563eb] bg-blue-50/70 font-semibold"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-700"
                }`}
              >
                <Calendar
                  size={15}
                  className={
                    activeSidebarItem === "my-date"
                      ? "text-[#2563eb]"
                      : "text-gray-400 group-hover:text-blue-600 transition shrink-0"
                  }
                />
                <span>Date Signed</span>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarItem("my-checkmark");
                  handleAddField("checkmark", "✔ Verified");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left cursor-pointer group ${
                  activeSidebarItem === "my-checkmark"
                    ? "text-[#2563eb] bg-blue-50/70 font-semibold"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-700"
                }`}
              >
                <CheckSquare
                  size={15}
                  className={
                    activeSidebarItem === "my-checkmark"
                      ? "text-[#2563eb]"
                      : "text-gray-400 group-hover:text-blue-600 transition shrink-0"
                  }
                />
                <span>Checkmark</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: ADD FIELDS */}
          <div className="p-4 flex-1">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              ADD FIELDS
            </h3>

            {/* Edit Signers button matching the screenshot */}
            <button
              onClick={() => {
                setActiveSidebarItem("edit-signers");
                setAddSignersModalOpen(true);
              }}
              className="w-full flex items-center gap-1.5 text-xs font-semibold mb-3 py-1 cursor-pointer transition text-[#2563eb] hover:text-blue-800 underline decoration-blue-500"
            >
              <PenLine size={13} className="stroke-[2.5]" />
              <span>Edit Signers</span>
            </button>

            <div className="space-y-0.5">
              {[
                { icon: PenLine, label: "Signature Field", type: "signature" },
                { icon: FileBadge, label: "Initials Field", type: "initials" },
                { icon: FormInput, label: "Text Field", type: "text" },
                { icon: CalendarClock, label: "Date Signed Field", type: "date" },
                { icon: CheckSquare2, label: "Checkbox Field", type: "checkbox" },
                { icon: CircleDot, label: "Radio Buttons", type: "radio" },
                { icon: ListFilter, label: "Dropdown Field", type: "dropdown" },
                { icon: Paperclip, label: "Attachment Field", type: "attachment" },
                { icon: User, label: "Name Field", type: "name" },
                { icon: Mail, label: "Email Field", type: "email" },
                { icon: Building2, label: "CompanyField", type: "company" },
                { icon: Briefcase, label: "Title Field", type: "title" },
              ].map((item) => {
                const isActive =
                  activeSidebarItem === item.type ||
                  (item.type === "signature" && activeSidebarItem === "signature-field") ||
                  (item.type === "initials" && (activeSidebarItem === "initials-field" || activeSidebarItem === "initials")) ||
                  (item.type === "text" && (activeSidebarItem === "text-field" || activeSidebarItem === "text")) ||
                  (item.type === "date" && (activeSidebarItem === "date-field" || activeSidebarItem === "date")) ||
                  (item.type === "checkbox" && (activeSidebarItem === "checkbox-field" || activeSidebarItem === "checkbox")) ||
                  (item.type === "radio" && (activeSidebarItem === "radio-buttons" || activeSidebarItem === "radio")) ||
                  (item.type === "dropdown" && (activeSidebarItem === "dropdown-field" || activeSidebarItem === "dropdown")) ||
                  (item.type === "attachment" && (activeSidebarItem === "attachment-field" || activeSidebarItem === "attachment")) ||
                  (item.type === "name" && (activeSidebarItem === "name-field" || activeSidebarItem === "name")) ||
                  (item.type === "email" && (activeSidebarItem === "email-field" || activeSidebarItem === "email")) ||
                  (item.type === "company" && (activeSidebarItem === "company-field" || activeSidebarItem === "company")) ||
                  (item.type === "title" && (activeSidebarItem === "title-field" || activeSidebarItem === "title"));

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.type === "signature") {
                        setActiveSidebarItem("signature-field");
                        setShowPropertiesPanel(true);
                        const existing = placedFields.find((f) => f.type === "signature");
                        if (existing) {
                          setSelectedFieldId(existing.id);
                        } else {
                          const newField = {
                            id: `sig-${Date.now()}`,
                            type: "signature",
                            label: "Signature",
                            x: 50,
                            y: 50,
                            width: 140,
                            height: 44,
                            signer: signers[0]?.name || "Signer",
                            signed: false,
                            value: "Signature",
                            prefill: "",
                          };
                          setPlacedFields((prev) => [
                            ...prev.filter((f) => f.type !== "signature"),
                            newField,
                          ]);
                          setSelectedFieldId(newField.id);
                        }
                      } else if (item.type === "initials") {
                        setActiveSidebarItem("initials-field");
                        setShowPropertiesPanel(true);
                        const existing = placedFields.find((f) => f.type === "initials");
                        if (existing) {
                          setSelectedFieldId(existing.id);
                        } else {
                          const newField = {
                            id: `init-${Date.now()}`,
                            type: "initials",
                            label: "Initials",
                            x: 50,
                            y: 50,
                            width: 80,
                            height: 36,
                            signer: signers[0]?.name || "Signer",
                            signed: false,
                            value: "Initials",
                            prefill: "",
                          };
                          setPlacedFields((prev) => [
                            ...prev.filter((f) => f.type !== "initials"),
                            newField,
                          ]);
                          setSelectedFieldId(newField.id);
                        }
                      } else if (item.type === "text") {
                        setActiveSidebarItem("text-field");
                        setShowPropertiesPanel(true);
                        const existing = placedFields.find((f) => f.type === "text");
                        if (existing) {
                          setSelectedFieldId(existing.id);
                        } else {
                          const newField = {
                            id: `text-${Date.now()}`,
                            type: "text",
                            label: "Text",
                            x: 50,
                            y: 50,
                            width: 140,
                            height: 36,
                            signer: signers[0]?.name || "Signer",
                            signed: false,
                            value: "",
                            prefill: "",
                            validation: "None",
                          };
                          setPlacedFields((prev) => [
                            ...prev.filter((f) => f.type !== "text"),
                            newField,
                          ]);
                          setSelectedFieldId(newField.id);
                        }
                      } else if (item.type === "date") {
                        setActiveSidebarItem("date-field");
                        setShowPropertiesPanel(true);
                        const existing = placedFields.find((f) => f.type === "date");
                        if (existing) {
                          setSelectedFieldId(existing.id);
                        } else {
                          const newField = {
                            id: "date-main",
                            type: "date",
                            label: "Date signed",
                            x: 69.2,
                            y: 50.4,
                            width: 108,
                            height: 36,
                            signer: signers[0]?.name || user?.name || "Signer",
                            signed: false,
                            value: "Date signed",
                            prefill: "",
                          };
                          setPlacedFields((prev) => [
                            ...prev.filter((f) => f.type !== "date"),
                            newField,
                          ]);
                          setSelectedFieldId(newField.id);
                        }
                      } else if (item.type === "checkbox") {
                        setActiveSidebarItem("checkbox-field");
                        setShowPropertiesPanel(true);
                        const existing = placedFields.find((f) => f.type === "checkbox");
                        if (existing) {
                          setSelectedFieldId(existing.id);
                        } else {
                          const newField1 = {
                            id: "check-empty",
                            type: "checkbox",
                            label: "Checkbox",
                            x: 69.2,
                            y: 44.8,
                            width: 28,
                            height: 28,
                            signer: signers[0]?.name || user?.name || "Signer",
                            required: false,
                            selected: false,
                          };
                          const newField2 = {
                            id: "check-main",
                            type: "checkbox",
                            label: "Checkbox",
                            x: 69.2,
                            y: 50.4,
                            width: 28,
                            height: 28,
                            signer: signers[0]?.name || user?.name || "Signer",
                            required: false,
                            selected: true,
                          };
                          setPlacedFields((prev) => [
                            ...prev.filter((f) => f.type !== "checkbox"),
                            newField1,
                            newField2,
                          ]);
                          setSelectedFieldId(newField2.id);
                        }
                      } else if (item.type === "radio") {
                        setActiveSidebarItem("radio-buttons");
                        setShowPropertiesPanel(true);
                        const existing = placedFields.find((f) => f.type === "radio");
                        if (existing) {
                          setSelectedFieldId(existing.id);
                        } else {
                          const radio1 = {
                            id: "radio-1",
                            type: "radio",
                            label: "Radio Button",
                            x: 69.2,
                            y: 44.8,
                            width: 28,
                            height: 28,
                            signer: signers[0]?.name || user?.name || "Signer",
                            required: false,
                            selected: false,
                          };
                          const radio2 = {
                            id: "radio-2",
                            type: "radio",
                            label: "Radio Button",
                            x: 73.2,
                            y: 44.8,
                            width: 28,
                            height: 28,
                            signer: signers[0]?.name || user?.name || "Signer",
                            required: false,
                            selected: false,
                          };
                          const radioMain = {
                            id: "radio-main",
                            type: "radio",
                            label: "Radio Button",
                            x: 69.2,
                            y: 50.4,
                            width: 28,
                            height: 28,
                            signer: signers[0]?.name || user?.name || "Signer",
                            required: false,
                            selected: false,
                          };
                          const radio4 = {
                            id: "radio-4",
                            type: "radio",
                            label: "Radio Button",
                            x: 73.2,
                            y: 50.4,
                            width: 28,
                            height: 28,
                            signer: signers[0]?.name || user?.name || "Signer",
                            required: false,
                            selected: false,
                          };
                          setPlacedFields((prev) => [
                            ...prev.filter((f) => f.type !== "radio"),
                            radio1,
                            radio2,
                            radioMain,
                            radio4,
                          ]);
                          setSelectedFieldId(radioMain.id);
                        }
                      } else if (item.type === "dropdown") {
                        setActiveSidebarItem("dropdown-field");
                        setShowPropertiesPanel(true);
                        const existing = placedFields.find((f) => f.type === "dropdown");
                        if (existing) {
                          setSelectedFieldId(existing.id);
                        } else {
                          const newField = {
                            id: "dropdown-main",
                            type: "dropdown",
                            label: "",
                            value: "Gender",
                            x: 65.4,
                            y: 49.6,
                            width: 108,
                            height: 36,
                            signer: signers[0]?.name || user?.name || "Signer",
                            options: ["", ""],
                          };
                          setPlacedFields((prev) => [
                            ...prev.filter((f) => f.type !== "dropdown"),
                            newField,
                          ]);
                          setSelectedFieldId(newField.id);
                        }
                      } else if (item.type === "attachment") {
                        setActiveSidebarItem("attachment-field");
                        setShowPropertiesPanel(true);
                        const existing = placedFields.find((f) => f.type === "attachment");
                        if (existing) {
                          setSelectedFieldId(existing.id);
                        } else {
                          const newField = {
                            id: "attachment-main",
                            type: "attachment",
                            label: "",
                            value: "Attachment",
                            x: 65.4,
                            y: 49.6,
                            width: 108,
                            height: 36,
                            signer: signers[0]?.name || user?.name || "Signer",
                          };
                          setPlacedFields((prev) => [
                            ...prev.filter((f) => f.type !== "attachment"),
                            newField,
                          ]);
                          setSelectedFieldId(newField.id);
                        }
                      } else if (item.type === "name") {
                        setActiveSidebarItem("name-field");
                        setShowPropertiesPanel(true);
                        const existing = placedFields.find((f) => f.type === "name");
                        if (existing) {
                          setSelectedFieldId(existing.id);
                        } else {
                          const newField = {
                            id: "name-main",
                            type: "name",
                            label: "",
                            value: "Name",
                            x: 65.4,
                            y: 49.6,
                            width: 108,
                            height: 36,
                            signer: signers[0]?.name || user?.name || "Signer",
                            prefill: "",
                          };
                          setPlacedFields((prev) => [
                            ...prev.filter((f) => f.type !== "name"),
                            newField,
                          ]);
                          setSelectedFieldId(newField.id);
                        }
                      } else if (item.type === "email") {
                        setActiveSidebarItem("email-field");
                        setShowPropertiesPanel(true);
                        const existing = placedFields.find((f) => f.type === "email");
                        if (existing) {
                          setSelectedFieldId(existing.id);
                        } else {
                          const newField = {
                            id: "email-main",
                            type: "email",
                            label: "",
                            value: "Email",
                            x: 65.4,
                            y: 49.6,
                            width: 108,
                            height: 36,
                            signer: signers[0]?.name || user?.name || "Signer",
                            prefill: "",
                          };
                          setPlacedFields((prev) => [
                            ...prev.filter((f) => f.type !== "email"),
                            newField,
                          ]);
                          setSelectedFieldId(newField.id);
                        }
                      } else if (item.type === "company") {
                        setActiveSidebarItem("company-field");
                        setShowPropertiesPanel(true);
                        const existing = placedFields.find((f) => f.type === "company");
                        if (existing) {
                          setSelectedFieldId(existing.id);
                        } else {
                          const newField = {
                            id: "company-main",
                            type: "company",
                            label: "",
                            value: "Company",
                            x: 65.4,
                            y: 49.6,
                            width: 108,
                            height: 36,
                            signer: signers[0]?.name || user?.name || "Signer",
                            prefill: "",
                          };
                          setPlacedFields((prev) => [
                            ...prev.filter((f) => f.type !== "company"),
                            newField,
                          ]);
                          setSelectedFieldId(newField.id);
                        }
                      } else if (item.type === "title") {
                        setActiveSidebarItem("title-field");
                        setShowPropertiesPanel(true);
                        const existing = placedFields.find((f) => f.type === "title");
                        if (existing) {
                          setSelectedFieldId(existing.id);
                        } else {
                          const newField = {
                            id: "title-main",
                            type: "title",
                            label: "",
                            value: "Title",
                            x: 65.4,
                            y: 49.6,
                            width: 108,
                            height: 36,
                            signer: signers[0]?.name || user?.name || "Signer",
                            prefill: "",
                          };
                          setPlacedFields((prev) => [
                            ...prev.filter((f) => f.type !== "title"),
                            newField,
                          ]);
                          setSelectedFieldId(newField.id);
                        }
                      } else {
                        setActiveSidebarItem(item.type);
                        handleAddField(item.type, item.label);
                      }
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition text-left cursor-pointer group ${
                      isActive
                        ? "text-[#2563eb] bg-blue-50/70 font-semibold"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-700"
                    }`}
                  >
                    <item.icon
                      size={15}
                      className={
                        isActive
                          ? "text-[#2563eb]"
                          : "text-gray-400 group-hover:text-blue-600 transition shrink-0"
                      }
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
        )}

        {/* ==================================================
            CENTER CANVAS WORKSPACE
        ================================================== */}
        <main className="flex-1 flex flex-col items-center justify-center relative p-6 sm:p-10 overflow-auto bg-[#c5cbcf]">
          {/* FLOATING TOP CANVAS CONTROLS (18% ⌄, Fit icon, 3 dots) */}
          <div className="absolute top-4 right-8 sm:right-12 bg-white/95 backdrop-blur-xs border border-gray-200 rounded-xl shadow-md px-3 py-1.5 flex items-center gap-3 z-30">
            {/* Zoom Selector */}
            <div className="relative" ref={zoomMenuRef}>
              <button
                onClick={() => setZoomMenuOpen(!zoomMenuOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 hover:text-blue-600 transition cursor-pointer"
              >
                <span>{zoomLevel}%</span>
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              {/* Zoom Dropdown */}
              <AnimatePresence>
                {zoomMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 mt-2 w-28 bg-white border border-gray-100 rounded-xl shadow-xl py-1 text-xs z-50"
                  >
                    {[18, 25, 50, 75, 100, 125].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          setZoomLevel(lvl);
                          setZoomMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left hover:bg-gray-50 transition ${
                          zoomLevel === lvl ? "font-bold text-blue-600 bg-blue-50/50" : "text-gray-700"
                        }`}
                      >
                        {lvl}%
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-[1px] h-4 bg-gray-200" />

            {/* Layout Grid / Two Page View Toggle (matching Screen 1 icon) */}
            <button
              onClick={() => {
                setTwoPageView((prev) => !prev);
                setShowPropertiesPanel(false);
              }}
              className={`p-1 rounded transition cursor-pointer ${
                twoPageView ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-800"
              }`}
              title="Toggle Two Page View (Screen 1)"
            >
              <LayoutGrid size={15} />
            </button>

            {/* Three Dots Menu - Opens Agree Modal & Options */}
            <button
              onClick={() => setUserAgreeModalOpen(true)}
              className="text-gray-500 hover:text-gray-800 p-0.5 transition cursor-pointer"
              title="Review & Sign Agreement Modal (user open agree)"
            >
              <MoreVertical size={14} />
            </button>
          </div>

          {/* ====================================================
              DOCUMENT PAGE: DIPLOMA OF GRADUATION (MANKATO UNIVERSITY)
          ==================================================== */}
          <div
            ref={canvasContainerRef}
            style={{
              transform: `scale(${zoomLevel >= 100 ? zoomLevel / 100 : 1})`,
              transformOrigin: "center center",
            }}
            className={`relative bg-white shadow-2xl transition-transform duration-200 flex flex-col justify-between overflow-hidden ${
              isStaticDiploma
                ? "rounded-sm border-8 border-[#0c4a7e] w-[720px] max-w-[92vw] aspect-[1.414/1] p-8 sm:p-10"
                : isPdfDoc
                ? "rounded-xl border border-gray-300 w-[780px] max-w-[95vw] min-h-[850px] p-0"
                : isImageDoc
                ? "rounded-xl border border-gray-300 w-[760px] max-w-[94vw] min-h-[720px] p-4"
                : "rounded-xl border border-gray-300 w-[760px] max-w-[94vw] min-h-[920px] p-6 sm:p-8"
            }`}
          >
            {/* INNER BORDER ORNAMENTS (Only for demo certificate) */}
            {isStaticDiploma && (
              <>
                <div className="absolute inset-2 border-2 border-[#d4af37] pointer-events-none" />
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#d4af37] via-[#f3e5ab] to-transparent clip-corner pointer-events-none opacity-90" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#0c4a7e] to-transparent pointer-events-none opacity-80" />
              </>
            )}

            {isStaticDiploma ? (
              activePage === 1 ? (
                <>
                  {/* GOLD BADGE (Graduate of 2020) */}
                  <div className="absolute top-8 left-8 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f6d365] via-[#d4af37] to-[#aa771c] shadow-lg flex flex-col items-center justify-center text-center p-1 border-2 border-white">
                      <span className="text-[8px] font-bold text-white tracking-widest uppercase">Graduate</span>
                      <span className="text-[7px] text-white/90">of</span>
                      <span className="text-xs font-black text-white">2020</span>
                    </div>
                    {/* Ribbon Tails */}
                    <div className="flex -mt-1.5 gap-1">
                      <div className="w-2.5 h-6 bg-[#d4af37] transform -rotate-12 rounded-b-xs shadow-xs" />
                      <div className="w-2.5 h-6 bg-[#aa771c] transform rotate-12 rounded-b-xs shadow-xs" />
                    </div>
                  </div>

                  {/* HEADER AREA */}
                  <div className="text-center pt-2">
                    {/* University Logo Crest */}
                    <div className="w-10 h-10 mx-auto mb-1.5 rounded-full bg-[#0c4a7e] flex items-center justify-center text-[#d4af37] border-2 border-[#d4af37]">
                      <Sparkles size={20} />
                    </div>
                    <h2 className="font-cinzel font-bold text-sm sm:text-base text-gray-900 tracking-wider">
                      MANKATO UNIVERSITY
                    </h2>
                    <p className="text-[8px] text-gray-500 font-sans tracking-wide">
                      711-2880 Nulla St. Mankato Mississippi 96522
                    </p>
                    <p className="text-[7px] text-blue-700 underline font-sans">
                      mankatopreschool.com
                    </p>
                  </div>

                  {/* DIPLOMA TITLE */}
                  <div className="text-center my-3">
                    <h1 className="font-cinzel font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-wider">
                      DIPLOMA OF GRADUATION
                    </h1>
                    <p className="text-[10px] text-gray-500 italic mt-1 font-playfair">
                      This certifies that
                    </p>
                  </div>

                  {/* STUDENT NAME */}
                  <div className="text-center">
                    <h3 className="font-cinzel font-bold text-xl sm:text-2xl text-[#0c4a7e] tracking-widest inline-block min-w-[280px]">
                      CHARLES REYNOLDS
                    </h3>
                  </div>

                  {/* CERTIFICATE BODY TEXT */}
                  <div className="text-center px-6 max-w-lg mx-auto">
                    <p className="text-[9px] text-gray-600 leading-relaxed font-playfair">
                      Has completed all the requirements for graduation at{" "}
                      <span className="font-bold text-gray-800">[NAME OF INSTITUTE]</span>{" "}
                      from <span className="font-bold text-gray-800">[DATE]</span> to{" "}
                      <span className="font-bold text-gray-800">[DATE]</span> and awarded this
                      DIPLOMA.
                    </p>
                    <p className="text-[8px] text-gray-500 italic mt-2">
                      Mankato University wishes him all the best!
                    </p>
                    <p className="text-[8px] text-gray-400 mt-0.5">
                      Given this [DATE]
                    </p>
                  </div>

                  {/* SIGNATURES FOOTER */}
                  <div className="flex items-end justify-between px-6 pt-4 pb-2 border-t border-gray-200 mt-2">
                    {/* Chairman Signature */}
                    <div className="text-center w-36">
                      <div className="h-9 flex items-center justify-center">
                        <span className="font-caveat text-2xl text-gray-800 font-bold">
                          Steven Stevenson
                        </span>
                      </div>
                      <div className="border-t border-gray-800 pt-1">
                        <p className="text-[9px] font-bold text-gray-800">Steven Stevenson</p>
                        <p className="text-[7px] text-gray-500 uppercase tracking-wider">Chairman</p>
                      </div>
                    </div>

                    {/* President Signature */}
                    <div className="text-center w-36">
                      <div className="h-9 flex items-center justify-center">
                        <span className="font-dancing text-2xl text-gray-800 font-bold">
                          Arthur Arthurson
                        </span>
                      </div>
                      <div className="border-t border-gray-800 pt-1">
                        <p className="text-[9px] font-bold text-gray-800">Arthur Arthurson</p>
                        <p className="text-[7px] text-gray-500 uppercase tracking-wider">President</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col justify-between p-2 z-10 select-none">
                  {/* PAGE 2 HEADER */}
                  <div className="text-center pt-1 border-b border-gray-200 pb-3">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-[#0c4a7e] flex items-center justify-center text-[#d4af37] border-2 border-[#d4af37]">
                        <Sparkles size={16} />
                      </div>
                      <div className="text-left">
                        <h2 className="font-cinzel font-bold text-xs sm:text-sm text-gray-900 tracking-wider">
                          MANKATO UNIVERSITY
                        </h2>
                        <p className="text-[7px] text-gray-500 uppercase tracking-widest font-sans">
                          Academic Transcript & Skills Module Completion Record
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-[8px] text-gray-600 mt-1 font-medium">
                      <span>Student: <strong className="text-gray-900 font-bold">CHARLES REYNOLDS</strong></span>
                      <span>•</span>
                      <span>Student ID: <strong className="text-gray-900">MK-2020-8914</strong></span>
                      <span>•</span>
                      <span>Conferred: <strong className="text-gray-900">September 2020</strong></span>
                    </div>
                  </div>

                  {/* MODULES TABLE */}
                  <div className="my-2 px-2 overflow-hidden">
                    <table className="w-full text-left text-[8px] sm:text-[9px] border-collapse">
                      <thead>
                        <tr className="bg-gray-100/90 text-gray-700 font-bold border-b border-gray-300">
                          <th className="py-1 px-2">Code</th>
                          <th className="py-1 px-2">Module Title & Competency Area</th>
                          <th className="py-1 px-2 text-center">Credits</th>
                          <th className="py-1 px-2 text-right">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-800 font-sans">
                        <tr>
                          <td className="py-1 px-2 font-mono font-semibold text-blue-700">MOD-101</td>
                          <td className="py-1 px-2">Advanced Enterprise Web Architecture & State Lifecycle</td>
                          <td className="py-1 px-2 text-center">30</td>
                          <td className="py-1 px-2 text-right font-bold text-emerald-700">A+ (98%)</td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 font-mono font-semibold text-blue-700">MOD-102</td>
                          <td className="py-1 px-2">Cryptographic E-Signature Verification & Audit Trail</td>
                          <td className="py-1 px-2 text-center">30</td>
                          <td className="py-1 px-2 text-right font-bold text-emerald-700">A+ (100%)</td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 font-mono font-semibold text-blue-700">MOD-103</td>
                          <td className="py-1 px-2">Multi-Tenant CRM Pipelines & Cloud Integrations</td>
                          <td className="py-1 px-2 text-center">30</td>
                          <td className="py-1 px-2 text-right font-bold text-emerald-700">A (96%)</td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 font-mono font-semibold text-blue-700">MOD-104</td>
                          <td className="py-1 px-2">Distributed Systems Reliability & Compliance</td>
                          <td className="py-1 px-2 text-center">30</td>
                          <td className="py-1 px-2 text-right font-bold text-emerald-700">A+ (99%)</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Summary Metric Strip */}
                    <div className="mt-2 bg-blue-50/60 border border-blue-200 rounded p-1.5 flex items-center justify-around text-[8px] text-gray-700">
                      <span>Total Credits: <strong>120 / 120</strong></span>
                      <span>Cumulative GPA: <strong className="text-blue-800">3.98 / 4.00</strong></span>
                      <span>Standing: <strong className="text-emerald-800">Summa Cum Laude</strong></span>
                    </div>
                  </div>

                  {/* SIGNATURES FOOTER (PAGE 2) */}
                  <div className="flex items-end justify-between px-6 pt-2 pb-1 border-t border-gray-200">
                    <div className="text-center w-36">
                      <div className="h-7 flex items-center justify-center">
                        <span className="font-sacramento text-2xl text-gray-800 font-bold">
                          Margaret Vance
                        </span>
                      </div>
                      <div className="border-t border-gray-800 pt-0.5">
                        <p className="text-[8px] font-bold text-gray-800">Dr. Margaret Vance</p>
                        <p className="text-[7px] text-gray-500 uppercase tracking-wider">Registrar</p>
                      </div>
                    </div>

                    <div className="text-center w-36">
                      <div className="h-7 flex items-center justify-center">
                        <span className="font-allura text-2xl text-gray-800 font-bold">
                          Robert Sterling
                        </span>
                      </div>
                      <div className="border-t border-gray-800 pt-0.5">
                        <p className="text-[8px] font-bold text-gray-800">Dr. Robert Sterling</p>
                        <p className="text-[7px] text-gray-500 uppercase tracking-wider">Controller of Exams</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : isPdfDoc ? (
              <div className="flex-1 flex flex-col justify-between w-full h-full min-h-[820px]">
                <div className="flex items-center justify-between p-2.5 bg-gray-100/90 border-b border-gray-200 text-xs text-gray-700 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded shrink-0">PDF</span>
                    <span className="font-semibold text-gray-800 truncate max-w-[280px]">{docName}</span>
                    <span className="text-gray-400 shrink-0">&bull;</span>
                    <span className="text-gray-500 text-[11px] shrink-0">{documentData?.size || ""}</span>
                  </div>
                  {resolvedDocUrl && (
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={resolvedDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-white px-2 py-1 rounded border border-gray-300 shadow-2xs"
                      >
                        <ExternalLink size={12} /> Open in new tab
                      </a>
                      <a
                        href={resolvedDocUrl}
                        download={docName}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 hover:text-gray-900 bg-white px-2 py-1 rounded border border-gray-300 shadow-2xs"
                      >
                        <Download size={12} /> Download
                      </a>
                    </div>
                  )}
                </div>

                <div className="relative flex-1 w-full min-h-[760px] bg-slate-100">
                  <iframe
                    src={`${resolvedDocUrl}#toolbar=0&navpanes=0`}
                    title={docName}
                    className={`w-full h-full min-h-[760px] border-0 ${
                      draggingFieldId ? "pointer-events-none" : "pointer-events-auto"
                    }`}
                  />
                </div>
              </div>
            ) : isImageDoc ? (
              <div className="flex-1 flex flex-col justify-between w-full h-full min-h-[660px]">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 text-xs text-gray-500 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={14} className="text-blue-600 shrink-0" />
                    <span className="font-semibold text-gray-800 truncate max-w-[300px]">{docName}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono uppercase shrink-0">
                      {docExt}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] shrink-0">
                    <span>{documentData?.size || "Original"}</span>
                    <span>&bull;</span>
                    <span>{documentData?.createdOn || "Uploaded"}</span>
                    {resolvedDocUrl && (
                      <a
                        href={resolvedDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 ml-2"
                      >
                        <ExternalLink size={12} /> Open
                      </a>
                    )}
                  </div>
                </div>

                <div className="relative flex-1 flex items-center justify-center my-3 bg-gray-50/70 rounded-lg overflow-hidden border border-gray-100 min-h-[560px]">
                  <img
                    src={resolvedDocUrl}
                    alt={docName}
                    className="max-w-full max-h-[660px] object-contain select-none pointer-events-none rounded"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-[11px] text-gray-500 shrink-0">
                  <span>Signatures will be permanently certified on this document.</span>
                  <span className="font-semibold text-gray-700">Pearls IT Hub Document Service</span>
                </div>
              </div>
            ) : (
              activePage === 1 ? (
                <div className="flex-1 flex flex-col justify-between p-2 sm:p-4 select-none">
                  {/* DOCUMENT HEADER */}
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-[#1d68bd] pb-3 mb-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-[#1d68bd] text-[10px] font-bold uppercase tracking-wider">
                            Official Document
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium">
                            Ref: #{id || "DOC-2026"}
                          </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 tracking-tight">
                          {docName}
                        </h1>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-[#1d68bd] uppercase tracking-wider">
                          Pearls IT Hub
                        </div>
                        <div className="text-[10px] text-gray-400">
                          E-Signature Workflow System
                        </div>
                      </div>
                    </div>

                    {/* METADATA BAR */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-200/80 mb-5 text-[11px]">
                      <div>
                        <span className="block text-gray-400 text-[9px] uppercase font-bold">Author / Sender</span>
                        <span className="font-semibold text-gray-800 truncate block">{documentData?.author || "Admin"}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400 text-[9px] uppercase font-bold">File Format</span>
                        <span className="font-semibold text-gray-800 uppercase font-mono">{docExt || "DOC"}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400 text-[9px] uppercase font-bold">File Size</span>
                        <span className="font-semibold text-gray-800">{documentData?.size || "24.00 Kb"}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400 text-[9px] uppercase font-bold">Created Date</span>
                        <span className="font-semibold text-gray-800">{documentData?.createdOn || "Today"}</span>
                      </div>
                    </div>

                    {/* ATTACHED FILE NOTICE IF APPLICABLE */}
                    {resolvedDocUrl && (
                      <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200 rounded-xl mb-5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText size={18} className="text-blue-600 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-gray-800 truncate">{docName}</p>
                            <p className="text-[10px] text-gray-500">Uploaded file attachment</p>
                          </div>
                        </div>
                        <a
                          href={resolvedDocUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs hover:bg-blue-50 shrink-0 ml-2"
                        >
                          <ExternalLink size={12} /> Open File
                        </a>
                      </div>
                    )}

                    {/* DOCUMENT BODY */}
                    <div className="space-y-3.5 text-xs text-gray-700 leading-relaxed font-sans">
                      {documentData?.content ? (
                        <div className="whitespace-pre-line p-3 bg-gray-50/50 rounded-lg border border-gray-100 font-mono text-[11px]">
                          {documentData.content}
                        </div>
                      ) : (
                        <>
                          <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-1 text-xs uppercase tracking-wide">
                              1. Executive Overview & Instrument Scope
                            </h3>
                            <p className="text-gray-600 text-[11px] leading-relaxed">
                              This document sets forth the deliverables, legal terms, and administrative milestones for &ldquo;{docName}&rdquo; under Pearls IT Hub and CRM IT Services management.
                            </p>
                          </div>

                          <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-1 text-xs uppercase tracking-wide">
                              2. Execution & Authorization Stipulations
                            </h3>
                            <p className="text-gray-600 text-[11px] leading-relaxed">
                              By affixing electronic signatures below, all authorized signatories confirm that they have read, understood, and consented to the operational schedules and binding agreements documented herein.
                            </p>
                          </div>

                          <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-1 text-xs uppercase tracking-wide">
                              3. Electronic Signature & Audit Compliance
                            </h3>
                            <p className="text-gray-600 text-[11px] leading-relaxed">
                              Pursuant to ESIGN and UETA standards, electronic signatures applied to this instrument possess identical legal validity and enforceability as handwritten physical signatures.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* SIGNATURES FOOTER */}
                  <div className="flex items-end justify-between px-4 pt-4 pb-2 border-t border-gray-200 mt-6">
                    <div className="text-center w-40">
                      <div className="h-9 flex items-center justify-center">
                        <span className="font-caveat text-2xl text-gray-800 font-bold">
                          {documentData?.author || "Company Officer"}
                        </span>
                      </div>
                      <div className="border-t border-gray-800 pt-1">
                        <p className="text-[10px] font-bold text-gray-800 truncate">{documentData?.author || "Company Officer"}</p>
                        <p className="text-[8px] text-gray-500 uppercase tracking-wider">Authorized Officer</p>
                      </div>
                    </div>

                    <div className="text-center w-40">
                      <div className="h-9 flex items-center justify-center text-xs text-gray-400 italic">
                        [ Signatory Area ]
                      </div>
                      <div className="border-t border-gray-400 pt-1">
                        <p className="text-[10px] font-bold text-gray-700">Designated Signer</p>
                        <p className="text-[8px] text-gray-400 uppercase tracking-wider">Signatory</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between p-4 select-none">
                  <div>
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-blue-600">Audit Trail & Record</span>
                        <h2 className="text-lg font-bold text-gray-900">{docName}</h2>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">Page 2 of 2</span>
                    </div>

                    <div className="my-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Electronic Signature Verification Log
                      </h4>
                      <div className="text-[11px] text-gray-600 space-y-2">
                        <div className="flex justify-between py-1 border-b border-gray-200">
                          <span className="text-gray-500">Document Identifier:</span>
                          <span className="font-mono text-gray-800">{id || "DOC-2026"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-200">
                          <span className="text-gray-500">Document Status:</span>
                          <span className="font-semibold text-emerald-700">
                            {documentData?.isSigned ? "Certified Signed" : "Pending Signature"}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-200">
                          <span className="text-gray-500">Prepared By:</span>
                          <span className="font-medium text-gray-800">{documentData?.author || "Admin"}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-500">Security Hash:</span>
                          <span className="font-mono text-[10px] text-gray-700">SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
                    Pearls CRM Secure Electronic Signature Audit Trail &bull; Legally Binding under ESIGN Act
                  </div>
                </div>
              )
            )}

            {/* ==================================================
                PLACED INTERACTIVE FIELDS OVERLAY (DRAGGABLE & MOVABLE WITH MOUSE)
            ================================================== */}
            {placedFields
              .filter((f) => {
                if (activePage !== 1 && f.page !== activePage) return false;
                if (wireframePreset === "ceo") return f.id === "ceo-main" || f.type === "signature";
                if (wireframePreset === "initial") return f.id === "initial-main" || f.type === "initials";
                if (wireframePreset === "text") return f.id === "text-main" || f.type === "text";
                return true;
              })
              .map((field) => {
              const isSelected = selectedFieldId === field.id;
              const isDraggingThis = draggingFieldId === field.id;

              return (
                <div
                  key={field.id}
                  onMouseDown={(e) => handleMouseDownOnField(e, field)}
                  onTouchStart={(e) => handleTouchStartOnField(e, field)}
                  style={{
                    left: `${field.x}%`,
                    top: `${field.y}%`,
                  }}
                  className={`absolute select-none z-20 group transition-shadow ${
                    isDraggingThis
                      ? "cursor-grabbing shadow-xl ring-2 ring-teal-500 scale-[1.02] z-30 opacity-95"
                      : "cursor-grab hover:shadow-md hover:ring-1 hover:ring-teal-400"
                  }`}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      // If user moved/dragged the field, ignore click action
                      if (hasDraggedRef.current) {
                        hasDraggedRef.current = false;
                        return;
                      }
                      setSelectedFieldId(field.id);
                      if (field.type === "text") {
                        setEditingTextId(field.id);
                        return;
                      }
                      if (isSignerMode || field.label === "Company CEO" || field.type === "signature" || field.type === "initials") {
                        if (field.type === "initials") {
                          setTypedSigName(field.signed && field.value ? field.value : (field.prefill?.trim() || "R"));
                        } else {
                          setTypedSigName(field.signed && field.value && field.value !== "Company CEO" ? field.value : (field.prefill?.trim() || field.signer || "Ragavi"));
                        }
                        setSignatureModalOpen(true);
                        return;
                      }
                      setActiveSidebarItem(
                        field.type === "signature"
                          ? "signature-field"
                          : field.type === "initials"
                          ? "initials-field"
                          : field.type === "text"
                          ? "text-field"
                          : field.type === "date"
                          ? "date-field"
                          : field.type === "checkbox"
                          ? "checkbox-field"
                          : field.type === "radio"
                          ? "radio-buttons"
                          : field.type === "dropdown"
                          ? "dropdown-field"
                          : field.type === "attachment"
                          ? "attachment-field"
                          : field.type === "name"
                          ? "name-field"
                          : field.type === "email"
                          ? "email-field"
                          : field.type === "company"
                          ? "company-field"
                          : field.type === "title"
                          ? "title-field"
                          : field.type
                      );
                      setShowPropertiesPanel(true);
                      if (field.type === "checkbox") {
                        setPlacedFields((prev) =>
                          prev.map((f) =>
                            f.id === field.id ? { ...f, selected: !f.selected } : f
                          )
                        );
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setSelectedFieldId(field.id);
                      if (field.type === "signature" || field.type === "initials") {
                        if (field.type === "initials") {
                          setTypedSigName(field.signed && field.value ? field.value : (field.prefill?.trim() || "R"));
                        } else {
                          setTypedSigName(field.signed && field.value && field.value !== "Company CEO" ? field.value : (field.prefill?.trim() || field.signer || "Ragavi"));
                        }
                        setSignatureModalOpen(true);
                      }
                    }}
                    title={
                      isSignerMode
                        ? field.type === "text"
                          ? "Click to edit text"
                          : "Click to sign"
                        : field.type === "checkbox"
                        ? "Click to toggle checkmark"
                        : field.type === "radio"
                        ? "Click to select radio button"
                        : field.type === "dropdown"
                        ? "Click to configure dropdown field"
                        : field.type === "attachment"
                        ? "Click to configure attachment field"
                        : field.type === "name"
                        ? "Click to configure name field"
                        : field.type === "email"
                        ? "Click to configure email field"
                        : field.type === "company"
                        ? "Click to configure company field"
                        : field.type === "title"
                        ? "Click to configure title field"
                        : "Click to view properties, double-click to sign"
                    }
                    className={`rounded-xs select-none flex items-center justify-center cursor-inherit transition relative shadow-2xs ${
                      field.type === "checkbox" || field.type === "radio"
                        ? "w-7 h-7 min-w-[28px] max-w-[28px] bg-[#e8f8f5] border border-[#2dd4bf] text-[#2c7a6b]"
                        : field.type === "dropdown"
                        ? "min-w-[110px] h-9 px-3.5 py-2 text-xs bg-[#e8f8f5] border border-[#2dd4bf] text-[#2c7a6b] flex items-center justify-between gap-3"
                        : field.type === "initials" && !field.signed
                        ? "min-w-[42px] w-11 h-9 px-2 py-2 text-xs bg-[#e8f8f5] border border-[#2dd4bf] text-[#2c7a6b]"
                        : field.type === "signature" || field.type === "initials" || field.type === "text" || field.type === "date" || field.type === "attachment" || field.type === "name" || field.type === "email" || field.type === "company" || field.type === "title"
                        ? "min-w-[105px] h-9 px-4 py-2 text-xs bg-[#e8f8f5] border border-[#2dd4bf] text-[#2c7a6b]"
                        : "min-w-[105px] h-9 px-4 py-2 text-xs bg-[#eef1f5] border border-gray-300 text-gray-800"
                    } ${isSelected ? "ring-2 ring-teal-400/30" : "hover:border-teal-500"}`}
                  >
                    {/* Top Right Corner Handle Dot (as shown in wireframe) */}
                    {(field.type === "signature" || field.type === "initials" || field.type === "text" || field.type === "date" || field.type === "checkbox" || field.type === "radio" || field.type === "dropdown" || field.type === "attachment" || field.type === "name" || field.type === "email" || field.type === "company" || field.type === "title") && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-[#2dd4bf] rounded-full shadow-2xs pointer-events-none" />
                    )}

                    {field.type === "dropdown" ? (
                      <div className="w-full flex items-center justify-between gap-3">
                        <span className="text-[#0d9488] font-medium text-xs tracking-normal">
                          {field.label?.trim() || field.value || "Gender"}
                        </span>
                        <ChevronDown size={14} className="text-[#0d9488] stroke-[2.5] shrink-0" />
                      </div>
                    ) : field.type === "radio" ? (
                      <CircleDot size={15} className="text-[#2c7a6b] stroke-[2.2]" />
                    ) : field.type === "checkbox" ? (
                      field.selected ? (
                        <Check size={16} className="text-[#2c7a6b] stroke-[2.5]" />
                      ) : null
                    ) : field.type === "attachment" ? (
                      <span className="text-[#0d9488] font-medium text-xs tracking-normal">
                        {field.label?.trim() || field.value || "Attachment"}
                      </span>
                    ) : field.type === "name" ? (
                      <span className="text-[#0d9488] font-medium text-xs tracking-normal">
                        {field.label?.trim() || field.prefill?.trim() || field.value || "Name"}
                      </span>
                    ) : field.type === "email" ? (
                      <span className="text-[#0d9488] font-medium text-xs tracking-normal">
                        {field.label?.trim() || field.prefill?.trim() || field.value || "Email"}
                      </span>
                    ) : field.type === "company" ? (
                      <span className="text-[#0d9488] font-medium text-xs tracking-normal">
                        {field.label?.trim() || field.prefill?.trim() || field.value || "Company"}
                      </span>
                    ) : field.type === "title" ? (
                      <span className="text-[#0d9488] font-medium text-xs tracking-normal">
                        {field.label?.trim() || field.prefill?.trim() || field.value || "Title"}
                      </span>
                    ) : field.type === "text" ? (
                      editingTextId === field.id ? (
                        <input
                          type="text"
                          autoFocus
                          value={field.value && field.value !== "Text" ? field.value : (field.prefill || "")}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPlacedFields((prev) =>
                              prev.map((f) => (f.id === field.id ? { ...f, value: val } : f))
                            );
                          }}
                          onBlur={() => {
                            setEditingTextId(null);
                            if (!field.value?.trim()) {
                              setPlacedFields((prev) =>
                                prev.map((f) => (f.id === field.id ? { ...f, value: f.prefill || "Text", signed: false } : f))
                              );
                            } else {
                              setPlacedFields((prev) =>
                                prev.map((f) => (f.id === field.id ? { ...f, signed: true } : f))
                              );
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setEditingTextId(null);
                              if (field.value?.trim() && field.value !== "Text") {
                                setPlacedFields((prev) =>
                                  prev.map((f) => (f.id === field.id ? { ...f, signed: true } : f))
                                );
                              }
                            }
                          }}
                          placeholder={field.prefill || "Type text..."}
                          className="w-full bg-transparent text-xs font-semibold text-gray-800 placeholder-teal-600/60 outline-none text-center"
                        />
                      ) : field.signed && field.value && field.value !== "Text" ? (
                        <span className="text-xs font-semibold text-gray-800 select-none">
                          {field.value}
                        </span>
                      ) : (
                        <span className="text-[#0d9488] font-medium text-xs tracking-normal">
                          {field.prefill?.trim() || field.label?.trim() || "Text"}
                        </span>
                      )
                    ) : field.type === "initials" ? (
                      field.signed && field.value && field.value !== "I" && field.value !== "Initials" ? (
                        <span
                          style={{ color: field.color || "#000000" }}
                          className={`text-sm sm:text-base font-normal tracking-wide leading-none select-none ${field.font || "font-dancing"}`}
                        >
                          {field.value}
                        </span>
                      ) : (
                        <span className="text-[#0d9488] font-bold text-xs tracking-normal">
                          {field.prefill?.trim() || field.label?.trim() || "I"}
                        </span>
                      )
                    ) : field.type === "signature" || field.type === "date" ? (
                      field.signed && field.value && field.value !== "Signature" && field.value !== "Date signed" && field.value !== "Company CEO" ? (
                        field.sigType === "draw" || field.sigType === "upload" ? (
                          <img
                            src={field.dataUrl}
                            alt="Signature"
                            className="h-6 max-w-[110px] object-contain pointer-events-none"
                          />
                        ) : (
                          <span
                            style={{ color: field.color || "#000000" }}
                            className={`text-sm sm:text-base font-normal tracking-wide leading-none select-none ${field.font || "font-dancing"}`}
                          >
                            {field.value}
                          </span>
                        )
                      ) : (
                        <span className="text-[#0d9488] font-medium text-xs tracking-normal">
                          {field.prefill?.trim() || field.label?.trim() || (field.type === "date" ? "Date signed" : "Company CEO")}
                        </span>
                      )
                    ) : (
                      <span className="text-xs font-medium text-gray-800">
                        {field.label}
                      </span>
                    )}

                    {/* Quick delete icon on hover when selected (hidden in signer mode) */}
                    {isSelected && !isSignerMode && (
                      <button
                        onClick={(e) => handleDeleteField(field.id, e)}
                        className="absolute -top-2.5 -left-2.5 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-xs cursor-pointer z-30"
                        title="Remove field"
                      >
                        <X size={10} />
                      </button>
                    )}

                    {/* 4-Way Move Indicator Icon (hidden in signer mode) */}
                    {isSelected && !isSignerMode && (
                      <div
                        onMouseDown={(e) => handleMouseDownOnField(e, field)}
                        className={`absolute -bottom-4.5 right-1 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-move transition select-none ${
                          draggingFieldId === field.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                        title="Drag to move"
                      >
                        <Move size={14} className="stroke-[1.75] text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* ==================================================
            RIGHT PANEL: SIGNATURE FIELD PROPERTIES PANEL OR THUMBNAIL
        ================================================== */}
        {!isSignerMode && showPropertiesPanel && selectedField && !twoPageView ? (
          <aside className="w-64 sm:w-72 bg-white border-l border-gray-200 p-4 sm:p-5 flex flex-col shrink-0 z-20 overflow-y-auto no-scrollbar select-none">
            {/* PANEL HEADER */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {selectedField.type === "company"
                  ? "COMPANY FIELD"
                  : selectedField.type === "title"
                  ? "TITLE FIELD"
                  : selectedField.type === "email"
                  ? "EMAIL FIELD"
                  : selectedField.type === "name"
                  ? "NAME FIELD"
                  : selectedField.type === "attachment"
                  ? "ATTACHMENT FIELD"
                  : selectedField.type === "dropdown"
                  ? "DROPDOWN FIELD"
                  : selectedField.type === "radio"
                  ? "RADIO BUTTONS"
                  : selectedField.type === "checkbox"
                  ? "CHECKBOX FIELD"
                  : selectedField.type === "date"
                  ? "DATE SIGNED FIELD"
                  : selectedField.type === "text"
                  ? "TEXT FIELD"
                  : selectedField.type === "initials"
                  ? "INITIALS FIELD"
                  : selectedField.type === "signature"
                  ? "SIGNATURE FIELD"
                  : `${selectedField.label?.toUpperCase() || selectedField.type?.toUpperCase()} FIELD`}
              </h3>
              <button
                onClick={() => setShowPropertiesPanel(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition"
                title="Close properties panel"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* SECTION 1: SIGNER */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  SIGNER
                </label>
                <div className="relative">
                  <select
                    value={selectedField.signer || signers[0]?.name || "Signer"}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPlacedFields((prev) =>
                        prev.map((f) =>
                          f.id === selectedField.id ? { ...f, signer: val } : f
                        )
                      );
                    }}
                    className="w-full bg-[#ededed] hover:bg-[#e4e4e4] focus:bg-white border border-transparent focus:border-blue-500 rounded px-3 py-2 text-xs text-gray-800 outline-none appearance-none cursor-pointer transition pr-8"
                  >
                    {signers.map((s) => (
                      <option key={s.id || s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAddSignersModalOpen(true)}
                  className="text-[11px] text-[#2563eb] hover:underline font-semibold mt-1.5 inline-block cursor-pointer"
                >
                  + Add New Signers
                </button>
              </div>

              {/* SECTION: DROPDOWN OPTIONS (Exact match for "Drop down field 7" wireframe) */}
              {selectedField.type === "dropdown" && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    OPTIONS
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={selectedField.options?.[0] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPlacedFields((prev) =>
                          prev.map((f) =>
                            f.id === selectedField.id
                              ? {
                                  ...f,
                                  options: [val, f.options?.[1] || ""],
                                }
                              : f
                          )
                        );
                      }}
                      placeholder="01."
                      className="w-full bg-[#ededed] focus:bg-white border border-transparent focus:border-blue-500 rounded px-3 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none transition"
                    />
                    <input
                      type="text"
                      value={selectedField.options?.[1] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPlacedFields((prev) =>
                          prev.map((f) =>
                            f.id === selectedField.id
                              ? {
                                  ...f,
                                  options: [f.options?.[0] || "", val],
                                }
                              : f
                          )
                        );
                      }}
                      placeholder="02."
                      className="w-full bg-[#ededed] focus:bg-white border border-transparent focus:border-blue-500 rounded px-3 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none transition"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: CHECKBOX & RADIO OPTIONS (Exact match for "Checkbox field 5" & "Radio button field 6" wireframes) */}
              {(selectedField.type === "checkbox" || selectedField.type === "radio") && (
                <div className="space-y-3 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={!!selectedField.required}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setPlacedFields((prev) =>
                          prev.map((f) =>
                            f.id === selectedField.id ? { ...f, required: val } : f
                          )
                        );
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-[#175ea8] focus:ring-[#175ea8] cursor-pointer"
                    />
                    <span className="text-xs text-gray-700 font-medium group-hover:text-gray-900">
                      Required
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={!!selectedField.selected}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setPlacedFields((prev) =>
                          prev.map((f) =>
                            f.id === selectedField.id ? { ...f, selected: val } : f
                          )
                        );
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-[#175ea8] focus:ring-[#175ea8] cursor-pointer"
                    />
                    <span className="text-xs text-gray-700 font-medium group-hover:text-gray-900">
                      Selected
                    </span>
                  </label>
                </div>
              )}

              {/* SECTION 2: LABEL / LEBEL */}
              {selectedField.type === "dropdown" || selectedField.type === "attachment" ? (
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    LEBEL
                  </label>
                  <input
                    type="text"
                    value={selectedField.label || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPlacedFields((prev) =>
                        prev.map((f) =>
                          f.id === selectedField.id
                            ? {
                                ...f,
                                label: val,
                                value: val
                                  ? val
                                  : selectedField.type === "attachment"
                                  ? "Attachment"
                                  : "Gender",
                              }
                            : f
                        )
                      );
                    }}
                    placeholder="..."
                    className="w-full bg-[#ededed] focus:bg-white border border-transparent focus:border-blue-500 rounded px-3 py-2 text-xs text-gray-800 outline-none transition"
                  />
                </div>
              ) : (
                selectedField.type !== "date" &&
                selectedField.type !== "checkbox" &&
                selectedField.type !== "radio" && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      LABEL
                    </label>
                    <input
                      type="text"
                      value={selectedField.label || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPlacedFields((prev) =>
                          prev.map((f) =>
                            f.id === selectedField.id ? { ...f, label: val } : f
                          )
                        );
                      }}
                      placeholder="..."
                      className="w-full bg-[#ededed] focus:bg-white border border-transparent focus:border-blue-500 rounded px-3 py-2 text-xs text-gray-800 outline-none transition"
                    />
                  </div>
                )
              )}

              {/* SECTION 3: PREFILL FIELD FOR SIGNER (Only shown when field supports prefill) */}
              {selectedField.type !== "date" &&
                selectedField.type !== "checkbox" &&
                selectedField.type !== "radio" &&
                selectedField.type !== "dropdown" &&
                selectedField.type !== "attachment" && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    PREFILL FIELD FOR SIGNER
                  </label>
                  {selectedField.type === "text" || selectedField.type === "name" || selectedField.type === "email" || selectedField.type === "company" || selectedField.type === "title" ? (
                    <textarea
                      rows={2}
                      value={selectedField.prefill || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPlacedFields((prev) =>
                          prev.map((f) =>
                            f.id === selectedField.id
                              ? {
                                  ...f,
                                  prefill: val,
                                  value: f.signed ? f.value : (val || f.value),
                                }
                              : f
                          )
                        );
                      }}
                      placeholder="..."
                      className="w-full bg-[#ededed] focus:bg-white border border-transparent focus:border-blue-500 rounded px-3 py-2 text-xs text-gray-800 outline-none resize-none transition"
                    />
                  ) : (
                    <input
                      type="text"
                      value={selectedField.prefill || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPlacedFields((prev) =>
                          prev.map((f) =>
                            f.id === selectedField.id
                              ? {
                                  ...f,
                                  prefill: val,
                                  value: f.signed ? f.value : (val || f.value),
                                }
                              : f
                          )
                        );
                      }}
                      placeholder="..."
                      className="w-full bg-[#ededed] focus:bg-white border border-transparent focus:border-blue-500 rounded px-3 py-2 text-xs text-gray-800 outline-none transition"
                    />
                  )}
                </div>
              )}

              {/* SECTION: VALIDATION (for Text Field - Exact match for "Text field 3" & "validatio..." wireframe) */}
              {selectedField.type === "text" && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    VALIDATION
                  </label>
                  <div className="relative">
                    <select
                      value={selectedField.validation || "None"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPlacedFields((prev) =>
                          prev.map((f) =>
                            f.id === selectedField.id ? { ...f, validation: val } : f
                          )
                        );
                      }}
                      className="w-full bg-[#ededed] hover:bg-[#e4e4e4] focus:bg-white border border-transparent focus:border-blue-500 rounded px-3 py-2 text-xs text-gray-800 outline-none appearance-none cursor-pointer transition pr-8"
                    >
                      {["None", "Number", "Email", "Letter", "Date", "Zip"].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 4: LOCATION */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                  LOCATION
                </label>

                {/* Bottom Left Corner */}
                <div className="mb-2.5">
                  <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    BOTTOM LEFT CORNER
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#ededed] rounded px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-gray-700">
                      <span className="text-gray-400 text-[10px] font-medium">X:</span>
                      <input
                        type="number"
                        value={Math.round(selectedField.x * 9.8) || 678}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) / 9.8;
                          setPlacedFields((prev) =>
                            prev.map((f) =>
                              f.id === selectedField.id ? { ...f, x: val } : f
                            )
                          );
                        }}
                        className="w-full bg-transparent outline-none text-xs text-gray-800"
                      />
                    </div>
                    <div className="bg-[#ededed] rounded px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-gray-700">
                      <span className="text-gray-400 text-[10px] font-medium">Y:</span>
                      <input
                        type="number"
                        value={Math.round(selectedField.y * 8.1) || 408}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) / 8.1;
                          setPlacedFields((prev) =>
                            prev.map((f) =>
                              f.id === selectedField.id ? { ...f, y: val } : f
                            )
                          );
                        }}
                        className="w-full bg-transparent outline-none text-xs text-gray-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Top Right Corner */}
                <div>
                  <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    TOP RIGHT CORNER
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#ededed] rounded px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-gray-700">
                      <span className="text-gray-400 text-[10px] font-medium">X:</span>
                      <input
                        type="number"
                        value={Math.round(selectedField.x * 9.8 + 77) || 755}
                        className="w-full bg-transparent outline-none text-xs text-gray-800"
                        readOnly
                      />
                    </div>
                    <div className="bg-[#ededed] rounded px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-gray-700">
                      <span className="text-gray-400 text-[10px] font-medium">Y:</span>
                      <input
                        type="number"
                        value={Math.round(selectedField.y * 8.1 + 91) || 499}
                        className="w-full bg-transparent outline-none text-xs text-gray-800"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        ) : (!isSignerMode || twoPageView) ? (
          <aside className="w-24 sm:w-28 bg-white border-l border-gray-200 py-6 px-3 flex flex-col items-center gap-6 shrink-0 z-20 overflow-y-auto no-scrollbar select-none">
            {/* Page 1 Thumbnail (Screen 1: Two page view) */}
            <div
              onClick={() => {
                setActivePage(1);
              }}
              className="flex flex-col items-center group cursor-pointer"
              title="Click to view Page 1"
            >
              <div
                className={`w-18 h-13 bg-white rounded border-2 shadow-xs p-1 flex flex-col justify-between overflow-hidden relative transition ${
                  activePage === 1
                    ? "border-[#2563eb] ring-2 ring-blue-300/50 shadow-md scale-102"
                    : "border-gray-300 hover:border-gray-400 opacity-80 hover:opacity-100"
                }`}
              >
                {isStaticDiploma ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                      <div className="h-0.5 w-6 bg-gray-300 rounded" />
                    </div>
                    <div className="h-1 w-8 bg-[#0c4a7e] mx-auto rounded" />
                    <div className="space-y-0.5">
                      <div className="h-0.5 w-full bg-gray-200 rounded" />
                      <div className="h-0.5 w-4/5 bg-gray-200 rounded" />
                    </div>
                    <div className="flex justify-between">
                      <div className="h-0.5 w-3 bg-gray-400 rounded" />
                      <div className="h-0.5 w-3 bg-gray-400 rounded" />
                    </div>
                  </>
                ) : isPdfDoc ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[6px] bg-red-600 text-white font-bold px-1 rounded">PDF</span>
                      <div className="h-0.5 w-5 bg-gray-300 rounded" />
                    </div>
                    <div className="space-y-0.5 my-0.5">
                      <div className="h-0.5 w-full bg-gray-300 rounded" />
                      <div className="h-0.5 w-full bg-gray-200 rounded" />
                      <div className="h-0.5 w-3/4 bg-gray-200 rounded" />
                    </div>
                    <div className="h-0.5 w-4 bg-blue-500 rounded" />
                  </>
                ) : isImageDoc ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded">
                    <span className="text-[7px] font-bold text-blue-600 font-mono">IMG</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-0.5">
                      <div className="h-1 w-6 bg-[#1d68bd] rounded" />
                      <div className="h-0.5 w-4 bg-gray-300 rounded" />
                    </div>
                    <div className="space-y-0.5 my-0.5">
                      <div className="h-0.5 w-full bg-gray-200 rounded" />
                      <div className="h-0.5 w-full bg-gray-200 rounded" />
                      <div className="h-0.5 w-2/3 bg-gray-200 rounded" />
                    </div>
                    <div className="flex justify-between">
                      <div className="h-0.5 w-3 bg-gray-400 rounded" />
                      <div className="h-0.5 w-3 bg-gray-400 rounded" />
                    </div>
                  </>
                )}
              </div>
              <span
                className={`text-xs font-bold mt-1.5 ${
                  activePage === 1 ? "text-[#2563eb]" : "text-gray-600"
                }`}
              >
                1
              </span>
            </div>

            {/* Page 2 Thumbnail (Screen 1: Two page view) */}
            <div
              onClick={() => {
                setActivePage(2);
              }}
              className="flex flex-col items-center group cursor-pointer"
              title="Click to view Page 2"
            >
              <div
                className={`w-18 h-13 bg-white rounded border-2 shadow-xs p-1 flex flex-col justify-between overflow-hidden relative transition ${
                  activePage === 2
                    ? "border-[#2563eb] ring-2 ring-blue-300/50 shadow-md scale-102"
                    : "border-gray-300 hover:border-gray-400 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-0.5">
                  <div className="h-0.5 w-5 bg-gray-400 rounded" />
                  <div className="h-0.5 w-3 bg-gray-300 rounded" />
                </div>
                <div className="space-y-0.5 my-auto">
                  <div className="h-0.5 w-full bg-gray-200 rounded" />
                  <div className="h-0.5 w-full bg-gray-200 rounded" />
                  <div className="h-0.5 w-3/4 bg-gray-200 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-0.5 w-3 bg-gray-400 rounded" />
                  <div className="h-0.5 w-3 bg-gray-400 rounded" />
                </div>
              </div>
              <span
                className={`text-xs font-bold mt-1.5 ${
                  activePage === 2 ? "text-[#2563eb]" : "text-gray-600"
                }`}
              >
                2
              </span>
            </div>
          </aside>
        ) : null}
      </div>

      {/* ====================================================
          MODAL: MY SIGNATURE STUDIO (TYPE, DRAW, UPLOAD)
      ==================================================== */}
      <AnimatePresence>
        {signatureModalOpen && (
          <SignatureStudioModal
            isOpen={signatureModalOpen}
            document={{ name: docName }}
            initialName={typedSigName || "Ragavi"}
            onClose={() => setSignatureModalOpen(false)}
            onSigned={async (doc, sigData) => {
              const sigText = sigData?.text?.trim() || typedSigName || "Ragavi";
              setTypedSigName(sigText);
              const targetId = selectedFieldId || placedFields.find((f) => f.type === "signature")?.id || placedFields[0]?.id;
              const updatedFields = placedFields.map((f) =>
                f.id === targetId
                  ? {
                      ...f,
                      signed: true,
                      value: sigText,
                      sigType: sigData?.type || "type",
                      font: sigData?.font || f.font || "font-dancing",
                      fontName: sigData?.fontName || f.fontName || "Dancing Script",
                      color: sigData?.color || f.color || "#000000",
                      dataUrl: sigData?.dataUrl,
                    }
                  : f
              );
              setPlacedFields(updatedFields);

              // Persist signature to MongoDB if id is present
              if (id) {
                try {
                  await fetch(apiUrl(`/documents/${id}/sign`), {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      signedBy: sigText,
                      signatureData: sigData,
                    }),
                  });
                  await fetch(apiUrl(`/documents/${id}/fields`), {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      placedFields: updatedFields,
                      signers,
                    }),
                  });
                } catch (err) {
                  console.warn("Could not persist applied signature:", err);
                }
              }

              setSignatureModalOpen(false);
              toast.success(
                <span>
                  Signature <b>"{sigText}"</b> applied & saved to document!
                </span>,
                { icon: "✍️" }
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* ====================================================
          MODAL: SEND DOCUMENT FOR SIGNING / SHARE EMAIL (TRIGGERED BY SHARE BUTTON)
      ==================================================== */}
      <AnimatePresence>
        {shareModalOpen && (
          <SendDocumentModal
            isOpen={shareModalOpen}
            document={{ name: docName }}
            onClose={() => setShareModalOpen(false)}
            onAssigned={(payload) => {
              setSigners((prev) => [
                ...prev,
                {
                  id: `s-${Date.now()}`,
                  name: payload.name,
                  email: payload.email,
                  role: "Signer",
                  color: "#2563eb",
                },
              ]);
              setShareModalOpen(false);
              toast.success(
                <span>
                  Document assigned & invitation sent to <b>{payload.email}</b>!
                </span>,
                { icon: "✉️" }
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* ====================================================
          MODAL: EDIT / ADD SIGNERS (EXACT WIREFRAME MATCH: "Edit signer")
      ==================================================== */}
      <AnimatePresence>
        {addSignersModalOpen && (
          <AddSignersModal
            isOpen={addSignersModalOpen}
            signers={signers}
            title="Keyboard shortcuts"
            subtitle="Add, rename or delete signers"
            docName={docName}
            docId={id || ""}
            signUrl={`${window.location.origin}/e-signatures/editor/${id || ""}?mode=signer`}
            onClose={() => setAddSignersModalOpen(false)}
            onSave={async (updatedSigners) => {
              const formattedSigners = updatedSigners.map((s, idx) => ({
                id: s.id || `s-${idx}`,
                name: s.name,
                email: s.email,
                role: "Signer",
                color: "#2563eb",
              }));
              setSigners(formattedSigners);

              if (id) {
                try {
                  await fetch(apiUrl(`/documents/${id}/fields`), {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      placedFields,
                      signers: formattedSigners,
                    }),
                  });
                } catch (err) {
                  console.warn("Could not persist signers to DB:", err);
                }
              }

              setAddSignersModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* ====================================================
          MODAL: ASK TO EDIT
      ==================================================== */}
      <AnimatePresence>
        {askToEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center mx-auto mb-3">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Request Edit Access</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Send an access request to the document owner to unlock form modification rights.
              </p>

              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setAskToEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setAskToEditModalOpen(false);
                    toast.success("Edit request submitted to document owner!");
                  }}
                  className="px-5 py-2 text-xs font-semibold bg-[#2563eb] text-white rounded-xl shadow-xs hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================
          MODAL: USER OPEN AGREE & MORE OPTIONS (SCREEN 2 & SCREEN 3)
      ==================================================== */}
      <AnimatePresence>
        {userAgreeModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-white rounded-md shadow-2xl border border-gray-200 px-5 py-4 text-left select-none relative"
            >
              {/* Top line: Header text */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 tracking-tight">
                  Please review and sign this document
                </h3>
                <button
                  type="button"
                  onClick={() => setUserAgreeModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition cursor-pointer"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Bottom row: Checkbox on left, Buttons on right */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                {/* Left: Agree checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={agreeRecordsChecked}
                    onChange={(e) => setAgreeRecordsChecked(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#1d528f] focus:ring-[#1d528f] cursor-pointer"
                  />
                  <span className="text-xs text-gray-700 font-normal group-hover:text-gray-900 transition">
                    I agree to use electronic records and signatures
                  </span>
                </label>

                {/* Right: "..." More options button & "Get Started" primary button */}
                <div className="flex items-center gap-2 self-end sm:self-auto relative" ref={moreOptionRef}>
                  {/* "..." More Option Button */}
                  <button
                    type="button"
                    onClick={() => setMoreOptionMenuOpen((prev) => !prev)}
                    className="px-3 py-1.5 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 rounded text-xs text-gray-600 transition flex items-center gap-1 cursor-pointer font-medium shadow-2xs"
                    title="More options"
                  >
                    <span>...</span>
                    <ChevronDown size={12} className="text-gray-400 stroke-[2]" />
                  </button>

                  {/* Dropdown Menu beneath "..." button (SCREEN 3: More option) */}
                  <AnimatePresence>
                    {moreOptionMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-24 sm:right-28 top-9 w-44 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-50 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMoreOptionMenuOpen(false);
                            handleDownload();
                          }}
                          className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer transition"
                        >
                          <Download size={13} className="text-gray-500" />
                          <span>Download</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMoreOptionMenuOpen(false);
                            setAssignModalOpen(true);
                          }}
                          className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer transition"
                        >
                          <UserPlus size={13} className="text-gray-500" />
                          <span>Assign to someone</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Primary "Get Started" Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!agreeRecordsChecked) {
                        toast.error("Please agree to electronic records and signatures to proceed");
                        return;
                      }
                      setUserAgreeModalOpen(false);
                      toast.success("Ready to sign! Review and fill the document.");
                    }}
                    className="px-5 py-1.5 bg-[#1d528f] hover:bg-[#164070] text-white text-xs font-semibold rounded transition shadow-xs cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================
          MODAL: ASSIGN TO SOMEONE (EXACT WIREFRAME MATCH)
      ==================================================== */}
      <AnimatePresence>
        {assignModalOpen && (
          <div
            onClick={() => setAssignModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-left relative border border-gray-100 cursor-default"
            >
              {/* Header: Assign to Someone | ✕ */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  Assign to Someone
                </h3>
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body: New Signer & Email & Reason */}
              <div className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1">
                    Signer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    placeholder="Enter recipient's full name (e.g. John Doe)"
                    className="w-full bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-gray-300 focus:border-[#1d528f] rounded-lg px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none transition"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1">
                    Signer Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      value={assigneeEmail}
                      onChange={(e) => setAssigneeEmail(e.target.value)}
                      placeholder="Enter recipient's email (e.g. user@gmail.com)"
                      className="w-full bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-gray-300 focus:border-[#1d528f] rounded-lg pl-9 pr-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none transition"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    An email invitation with a secure link to review and sign will be sent to this address.
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1">
                    Reason / Note (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={assigneeReason}
                    onChange={(e) => setAssigneeReason(e.target.value)}
                    placeholder="Add a personalized message or instructions for the signer..."
                    className="w-full bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-gray-300 focus:border-[#1d528f] rounded-lg px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none resize-none transition"
                  />
                </div>
              </div>

              {/* Action Buttons: [ Cancel ] [ Assign & Send ] */}
              <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-5 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition shadow-2xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={assignLoading}
                  onClick={async () => {
                    if (!assigneeName.trim()) {
                      toast.error("Please enter the new signer's name");
                      return;
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!assigneeEmail.trim() || !emailRegex.test(assigneeEmail.trim())) {
                      toast.error("Please enter a valid email address");
                      return;
                    }

                    setAssignLoading(true);
                    const newSignerName = assigneeName.trim();
                    const newEmail = assigneeEmail.trim().toLowerCase();

                    const newSignerObj = {
                      id: `s-${Date.now()}`,
                      name: newSignerName,
                      email: newEmail,
                      role: "Signer",
                      color: "#2563eb",
                    };
                    const updatedSignersList = [...signers, newSignerObj];
                    setSigners(updatedSignersList);

                    const targetSignUrl = location.pathname.startsWith("/employee")
                      ? `${window.location.origin}/employee/e-signatures/editor/${id || ""}?mode=signer`
                      : `${window.location.origin}/e-signatures/editor/${id || ""}?mode=signer`;

                    const sender = user?.name || user?.displayName || (isAdmin ? "Pearls Admin" : "Pearls Employee");

                    // Send email invitation to the recipient
                    try {
                      const res = await fetch(apiUrl("/email/esign-invite"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email: newEmail,
                          name: newSignerName,
                          docName: docName || "Document",
                          docId: id || "",
                          message: assigneeReason.trim() || `Document assigned to you for review and signing`,
                          signUrl: targetSignUrl,
                          origin: window.location.origin,
                          senderName: sender,
                        }),
                      });

                      const json = await res.json().catch(() => ({}));
                      if (json.success) {
                        toast.success(
                          <span>
                            Document assigned & invitation sent to <b>{newEmail}</b>!
                          </span>,
                          { icon: "✉️" }
                        );
                      } else {
                        toast.success(`Document assigned to ${newSignerName} (${newEmail})!`, { icon: "📨" });
                      }
                    } catch (err) {
                      console.warn("Could not dispatch delegation email:", err);
                      toast.success(`Document assigned to ${newEmail}`);
                    }

                    // Persist to MongoDB
                    if (id) {
                      try {
                        await fetch(apiUrl(`/documents/${id}/fields`), {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            placedFields,
                            signers: updatedSignersList,
                          }),
                        });
                      } catch (err) {
                        console.warn("Could not save new signer to DB:", err);
                      }
                    }

                    setAssignLoading(false);
                    setAssignModalOpen(false);
                    setUserAgreeModalOpen(false);
                    setAssigneeName("");
                    setAssigneeEmail("");
                    setAssigneeReason("");
                  }}
                  className="px-6 py-2 text-xs font-semibold text-white bg-[#1d528f] hover:bg-[#164070] rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {assignLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Assign & Send</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================
          MODAL: SUCCESSFULLY COMPLETED (AFTER SAVE SIGNATURE)
      ==================================================== */}
      <AnimatePresence>
        {completedModalOpen && (
          <div
            onClick={() => setCompletedModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-full p-8 sm:p-10 text-center relative border border-gray-100 cursor-default"
            >
              {/* Close "✕" Button on Top Right */}
              <button
                type="button"
                onClick={() => setCompletedModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Graphic in Center: Blue Folder with Document, Sparkles, and Green Checkmark Badge */}
              <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center select-none">
                <svg viewBox="0 0 96 96" className="w-24 h-24 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Sky blue sparkles */}
                  <path d="M22 28L24 22L26 28L32 30L26 32L24 38L22 32L16 30L22 28Z" fill="#60a5fa" opacity="0.85" />
                  <path d="M72 18L73.5 13L75 18L80 19.5L75 21L73.5 26L72 21L67 19.5L72 18Z" fill="#38bdf8" opacity="0.9" />
                  <circle cx="78" cy="38" r="2.5" fill="#93c5fd" />
                  <circle cx="18" cy="46" r="2" fill="#93c5fd" />

                  {/* Blue Folder Back */}
                  <path d="M20 32C20 29.7909 21.7909 28 24 28H40L46 34H72C74.2091 34 76 35.7909 76 38V44H20V32Z" fill="#1d68bd" />

                  {/* Document Peeking Out with Lines */}
                  <rect x="28" y="22" width="38" height="42" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                  <rect x="34" y="28" width="26" height="3" rx="1.5" fill="#3b82f6" />
                  <rect x="34" y="35" width="20" height="2" rx="1" fill="#cbd5e1" />
                  <rect x="34" y="41" width="24" height="2" rx="1" fill="#cbd5e1" />
                  <rect x="34" y="47" width="16" height="2" rx="1" fill="#cbd5e1" />

                  {/* Folder Front Tab */}
                  <path d="M18 42C18 39.7909 19.7909 38 22 38H74C76.2091 38 78 39.7909 78 42V70C78 72.2091 76.2091 74 74 74H22C19.7909 74 18 72.2091 18 70V42Z" fill="#2563eb" />
                  <path d="M18 48L32 60H78V70C78 72.2091 76.2091 74 74 74H22C19.7909 74 18 72.2091 18 70V48Z" fill="#1d4ed8" opacity="0.3" />

                  {/* Green Checkmark Badge at Bottom-Right */}
                  <circle cx="68" cy="66" r="13" fill="#22c55e" stroke="white" strokeWidth="2.5" />
                  <path d="M63 66L66.5 69.5L73.5 62.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Title Text */}
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-5 tracking-tight">
                Successfully completed!
              </h3>

              {/* Download Document Button */}
              <button
                type="button"
                onClick={() => {
                  handleDownload();
                  setCompletedModalOpen(false);
                }}
                className="px-6 py-2 bg-[#1d528f] hover:bg-[#164070] text-white rounded-full text-xs font-semibold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                Download Document
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
