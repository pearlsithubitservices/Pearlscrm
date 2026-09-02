import React, { useState } from "react";
import { Camera, Lock, ChevronRight, AlertCircle, Search, Check, Users } from "lucide-react";

const CollabCreateView = ({
  collabNameInput,
  setCollabNameInput,
  collabDescriptionInput,
  setCollabDescriptionInput,
  employeeList = [],
  selectedEmpIds = [],
  toggleEmpSelection,
  loadingModalData = false,
  onOpenAccessPermissions,
  onCancel,
  onCreateCollab
}) => {
  const [userSearch, setUserSearch] = useState("");

  const filteredUsers = (employeeList || []).filter((emp) => {
    if (!emp) return false;
    const name = emp.employeeName || emp.name || emp.displayName || emp.username || "";
    const email = emp.email || "";
    const role = emp.role || emp.department || emp.designation || "";
    const q = userSearch.toLowerCase();

    return (
      name.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F0F5FA] p-6 md:p-8 overflow-y-auto relative">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Title Bar with Camera Icon */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <button className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D61E7] flex items-center justify-center hover:bg-blue-100 transition cursor-pointer shrink-0">
            <Camera size={20} />
          </button>
          <input
            type="text"
            value={collabNameInput}
            onChange={(e) => setCollabNameInput(e.target.value)}
            placeholder="Collab name..."
            className="text-lg md:text-xl font-bold text-gray-900 outline-none w-full placeholder-gray-300 bg-transparent"
          />
        </div>

        {/* Subtitle Callout Banner */}
        <p className="text-xs md:text-sm font-semibold text-[#0B2B57]/80 leading-relaxed">
          Collab is a shared workspace for collaborating with team members, external guests, and customers.
        </p>

        {/* Collab Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700">
            Collab description
          </label>
          <textarea
            value={collabDescriptionInput}
            onChange={(e) => setCollabDescriptionInput(e.target.value)}
            placeholder="Tell other users what this collab is about..."
            rows={2}
            className="w-full bg-[#F8FAFC] border border-gray-200/80 rounded-2xl p-3.5 text-xs text-gray-800 outline-none focus:border-blue-500 transition resize-none"
          />
        </div>

        {/* Dynamic User Selection Section (Fetched from DB) */}
        <div className="space-y-2.5 bg-[#F8FAFC] p-4 rounded-2xl border border-gray-200/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#0B2B57] flex items-center gap-2">
              <Users size={16} className="text-[#1D61E7]" />
              Select Collaborators (Users DB)
            </label>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              {selectedEmpIds.length} Selected
            </span>
          </div>

          {/* User Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user by name, email, or role..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-blue-500"
            />
          </div>

          {/* User Selection List */}
          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 pt-1 no-scrollbar">
            {loadingModalData ? (
              <p className="text-center text-xs text-gray-400 py-4">Loading users from DB...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-4">No users found</p>
            ) : (
              filteredUsers.map((emp) => {
                const empId = emp._id || emp.id || emp.uid || emp.email;
                const name = emp.employeeName || emp.name || emp.displayName || (emp.email ? emp.email.split("@")[0] : "User");
                const isSelected = selectedEmpIds.includes(empId);

                return (
                  <div
                    key={empId}
                    onClick={() => toggleEmpSelection && toggleEmpSelection(empId)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition border ${
                      isSelected
                        ? "bg-blue-50/90 border-blue-300 text-blue-900 font-bold shadow-xs"
                        : "bg-white border-gray-100 hover:bg-gray-100/80 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? "bg-[#1D61E7] text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold leading-tight truncate">{name}</p>
                        <p className="text-[10px] text-gray-400 font-medium truncate">
                          {emp.email || emp.role || emp.department || "Employee"}
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      isSelected ? "bg-[#1D61E7] border-[#1D61E7] text-white" : "border-gray-300 bg-white"
                    }`}>
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Access Permissions Card */}
        <button
          type="button"
          onClick={onOpenAccessPermissions}
          className="w-full flex items-center justify-between p-4 bg-[#F8FAFC] hover:bg-gray-100/80 rounded-2xl border border-gray-200/80 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white text-gray-600 shadow-2xs border border-gray-100">
              <Lock size={18} />
            </div>
            <span className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition">
              Access Permissions
            </span>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Auto Delete Message Card */}
        <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-gray-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white text-gray-600 shadow-2xs border border-gray-100">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Auto delete message</p>
              <p className="text-[10px] font-medium text-gray-400">Never</p>
            </div>
          </div>
          <div className="w-10 h-5 bg-gray-200 rounded-full p-0.5 cursor-pointer flex items-center">
            <div className="w-4 h-4 bg-white rounded-full shadow-md" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onCreateCollab}
            className="px-8 py-2.5 rounded-xl bg-[#1D61E7] text-white text-xs font-bold hover:bg-blue-700 transition shadow-md shadow-blue-500/20 cursor-pointer"
          >
            Create Collab
          </button>
        </div>

      </div>
    </div>
  );
};

export default CollabCreateView;
