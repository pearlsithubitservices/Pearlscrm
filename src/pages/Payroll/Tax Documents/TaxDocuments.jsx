import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    Shield,
    FileSpreadsheet,
    Eye,
    SquarePen,
    Trash2,
    Plus,
} from "lucide-react";

import useTaxDocuments from "../../../Hooks/useTaxDocument";
import TaxDocumentForm from "./TaxDocumentForm";

const defaultTaxCatalog = [
    {
        _id: "def-1",
        title: "Form 16",
        description: "TDS certificate from employer · FY 2025–26",
    },
    {
        _id: "def-2",
        title: "Form 16A",
        description: "TDS on non-salary income · FY 2025–26",
    },
    {
        _id: "def-3",
        title: "Annual Tax Statement",
        description: "Form 26AS · full year TDS summary",
    },
];

export default function TaxDocuments() {


    const { documents: fetchedDocs, deleteDocument, fetchDocuments } = useTaxDocuments();
    const documents = (fetchedDocs && fetchedDocs.length > 0) ? fetchedDocs : defaultTaxCatalog;

    const [openForm, setOpenForm] = useState(false);

    const [selectedDocument, setSelectedDocument] =
        useState(null);

    const iconMap = {
        "Form 16": FileText,
        "Form 16A": FileText,
        "Annual Tax Statement": Shield,
        "Form 26AS": FileSpreadsheet,
        "Other": FileText,
    };

    const handleEdit = (doc) => {
        setSelectedDocument(doc);
        setOpenForm(true);
    };

    const handleAdd = () => {
        setSelectedDocument(null);
        setOpenForm(true);
    };

    const handleDelete = async (id) => {

        const ok = window.confirm(
            "Delete this document?"
        );

        if (!ok) return;

        await deleteDocument(id);
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-[#F6F2EB] p-4 sm:p-6 custom-scrollbar"
        >
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Tax documents
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and publish tax forms for employees</p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: .97 }}
                        onClick={handleAdd}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-sm w-full sm:w-auto"
                    >
                        <Plus size={18} />
                        <span>Add New</span>
                    </motion.button>

                </div>

                {/* Cards */}

                <div className="space-y-4">

                    {documents?.map((doc, idx) => {

                        const Icon = iconMap[doc.title] || FileText;
                        const docUrl = doc.documentUrl
                            ? (doc.documentUrl.startsWith("http") ? doc.documentUrl : `http://localhost:5000${doc.documentUrl.startsWith("/") ? doc.documentUrl : `/${doc.documentUrl}`}`)
                            : "#";

                        return (

                            <motion.div
                                key={doc._id || doc.id || idx}
                                whileHover={{ y: -2 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                            >

                                {/* Left */}

                                <div className="flex items-center gap-4">

                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">

                                        <Icon
                                            size={26}
                                            className="text-blue-700"
                                        />

                                    </div>

                                    <div>

                                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                            {doc.title}
                                        </h2>

                                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                            {doc.description || "Official Tax Document"}
                                        </p>

                                    </div>

                                </div>

                                {/* Right */}

                                <div className="flex items-center gap-3 self-end sm:self-center">

                                    <motion.a
                                        href={docUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                                        title="View Document"
                                    >
                                        <Eye size={18} className="text-gray-600" />
                                    </motion.a>

                                    <motion.button
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: .95 }}
                                        onClick={() => handleEdit(doc)}
                                        className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition"
                                        title="Edit Document"
                                    >
                                        <SquarePen
                                            size={18}
                                            className="text-emerald-700"
                                        />
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: .95 }}
                                        onClick={() => handleDelete(doc._id)}
                                        className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition"
                                        title="Delete Document"
                                    >
                                        <Trash2
                                            size={18}
                                            className="text-red-600"
                                        />
                                    </motion.button>

                                </div>

                            </motion.div>

                        );
                    })}

                </div>

            </div>
            {
                openForm && (
                    <TaxDocumentForm
                        onClose={() => {
                            setOpenForm(false);
                            setSelectedDocument(null);
                        }}
                        editingDocument={selectedDocument}
                        getDocument={fetchDocuments}
                    />
                )
            }
        </motion.div>
    );
}