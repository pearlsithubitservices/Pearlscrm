import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X } from "lucide-react";
import useSkillCertification from "../../../Hooks/useSkillCertification";

export default function AddCertification({ onClose }) {
    const [formData, setFormData] = useState({
        certificationName: "",
        organization: "",
        issueDate: "",
        credentialId: "",
    });

    const [file, setFile] = useState(null);

    const { addCertification, loading } =
        useSkillCertification();

    // handle text inputs
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // file upload
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const removeFile = () => setFile(null);

    // submit
    const handleSubmit = async () => {
        if (!formData.certificationName) return;

        const payload = {
            employee_uid: "EMP001", // replace with real user id
            title: formData.certificationName,
            issuer: formData.organization,
            issued: formData.issueDate,
            credentialId: formData.credentialId,
            file: file ? file.name : null, // backend file upload not implemented yet
        };

        const res = await addCertification(payload);

        if (res?.success) {
            setFormData({
                certificationName: "",
                organization: "",
                issueDate: "",
                credentialId: "",
            });
            setFile(null);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-lg max-h-[500px] h-full overflow-y-auto rounded-3xl bg-[#F5F2EC] shadow-2xl p-6"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-[#0F355C]">
                            Add Certification
                        </h2>

                        <button onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Certification Name */}
                    <div className="mb-4">
                        <label className="block mb-2 font-semibold text-[#0F355C]">
                            Certification Name
                        </label>

                        <input
                            name="certificationName"
                            value={formData.certificationName}
                            onChange={handleChange}
                            type="text"
                            placeholder="AWS Solutions Architect"
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Organization */}
                    <div className="mb-4">
                        <label className="block mb-2 font-semibold text-[#0F355C]">
                            Issuing Organization
                        </label>

                        <input
                            name="organization"
                            value={formData.organization}
                            onChange={handleChange}
                            type="text"
                            placeholder="Amazon Web Services"
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Date & Credential */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="block mb-2 font-semibold text-[#0F355C]">
                                Issue Date
                            </label>

                            <input
                                name="issueDate"
                                value={formData.issueDate}
                                onChange={handleChange}
                                type="date"
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-[#0F355C]">
                                Credential ID
                            </label>

                            <input
                                name="credentialId"
                                value={formData.credentialId}
                                onChange={handleChange}
                                type="text"
                                placeholder="123456"
                                className="w-full rounded-xl border px-4 py-3 outline-none"
                            />
                        </div>
                    </div>

                    {/* Upload */}
                    <label className="block mb-6 cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center">
                            <Upload
                                size={32}
                                className="text-gray-400 mb-2"
                            />

                            <p className="text-sm text-gray-600">
                                Click to upload certificate
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                                JPG, PNG, PDF (Max 5MB)
                            </p>

                            {file && (
                                <div className="mt-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <p className="text-sm">
                                            {file.name}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={removeFile}
                                        >
                                            <X
                                                size={16}
                                                className="text-red-500"
                                            />
                                        </button>
                                    </div>

                                    <p className="text-xs text-gray-500">
                                        {(
                                            file.size / 1024
                                        ).toFixed(2)}{" "}
                                        KB
                                    </p>
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                        />
                    </label>

                    {/* Footer */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-3 rounded-xl border text-gray-600"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-[#0E5BA8] text-white font-semibold disabled:opacity-50"
                        >
                            {loading
                                ? "Submitting..."
                                : "Submit"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}