import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Shield,
  Eye,
  Download,
} from "lucide-react";

const taxDocuments = [
  {
    title: "Form 16",
    description: "TDS certificate from employer · FY 2025–26",
    icon: FileText,
  },
  {
    title: "Form 16A",
    description: "TDS on non-salary income · FY 2025–26",
    icon: FileText,
  },
  {
    title: "Annual Tax Statement",
    description: "Form 26AS · full year TDS summary",
    icon: Shield,
  },
  {
    title: "Annual Tax Statement",
    description: "Form 26AS · full year TDS summary",
    icon: FileText,
  },
];

export default function TaxDocument() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">
          Tax documents
        </h1>

        <span className="text-xl font-semibold text-gray-500">
          FY 2025–26
        </span>
      </div>

      {/* Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {taxDocuments.map((doc, index) => {
          const Icon = doc.icon;

          return (
            <motion.div
              key={index}
              whileHover={{
                y: -4,
              }}
              transition={{
                duration: 0.2,
              }}
              className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Icon
                    size={28}
                    className="text-[#1f66b2]"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-lg text-black">
                    {doc.title}
                  </h3>

                  <p className="text-gray-500 mt-1">
                    {doc.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <button className="text-gray-500 hover:text-[#1f66b2] transition">
                  <Eye size={22} />
                </button>

                <button className="text-[#1f66b2] hover:scale-110 transition">
                  <Download size={22} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}