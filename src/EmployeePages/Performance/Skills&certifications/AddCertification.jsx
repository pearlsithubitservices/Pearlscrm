import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X } from "lucide-react";
import useSkillCertification from "../../../Hooks/useSkillCertification";
import { useAuth } from "../../../context/AuthContext";

export default function AddCertification({ onClose, fetchCertifications }) {
    const [formData, setFormData] = useState({
        certificationName: "",
        organization: "",
        issueDate: "",
        credentialId: "",
    });
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { addCertification } = useSkillCertification();
    const employeeUid = user?.uid || user?._id || user?.id || user?.email || "";

    const validateForm = () => {
        const newErrors = {};
        if (!formData.certificationName.trim()) {
            newErrors.certificationName = "Certification name is required";
        }
        if (!formData.organization.trim()) {
            newErrors.organization = "Organization is required";
        }
        if (!formData.issueDate) {
            newErrors.issueDate = "Issue date is required";
        }
        if (!file) {
            newErrors.image = "Certificate image is required";
        }
        return newErrors;
    };

    // handle text inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    // file upload
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            if (errors.image) {
                setErrors({ ...errors, image: "" });
            }
        }
    };

    const removeFile = () => setFile(null);

    // submit
    const handleSubmit = async () => {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (!employeeUid) {
            setErrors({ submit: "User session is missing. Please login again." });
            return;
        }

        setLoading(true);
        try {
            const form = new FormData();

            form.append("employee_uid", employeeUid);
            form.append("title", formData.certificationName);
            form.append("issuer", formData.organization);
            form.append("issued", formData.issueDate);
            form.append("credentialId", formData.credentialId || "");

            if (file) {
                form.append("image", file);
            }

            const res = await addCertification(form);

            if (res?.success) {
                setFormData({
                    certificationName: "",
                    organization: "",
                    issueDate: "",
                    credentialId: "",
                });
                setFile(null);
                await fetchCertifications?.();
                onClose?.();
            }
        } catch (err) {
            setErrors({ submit: err.message || "Failed to add certification" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-[#0F355C]">
                            Add Certification
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition"
                        >
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>

                    {errors.submit && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                            {errors.submit}
                        </div>
                    )}

                    {/* Certification Name */}
                    <div className="mb-5">
                        <label className="block mb-2 font-semibold text-[#0F355C]">
                            Certification Name <span className="text-red-500">*</span>
                        </label>

                        <input
                            name="certificationName"
                            value={formData.certificationName}
                            onChange={handleChange}
                            type="text"
                            placeholder="AWS Solutions Architect"
                            className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.certificationName ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.certificationName && (
                            <span className="text-red-500 text-sm mt-1">{errors.certificationName}</span>
                        )}
                    </div>

                    {/* Organization */}
                    <div className="mb-5">
                        <label className="block mb-2 font-semibold text-[#0F355C]">
                            Issuing Organization <span className="text-red-500">*</span>
                        </label>

                        <input
                            name="organization"
                            value={formData.organization}
                            onChange={handleChange}
                            type="text"
                            placeholder="Amazon Web Services"
                            className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.organization ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.organization && (
                            <span className="text-red-500 text-sm mt-1">{errors.organization}</span>
                        )}
                    </div>

                    {/* Date & Credential */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div>
                            <label className="block mb-2 font-semibold text-[#0F355C]">
                                Issue Date <span className="text-red-500">*</span>
                            </label>

                            <input
                                name="issueDate"
                                value={formData.issueDate}
                                onChange={handleChange}
                                type="date"
                                className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.issueDate ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.issueDate && (
                                <span className="text-red-500 text-sm mt-1">{errors.issueDate}</span>
                            )}
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
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Upload */}
                    <label className={`block mb-6 cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition ${errors.image ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50"}`}>
                        <input
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                        />

                        {file ? (
                            <div className="flex flex-col items-center">
                                <svg className="w-10 h-10 text-green-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm font-medium text-gray-700">
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeFile();
                                    }}
                                    className="text-red-500 text-sm mt-2 hover:text-red-700"
                                >
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload size={32} className="text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">
                                    Click to upload certificate
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    JPG, PNG, PDF (Max 5MB)
                                </p>
                            </div>
                        )}
                    </label>
                    {errors.image && (
                        <span className="text-red-500 text-sm mt-1">{errors.image}</span>
                    )}

                    {/* Footer */}
                    <div className="flex gap-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-[#0E5BA8] text-white font-semibold hover:bg-[#083a7a] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}