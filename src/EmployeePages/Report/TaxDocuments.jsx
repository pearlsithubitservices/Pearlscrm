import { motion } from "framer-motion";
import { Eye, Download, FileText, Shield } from "lucide-react";

const documents = [
  {
    title: "Form 16",
    desc: "TDS certificate from employer · FY 2025–26",
    icon: FileText,
  },
  {
    title: "Form 16A",
    desc: "TDS on non-salary income · FY 2025–26",
    icon: FileText,
  },
  {
    title: "Annual Tax Statement",
    desc: "Form 26AS · full year TDS summary",
    icon: Shield,
  },
  {
    title: "Annual Tax Statement",
    desc: "Form 26AS · full year TDS summary",
    icon: Shield,
  },
];

export default function TaxDocuments() {
  return (
    <div className="min-h-screen bg-[#f4f2ee] p-6 flex justify-center">
      <div className="w-full max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Tax documents
          </h1>
          <span className="text-sm font-medium text-gray-600">
            FY 2025–26
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {documents.map((doc, index) => {
            const Icon = doc.icon;

            return (
              <motion.div
                key={index}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition"
              >
                {/* Left side */}
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="text-blue-600 w-5 h-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {doc.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {doc.desc}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 text-gray-500">
                  <button className="hover:text-gray-900 transition">
                    <Eye size={18} />
                  </button>
                  <button className="hover:text-gray-900 transition">
                    <Download size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}