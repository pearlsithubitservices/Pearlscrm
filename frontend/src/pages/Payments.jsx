import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  Bell,
  Plus,
  Clock4,
  CircleAlert,
  CircleCheckBig,
  BanknoteArrowUp,
  Trash2,
  Edit2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  XCircle,
  X,
  RotateCcw,
  Check
} from "lucide-react";

import { Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "../components/Pagination";
import AnimateModals from "../components/Dashboard/AnimateModals";
import Createinvoice from "./Createinvoice";
import usePayments from "../Hooks/usePayments";

export default function LeadManagement() {
  const { payments, loading, error, fetchPayments, updatePayment, deletePayment } = usePayments();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("thismonth");
  const [updatingId, setUpdatingId] = useState(null);

  // Advanced Filter Modal & State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  const [filterSelectedStatus, setFilterSelectedStatus] = useState("all");

  // Notification Dropdown State
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const filterRef = useRef(null);
  const notificationRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterModal(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buttons = ["All", "Pending & Incomplete", "Pending", "Partial", "Overdue", "Paid", "Cancelled"];

  // Active filter count badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterDateRange !== "all") count++;
    if (filterSelectedStatus !== "all") count++;
    if (filterMinAmount !== "") count++;
    if (filterMaxAmount !== "") count++;
    return count;
  }, [filterDateRange, filterSelectedStatus, filterMinAmount, filterMaxAmount]);

  // Notifications generator from payments
  const notifications = useMemo(() => {
    const list = [];
    const today = new Date();

    (Array.isArray(payments) ? payments : []).forEach((p) => {
      const s = (p.status || "").toLowerCase();
      const dueDate = p.dueDate ? new Date(p.dueDate) : null;
      const amountStr = (Number(p.budget) || 0).toLocaleString();

      if (s === "overdue" || (dueDate && dueDate < today && s !== "paid")) {
        list.push({
          id: `ov-${p._id}`,
          type: "overdue",
          title: "Overdue Payment Alert",
          message: `${p.clientName || p.companyName || "Client"} invoice of ₹${amountStr} is overdue!`,
          time: p.dueDate ? `Due date: ${new Date(p.dueDate).toLocaleDateString("en-IN")}` : "Overdue",
          payment: p,
        });
      } else if (s === "pending" || s === "partial") {
        list.push({
          id: `pd-${p._id}`,
          type: "pending",
          title: "Pending Collection",
          message: `${p.clientName || p.companyName || "Client"} has a pending amount of ₹${amountStr}.`,
          time: p.dueDate ? `Due: ${new Date(p.dueDate).toLocaleDateString("en-IN")}` : "Pending",
          payment: p,
        });
      }
    });

    return list;
  }, [payments]);

  // Filter payments by tab, advanced filters, and search query
  const filteredPayments = useMemo(() => {
    let result = Array.isArray(payments) ? payments : [];

    // Tab status filter
    const currentTab = buttons[active];
    if (currentTab === "Pending & Incomplete") {
      result = result.filter((p) => {
        const s = (p.status || "").toLowerCase();
        return s === "pending" || s === "partial" || s === "overdue" || s === "cancelled";
      });
    } else if (currentTab !== "All") {
      result = result.filter(
        (p) => p.status && p.status.toLowerCase() === currentTab.toLowerCase()
      );
    }

    // Advanced status filter
    if (filterSelectedStatus !== "all") {
      result = result.filter(
        (p) => (p.status || "").toLowerCase() === filterSelectedStatus.toLowerCase()
      );
    }

    // Date range filter
    if (filterDateRange !== "all") {
      const now = new Date();
      result = result.filter((p) => {
        const pDate = p.issuedDate ? new Date(p.issuedDate) : p.createdAt ? new Date(p.createdAt) : null;
        if (!pDate) return true;
        if (filterDateRange === "this_month") {
          return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
        } else if (filterDateRange === "last_month") {
          const lastM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return pDate.getMonth() === lastM.getMonth() && pDate.getFullYear() === lastM.getFullYear();
        } else if (filterDateRange === "this_year") {
          return pDate.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    // Amount range filter
    if (filterMinAmount !== "" && !isNaN(filterMinAmount)) {
      result = result.filter((p) => (Number(p.budget) || 0) >= Number(filterMinAmount));
    }
    if (filterMaxAmount !== "" && !isNaN(filterMaxAmount)) {
      result = result.filter((p) => (Number(p.budget) || 0) <= Number(filterMaxAmount));
    }

    // Search query filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          (p.clientName && p.clientName.toLowerCase().includes(term)) ||
          (p.companyName && p.companyName.toLowerCase().includes(term)) ||
          (p.paymentDescription && p.paymentDescription.toLowerCase().includes(term))
      );
    }

    return result;
  }, [payments, active, searchTerm, filterDateRange, filterMinAmount, filterMaxAmount, filterSelectedStatus]);

  // Incomplete / Pending processes specific list
  const pendingIncompleteList = useMemo(() => {
    const today = new Date();
    return (Array.isArray(payments) ? payments : [])
      .filter((p) => {
        const s = (p.status || "").toLowerCase();
        return s !== "paid";
      })
      .map((p) => {
        const dueDate = p.dueDate ? new Date(p.dueDate) : null;
        const isOverdue = dueDate && dueDate < today && (p.status || "").toLowerCase() !== "paid";
        return {
          ...p,
          isOverdue,
        };
      });
  }, [payments]);

  // Pagination logic
  const filesPerPage = 6;
  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;
  const currentFiles = filteredPayments.slice(firstIndex, lastIndex);
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / filesPerPage));

  // Dynamic Statistics
  const stats = useMemo(() => {
    let total = 0;
    let pending = 0;
    let overdue = 0;
    let paid = 0;

    payments.forEach((p) => {
      const budgetVal = Number(p.budget) || 0;
      total += budgetVal;
      const statusLower = (p.status || "").toLowerCase();

      if (statusLower === "paid") {
        paid += budgetVal;
      } else if (statusLower === "pending" || statusLower === "partial") {
        pending += budgetVal;
      } else if (statusLower === "overdue") {
        overdue += budgetVal;
      }
    });

    return [
      { icon: BanknoteArrowUp, title: "Total Revenue", value: `₹${total.toLocaleString()}`, color: "bg-blue-50 text-blue-600" },
      { icon: Clock4, title: "Pending & Incomplete", value: `₹${pending.toLocaleString()}`, color: "bg-amber-50 text-amber-600" },
      { icon: CircleAlert, title: "OverDue Payments", value: `₹${overdue.toLocaleString()}`, color: "bg-rose-50 text-rose-600" },
      { icon: CircleCheckBig, title: "Paid Collected", value: `₹${paid.toLocaleString()}`, color: "bg-emerald-50 text-emerald-600" },
    ];
  }, [payments]);

  // Dynamic Monthly Chart Data (Jan - Dec)
  const monthdata = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();

    const aggregated = months.map((m) => ({ month: m, revenue: 0, target: 0 }));

    if (Array.isArray(payments)) {
      payments.forEach((p) => {
        const dateVal = p.issuedDate || p.createdAt;
        if (dateVal) {
          const d = new Date(dateVal);
          if (d.getFullYear() === currentYear) {
            const monthIndex = d.getMonth();
            if (monthIndex >= 0 && monthIndex < 12) {
              const amount = Number(p.budget) || 0;
              aggregated[monthIndex].target += amount;
              if ((p.status || "").toLowerCase() === "paid") {
                aggregated[monthIndex].revenue += amount;
              }
            }
          }
        }
      });
    }

    return aggregated;
  }, [payments]);

  // Dynamic Yearly Chart Data
  const yeardata = useMemo(() => {
    if (!Array.isArray(payments) || payments.length === 0) {
      const yr = new Date().getFullYear();
      return [{ year: String(yr), revenue: 0, target: 0 }];
    }

    const currentYear = new Date().getFullYear();
    const yearsSet = new Set([currentYear]);

    payments.forEach((p) => {
      const dateVal = p.issuedDate || p.createdAt;
      if (dateVal) {
        const yr = new Date(dateVal).getFullYear();
        if (!isNaN(yr)) yearsSet.add(yr);
      }
    });

    const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);
    return sortedYears.map((yr) => {
      let revenue = 0;
      let target = 0;
      payments.forEach((p) => {
        const dateVal = p.issuedDate || p.createdAt;
        if (dateVal && new Date(dateVal).getFullYear() === yr) {
          const amount = Number(p.budget) || 0;
          target += amount;
          if ((p.status || "").toLowerCase() === "paid") {
            revenue += amount;
          }
        }
      });
      return { year: String(yr), revenue, target };
    });
  }, [payments]);

  const handleQuickStatusChange = async (payment, newStatus) => {
    try {
      setUpdatingId(payment._id);
      await updatePayment(payment._id, {
        ...payment,
        status: newStatus,
      });
    } catch (err) {
      alert(err.message || "Failed to update payment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment record?")) {
      try {
        await deletePayment(id);
      } catch (err) {
        alert(err.message || "Failed to delete payment");
      }
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
    setEditingPayment(null);
  };

  const resetAllFilters = () => {
    setFilterDateRange("all");
    setFilterMinAmount("");
    setFilterMaxAmount("");
    setFilterSelectedStatus("all");
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col lg:flex-row max-h-screen overflow-y-auto no-scrollbar bg-[#f3f0eb] w-full overflow-x-hidden">
      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between w-full shadow-sm relative z-30">
          <div>
            <h1 className="text-2xl font-bold text-[#023167] p-1">
              Payment & Invoice Management
            </h1>
            <p className="text-xs text-gray-500">
              Track, manage and resolve pending & incomplete payment processes
            </p>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => {
                setEditingPayment(null);
                setOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all shadow-md"
            >
              <Plus size={16} />
              New Invoice
            </button>

            {/* FILTER BUTTON & DROPDOWN */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => {
                  setShowFilterModal(!showFilterModal);
                  setShowNotificationMenu(false);
                }}
                className={`p-2.5 border rounded-xl transition-colors relative flex items-center gap-1.5 text-xs font-semibold ${
                  activeFilterCount > 0
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                }`}
                title="Advanced Filters"
              >
                <Filter size={18} />
                {activeFilterCount > 0 && (
                  <span className="bg-[#2563a9] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* ADVANCED FILTER POPUP */}
              <AnimatePresence>
                {showFilterModal && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                      <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                        <Filter size={15} className="text-[#2563a9]" />
                        Advanced Filters
                      </h3>
                      <button
                        onClick={() => setShowFilterModal(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* STATUS SELECT */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Payment Status
                        </label>
                        <select
                          value={filterSelectedStatus}
                          onChange={(e) => setFilterSelectedStatus(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none"
                        >
                          <option value="all">All Statuses</option>
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Partial">Partial</option>
                          <option value="Overdue">Overdue</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* DATE RANGE */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Date Range
                        </label>
                        <select
                          value={filterDateRange}
                          onChange={(e) => setFilterDateRange(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none"
                        >
                          <option value="all">All Time</option>
                          <option value="this_month">This Month</option>
                          <option value="last_month">Last Month</option>
                          <option value="this_year">This Year</option>
                        </select>
                      </div>

                      {/* AMOUNT RANGE */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Amount Range (₹)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Min ₹"
                            value={filterMinAmount}
                            onChange={(e) => setFilterMinAmount(e.target.value)}
                            className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none"
                          />
                          <input
                            type="number"
                            placeholder="Max ₹"
                            value={filterMaxAmount}
                            onChange={(e) => setFilterMaxAmount(e.target.value)}
                            className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none"
                          />
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-3">
                        <button
                          onClick={resetAllFilters}
                          className="text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1 text-[11px]"
                        >
                          <RotateCcw size={12} />
                          Reset Filters
                        </button>

                        <button
                          onClick={() => setShowFilterModal(false)}
                          className="px-3.5 py-1.5 bg-[#2563a9] text-white rounded-xl font-semibold text-[11px] shadow-sm hover:bg-blue-700 transition"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* NOTIFICATION BUTTON & DROPDOWN */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotificationMenu(!showNotificationMenu);
                  setShowFilterModal(false);
                }}
                className="p-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors relative"
                title="Payment Notifications"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
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
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-[#2563a9]" />
                        <h3 className="font-bold text-gray-900 text-sm">Payment Notifications</h3>
                      </div>
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {notifications.length} Alerts
                      </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500 opacity-80" />
                          <p className="font-bold text-gray-700">All caught up!</p>
                          <p className="text-xs text-gray-400 mt-0.5">No overdue or pending payment alerts.</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                              n.type === "overdue" ? "bg-red-50/30" : ""
                            }`}
                          >
                            <div
                              className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                                n.type === "overdue"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {n.type === "overdue" ? <AlertCircle size={16} /> : <Clock size={16} />}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-900 text-xs">{n.title}</h4>
                                <span className="text-[10px] text-gray-400 font-medium">{n.time}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5 leading-snug">{n.message}</p>

                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    handleQuickStatusChange(n.payment, "Paid");
                                    setShowNotificationMenu(false);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition shadow-sm"
                                >
                                  Mark Paid
                                </button>
                                <button
                                  onClick={() => {
                                    handleEdit(n.payment);
                                    setShowNotificationMenu(false);
                                  }}
                                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-[10px] transition"
                                >
                                  View Details
                                </button>
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
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6 lg:p-5 bg-[#f3f0eb] space-y-6">
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-5 rounded-2xl border border-gray-200/80 flex flex-col justify-between shadow-sm min-h-[120px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{s.title}</span>
                  <div className={`p-2.5 rounded-xl ${s.color}`}>
                    <s.icon size={20} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#0b2b57] mt-3">
                  {s.value}
                </h2>
              </motion.div>
            ))}
          </div>

          {/* INCOMPLETE / PENDING PROCESSES SUMMARY BANNER */}
          {pendingIncompleteList.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl mt-0.5">
                  <Clock size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-900">
                    Pending & Incomplete Processes ({pendingIncompleteList.length} Action Required)
                  </h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    There are {pendingIncompleteList.length} invoices awaiting payment completion or follow-up. Filter or update status below.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActive(1);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-amber-600 text-white font-medium text-xs rounded-xl hover:bg-amber-700 transition flex items-center justify-center gap-1.5 shadow-sm self-start md:self-auto"
              >
                View Pending List
                <ArrowUpRight size={14} />
              </button>
            </div>
          )}

          {/* FILTER BAR */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="font-bold text-lg text-[#0b2b57] shrink-0">
              Payment Invoices
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap py-1">
              {buttons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActive(index);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                    active === index
                      ? "bg-[#2563a9] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="flex items-center border border-gray-300 bg-gray-50 rounded-xl px-3 py-2 w-full xl:w-64 shrink-0">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                className="ml-2 w-full outline-none text-xs bg-transparent text-gray-700"
                placeholder="Search Client or Company..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* MAIN TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl overflow-x-auto border border-gray-200/80 shadow-sm"
          >
            {loading ? (
              <div className="p-8 text-center text-gray-500 font-medium text-sm">
                Loading payment records...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500 font-medium text-sm">
                Failed to load payments: {error}
              </div>
            ) : currentFiles.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <FileText size={40} className="mx-auto mb-2 opacity-50 text-gray-400" />
                <p className="text-base font-bold text-gray-700">No matching payment records</p>
                <p className="text-xs text-gray-400 mt-1">Try changing filters or add a new invoice.</p>
              </div>
            ) : (
              <table className="min-w-[950px] w-full text-xs">
                <thead className="bg-gray-50 text-left text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-4">CLIENT & COMPANY</th>
                    <th className="p-4">ISSUED DATE</th>
                    <th className="p-4">DUE DATE</th>
                    <th className="p-4">AMOUNT</th>
                    <th className="p-4">PROCESS STATUS</th>
                    <th className="p-4 text-center">QUICK UPDATE</th>
                    <th className="p-4 text-center">ACTION</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {currentFiles.map((l) => {
                    const statusLower = (l.status || "pending").toLowerCase();
                    const isPending = statusLower === "pending" || statusLower === "partial" || statusLower === "overdue";

                    return (
                      <tr key={l._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900 text-sm">{l.clientName}</p>
                          <p className="text-xs text-gray-400">{l.companyName}</p>
                        </td>

                        <td className="p-4 text-gray-600 font-medium">
                          {l.issuedDate ? new Date(l.issuedDate).toLocaleDateString("en-IN") : "-"}
                        </td>

                        <td className="p-4 font-medium">
                          <span className={statusLower === "overdue" ? "text-red-600 font-bold" : "text-gray-600"}>
                            {l.dueDate ? new Date(l.dueDate).toLocaleDateString("en-IN") : "-"}
                          </span>
                        </td>

                        <td className="p-4 font-bold text-gray-900 text-sm">
                          ₹{(Number(l.budget) || 0).toLocaleString()}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                              statusLower === "paid"
                                ? "bg-emerald-100 text-emerald-700"
                                : statusLower === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : statusLower === "overdue"
                                ? "bg-rose-100 text-rose-700"
                                : statusLower === "partial"
                                ? "bg-blue-100 text-blue-700"
                                : statusLower === "cancelled"
                                ? "bg-gray-200 text-gray-700 border border-gray-300"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {statusLower === "paid" && <CheckCircle2 size={12} />}
                            {statusLower === "pending" && <Clock size={12} />}
                            {statusLower === "overdue" && <AlertCircle size={12} />}
                            {statusLower === "cancelled" && <XCircle size={12} />}
                            {l.status || "Pending"}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <select
                            disabled={updatingId === l._id}
                            value={l.status || "Pending"}
                            onChange={(e) => handleQuickStatusChange(l, e.target.value)}
                            className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg px-2.5 py-1 outline-none transition-colors disabled:opacity-50"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Partial">Partial</option>
                            <option value="Paid">Paid</option>
                            <option value="Overdue">Overdue</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isPending && (
                              <button
                                onClick={() => handleQuickStatusChange(l, "Paid")}
                                disabled={updatingId === l._id}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] transition shadow-sm disabled:opacity-50"
                                title="Mark as Paid"
                              >
                                Mark Paid
                              </button>
                            )}

                            <button
                              onClick={() => handleEdit(l)}
                              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              title="Edit Payment"
                            >
                              <Edit2 size={15} />
                            </button>

                            <button
                              onClick={() => handleDelete(l._id)}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                              title="Delete Payment"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* PAGINATION */}
            {filteredPayments.length > filesPerPage && (
              <div className="p-3 border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                />
              </div>
            )}
          </motion.div>

          {/* BOTTOM CHARTS & INCOMPLETE PROCESSES LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start w-full">
            {/* MONTHLY CHART */}
            <div className="lg:col-span-3 flex flex-col justify-between h-[400px] bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm">
              <div className="flex items-center justify-between w-full mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#023167]">
                    Monthly Revenue Analytics
                  </h2>
                  <p className="text-xs text-gray-400">Comparing received revenue vs targets</p>
                </div>

                <div>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="bg-gray-100 text-xs font-semibold text-gray-700 rounded-xl px-3 py-1.5 border border-gray-200 outline-none"
                  >
                    <option value="thismonth">Monthly View (Jan - Dec)</option>
                    <option value="thisyear">Yearly Comparison</option>
                  </select>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={selectedPeriod === "thismonth" ? monthdata : yeardata}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey={selectedPeriod === "thismonth" ? "month" : "year"} tickLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="revenue" name="Collected Revenue (₹)" fill="#2563a9" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" name="Target (₹)" fill="#CBD5E1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* PENDING & INCOMPLETE PROCESSES LIST */}
            <div className="lg:col-span-2 flex flex-col h-[400px] bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <h1 className="font-bold text-[#023167] text-sm flex items-center gap-1.5">
                  <Clock size={16} className="text-amber-600" />
                  Pending & Incomplete Processes
                </h1>
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                  {pendingIncompleteList.length} INCOMPLETED
                </span>
              </div>

              {pendingIncompleteList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs">
                  <CheckCircle2 size={36} className="text-emerald-500 mb-2 opacity-80" />
                  <p className="font-semibold text-gray-700">All payment processes completed!</p>
                  <p className="text-gray-400 mt-1">No pending or incomplete invoices.</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto no-scrollbar flex-1 pr-1">
                  {pendingIncompleteList.map((ev) => (
                    <div
                      key={ev._id}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 hover:border-amber-300 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full w-9 h-9 bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                          {(ev.clientName || "C").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h1 className="text-xs font-bold text-gray-900">{ev.clientName}</h1>
                          <p className="text-[11px] text-gray-400">{ev.companyName}</p>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                              (ev.status || "").toLowerCase() === "overdue"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            Status: {ev.status || "Pending"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                        <h3 className="text-xs font-bold text-gray-800">
                          ₹{(Number(ev.budget) || 0).toLocaleString()}
                        </h3>
                        <button
                          onClick={() => handleQuickStatusChange(ev, "Paid")}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition"
                        >
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {open && (
        <AnimateModals>
          <Createinvoice
            onClose={handleModalClose}
            onSuccess={fetchPayments}
            initialData={editingPayment}
          />
        </AnimateModals>
      )}
    </div>
  );
}
