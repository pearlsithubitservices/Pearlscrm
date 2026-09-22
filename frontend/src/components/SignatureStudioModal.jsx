import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// 6 Handwriting cursive fonts matching the 3x2 grid in the screenshot
export const SIGNATURE_FONTS = [
  { id: "dancing", name: "Dancing Script", className: "font-dancing" },
  { id: "sacramento", name: "Sacramento", className: "font-sacramento" },
  { id: "caveat", name: "Caveat", className: "font-caveat" },
  { id: "alexbrush", name: "Alex Brush", className: "font-alexbrush" },
  { id: "greatvibes", name: "Great Vibes", className: "font-greatvibes" },
  { id: "allura", name: "Allura", className: "font-allura" },
];

export const INK_COLORS = [
  { id: "black", color: "#000000" },
  { id: "blue", color: "#1d68bd" },
  { id: "green", color: "#16a34a" },
];

/**
 * SignatureStudioModal
 * Matches the user's provided screenshots faithfully:
 * - Header: "Keyboard shortcuts" on left, Tabs ("Type", "Draw", "Upload"), Close "✕" on right
 * - Type: text input + 6 font preview cards (3x2 grid)
 * - Draw: dashed canvas area + "Clear" button
 * - Upload: dashed dropzone ("Drop files here or Click to upload")
 * - Bottom row: 3 color dots (Black, Blue, Green) + [ Cancel ] + [ Sign ] buttons
 */
