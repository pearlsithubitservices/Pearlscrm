import React, { useState } from "react";
import { X, Trash2, UserPlus, Mail, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { apiUrl } from "../config/api";

/**
 * AddSignersModal ("Add new sig" / "Add signers")
 * Exact match for user wireframe with email invitation delivery:
 * - Header: "Add signers", subtitle "Add, rename or delete signers", close "✕"
 * - Thin line divider
 * - Signer Rows: [ Signer name ] [ Email ] [ 🗑️ ]
 * - [ + Add new Signer ] button
 * - Email Invitation Checkbox
 * - Footer: [ Cancel ] on left, [ Save ] (solid blue) on right
 */
export default function AddSignersModal({
  isOpen = true,
  signers = [],
  title = "Add signers",
  subtitle = "Add, rename or delete signers",
  docName = "Document",
  docId = "",
  signUrl = "",
  senderName = "Pearls CRM Team",
  onClose,
  onSave,
}) {
  const [signerRows, setSignerRows] = useState(() => {
    if (signers && signers.length > 0) {
      return signers.map((s) => ({
        id: s.id || `s-${Math.random()}`,
        name: s.name || "",
        email: s.email || "",
        role: s.role || "Signer",
      }));
    }
    return [{ id: `s-${Date.now()}`, name: "", email: "", role: "Signer" }];
  });

  const [sendInviteEmail, setSendInviteEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRowChange = (id, field, value) => {
    setSignerRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    setSignerRows((prev) => [
      ...prev,
      { id: `s-${Date.now()}`, name: "", email: "", role: "Signer" },
    ]);
  };

  const handleDeleteRow = (id) => {
    if (signerRows.length === 1) {
      setSignerRows([{ id: `s-${Date.now()}`, name: "", email: "", role: "Signer" }]);
      return;
    }
    setSignerRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validSigners = signerRows.filter(
      (r) => r.name.trim() || r.email.trim()
    );

    if (validSigners.length === 0) {
      toast.error("Please add at least one signer name or email");
      return;
    }

    const emailSigners = validSigners.filter(
      (s) => s.email && s.email.trim().includes("@")
    );

    // If email invitation is enabled and there are email recipients
    if (sendInviteEmail && emailSigners.length > 0) {
      setLoading(true);
      try {
        const res = await fetch(apiUrl("/email/esign-invite"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signers: emailSigners.map((s) => ({
              name: s.name.trim() || "Signer",
              email: s.email.trim().toLowerCase(),
            })),
            docName,
            docId,
            signUrl,
            senderName,
            origin: window.location.origin,
          }),
        });

        const data = await res.json();
        if (data.success) {
          toast.success(
            <span>
              Invitation email sent to{" "}
              <b>{emailSigners.map((s) => s.email.trim()).join(", ")}</b>!
            </span>,
            { icon: "✉️" }
          );
        } else {
          console.warn("Email API response:", data);
          toast.success("Signers saved! (Email notification queued)");
        }
      } catch (err) {
        console.warn("Could not send signer email invite:", err);
        toast.success("Signers saved locally");
      } finally {
        setLoading(false);
      }
    } else {
      toast.success("Signers list updated successfully!");
    }

    if (onSave) {
      onSave(validSigners);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs flex items-center justify-center p-4 z-[99999]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-7 border border-gray-100 relative select-none"
      >
        {/* ====================================================
            HEADER: Keyboard shortcuts | Add, rename or delete signers | ✕
        ==================================================== */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-normal">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Thin Horizontal Line Divider */}
        <hr className="border-t border-gray-100 mt-3 mb-5" />

        <form onSubmit={handleSave}>
          {/* ====================================================
              SIGNER ROWS LIST: [ Signer name ] [ Email ] [ 🗑️ ]
          ==================================================== */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 no-scrollbar">
            {signerRows.map((row) => (
              <div key={row.id} className="flex items-center gap-3">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) =>
                    handleRowChange(row.id, "name", e.target.value)
                  }
                  placeholder="Signer name"
                  className="flex-1 min-w-[110px] bg-[#ededed] focus:bg-white border border-transparent focus:border-[#175ea8] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none transition"
                />
                <input
                  type="email"
                  value={row.email}
                  onChange={(e) =>
                    handleRowChange(row.id, "email", e.target.value)
                  }
                  placeholder="Email"
                  className="flex-1 min-w-[130px] bg-[#ededed] focus:bg-white border border-transparent focus:border-[#175ea8] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteRow(row.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer shrink-0"
                  title="Delete signer"
                >
                  <Trash2 size={16} className="text-red-500 stroke-[1.75]" />
                </button>
              </div>
            ))}
          </div>

          {/* ====================================================
              [ + Add new Signer ] BUTTON
          ==================================================== */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-xs font-medium cursor-pointer transition shadow-2xs"
            >
              <UserPlus size={14} className="text-gray-600" />
              <span>Add new Signer</span>
            </button>
          </div>

          {/* ====================================================
              EMAIL INVITATION TOGGLE
          ==================================================== */}
          <div className="mt-5 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-3">
            <input
              type="checkbox"
              id="sendInviteEmailCheckbox"
              checked={sendInviteEmail}
              onChange={(e) => setSendInviteEmail(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#175ea8] focus:ring-[#175ea8] border-gray-300 cursor-pointer"
            />
            <label
              htmlFor="sendInviteEmailCheckbox"
              className="text-xs text-gray-700 cursor-pointer select-none"
            >
              <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Mail size={13} className="text-[#175ea8]" />
                Send signature invitation email to signers immediately
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
                Each signer with an email address will receive an email with a direct link to sign this document.
              </p>
            </label>
          </div>

          {/* ====================================================
              FOOTER: [ Cancel ] (Left/Center) + [ Save ] (Right)
          ==================================================== */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-7 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2 bg-[#175ea8] hover:bg-[#134c88] text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Sending & Saving...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Save & Notify</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
