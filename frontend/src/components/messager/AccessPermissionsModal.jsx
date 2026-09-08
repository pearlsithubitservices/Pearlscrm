import React from "react";
import { X } from "lucide-react";

const AccessPermissionsModal = ({
  isOpen,
  onClose,
  collabOwner = "Vishnu",
  collabHistoryNewMembers = "yes",
  setCollabHistoryNewMembers,
  collabUsersInvite = "All members",
  setCollabUsersInvite,
  collabAllowGuests = "yes",
  setCollabAllowGuests,
  collabUsersPost = "All members",
  setCollabUsersPost,
  collabUsersViewTasks = "All members",
  setCollabUsersViewTasks,
  onAddModerator
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center md:justify-end p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 animate-in slide-in-from-right duration-200 max-h-[90vh] overflow-y-auto space-y-5">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 tracking-tight">
            Access permissions
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Admin & Permissions Section Card */}
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100 space-y-4">
          <h4 className="text-xs font-bold text-[#0B2B57] uppercase tracking-wider">
            Admin & Permissions
          </h4>

          {/* Owner */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              Owner:
            </label>
            <input
              type="text"
              readOnly
              value={collabOwner}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-800 outline-none"
            />
          </div>

          {/* Moderators */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              Moderators:
            </label>
            <button
              type="button"
              onClick={onAddModerator}
              className="w-full border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-[#1D61E7] rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
            >
              + Add
            </button>
          </div>

          {/* Make chat history available to new members */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              Make chat history available to new members:
            </label>
            <select
              value={collabHistoryNewMembers}
              onChange={(e) => setCollabHistoryNewMembers && setCollabHistoryNewMembers(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 outline-none focus:border-blue-500"
            >
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
          </div>

          {/* Users allowed to invite new collab members */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              Users allowed to invite new collab members:
            </label>
            <select
              value={collabUsersInvite}
              onChange={(e) => setCollabUsersInvite && setCollabUsersInvite(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 outline-none focus:border-blue-500"
            >
              <option value="All members">All members</option>
              <option value="Admins only">Admins only</option>
            </select>
          </div>

          {/* Allow inviting guests to this collab */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              Allow inviting guests to this collab:
            </label>
            <select
              value={collabAllowGuests}
              onChange={(e) => setCollabAllowGuests && setCollabAllowGuests(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 outline-none focus:border-blue-500"
            >
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
          </div>

          {/* Users allowed to post messages */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              Users allowed to post messages:
            </label>
            <select
              value={collabUsersPost}
              onChange={(e) => setCollabUsersPost && setCollabUsersPost(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 outline-none focus:border-blue-500"
            >
              <option value="All members">All members</option>
              <option value="Admins only">Admins only</option>
            </select>
          </div>
        </div>

        {/* Collab Tasks Section Card */}
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100 space-y-3">
          <h4 className="text-xs font-bold text-[#0B2B57] uppercase tracking-wider">
            Collab Tasks
          </h4>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              Users allowed to view collab tasks:
            </label>
            <select
              value={collabUsersViewTasks}
              onChange={(e) => setCollabUsersViewTasks && setCollabUsersViewTasks(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 outline-none focus:border-blue-500"
            >
              <option value="All members">All members</option>
              <option value="Admins only">Admins only</option>
            </select>
          </div>
        </div>

        {/* Save Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#1D61E7] text-white text-xs font-bold hover:bg-blue-700 transition shadow-md shadow-blue-500/20 cursor-pointer"
          >
            Save Permissions
          </button>
        </div>

      </div>
    </div>
  );
};

export default AccessPermissionsModal;
