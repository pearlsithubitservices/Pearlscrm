import React from "react";
import { Camera, Lock, ChevronRight, AlertCircle } from "lucide-react";

const CollabCreateView = ({
  collabNameInput,
  setCollabNameInput,
  collabDescriptionInput,
  setCollabDescriptionInput,
  onOpenAccessPermissions,
  onCancel,
  onCreateCollab
}) => {
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
          Collab is a shared workspace for collaborating with external guests and customers.
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
            rows={3}
            className="w-full bg-[#F8FAFC] border border-gray-200/80 rounded-2xl p-3.5 text-xs text-gray-800 outline-none focus:border-blue-500 transition resize-none"
          />
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
