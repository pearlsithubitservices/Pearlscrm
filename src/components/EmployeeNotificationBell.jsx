import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  Info,
  CheckCheck,
  Trash2,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import useNotification from "../Hooks/useNotification";

// Visual config + display order per notification type/module.
// Each module (Leave / Payroll / Benefits) gets its own section
// in the panel instead of one mixed list.
const MODULE_CONFIG = [
  { key: "Leave", label: "Leave Management", icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50", ring: "border-blue-100" },
  { key: "Payroll", label: "Payroll", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50", ring: "border-emerald-100" },
  { key: "Benefits", label: "Benefits", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50", ring: "border-purple-100" },
  { key: "Other", label: "Other Alerts", icon: Info, color: "text-gray-600", bg: "bg-gray-100", ring: "border-gray-200" },
];

const KNOWN_KEYS = ["Leave", "Payroll", "Benefits"];

/**
 * Employee-side notification bell.
 *
 * IMPORTANT: the dropdown panel is rendered through a React Portal
 * straight into document.body and positioned with `fixed` coordinates
 * computed from the bell button's own position. This is required
 * because the bell lives inside the sidebar, and the sidebar container
 * uses `overflow-hidden` (for its own scroll/rounded-corner styling) —
 * an ordinary `absolute` dropdown nested inside it would get visually
 * clipped/hidden, which is why clicking the icon looked like it
 * "did nothing". Rendering outside that DOM subtree avoids the clipping
 * entirely, regardless of any parent's overflow or z-index.
 */
export default function EmployeeNotificationBell({ employeeId, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState({}); // { Leave: false, Payroll: false, ... }
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const prevCountRef = useRef(0);

  const {
    notifications,
    loading,
    fetchNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
  } = useNotification(employeeId);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Group notifications by module so each has its own separate section
  const grouped = useMemo(() => {
    const buckets = { Leave: [], Payroll: [], Benefits: [], Other: [] };
    notifications.forEach((n) => {
      const key = KNOWN_KEYS.includes(n.notificationType) ? n.notificationType : "Other";
      buckets[key].push(n);
    });
    return buckets;
  }, [notifications]);

  // Toast a live popup whenever a brand-new notification arrives while closed
  useEffect(() => {
    if (notifications.length > prevCountRef.current && prevCountRef.current !== 0) {
      const latest = notifications[0];
      if (latest && !isOpen) {
        toast(`${latest.notificationType ? `[${latest.notificationType}] ` : ""}${latest.title || "New notification"}`, {
          icon: "🔔",
        });
      }
    }
    prevCountRef.current = notifications.length;
  }, [notifications, isOpen]);

  // Recompute the panel position from the button's live position on the
  // screen (works no matter where the bell is mounted: sidebar, topbar, etc.)
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 10,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  };

  const handleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        updatePosition();
        fetchNotification();
      }
      return next;
    });
  };

  // Close on outside click / Escape, and reposition on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  const toggleSection = (key) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            top: coords.top,
            right: coords.right,
            zIndex: 9999,
          }}
          className="w-[24rem] max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-gray-900"
        >
          {/* Header */}
          <div className="p-4 bg-[#0b2b57] text-white flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">Notifications</h3>
              <p className="text-[11px] text-blue-200">Grouped by Leave / Payroll / Benefits</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={markAllAsRead}
                title="Mark all as read"
                className="px-2 py-1.5 rounded-lg text-[11px] font-bold text-blue-100 hover:text-white hover:bg-white/10 flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Module Sections */}
          <div className="max-h-[28rem] overflow-y-auto p-3 space-y-3 bg-[#F8FAFC]">
            {loading ? (
              <div className="py-10 text-center text-xs text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 text-gray-300" />
                <p className="text-xs font-semibold">No notifications yet</p>
              </div>
            ) : (
              MODULE_CONFIG.map((section) => {
                const items = grouped[section.key] || [];
                if (items.length === 0) return null;

                const SectionIcon = section.icon;
                const isCollapsed = !!collapsed[section.key];
                const unreadInSection = items.filter((n) => !n.isRead).length;

                return (
                  <div key={section.key} className={`rounded-xl border ${section.ring} bg-white overflow-hidden`}>
                    {/* Section header — one per module */}
                    <button
                      onClick={() => toggleSection(section.key)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg ${section.bg} flex items-center justify-center shrink-0`}>
                          <SectionIcon className={`w-3.5 h-3.5 ${section.color}`} />
                        </div>
                        <span className="text-xs font-bold text-gray-900 truncate">{section.label}</span>
                        <span className="text-[10px] font-bold text-gray-400">({items.length})</span>
                        {unreadInSection > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 shrink-0 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                      />
                    </button>

                    {/* Section items */}
                    {!isCollapsed && (
                      <div className="px-2 pb-2 space-y-1.5 border-t border-gray-100 pt-2">
                        {items.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => !notif.isRead && markAsRead(notif._id)}
                            className={`p-2.5 rounded-lg bg-[#FAFBFC] border border-gray-100 flex items-start gap-2 cursor-pointer hover:shadow-sm transition ${
                              !notif.isRead ? "ring-1 ring-blue-100" : "opacity-75"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-gray-900 truncate">{notif.title}</p>
                                {!notif.isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                                {notif.sub}
                              </p>
                              <span className="text-[10px] text-gray-400 font-medium block pt-1">
                                {notif.createdAt
                                  ? new Date(notif.createdAt).toLocaleString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      day: "2-digit",
                                      month: "short",
                                    })
                                  : "Just now"}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif._id);
                              }}
                              className="text-gray-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition cursor-pointer shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        title="Notifications"
        className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {typeof document !== "undefined" ? createPortal(panel, document.body) : null}
    </div>
  );
}