export default function SignatureStudioModal({
  isOpen = true,
  document: doc,
  onClose,
  onSigned,
  initialName = "Type your name here",
}) {
  // Mode: "type" | "draw" | "upload"
  const [activeTab, setActiveTab] = useState("type");

  // Type signature state
  const [typedName, setTypedName] = useState(
    initialName === "Type your name here" ? "Type your name here" : initialName
  );
  const [selectedFontIndex, setSelectedFontIndex] = useState(0);

  useEffect(() => {
    if (initialName && initialName !== "Type your name here") {
      setTypedName(initialName);
    }
  }, [initialName]);

  // Ink color state (Black, Blue, Green)
  const [inkColor, setInkColor] = useState("#000000");

  // Drawing canvas state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Upload image state
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize canvas drawing settings when switching to "draw" or changing ink color
  useEffect(() => {
    if (activeTab !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = inkColor;
  }, [activeTab, inkColor]);

  // Handle freehand drawing
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);
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
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Handle image upload
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please upload an image file (.png, .jpg)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result);
      toast.success("Signature image uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  // Convert typed text to PNG DataURL for seamless document embedding
  const renderTypedSignatureDataUrl = (text, fontName, color) => {
    const offscreen = window.document.createElement("canvas");
    offscreen.width = 400;
    offscreen.height = 120;
    const ctx = offscreen.getContext("2d");
    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    ctx.font = `48px "${fontName}", cursive`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, offscreen.width / 2, offscreen.height / 2);
    return offscreen.toDataURL("image/png");
  };

  // Submit Signature
  const handleSignSubmit = () => {
    let signatureResult = null;

    if (activeTab === "type") {
      const selectedFont = SIGNATURE_FONTS[selectedFontIndex];
      const name = typedName.trim() || "Signature";
      const dataUrl = renderTypedSignatureDataUrl(name, selectedFont.name, inkColor);

      signatureResult = {
        type: "type",
        text: name,
        font: selectedFont.className,
        fontName: selectedFont.name,
        color: inkColor,
        dataUrl,
      };
    } else if (activeTab === "draw") {
      if (!hasDrawn && canvasRef.current) {
        toast.error("Please draw your signature first or choose Type");
        return;
      }
      const dataUrl = canvasRef.current.toDataURL("image/png");
      signatureResult = {
        type: "draw",
        text: "Drawn Signature",
        color: inkColor,
        dataUrl,
      };
    } else if (activeTab === "upload") {
      if (!uploadedImage) {
        toast.error("Please upload an image of your signature first");
        return;
      }
      signatureResult = {
        type: "upload",
        text: "Uploaded Signature",
        dataUrl: uploadedImage,
      };
    }

    if (onSigned) {
      onSigned(doc, signatureResult);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-[99999]">
      {/* Import Signature Script Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Allura&family=Caveat:wght@600;700&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Sacramento&display=swap');
        .font-dancing { font-family: 'Dancing Script', cursive; }
        .font-sacramento { font-family: 'Sacramento', cursive; }
        .font-caveat { font-family: 'Caveat', cursive; }
        .font-alexbrush { font-family: 'Alex Brush', cursive; }
        .font-greatvibes { font-family: 'Great Vibes', cursive; }
        .font-allura { font-family: 'Allura', cursive; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 relative border border-gray-100"
      >
        {/* ====================================================
            HEADER: Keyboard shortcuts | Type | Draw | Upload | ✕
        ==================================================== */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          {/* Left Title: Keyboard shortcuts */}
          <h3 className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">
            Keyboard shortcuts
          </h3>

          {/* Right: Tabs (Type, Draw, Upload) + Close button */}
          <div className="flex items-center gap-5 sm:gap-7">
            <button
              type="button"
              onClick={() => setActiveTab("type")}
              className={`text-sm transition cursor-pointer pb-0.5 ${
                activeTab === "type"
                  ? "text-[#1d68bd] font-medium border-b-2 border-[#1d68bd]"
                  : "text-gray-600 hover:text-gray-900 font-normal"
              }`}
            >
              Type
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("draw")}
              className={`text-sm transition cursor-pointer pb-0.5 ${
                activeTab === "draw"
                  ? "text-[#1d68bd] font-medium border-b-2 border-[#1d68bd]"
                  : "text-gray-600 hover:text-gray-900 font-normal"
              }`}
            >
              Draw
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`text-sm transition cursor-pointer pb-0.5 ${
                activeTab === "upload"
                  ? "text-[#1d68bd] font-medium border-b-2 border-[#1d68bd]"
                  : "text-gray-600 hover:text-gray-900 font-normal"
              }`}
            >
              Upload
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer ml-1 transition"
              aria-label="Close signature modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ====================================================
            TAB 1: TYPE SIGNATURE
        ==================================================== */}
        {activeTab === "type" && (
          <div className="mt-4">
            {/* Input field */}
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              onFocus={(e) => {
                if (e.target.value === "Type your name here") {
                  setTypedName("");
                }
              }}
              placeholder="Type your name here"
              className="w-full bg-[#f0f0f0] hover:bg-[#eaeaea] focus:bg-white border border-gray-200 focus:border-[#1d68bd] rounded-md px-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none transition"
            />

            {/* 6 Signature preview cards (3x2 grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 mt-4">
              {SIGNATURE_FONTS.map((font, idx) => {
                const isSelected = selectedFontIndex === idx;

                return (
                  <div
                    key={font.id}
                    onClick={() => setSelectedFontIndex(idx)}
                    className={`rounded-md p-4 sm:p-5 flex items-center justify-center min-h-[72px] cursor-pointer transition select-none bg-white ${
                      isSelected
                        ? "border-2 border-[#1d68bd] bg-blue-50/20 shadow-xs"
                        : "border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p
                      style={{ color: inkColor }}
                      className={`${font.className} text-xl sm:text-2xl text-center truncate max-w-full`}
                    >
                      {typedName.trim() || "Type your name here"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 2: DRAW SIGNATURE
        ==================================================== */}
        {activeTab === "draw" && (
          <div className="mt-4">
            <div className="relative border border-dashed border-gray-300 rounded-lg bg-white p-2 min-h-[220px] sm:min-h-[260px] flex items-center justify-center">
              {/* Clear button on top-right */}
              <button
                type="button"
                onClick={handleClearCanvas}
                className="absolute top-3 right-3 px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 rounded text-xs font-medium cursor-pointer shadow-2xs transition z-10"
              >
                Clear
              </button>

              <canvas
                ref={canvasRef}
                width={640}
                height={250}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-56 sm:h-64 cursor-crosshair touch-none bg-transparent"
              />
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 3: UPLOAD SIGNATURE
        ==================================================== */}
        {activeTab === "upload" && (
          <div className="mt-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border border-dashed rounded-lg bg-white p-12 sm:p-16 text-center flex flex-col items-center justify-center min-h-[220px] sm:min-h-[260px] cursor-pointer transition ${
                isDragging
                  ? "border-blue-500 bg-blue-50/20"
                  : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadedImage ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={uploadedImage}
                    alt="Signature preview"
                    className="max-h-36 max-w-xs object-contain p-1 border border-gray-200 rounded-md bg-white shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedImage(null);
                    }}
                    className="text-xs text-red-500 hover:underline cursor-pointer font-medium"
                  >
                    Remove / Choose another
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-normal text-gray-900">
                    Drop files here or{" "}
                    <span className="text-[#1d68bd] underline font-medium cursor-pointer">
                      Click to upload
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload an image of your signature
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            BOTTOM ACTIONS ROW: COLOR DOTS (LEFT) + CANCEL & SIGN (RIGHT)
        ==================================================== */}
        <div className="flex items-center justify-between mt-6 pt-2">
          {/* Left: 3 Color Dots (Black, Blue, Green) */}
          <div className="flex items-center gap-2.5">
            {activeTab !== "upload" &&
              INK_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setInkColor(c.color)}
                  style={{ backgroundColor: c.color }}
                  className={`w-5 h-5 rounded-full transition cursor-pointer ${
                    inkColor === c.color
                      ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                      : "hover:scale-105 opacity-90"
                  }`}
                  aria-label={`Select ${c.id} ink color`}
                />
              ))}
          </div>

          {/* Right: [ Save ] [ Sign ] Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSignSubmit}
              className="px-5 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-md text-xs font-medium cursor-pointer transition shadow-2xs"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleSignSubmit}
              className="px-6 py-2 bg-[#1d528f] hover:bg-[#164070] text-white rounded-md text-xs font-semibold cursor-pointer transition shadow-xs"
            >
              Sign
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
