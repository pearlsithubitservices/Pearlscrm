import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  Pencil,
  Upload,
  Phone,
} from "lucide-react";

export default function LeadDocuments() {
  

  const documents = [
    {
      name: "Proposal_v2_Final.pdf",
      type: "PDF",
      size: "2.4 MB",
      date: "Jun 9",
      icon: FileText,
      bg: "bg-gray-200",
      iconColor: "text-gray-500",
    },
    {
      name: "TechFlow_Requirements.docx",
      type: "DOCX",
      size: "840 KB",
      date: "Jun 6",
      icon: FileSpreadsheet,
      bg: "bg-green-100",
      iconColor: "text-green-500",
    },
    {
      name: "Proposal_v2_Final.jpeg",
      type: "jpeg",
      size: "312 KB",
      date: "Jun 4",
      icon: FileImage,
      bg: "bg-purple-200",
      iconColor: "text-purple-500",
    },
    {
      name: "NDA_Signed.pdf",
      type: "PDF",
      size: "2.4 MB",
      date: "Jun 9",
      icon: FileText,
      bg: "bg-gray-200",
      iconColor: "text-gray-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f2ec] py-8 px-3 md:px-6 lg:px-10">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="
        bg-[#f5f2ec]
        rounded-[30px]
        overflow-hidden
        max-w-7xl
        mx-auto
        "
      >
        {/* Header */}

        

        {/* Tabs */}

        

        {/* Documents */}

        <div className="mt-10">

          <div className="flex justify-between items-center">

            <h1
              className="
              text-gray-500
              font-bold
              text-lg
              "
            >
              DOCUMENTS
            </h1>

            <button
              className="
              border
              bg-white
              rounded-lg
              px-5
              py-3
              flex
              items-center
              gap-2
              text-gray-500
              "
            >
              <Upload size={18} />
              Upload
            </button>

          </div>

          {/* Files */}

          <div className="space-y-5 mt-8">

            {documents.map((doc, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.1,
                }}
                whileHover={{
                  scale: 1.01,
                }}
                className="
                bg-white
                rounded-2xl
                p-5
                flex
                items-center
                gap-5
                "
              >
                {/* icon */}

                <div
                  className={`
                  w-12
                  h-12
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  ${doc.bg}
                  `}
                >
                  <doc.icon
                    className={doc.iconColor}
                    size={22}
                  />
                </div>

                {/* text */}

                <div>

                  <h1
                    className="
                    text-[#082f57]
                    font-bold
                    text-lg
                    md:text-2xl
                    "
                  >
                    {doc.name}
                  </h1>

                  <p
                    className="
                    text-gray-400
                    text-sm
                    md:text-lg
                    "
                  >
                    {doc.type} • {doc.size} • {doc.date}
                  </p>

                </div>

              </motion.div>
            ))}
          </div>

        </div>

      </motion.div>

    </div>
  );
}