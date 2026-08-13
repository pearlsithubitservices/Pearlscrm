import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    IdCard,
    Fingerprint,
    GraduationCap,
    FileBadge,
    Upload,
    Eye,
    Pencil,
} from "lucide-react";

export default function EmployeeDocuments() {
    const [documents, setDocuments] = useState([
        {
            title: "Latest Resume",
            icon: FileText,
            file: null,
        },
        {
            title: "PAN Card",
            icon: IdCard,
            file: null,
        },
        {
            title: "Aadhaar Card",
            icon: Fingerprint,
            file: null,
        },
        {
            title: "Edu. Certificates",
            icon: GraduationCap,
            file: null,
        },
        {
            title: "Experience",
            icon: FileBadge,
            file: null,
        },
    ]);

    const handleFileUpload = (e, title) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        setDocuments((prev) =>
            prev.map((doc) =>
                doc.title === title
                    ? {
                        ...doc,
                        file: selectedFile,
                    }
                    : doc
            )
        );
    };

    const handleView = (file) => {
        if (!file) return;

        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
    };

    return (
        <div className="bg-[#f8f8f8] border rounded-3xl p-6">
            {/* Header */}
            <h2 className="text-3xl font-bold text-black mb-8">
                Documents
            </h2>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {documents.map((doc, index) => (
                    <motion.div
                        key={doc.title}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{
                            y: -5,
                            scale: 1.02,
                        }}
                        className="bg-white border rounded-3xl p-6 shadow-sm min-h-[250px] flex flex-col justify-between"
                    >
                        <div>
                            {/* Icon */}
                            <div className="mb-5">
                                <doc.icon
                                    size={34}
                                    className="text-slate-500"
                                    strokeWidth={1.8}
                                />
                            </div>

                            {/* Title */}
                            <h3 className="font-bold text-[#0b2b57] text-lg mb-3">
                                {doc.title}
                            </h3>

                            {/* File Name */}
                            <p className="text-gray-500 text-sm mb-6 truncate">
                                {doc.file ? doc.file.name : "Not uploaded"}
                            </p>
                        </div>

                        {/* Actions */}
                        {doc.file ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleView(doc.file)}
                                    className="flex-1 bg-[#1f5ea8] hover:bg-[#164785] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition"
                                >
                                    <Eye size={16} />
                                    View
                                </button>

                                <button
                                    onClick={() =>
                                        document.getElementById(`upload-${index}`).click()
                                    }
                                    className="w-12 bg-slate-100 hover:bg-slate-200 text-[#0b2b57] py-3 rounded-xl flex items-center justify-center transition"
                                >
                                    <Pencil size={16} />
                                </button>

                                <input
                                    type="file"
                                    id={`upload-${index}`}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={(e) =>
                                        handleFileUpload(e, doc.title)
                                    }
                                />
                            </div>
                        ) : (
                            <>
                                <input
                                    type="file"
                                    id={`upload-${index}`}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={(e) =>
                                        handleFileUpload(e, doc.title)
                                    }
                                />

                                <button
                                    onClick={() =>
                                        document
                                            .getElementById(`upload-${index}`)
                                            .click()
                                    }
                                    className="w-full border-2 border-dashed border-blue-300 text-[#1f5ea8] py-3 rounded-xl font-small flex items-center justify-center gap-2 hover:bg-blue-50 transition"
                                >
                                    <Upload size={18} />
                                    Upload File
                                </button>
                            </>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}