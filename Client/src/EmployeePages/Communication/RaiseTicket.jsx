import React, { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, CalendarDays, IndianRupee, X } from "lucide-react";
import InputField from "../../components/InputField";
import useTicket from "../../Hooks/useTicket";

export default function RaiseTicket({ onClose }) {
    const { fetchTickets, createTicket } = useTicket();
    const [formData, setFormData] = useState({
        issuedcategory: "",
        priority: "",
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
        await createTicket(formData);
        await fetchTickets();
        onClose();
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit}
            className="w-full max-w-3xl mx-auto bg-[#efede8] rounded-2xl sm:rounded-[28px] p-4 sm:p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto page-scroll"
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-6 border-b border-gray-300 pb-4">
                <h3 className="uppercase text-xs sm:text-sm font-bold tracking-[2px] text-[#0b2b57]">
                    Raise Ticket
                </h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-full text-gray-600 hover:bg-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <InputField
                    label="Issued Category"
                    Icon={IndianRupee}
                    name="issuedcategory"
                    value={formData.issuedcategory}
                    onChange={handleChange}
                    placeholder="IT hardware"
                    type="select"
                    options={[
                        { value: "It/hardware", label: "IT/Hardware" },
                        { value: "It/software", label: "IT/Software" },
                        { value: "hr/payroll", label: "HR/Payroll" },
                        { value: "finance", label: "Finance" },
                        { value: "admin/facilities", label: "Admin/Facilities" },
                        { value: "other", label: "Other" },
                    ]}
                />

                <InputField
                    label="Priority"
                    Icon={CalendarDays}
                    placeholder="Select type"
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

            <div className="mt-4">
                <InputField
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief title of the issue"
                    type="text"
                />
            </div>

            {/* Description */}
            <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
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
                    placeholder="Describe the issue you had..."
                    className="w-full h-28 rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Upload */}
            <div className="mt-6">
                <label className="font-bold text-[#0b2b57] text-sm block mb-2">
                    Upload Receipts / Files
                </label>

                <label className="block cursor-pointer">
                    <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                    />

                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                        <UploadCloud
                            size={36}
                            className="text-gray-400 mb-2"
                        />
                        <p className="text-sm font-medium text-gray-700">
                            Drag & Drop or{" "}
                            <span className="text-blue-700 underline font-semibold">
                                Choose File
                            </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Supported: JPG, PNG, PDF (Max 5MB)
                        </p>

                        {formData.file && (
                            <p className="mt-2 text-xs font-semibold text-green-600">
                                {formData.file.name}
                            </p>
                        )}
                    </div>
                </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 border-t border-gray-300 pt-6">
                <button
                    type="button"
                    className="px-6 py-3 rounded-xl border border-gray-400 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="flex-1 py-3 px-6 rounded-xl bg-[#1f66b2] hover:bg-[#185392] text-white font-semibold text-sm transition-colors shadow-sm"
                >
                    Submit Ticket
                </button>
            </div>
        </motion.form>
    );
}