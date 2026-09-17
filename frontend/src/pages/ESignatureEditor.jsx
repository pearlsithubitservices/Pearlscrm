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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function ESignatureEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Document name and metadata
  const docName =
    location.state?.document?.name ||
    (id ? `Document-${id}` : "skills module certificate");

  // Zoom level state: 18% as shown in screenshot, with zoom presets
  const [zoomLevel, setZoomLevel] = useState(18);
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const zoomMenuRef = useRef(null);

  // Active interaction tool: 'select' | 'hand' | 'draw'
  const [activeTool, setActiveTool] = useState("select");

  // Sign & edit / Placed fields layer state
  const [placedFields, setPlacedFields] = useState([
    {
      id: "f-init-1",
      type: "signature",
      label: "Arthur Arthurson",
      x: 62,
      y: 62,
      width: 140,
      height: 48,
      signer: "President",
      signed: true,
      value: "Arthur Arthurson",
      font: "font-dancing",
    },
    {
      id: "f-init-2",
      type: "signature",
      label: "Steven Stevenson",
      x: 37,
      y: 62,
      width: 140,
      height: 48,
      signer: "Chairman",
      signed: true,
      value: "Steven Stevenson",
      font: "font-caveat",
    },
  ]);

  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [draggingFieldId, setDraggingFieldId] = useState(null);
  const canvasContainerRef = useRef(null);

  // Modals state
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [addSignersModalOpen, setAddSignersModalOpen] = useState(false);
  const [askToEditModalOpen, setAskToEditModalOpen] = useState(false);

  // Signature creation state
  const [signatureMode, setSignatureMode] = useState("draw");
  const [typedSigName, setTypedSigName] = useState("Charles Reynolds");
  const [selectedFont, setSelectedFont] = useState("font-caveat");
  const [sigColor, setSigColor] = useState("#0f172a");
  const sigCanvasRef = useRef(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);

  // Signers list
  const [signers, setSigners] = useState([
    { id: "s1", name: "Charles Reynolds", email: "charles@mankato.edu", role: "Recipient", color: "#2563eb" },
    { id: "s2", name: "Steven Stevenson", email: "steven@mankato.edu", role: "Chairman", color: "#16a34a" },
    { id: "s3", name: "Arthur Arthurson", email: "arthur@mankato.edu", role: "President", color: "#9333ea" },
  ]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (zoomMenuRef.current && !zoomMenuRef.current.contains(e.target)) {
        setZoomMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      signer: signers[0].name,
      signed: type === "signature" ? false : undefined,
      value: "",
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

  // Save document
  const handleSave = () => {
    toast.success("Document and signature fields saved successfully!", {
      icon: "💾",
    });
  };

  // Dragging logic on canvas
  const handleMouseDownOnField = (e, fieldId) => {
    e.stopPropagation();
    setSelectedFieldId(fieldId);
    setDraggingFieldId(fieldId);
  };

  const handleMouseMove = (e) => {
    if (!draggingFieldId || !canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 5), 85);
    const y = Math.min(Math.max(((e.clientY - rect.top) / rect.height) * 100, 5), 85);

    setPlacedFields((prev) =>
      prev.map((f) => (f.id === draggingFieldId ? { ...f, x, y } : f))
    );
  };

  const handleMouseUp = () => {
    setDraggingFieldId(null);
  };

  // Signature canvas handlers
  const startDrawing = (e) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = sigColor;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawingSig(true);
  };

  const draw = (e) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawingSig(false);
  };

  const applySignature = () => {
    handleAddField("signature", typedSigName || "My Signature");
    setSignatureModalOpen(false);
    toast.success("Signature stamp placed on document!", { icon: "✍️" });
  };

  return (
    <div
      className="flex flex-col h-screen w-full bg-[#cbd1db] overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Import script fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@600;700&family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Sacramento&display=swap');
        .font-caveat { font-family: 'Caveat', cursive; }
        .font-dancing { font-family: 'Dancing Script', cursive; }
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>

      {/* ====================================================
          TOP NAVBAR: E- signature | skills module certificate
      ==================================================== */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/e-signatures")}
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
              {docName}
            </span>
          </div>
        </div>

        {/* RIGHT TOP ACTIONS: SHARE & SAVE */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShareModalOpen(true)}
            className="px-4 py-1.5 text-xs font-semibold text-[#1e40af] border border-[#2563eb] hover:bg-blue-50 rounded-full transition shadow-2xs cursor-pointer"
          >
            SHARE
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-1.5 text-xs font-semibold text-white bg-[#1d528f] hover:bg-[#164070] rounded-full transition shadow-xs cursor-pointer"
          >
            SAVE
          </button>
        </div>
      </header>

      {/* ====================================================
          MAIN EDITOR BODY: LEFT SIDEBAR + WORKSPACE + RIGHT THUMBNAILS
      ==================================================== */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ==================================================
            LEFT SIDEBAR (SIGN & EDIT / ADD FIELDS)
        ================================================== */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto no-scrollbar z-20">
          {/* SECTION 1: SIGN & EDIT */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              SIGN & EDIT
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSignatureModalOpen(true)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition text-left cursor-pointer group"
              >
                <PenLine size={16} className="text-[#2563eb] group-hover:scale-110 transition" />
                <span>My Signature</span>
              </button>

              <button
                onClick={() => handleAddField("initials", "My Initials")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition text-left cursor-pointer group"
              >
                <Stamp size={16} className="text-gray-500 group-hover:text-blue-600 transition" />
                <span>My Initials</span>
              </button>

              <button
                onClick={() => handleAddField("text", "Text Input")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition text-left cursor-pointer group"
              >
                <Type size={16} className="text-gray-500 group-hover:text-blue-600 transition" />
                <span>Text</span>
              </button>

              <button
                onClick={() =>
                  handleAddField(
                    "date",
                    new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  )
                }
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition text-left cursor-pointer group"
              >
                <Calendar size={16} className="text-gray-500 group-hover:text-blue-600 transition" />
                <span>Date Signed</span>
              </button>

              <button
                onClick={() => handleAddField("checkmark", "✔ Verified")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition text-left cursor-pointer group"
              >
                <CheckSquare size={16} className="text-gray-500 group-hover:text-blue-600 transition" />
                <span>Checkmark</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: ADD FIELDS */}
          <div className="p-4 flex-1">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              ADD FIELDS
            </h3>

            {/* + Add Signers button */}
            <button
              onClick={() => setAddSignersModalOpen(true)}
              className="w-full flex items-center gap-1.5 text-xs text-[#2563eb] hover:text-blue-800 font-semibold mb-3 py-1 cursor-pointer"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>Add Signers</span>
            </button>

            <div className="space-y-0.5">
              {[
                { icon: FileSignature, label: "Signature Field", type: "signature" },
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
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleAddField(item.type, item.label)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-gray-100 hover:text-blue-700 transition text-left cursor-pointer group"
                >
                  <item.icon size={15} className="text-gray-400 group-hover:text-blue-600 transition shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ==================================================
            CENTER CANVAS WORKSPACE
        ================================================== */}
        <main className="flex-1 flex flex-col items-center justify-center relative p-6 sm:p-10 overflow-auto bg-[#c5cbcf]">
          {/* FLOATING TOP CANVAS CONTROLS (18% ⌄, Fit icon, 3 dots) */}
          <div className="absolute top-4 right-28 bg-white/95 backdrop-blur-xs border border-gray-200 rounded-xl shadow-md px-3 py-1.5 flex items-center gap-3 z-30">
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

            {/* Fit View Icon */}
            <button
              onClick={() => setZoomLevel(18)}
              className="text-gray-500 hover:text-gray-800 p-0.5 transition cursor-pointer"
              title="Fit to page"
            >
              <Maximize2 size={14} />
            </button>

            {/* Three Dots Menu */}
            <button
              onClick={() => toast("Export as PDF or print available in menu")}
              className="text-gray-500 hover:text-gray-800 p-0.5 transition cursor-pointer"
              title="Options"
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
            className="relative bg-white shadow-2xl rounded-sm border-8 border-[#0c4a7e] w-[720px] max-w-[92vw] aspect-[1.414/1] p-8 sm:p-10 transition-transform duration-200 flex flex-col justify-between overflow-hidden"
          >
            {/* INNER BORDER ORNAMENTS */}
            <div className="absolute inset-2 border-2 border-[#d4af37] pointer-events-none" />

            {/* GOLD CORNER ACCENTS */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#d4af37] via-[#f3e5ab] to-transparent clip-corner pointer-events-none opacity-90" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#0c4a7e] to-transparent pointer-events-none opacity-80" />

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
              <h3 className="font-cinzel font-bold text-xl sm:text-2xl text-[#0c4a7e] tracking-widest border-b border-gray-300 pb-1.5 inline-block min-w-[280px]">
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

            {/* ==================================================
                PLACED INTERACTIVE FIELDS OVERLAY
            ================================================== */}
            {placedFields.map((field) => {
              const isSelected = selectedFieldId === field.id;

              return (
                <div
                  key={field.id}
                  onMouseDown={(e) => handleMouseDownOnField(e, field.id)}
                  style={{
                    left: `${field.x}%`,
                    top: `${field.y}%`,
                  }}
                  className={`absolute cursor-move transition-shadow z-20 group ${
                    isSelected
                      ? "ring-2 ring-blue-500 shadow-lg"
                      : "hover:ring-1 hover:ring-blue-300"
                  }`}
                >
                  <div className="bg-white/90 backdrop-blur-xs border border-blue-400 rounded-lg px-3 py-1.5 flex items-center gap-2 min-w-[120px] shadow-xs">
                    {field.type === "signature" ? (
                      <div className="flex-1">
                        <span className="font-caveat text-xl text-blue-900 leading-none">
                          {field.value || field.label}
                        </span>
                        <span className="text-[8px] text-blue-600 block uppercase font-sans">
                          Signer: {field.signer}
                        </span>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-gray-800">
                          {field.label}
                        </span>
                      </div>
                    )}

                    {/* Delete button when selected */}
                    {isSelected && (
                      <button
                        onClick={(e) => handleDeleteField(field.id, e)}
                        className="text-red-400 hover:text-red-600 p-0.5 rounded cursor-pointer"
                        title="Remove field"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ====================================================
              BOTTOM FLOATING TOOLBAR DOCK
          ==================================================== */}
          <div className="absolute bottom-5 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2 z-40">
            {/* Selection Tool */}
            <button
              onClick={() => setActiveTool("select")}
              className={`p-2 rounded-xl transition cursor-pointer ${
                activeTool === "select"
                  ? "bg-blue-50 text-blue-600 shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Select / Move"
            >
              <MousePointer size={16} />
            </button>

            {/* Hand / Pan Tool */}
            <button
              onClick={() => setActiveTool("hand")}
              className={`p-2 rounded-xl transition cursor-pointer ${
                activeTool === "hand"
                  ? "bg-[#2563eb] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Hand Tool"
            >
              <Hand size={16} />
            </button>

            {/* Zoom Tool */}
            <button
              onClick={() => setZoomLevel((prev) => (prev >= 100 ? 18 : prev + 25))}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>

            {/* Ask to edit blue pill button */}
            <button
              onClick={() => setAskToEditModalOpen(true)}
              className="px-4 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              Ask to edit
            </button>

            <div className="w-[1px] h-5 bg-gray-200 mx-1" />

            {/* Annotation / Draw Tools */}
            <button
              onClick={() => handleAddField("signature", "My Signature")}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-xl transition cursor-pointer"
              title="Pen / Signature"
            >
              <PenTool size={16} />
            </button>

            <button
              onClick={() => handleAddField("text", "Highlighted Note")}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-xl transition cursor-pointer"
              title="Highlighter"
            >
              <Highlighter size={16} />
            </button>

            <button
              onClick={() => handleAddField("checkmark", "Approved")}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-xl transition cursor-pointer"
              title="Stamp"
            >
              <Stamp size={16} />
            </button>

            <button
              onClick={() => toast("Code / template markup view")}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-xl transition cursor-pointer"
              title="Inspect"
            >
              <Code size={16} />
            </button>
          </div>
        </main>

        {/* ==================================================
            RIGHT PAGE THUMBNAILS PANEL
        ================================================== */}
        <aside className="w-40 bg-white border-l border-gray-200 p-4 flex flex-col items-center shrink-0 z-20">
          <div className="flex flex-col items-center group cursor-pointer">
            {/* Page 1 Mini Preview */}
            <div className="w-28 h-20 bg-white rounded border-2 border-[#2563eb] shadow-md p-1.5 flex flex-col justify-between overflow-hidden relative group-hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div className="w-3 h-3 rounded-full bg-[#d4af37]" />
                <div className="h-1 w-12 bg-gray-300 rounded" />
              </div>
              <div className="h-1.5 w-16 bg-[#0c4a7e] mx-auto rounded" />
              <div className="space-y-0.5">
                <div className="h-0.5 w-full bg-gray-200 rounded" />
                <div className="h-0.5 w-4/5 bg-gray-200 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-1 w-6 bg-gray-400 rounded" />
                <div className="h-1 w-6 bg-gray-400 rounded" />
              </div>
            </div>
            <span className="text-xs font-bold text-gray-800 mt-2">1</span>
          </div>

          {/* Add Page Button */}
          <button
            onClick={() => toast("Added page 2 to document", { icon: "📄" })}
            className="mt-6 flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 font-medium transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Page</span>
          </button>
        </aside>
      </div>

      {/* ====================================================
          MODAL: MY SIGNATURE DRAW / TYPE
      ==================================================== */}
      <AnimatePresence>
        {signatureModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center">
                    <PenLine size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Create Signature</h3>
                </div>
                <button
                  onClick={() => setSignatureModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mt-4 p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setSignatureMode("draw")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    signatureMode === "draw" ? "bg-white text-blue-600 shadow-xs" : "text-gray-600"
                  }`}
                >
                  Draw
                </button>
                <button
                  onClick={() => setSignatureMode("type")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    signatureMode === "type" ? "bg-white text-blue-600 shadow-xs" : "text-gray-600"
                  }`}
                >
                  Type
                </button>
              </div>

              {signatureMode === "draw" ? (
                <div className="mt-4 border-2 border-dashed border-gray-300 rounded-2xl p-2 bg-gray-50/50">
                  <canvas
                    ref={sigCanvasRef}
                    width={440}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    className="w-full h-36 bg-white rounded-xl touch-none cursor-crosshair"
                  />
                  <div className="flex justify-end mt-1">
                    <button
                      onClick={() => {
                        const c = sigCanvasRef.current;
                        if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
                      }}
                      className="text-xs text-red-500 font-medium cursor-pointer hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={typedSigName}
                    onChange={(e) => setTypedSigName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="Type name here"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Caveat", cls: "font-caveat" },
                      { name: "Dancing", cls: "font-dancing" },
                    ].map((f) => (
                      <div
                        key={f.cls}
                        onClick={() => setSelectedFont(f.cls)}
                        className={`p-2.5 rounded-xl border-2 text-center cursor-pointer ${
                          selectedFont === f.cls ? "border-blue-600 bg-blue-50/40" : "border-gray-200"
                        }`}
                      >
                        <p className={`${f.cls} text-2xl text-gray-900 truncate`}>
                          {typedSigName || "Signature"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setSignatureModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={applySignature}
                  className="px-5 py-2 text-xs font-semibold bg-[#2563eb] text-white rounded-xl shadow-xs hover:bg-blue-700"
                >
                  Insert Signature
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================
          MODAL: SHARE & SIGNERS
      ==================================================== */}
      <AnimatePresence>
        {shareModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Share2 size={18} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-base">Share Document</h3>
                </div>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Send via Email
                  </label>
                  <input
                    type="email"
                    placeholder="signer@example.com"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Current Signers
                  </label>
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden text-xs">
                    {signers.map((s) => (
                      <div key={s.id} className="p-2 flex items-center justify-between bg-gray-50/50">
                        <div>
                          <p className="font-semibold text-gray-800">{s.name}</p>
                          <p className="text-[10px] text-gray-500">{s.email}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                          {s.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShareModalOpen(false);
                    toast.success("Document link and invitations sent!", { icon: "🚀" });
                  }}
                  className="px-5 py-2 text-xs font-semibold bg-[#2563eb] text-white rounded-xl shadow-xs hover:bg-blue-700"
                >
                  Send Invitations
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================
          MODAL: ADD SIGNERS
      ==================================================== */}
      <AnimatePresence>
        {addSignersModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">Add New Signer</h3>
                <button
                  onClick={() => setAddSignersModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = e.target.signerName.value;
                  const email = e.target.signerEmail.value;
                  const role = e.target.signerRole.value;
                  if (!name || !email) return;

                  setSigners((prev) => [
                    ...prev,
                    { id: `s-${Date.now()}`, name, email, role, color: "#e11d48" },
                  ]);
                  setAddSignersModalOpen(false);
                  toast.success(`Added ${name} as signer`);
                }}
                className="mt-4 space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Signer Full Name
                  </label>
                  <input
                    name="signerName"
                    required
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    name="signerEmail"
                    type="email"
                    required
                    placeholder="jane@example.com"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Role / Position
                  </label>
                  <input
                    name="signerRole"
                    defaultValue="Signer"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setAddSignersModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-[#2563eb] text-white rounded-xl shadow-xs hover:bg-blue-700"
                  >
                    Add Signer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
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
    </div>
  );
}
