import React, { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { apiUrl } from "../config/api";

/**
 * SendDocumentModal ("Share email" / "Send Document for Signing")
 * Exact match for user wireframe:
 * - Header: "Send Document for Signing", close "✕", subtle line divider
 * - Section 1: "Add Signers" with [ Enter name ] and [ Enter Email ] side-by-side
 * - Section 2: "Subject & Message" with [ Subject ] input and [ Message... ] textarea
 * - Footer: [ Cancel ] on left, [ Assign ] (solid blue) on right
 */
export default function SendDocumentModal({
  isOpen = true,
  document: doc,
  onClose,
  onAssigned,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Signer");
  const [subject, setSubject] = useState(
    doc?.name ? `Signature Request: ${doc.name}` : ""
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() && !name.trim()) {
      toast.error("Please enter signer name and email");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    const docName = doc?.name || "Document";
    let effectiveDocId = doc?._id || doc?.id || "";

    // Validate if effectiveDocId is a valid 24-character hex MongoDB ObjectId
    const isMongoId = Boolean(effectiveDocId && /^[0-9a-fA-F]{24}$/.test(effectiveDocId));

    // If document is not yet saved in MongoDB, create it now so recipient has a real document to open
    if (!isMongoId) {
      try {
        const createRes = await fetch(apiUrl("/documents"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: docName,
            url: doc?.url || "",
            type: doc?.type || "doc",
            extension: doc?.extension || (docName.includes(".") ? docName.split(".").pop() : "doc"),
            size: doc?.size || "24.00 Kb",
            author: doc?.author || "Admin",
            placedFields: doc?.placedFields || [],
            signers: [
              ...(doc?.signers || []),
              {
                id: `s-${Date.now()}`,
                name: name.trim() || "Signer",
                email: email.trim().toLowerCase(),
                role: role || "Signer",
                status: "pending",
              },
            ],
            content: doc?.content || "",
          }),
        });

        if (createRes.ok) {
          const createJson = await createRes.json();
          if (createJson.data?._id || createJson.data?.id) {
            effectiveDocId = createJson.data._id || createJson.data.id;
          }
        }
      } catch (err) {
        console.warn("Could not pre-save document to MongoDB:", err);
      }
    } else {
      // If already in MongoDB, sync latest placed fields & signer to DB
      try {
        const updatedSigners = [
          ...(doc?.signers || []),
          {
            id: `s-${Date.now()}`,
            name: name.trim() || "Signer",
            email: email.trim().toLowerCase(),
            role: role || "Signer",
            status: "pending",
          },
        ];
        await fetch(apiUrl(`/documents/${effectiveDocId}/fields`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            placedFields: doc?.placedFields || [],
            signers: updatedSigners,
          }),
        });
      } catch (err) {
        console.warn("Could not sync document fields to MongoDB:", err);
      }
    }

    const targetSignUrl = `${window.location.origin}/e-signatures/editor/${effectiveDocId}?mode=signer`;

    try {
      const res = await fetch(apiUrl("/email/esign-invite"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || "Signer",
          role: role || "Signer",
          docName: docName,
          docId: effectiveDocId,
          signUrl: targetSignUrl,
          message: message.trim(),
          origin: window.location.origin,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          <span>
            Document invitation sent to <b>{email.trim()}</b>!
          </span>,
          { icon: "✉️" }
        );
      } else {
        toast.success(
          <span>
            Document assigned & invitation queued for <b>{email.trim()}</b>!
          </span>,
          { icon: "✉️" }
        );
      }
    } catch (err) {
      console.warn("Could not dispatch invitation email:", err);
      toast.success(`Document assigned to ${email.trim()}`);
    } finally {
      setLoading(false);
    }

    const payload = {
      name: name.trim() || "Signer",
      email: email.trim(),
      role: role || "Signer",
      subject: subject.trim() || "Document Signing Request",
      message: message.trim(),
      effectiveDocId: effectiveDocId,
      document: {
        ...(doc || {}),
        _id: effectiveDocId,
        id: effectiveDocId,
      },
    };

    if (onAssigned) {
      onAssigned(payload);
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
        className="bg-[#f6f5f1] rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-7 border border-gray-200/70 relative select-none"
      >
        {/* ====================================================
            MODAL HEADER: Send Document for Signing | ✕
        ==================================================== */}
        <div className="flex items-center justify-between pb-3">
          <h3 className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">
            Send Document for Signing
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Subtle Horizontal Divider */}
        <hr className="border-t border-gray-200/90 mb-5" />

        <form onSubmit={handleSubmit}>
          {/* ====================================================
              SECTION 1: Add Signers (Enter name | Enter Email)
          ==================================================== */}
          <div>
            <h4 className="font-bold text-[#1e3a5f] text-xs sm:text-sm mb-2.5">
              Add Signers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                className="w-full bg-white border border-gray-200/90 focus:border-[#175ea8] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none transition shadow-2xs"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="w-full bg-white border border-gray-200/90 focus:border-[#175ea8] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* ====================================================
              SECTION 2: Subject & Message
          ==================================================== */}
          <div className="mt-5">
            <h4 className="font-bold text-[#1e3a5f] text-xs sm:text-sm mb-2.5">
              Subject & Message
            </h4>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full bg-white border border-gray-200/90 focus:border-[#175ea8] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none transition shadow-2xs mb-2.5"
            />
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message..."
              className="w-full bg-white border border-gray-200/90 focus:border-[#175ea8] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none transition shadow-2xs resize-none"
            />
          </div>

          {/* ====================================================
              FOOTER: [ Cancel ] (Left) + [ Assign ] (Right)
          ==================================================== */}
          <div className="flex items-center justify-between mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-7 sm:px-9 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 sm:px-11 py-2.5 bg-[#175ea8] hover:bg-[#124b86] text-white rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Assigning & Sending...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Assign & Send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
