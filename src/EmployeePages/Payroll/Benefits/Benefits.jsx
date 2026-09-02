import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  ExternalLink,
  X,
  ShieldCheck,
  Building2,
  CheckCircle2,
  FileText,
  BadgeDollarSign,
  Users,
  Info
} from "lucide-react";
import useBenefits from "../../../Hooks/useBenefits";
import { getFinancialYear } from "../../../Utils/formatNumber";

export default function Benefits() {
  const { benefits: dbBenefits, loading } = useBenefits();
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const financialYear = getFinancialYear();

  const customDbBenefits = (dbBenefits || []).map((item) => ({
    _id: item._id,
    title: item.title,
    subtitle: item.subtitle || "Company Benefit Program",
    category: item.category || "General Benefit",
    provider: item.provider || "Company HR",
    coverAmount: item.coverAmount || "Standard Coverage",
    contribution: item.contribution || "Company Funded",
    extra: item.footer || `Category: ${item.category || "General"}`,
    status: item.status || "Active",
    rawItem: item,
  }));

  return (
    <div className="bg-[#f3f0eb] min-h-screen p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#082d5b] flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
              Employee Benefits & Perks
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Active company health insurance, retirement funds, and perk programs
            </p>
          </div>

          <span className="text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shrink-0">
            {financialYear}
          </span>
        </div>

        {/* Benefits Grid */}
        {loading ? (
          <div className="py-16 text-center text-gray-400 font-medium italic">Loading company benefits...</div>
        ) : customDbBenefits && customDbBenefits.length > 0 ? (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mt-6">
            {customDbBenefits.map((item, index) => (
              <motion.div
                key={item._id || index}
                whileHover={{ y: -3 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] uppercase tracking-wider rounded-md border border-blue-100 mb-1.5">
                        {item.category}
                      </span>
                      <h3 className="text-lg font-bold text-[#0b2b57] leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 mt-1 text-xs sm:text-sm">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 shrink-0">
                      <Gift size={22} className="text-blue-600" />
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                    <div className="text-xs sm:text-sm flex justify-between">
                      <span className="font-bold text-[#0b2b57]">Provider:</span>
                      <span className="text-gray-800 font-medium">{item.provider}</span>
                    </div>
                    <div className="text-xs sm:text-sm flex justify-between">
                      <span className="font-bold text-[#0b2b57]">Coverage:</span>
                      <span className="text-gray-900 font-semibold">{item.coverAmount}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-500 line-clamp-2">
                    {item.extra}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-6 pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-gray-400">Status: </span>
                    <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle2 size={11} /> {item.status}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedBenefit(item)}
                    className="flex items-center gap-1.5 text-xs text-[#2563eb] font-bold hover:text-blue-800 hover:underline transition cursor-pointer"
                  >
                    View Details
                    <ExternalLink size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 font-medium my-6 shadow-sm">
            <p className="text-lg text-gray-700 font-semibold">No company benefits assigned yet.</p>
            <p className="text-xs text-gray-400 mt-1">Active benefits published by admin will appear here automatically.</p>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      <AnimatePresence>
        {selectedBenefit && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full p-6 overflow-hidden relative modal-scrollbar max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] uppercase tracking-wider rounded-md border border-blue-100">
                      {selectedBenefit.category}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mt-0.5">
                      {selectedBenefit.title}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBenefit(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="mt-5 space-y-4 text-sm">
                <p className="text-gray-600 text-sm bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  {selectedBenefit.subtitle}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <Building2 size={18} className="text-blue-600" />
                      <span>Provider / Issuer</span>
                    </div>
                    <span className="font-bold text-gray-900">{selectedBenefit.provider}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <BadgeDollarSign size={18} className="text-emerald-600" />
                      <span>Coverage / Value</span>
                    </div>
                    <span className="font-bold text-emerald-700">{selectedBenefit.coverAmount}</span>
                  </div>

                  {selectedBenefit.contribution && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <FileText size={18} className="text-purple-600" />
                        <span>Contribution</span>
                      </div>
                      <span className="font-semibold text-gray-800">{selectedBenefit.contribution}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                    <Info size={18} className="text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">Eligibility & Notes</h4>
                      <p className="text-xs text-amber-800 mt-0.5">{selectedBenefit.extra}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                    <Users size={16} />
                    <span>How to Claim / Enrol</span>
                  </div>
                  <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                    This benefit program is active for eligible employees under FY 2025–26. To submit claims or update enrolled dependent details, contact your HR department or submit a request via Reimbursements tab.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Status: {selectedBenefit.status}
                </span>

                <button
                  onClick={() => setSelectedBenefit(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}