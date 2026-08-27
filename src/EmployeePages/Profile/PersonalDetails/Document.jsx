import { useEffect, useState } from "react";
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
import { getProfile, uploadDocument } from "../../../services/profileApi";

export default function EmployeeDocuments() {
    const [documents, setDocuments] = useState([
        {
            title: "Latest Resume",
            type: "resume",
            icon: FileText,
            file: null,
        },
        {
            title: "PAN Card",
            type: "panCard",
            icon: IdCard,
            file: null,
        },
        {
            title: "Aadhaar Card",
            type: "aadhaarCard",
            icon: Fingerprint,
            file: null,
        },
        {
            title: "Edu. Certificates",
            type: "certificates",
            icon: GraduationCap,
            file: null,
        },
        {
            title: "Experience",
            type: "experience",
            icon: FileBadge,
            file: null,
        },
    ]);
    const [uploading, setUploading] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProfile().then(({ data }) => {
            const stored = data.user?.profile?.documents || {};
            setDocuments((previous) => previous.map((doc) => ({ ...doc, file: stored[doc.type] || null })));
        }).catch(() => setMessage("Failed to load documents")).finally(() => setLoading(false));
    }, []);

    const handleFileUpload = async (e, documentType) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;
        setUploading(documentType);
        setMessage("");
        try {
            const { data } = await uploadDocument(documentType, selectedFile);
            setDocuments((prev) => prev.map((doc) => doc.type === documentType ? { ...doc, file: data.document } : doc));
            setMessage("Document uploaded successfully");
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to upload document");
        } finally {
            setUploading("");
            e.target.value = "";
        }
    };

    const handleView = (file) => {
        if (file?.fileUrl) window.open(file.fileUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="bg-[#f8f8f8] border rounded-3xl p-6">
            {/* Header */}
            <h2 className="text-3xl font-bold text-black mb-8">
                Documents
            </h2>
            {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}
            {loading && <p className="text-sm text-gray-500 mb-4">Loading documents...</p>}

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
                                {doc.file ? doc.file.fileName : "Not uploaded"}
                            </p>
                        </div>

                        {/* Actions */}
                        {doc.file ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleView(doc.file)}
                                    disabled={uploading === doc.type}
                                    className="flex-1 bg-[#1f5ea8] hover:bg-[#164785] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition"
                                >
                                    <Eye size={16} />
                                    View
                                </button>

                                <button
                                    onClick={() =>
                                        document.getElementById(`upload-${index}`).click()
                                    }
                                    disabled={uploading === doc.type}
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
                                        handleFileUpload(e, doc.type)
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
                                        handleFileUpload(e, doc.type)
                                    }
                                />

                                <button
                                    onClick={() =>
                                        document
                                            .getElementById(`upload-${index}`)
                                            .click()
                                    }
                                    className="w-full border-2 border-dashed border-blue-300 text-[#1f5ea8] py-3 rounded-xl font-small flex items-center justify-center gap-2 hover:bg-blue-50 transition"
                                    disabled={uploading === doc.type}
                                >
                                    <Upload size={18} />
                                    {uploading === doc.type ? "Uploading..." : "Upload File"}
                                </button>
                            </>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}