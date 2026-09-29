import React from "react";
import { Plus } from "lucide-react";
import { DOCUMENT_TEMPLATES } from "./documentData";

/**
 * Renders the 4 document creation template cards:
 * DOC (Word), XLS (Excel), PPT (PowerPoint), BOARD (Collaboration Board)
 * Each card features the distinctive folded paper graphic, badge, and circular '+' button.
 */
export default function DocumentTemplates({ onSelectTemplate }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {DOCUMENT_TEMPLATES.map((tpl) => (
        <div
          key={tpl.id}
          onClick={() => onSelectTemplate && onSelectTemplate(tpl)}
          className={`${tpl.cardBg} ${tpl.cardBorder} border rounded-2xl p-6 flex flex-col items-center justify-between cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group`}
        >
          {/* Document Sheet Graphic with Folded Corner */}
          <div className="relative w-28 h-36 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200">
            {/* Folded Top-Right Corner */}
            <div
              className="absolute top-0 right-0 w-6 h-6 rounded-bl-lg shadow-sm"
              style={{
                background: `linear-gradient(135deg, transparent 50%, ${tpl.foldedCornerColor || "#cbd5e1"} 50%)`,
              }}
            />
            {/* Cut-out background to give realistic paper fold */}
            <div
              className="absolute top-0 right-0 w-6 h-6"
              style={{
                clipPath: "polygon(0 0, 100% 100%, 100% 0)",
                backgroundColor: "inherit",
              }}
            />

            {/* Special decorative preview for BOARD */}
            {tpl.id === "board" && (
              <div className="absolute inset-2 grid grid-cols-3 gap-1 opacity-20 pointer-events-none">
                <div className="bg-teal-400 rounded-sm"></div>
                <div className="bg-teal-400 rounded-sm"></div>
                <div className="bg-teal-400 rounded-sm"></div>
                <div className="bg-teal-400 rounded-sm"></div>
                <div className="bg-teal-400 rounded-sm"></div>
                <div className="bg-teal-400 rounded-sm"></div>
              </div>
            )}

            {/* Template Badge (DOC, XLS, PPT, BOARD) */}
            <div
              className={`${tpl.badgeBg} text-white font-extrabold text-sm tracking-wider px-3.5 py-1.5 rounded-lg shadow-sm z-10`}
            >
              {tpl.badgeText}
            </div>
          </div>

          {/* Circular Action Plus Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectTemplate && onSelectTemplate(tpl);
            }}
            title={`Create new ${tpl.title}`}
            className={`w-10 h-10 rounded-full ${tpl.buttonBg} text-white flex items-center justify-center shadow-md transition-all duration-150 hover:scale-110 active:scale-95`}
          >
            <Plus size={20} strokeWidth={2.6} />
          </button>
        </div>
      ))}
    </div>
  );
}
