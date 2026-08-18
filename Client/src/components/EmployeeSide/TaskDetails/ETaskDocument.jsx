import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  Upload,
} from "lucide-react";

import toast from "react-hot-toast";
import { appUrl } from "../../../config/api.js";

export default function ETaskDocuments() {

  const [selectedFile, setSelectedFile] = useState(null);

  const [documents, setDocuments] = useState([
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
  ]);

  // Select File

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Upload File

  const handleUpload = async () => {

    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    try {

      // Backend Upload Logic

      const formData = new FormData();

      formData.append("file", selectedFile);

      /*
      await axios.post(
        appUrl("/upload"),
        formData
      );
      */

      // Create New Document Object

      const newDocument = {
        name: selectedFile.name,
        type: selectedFile.type.split("/")[1]?.toUpperCase(),
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        date: new Date().toLocaleDateString(),
        icon: selectedFile.type.includes("image")
          ? FileImage
          : FileText,
        bg: selectedFile.type.includes("image")
          ? "bg-purple-200"
          : "bg-gray-200",
        iconColor: selectedFile.type.includes("image")
          ? "text-purple-500"
          : "text-gray-500",
      };

      // Update UI

      setDocuments((prev) => [newDocument, ...prev]);

      toast.success("File Uploaded Successfully");

      setSelectedFile(null);

    } catch (error) {

      toast.error("Upload Failed");

      console.log(error);

    }
  };

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

        <div className="mt-10">

          <div className="flex flex-wrap gap-4 justify-between items-center">

            <h1
              className="
              text-gray-500
              font-bold
              text-lg
              "
            >
              DOCUMENTS
            </h1>

            {/* File Input */}

            <input
              type="file"
              onChange={handleFileChange}
              className="
              border
              bg-white
              rounded-lg
              px-5
              py-3
              text-gray-500 ml-60 
              "
            />

            {/* Upload Button */}

            <button
              onClick={handleUpload}
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
              hover:bg-gray-100
              transition
              "
            >
              <Upload size={18} />
              Upload
            </button>

          </div>

          {/* Documents List */}

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

                {/* Icon */}

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

                {/* Text */}

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