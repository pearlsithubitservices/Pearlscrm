import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Phone,
  NotebookTabs,
  X,
  Pencil,
  Save,
  Building2,
  Globe,
  IndianRupee,
  Calendar,
  User,
  Activity,
  CheckCircle2,
} from "lucide-react";

import ActivityTab from "../components/LeadDetails/LeadActivity";
import NotesTab from "../components/LeadDetails/Leadnotes";
import DocumentsTab from "../components/LeadDetails/Leaddocuments";
import NextActionTab from "../components/LeadDetails/Leadnextaction";
import OverviewTab from "../components/LeadDetails/Leadhome";
import { useNavigate, useParams } from "react-router-dom";
import useLead from "../Hooks/useLead";
import { apiUrl } from "../config/api.js";

export default function LeadDetails() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const { lead, loading, fetchLead } = useLead(id);

  // EDITABLE FORM STATE
  const [editData, setEditData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    website: "",
    budget: "",
    source: "",
    nextAction: "",
    status: "New",
    priority: "Cold",
    notes: "",
  });

  const openEditModal = () => {
    setEditData({
      name: lead.name || lead.clientName || "",
      company: lead.company || "",
      phone: lead.phone || "",
      email: lead.email || "",
      website: lead.website || "",
      budget: lead.budget || "",
      source: lead.source || "",
      nextAction: lead.nextAction || "",
      status: lead.status || "New",
      priority: lead.priority || "Cold",
      notes: lead.notes || "",
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const saveLeadUpdate = async () => {
    try {
      const response = await fetch(apiUrl(`/leads/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        alert("Lead updated successfully!");
        setIsEditing(false);
        fetchLead();
      } else {
        alert("Failed to update lead.");
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead.");
    }
  };

  // ACTION HANDLERS (Call, E-Mail, WhatsApp)
  const handleCall = () => {
    if (lead?.phone) {
      window.location.href = `tel:${lead.phone}`;
    } else {
      alert("No phone number available for this lead.");
    }
  };

  const handleEmail = () => {
    if (lead?.email) {
      window.location.href = `mailto:${lead.email}`;
    } else {
      alert("No email address available for this lead.");
    }
  };

  const handleWhatsApp = () => {
    if (lead?.phone) {
      const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${cleanPhone}`, "_blank");
    } else {
      alert("No phone number available for WhatsApp.");
    }
  };

  const tabs = [
    "Overview",
    "Activity",
    "Notes",
    "Documents",
    "Next Action",
  ];

  const getInitials = (name) => {
    if (!name) return "LD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "Overview":
        return <OverviewTab lead={lead} />;
      case "Activity":
        return <ActivityTab lead={lead} />;
      case "Notes":
        return <NotesTab lead={lead} />;
      case "Documents":
        return <DocumentsTab lead={lead} />;
      case "Next Action":
        return <NextActionTab lead={lead} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f0eb] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
          <div className="w-5 h-5 border-2 border-[#2563a9] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-gray-700">Loading Lead Details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen overflow-y-auto custom-scrollbar bg-[#f3f0eb] p-2 md:p-6 relative min-h-screen">
      {/* CLOSE BUTTON */}
      <div
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center cursor-pointer hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-xs"
        onClick={() => navigate(-1)}
      >
        <X size={18} />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-xs"
      >
        {/* HEADER */}
        <div className="border-b border-gray-200 bg-white p-5 md:p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
            {/* LEFT DETAILS */}
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-[#2563a9] font-bold text-xl border border-blue-200 shrink-0">
                {getInitials(lead?.name || lead?.clientName)}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-bold text-xl md:text-2xl text-[#082f57]">
                    {lead?.name || lead?.clientName || "Unnamed Lead"}
                  </h1>
                  <span className="text-xs bg-gray-100 px-2.5 py-0.5 rounded-full text-gray-600 font-semibold border border-gray-200">
                    {lead?.company || "Company N/A"}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Source: <span className="font-medium text-gray-700">{lead?.source || "Direct"}</span> • Next Action: <span className="font-medium text-indigo-600">{lead?.nextAction || "None"}</span>
                </p>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {/* CALL */}
                  <button
                    onClick={handleCall}
                    className="border border-green-200 bg-green-50 text-green-700 px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-green-600 hover:text-white transition-all shadow-xs"
                  >
                    <Phone size={14} />
                    <span>Call ({lead?.phone || "N/A"})</span>
                  </button>

                  {/* EMAIL */}
                  <button
                    onClick={handleEmail}
                    className="border border-blue-200 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-600 hover:text-white transition-all shadow-xs"
                  >
                    <Mail size={14} />
                    <span>E-Mail ({lead?.email || "N/A"})</span>
                  </button>

                  {/* WHATSAPP */}
                  <button
                    onClick={handleWhatsApp}
                    className="border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-600 hover:text-white transition-all shadow-xs"
                  >
                    <MessageSquare size={14} />
                    <span>WhatsApp</span>
                  </button>

                  {/* NOTES */}
                  <button
                    onClick={() => setActiveTab("Notes")}
                    className="border border-purple-200 bg-purple-50 text-purple-700 px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-600 hover:text-white transition-all shadow-xs"
                  >
                    <NotebookTabs size={14} />
                    <span>Notes</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT STATUS & EDIT */}
            <div className="flex items-center lg:items-end gap-3 self-end lg:self-auto">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                  (lead?.status || "").toLowerCase() === "converted" || (lead?.status || "").toLowerCase() === "closed"
                    ? "bg-green-100 text-green-700 border-green-300"
                    : "bg-blue-100 text-blue-700 border-blue-300"
                }`}
              >
                {lead?.status || "New"}
              </span>

              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase border ${
                  (lead?.priority || "").toLowerCase() === "hot"
                    ? "bg-red-100 text-red-700 border-red-300"
                    : (lead?.priority || "").toLowerCase() === "warm"
                    ? "bg-orange-100 text-orange-700 border-orange-300"
                    : "bg-gray-100 text-gray-700 border-gray-300"
                }`}
              >
                {lead?.priority || "COLD"}
              </span>

              <button
                onClick={openEditModal}
                className="border border-[#2563a9] bg-[#2563a9] text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1d4ed8] transition-all shadow-xs hover:scale-105"
              >
                <Pencil size={14} />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto gap-6 px-6 pt-3 custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap pb-3 text-xs font-semibold transition border-b-2 ${
                  activeTab === tab
                    ? "text-[#2563a9] border-[#2563a9]"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* EDIT LEAD MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-[#082f57]">Edit Lead Details</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* NAME */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Lead Name</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-2.5 py-2 bg-gray-50">
                  <User size={15} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    className="w-full bg-transparent outline-none text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* COMPANY */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Company</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-2.5 py-2 bg-gray-50">
                  <Building2 size={15} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    name="company"
                    value={editData.company}
                    onChange={handleEditChange}
                    className="w-full bg-transparent outline-none text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* PHONE */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Phone</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-2.5 py-2 bg-gray-50">
                  <Phone size={15} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    name="phone"
                    value={editData.phone}
                    onChange={handleEditChange}
                    className="w-full bg-transparent outline-none text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Email</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-2.5 py-2 bg-gray-50">
                  <Mail size={15} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleEditChange}
                    className="w-full bg-transparent outline-none text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* WEBSITE */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Website</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-2.5 py-2 bg-gray-50">
                  <Globe size={15} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    name="website"
                    value={editData.website}
                    onChange={handleEditChange}
                    className="w-full bg-transparent outline-none text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* BUDGET */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Budget</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-2.5 py-2 bg-gray-50">
                  <IndianRupee size={15} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    name="budget"
                    value={editData.budget}
                    onChange={handleEditChange}
                    className="w-full bg-transparent outline-none text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* NEXT ACTION */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Next Action</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-2.5 py-2 bg-gray-50">
                  <Calendar size={15} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    name="nextAction"
                    value={editData.nextAction}
                    onChange={handleEditChange}
                    className="w-full bg-transparent outline-none text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* PRIORITY */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Priority</label>
                <select
                  name="priority"
                  value={editData.priority}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-2 bg-gray-50 outline-none text-gray-800 font-medium cursor-pointer"
                >
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                  <option value="Cool">Cool</option>
                </select>
              </div>

              {/* STATUS */}
              <div className="md:col-span-2">
                <label className="font-semibold text-gray-700 block mb-1">Status</label>
                <select
                  name="status"
                  value={editData.status}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-2 bg-gray-50 outline-none text-gray-800 font-medium cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>

              {/* NOTES */}
              <div className="md:col-span-2">
                <label className="font-semibold text-gray-700 block mb-1">Description / Notes</label>
                <textarea
                  name="notes"
                  value={editData.notes}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 outline-none text-gray-800 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveLeadUpdate}
                className="px-5 py-2 rounded-lg bg-[#2563a9] hover:bg-[#1d4ed8] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Save size={14} />
                <span>Save Changes</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}