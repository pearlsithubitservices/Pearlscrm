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

const documents = [
    {
        id: 1,
        title: "Form 16",
        description: "TDS certificate from employer · FY 2025–26",
        icon: FileText,
    },
    {
        id: 2,
        title: "Annual Tax Statement",
        description: "Form 26AS · full year TDS summary",
        icon: Shield,
    },
    {
        id: 3,
        title: "Annual Tax Statement",
        description: "Form 26AS · full year TDS summary",
        icon: FileSpreadsheet,
    },
    {
        id: 4,
        title: "Form 16A",
        description: "TDS on non-salary income · FY 2025–26",
        icon: FileText,
    },
];

export default function TaxDocuments() {


    const { documents, deleteDocument, fetchDocuments } = useTaxDocuments();
    console.log(documents);

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
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="min-h-screen bg-[#F6F2EB] p-5"
        >
            <div className="max-w-7xl mx-auto">

                {/* Header */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex items-center justify-between">

                    <h1 className="text-4xl font-bold text-black">
                        Tax documents
                    </h1>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: .95 }}
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-[#E9EDF5] hover:bg-[#dfe5ef] text-gray-700 px-6 py-3 rounded-xl font-medium"
                    >
                        <Plus size={18} />
                        Add New
                    </motion.button>

                </div>

                {/* Cards */}

                <div className="mt-6 space-y-5">

                    {documents?.map((doc) => {

                        const Icon = iconMap[doc.title];


                        return (

                            <motion.div
                                key={doc.id}
                                whileHover={{
                                    y: -3,
                                    scale: 1.01,
                                }}
                                transition={{
                                    duration: .2,
                                }}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-6 flex items-center justify-between"
                            >

                                {/* Left */}

                                <div className="flex items-center gap-5">

                                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">

                                        <Icon
                                            size={30}
                                            className="text-[#2B6CB0]"
                                        />

                                    </div>

                                    <div>

                                        <h2 className="text-3xl font-bold text-gray-900">
                                            {doc.title}
                                        </h2>

                                        <p className="text-xl text-gray-500 mt-1">
                                            {doc.description}
                                        </p>

                                    </div>

                                </div>

                                {/* Right */}

                                <div className="flex items-center gap-5">

                                    <motion.a
                                        // href={`http://localhost:5000${doc.documentUrl}`}
                                        href={`https://pearlscrm.onrender.com${doc.documentUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.12 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center"
                                    >
                                        <Eye size={20} className="text-gray-600" />
                                    </motion.a>

                                    <motion.button
                                        whileHover={{ scale: 1.12 }}
                                        whileTap={{ scale: .9 }}
                                        onClick={() => handleEdit(doc)}
                                        className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center"
                                    >
                                        <SquarePen
                                            size={20}
                                            className="text-green-700"
                                        />
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.12 }}
                                        whileTap={{ scale: .9 }}
                                        onClick={() => handleDelete(doc._id)}
                                        className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center"
                                    >
                                        <Trash2
                                            size={20}
                                            className="text-red-500"
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