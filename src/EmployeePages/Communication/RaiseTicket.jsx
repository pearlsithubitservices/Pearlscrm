import React, { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, CalendarDays, IndianRupee, X, User, ShieldCheck } from "lucide-react";
import InputField from "../../components/InputField";
import useTicket from "../../Hooks/useTicket";
import { useAuth } from "../../context/AuthContext";

export default function RaiseTicket({ onClose }) {
    const { createTicket, fetchTickets } = useTicket();
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const empIdCode = user?.uid ? String(user.uid).slice(-6).toUpperCase() : (user?.id ? String(user.id).slice(-6).toUpperCase() : "EMP001");
    const empName = user?.displayName || user?.name || (user?.email ? user.email.split("@")[0] : "Employee");

    const [formData, setFormData] = useState({
        issuedcategory: "It/hardware",
        priority: "medium",
        subject: "",
        description: "",
        file: null,
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            file: e.target.files[0],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subject.trim() && !formData.description.trim()) {
            alert("Please provide a subject or description for your ticket.");
            return;
        }

        try {
            setSubmitting(true);
            const created = await createTicket(formData);
            if (created) {
                alert("Support ticket raised successfully!");
                await fetchTickets();
                onClose();
            } else {
                alert("Failed to create ticket. Please check connection and try again.");
            }
        } catch (err) {
            console.error("Raise ticket error:", err);
            alert("An error occurred while submitting ticket.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit}
            className="bg-[#efede8] rounded-[28px] p-8 md:p-10"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <h3 className="uppercase text-sm font-bold tracking-[3px] text-gray-500 whitespace-nowrap">
                    Raise Support Ticket
                </h3>

                <div className="h-px flex-1 bg-gray-400" />
                <X
                    size={20}
                    className="text-white bg-red-700 hover:scale-105 transition-transform duration-150 rounded cursor-pointer"
                    onClick={onClose}
                />
            </div>

            {/* AUTOMATIC STATIC EMPLOYEE INFO BANNER (CANNOT BE DELETED) */}
            <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Submitted By</p>
                        <p className="text-sm font-bold text-[#0b2b57]">{empName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Employee ID (Static)</p>
                        <p className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            #{empIdCode}
                        </p>
                    </div>
                </div>
            </div>

            {/* Issued Category + Priority */}
            <div className="grid md:grid-cols-2 gap-6 mt-4">
                <InputField
                    label="Issued Category"
                    Icon={IndianRupee}
                    name="issuedcategory"
                    value={formData.issuedcategory}
                    onChange={handleChange}
                    placeholder="IT hardware"
                    type="select"
                    options={[
                        { value: "It/hardware", label: "IT / Hardware" },
                        { value: "It/software", label: "IT / Software" },
                        { value: "hr/payroll", label: "HR / Payroll" },
                        { value: "finance", label: "Finance" },
                        { value: "admin/facilities", label: "Admin / Facilities" },
                        { value: "other", label: "Other" },
                    ]}
                />

                <InputField
                    label="Priority"
                    Icon={CalendarDays}
                    placeholder="Select priority"
                    type="select"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    options={[
                        { value: "high", label: "High" },
                        { value: "medium", label: "Medium" },
                        { value: "low", label: "Low" },
                    ]}
                />
            </div>

            {/* Subject */}
            <InputField
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief title of the issue..."
                type="text"
            />

            {/* Description */}
            <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                    <label className="font-bold text-[#0b2b57] text-sm">
                        Description
                    </label>

                    <span className="text-xs text-gray-400">
                        {formData.description.length} / 500
                    </span>
                </div>

                <textarea
                    name="description"
                    maxLength={500}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the issue in detail..."
                    className="w-full h-32 rounded-xl border border-gray-200 bg-white p-4 outline-none resize-none text-xs focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Upload Attachment */}
            <div className="mt-6">
                <label className="font-bold text-[#0b2b57] block mb-2 text-sm">
                    Upload Attachment (Receipt / Screenshot)
                </label>

                <label className="block cursor-pointer">
                    <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                    />

                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl h-36 flex flex-col items-center justify-center hover:border-blue-500 transition">
                        <UploadCloud
                            size={40}
                            className="text-gray-400 mb-2"
                        />

                        <p className="text-sm text-gray-600">
                            Drag & Drop or{" "}
                            <span className="text-blue-600 underline font-semibold">
                                Choose File
                            </span>
                        </p>

                        <p className="text-[11px] text-gray-400 mt-1">
                            Supported: JPG, PNG, PDF (Max 5MB)
                        </p>

                        {formData.file && (
                            <p className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                                {formData.file.name}
                            </p>
                        )}
                    </div>
                </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-4 mt-8">
                <button
                    type="button"
                    className="px-8 py-3.5 rounded-2xl border border-gray-400 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition cursor-pointer"
                    onClick={onClose}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 rounded-2xl bg-[#1f66b2] text-white font-semibold text-base hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                    {submitting ? "Submitting..." : "Submit Support Ticket"}
                </button>
            </div>
        </motion.form>
    );
}