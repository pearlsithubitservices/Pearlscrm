import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Shield,
  FileSpreadsheet,
  Eye,
  Download,
} from "lucide-react";
import useTaxDocument from "../../../Hooks/useTaxDocument";
import { getFinancialYear } from "../../../Utils/formatNumber";

const iconMap = {
  "Form 16": FileText,
  "Form 16A": FileText,
  "Annual Tax Statement": Shield,
  "Form 26AS": FileSpreadsheet,
};

export default function TaxDocument() {
  const { documents: fetchedDocs, loading } = useTaxDocument();
  const taxDocs = fetchedDocs || [];
  const financialYear = getFinancialYear();

  const getDocUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url.startsWith("/") ? url : `/${url}`}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-2 sm:p-4"
    >
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Tax Documents
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">View and download your official tax certificates</p>
        </div>

        <span className="text-xs sm:text-sm font-bold bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100">
          {financialYear}
        </span>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 font-medium italic">Loading tax documents from server...</div>
      ) : taxDocs && taxDocs.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {taxDocs.map((doc, index) => {
            const Icon = iconMap[doc.title] || FileText;
            const url = getDocUrl(doc.documentUrl);

            return (
              <motion.div
                key={doc._id || doc.id || index}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                    <Icon
                      size={26}
                      className="text-[#1f66b2]"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900">
                      {doc.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      {doc.description || `${doc.documentType || 'Tax Document'} · ${financialYear}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {url ? (
                    <>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:text-[#1f66b2] hover:bg-blue-50 transition"
                        title="View Document"
                      >
                        <Eye size={18} />
                      </a>

                      <a
                        href={url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-blue-100 text-[#1f66b2] hover:bg-blue-200 transition"
                        title="Download Document"
                      >
                        <Download size={18} />
                      </a>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 italic bg-gray-100 px-3 py-1.5 rounded-lg">
                      Pending Upload
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 font-medium shadow-sm">
          <p className="text-lg text-gray-700 font-semibold">No tax documents available yet.</p>
          <p className="text-xs text-gray-400 mt-1">Form 16 and annual tax certificates will appear here once published by admin.</p>
        </div>
      )}
    </motion.div>
  );
}