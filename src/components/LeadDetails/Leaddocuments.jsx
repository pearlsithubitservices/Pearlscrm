import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  FileImage,
  Upload,
} from "lucide-react";

import toast from "react-hot-toast";
import { apiUrl } from "../../config/api.js";

export default function LeadDocuments({ lead, fetchLead }) {

  const [selectedFile, setSelectedFile] = useState(null);

  const documents = Array.isArray(lead?.documents) ? lead.documents : [];

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

      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch(apiUrl(`/leads/${lead._id}/documents`), {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      await response.json();
      fetchLead();

      toast.success("File Uploaded Successfully");

      setSelectedFile(null);

    } catch (error) {

      toast.error("Upload Failed");

      console.log(error);

    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!lead?._id || !documentId || !window.confirm("Delete this document?")) return;
    try {
      const response = await fetch(apiUrl(`/leads/${lead._id}/documents/${documentId}`), {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete document");
      await response.json();
      fetchLead();
      toast.success("Document deleted");
    } catch (error) {
      toast.error(error.message);
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

            {documents.map((doc, index) => {
              const isImage = /image\//.test(doc.type || "");
              const Icon = isImage ? FileImage : FileText;
              return (
              <motion.div
                key={doc._id || index}
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
                  <Icon className="text-gray-500" size={22} />
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
                    {doc.type} • {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteDocument(doc._id)}
                  className="ml-auto text-red-600 hover:text-red-800"
                  aria-label="Delete document"
                >
                  Delete
                </button>

              </motion.div>
              );
            })}

          </div>

        </div>

      </motion.div>

    </div>
  );
}