import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
    UploadCloud,
    ChevronDown,
    X,
    Save,
} from "lucide-react";

import useTaxDocument from "../../../Hooks/useTaxDocument";
import { getFinancialYear } from '../../../Utils/formatNumber'

export default function TaxDocumentForm({
    onClose,
    editingDocument = null,
    getDocument,
}) {

    const fileRef = useRef(null);
    const year = getFinancialYear();
    console.log(year);

    const {
        addDocument,
        updateDocument,
    } = useTaxDocument();

    const [loading, setLoading] =
        useState(false);


    const [form, setForm] = useState({

        title: "",

        description: "",

        financialYear: year,

        documentType: "",

        document: null,

    });

    useEffect(() => {

        if (editingDocument) {

            setForm({

                title: editingDocument.title || "",

                description:
                    editingDocument.description || "",

                financialYear:
                    editingDocument.financialYear ||
                    year,

                documentType:
                    editingDocument.documentType || "",

                document: null,

            });

        }

    }, [editingDocument]);

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value,

        });

    };

    const handleFile = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setForm({

            ...form,

            document: file,

        });

    };

    const handleSubmit = async () => {

        if (!form.title) {

            alert("Select Tax Document");

            return;

        }

        try {

            setLoading(true);

            if (editingDocument) {

                await updateDocument(
                    editingDocument._id,
                    form
                );
                await getDocument();

            } else {
                
                await addDocument(form);
                  await getDocument();
            }

            onClose();

        } catch (err) {

            console.log(err);

            alert("Something went wrong.");

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6 z-50">

            <motion.div
                initial={{
                    opacity: 0,
                    scale: .95,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                }}
                className="w-full max-w-3xl h-[500px] overflow-y-auto no-scrollbar rounded-[28px] bg-[#F7F5EF] shadow-xl p-10"
            >

                {/* Header */}

                <div className="flex justify-between items-center mb-8">

                    <div className="flex items-center gap-5 w-full">

                        <span className="uppercase tracking-[3px] text-sm text-gray-500 whitespace-nowrap">

                            TAX DOCUMENTS INFORMATION

                        </span>

                        <div className="flex-1 h-px bg-gray-400"></div>

                    </div>

                    <button onClick={onClose}>

                        <X className="text-red-500" />

                    </button>

                </div>

                {/* Document Name */}

                <div>

                    <label className="block text-[#163B67] font-bold text-2xl mb-3">

                        Tax Documents Name

                    </label>

                    <div className="relative">

                        <select
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="appearance-none w-full h-16 rounded-2xl border bg-white px-5 text-xl outline-none"
                        >

                            <option value="">
                                Select Document
                            </option>

                            <option value="Form 16">
                                Form 16
                            </option>

                            <option value="Form 16A">
                                Form 16A
                            </option>

                            <option value="Form 26AS">
                                Form 26AS
                            </option>

                            <option value="Annual Tax Statement">
                                Annual Tax Statement
                            </option>

                        </select>

                        <ChevronDown
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                    </div>

                </div>

                {/* Description */}

                <div className="mt-8">

                    <div className="flex justify-between mb-3">

                        <label className="text-[#163B67] font-bold text-2xl">

                            Description

                        </label>

                        <span>

                            {form.description.length}/500

                        </span>

                    </div>

                    <textarea
                        rows={5}
                        maxLength={500}
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full rounded-2xl border bg-white p-5 text-lg outline-none resize-none"
                        placeholder="Document description..."
                    />

                </div>

                {/* Financial Year */}

                <div className="mt-8">

                    <label className="block text-[#163B67] font-bold text-xl mb-3">

                        Financial Year

                    </label>

                    <input
                        name="financialYear"
                        value={form.financialYear}
                        onChange={handleChange}
                        className="w-full h-14 rounded-xl border px-4 bg-white outline-none"
                    />

                </div>

                {/* File Upload */}

                <div className="mt-8">

                    <h3 className="text-[#163B67] font-bold text-2xl mb-4">

                        Upload File

                    </h3>

                    <div
                        onClick={() =>
                            fileRef.current.click()
                        }
                        className="cursor-pointer border-2 border-dashed rounded-2xl border-gray-300 bg-white py-14 flex flex-col justify-center items-center"
                    >

                        <UploadCloud
                            size={55}
                            className="text-gray-400 mb-4"
                        />

                        <p className="text-xl">

                            Drag & Drop or{" "}

                            <span className="text-green-700 underline">

                                Choose File

                            </span>

                        </p>

                        <p className="text-gray-400 mt-2">

                            JPG, PNG, PDF (Max 5MB)

                        </p>

                        {form.document && (

                            <p className="mt-4 text-blue-600 font-semibold">

                                {form.document.name}

                            </p>

                        )}

                        {editingDocument?.documentUrl &&
                            !form.document && (

                                <p className="mt-4 text-green-700">

                                    Existing File Uploaded

                                </p>

                            )}

                        <input
                            ref={fileRef}
                            hidden
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleFile}
                        />

                    </div>

                </div>

                {/* Buttons */}

                <div className="flex gap-5 mt-10">

                    <button
                        onClick={onClose}
                        className="w-44 h-16 rounded-2xl border bg-white"
                    >

                        Cancel

                    </button>

                    <motion.button
                        whileTap={{
                            scale: .95,
                        }}
                        disabled={loading}
                        onClick={handleSubmit}
                        className="flex-1 h-16 rounded-2xl bg-[#1F5EA8] text-white text-xl font-semibold flex items-center justify-center gap-3"
                    >

                        <Save />

                        {loading
                            ? "Saving..."
                            : editingDocument
                                ? "Update Document"
                                : "Add to Tax Documents"}

                    </motion.button>

                </div>

            </motion.div>

        </div>

    );

}