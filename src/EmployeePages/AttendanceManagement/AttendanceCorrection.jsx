import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Upload,
    ChevronDown,
    X,
} from "lucide-react";

const AttendanceCorrection = ({ onClose }) => {
    const [reason, setReason] = useState("");

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-h-screen w-[600px]  p-4 md:p-8 "
        >
            <div className="max-w-6xl mx-auto bg-[#e9e7e2] rounded-[30px] p-6 md:p-10 shadow-sm no-scrollbar">

                {/* Employee Details */}
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-xs tracking-[3px] text-gray-500 whitespace-nowrap">
                        EMPLOYEE DETAILS
                    </h2>
                    <div className="flex-1 h-px bg-gray-400" />
                    <X size={20} className="rounded bg-red-600 text-white hover:scale-105 transition-transform duration-150"  onClick={onClose}/>
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                    <InputField
                        label="Employee ID"
                        placeholder="HRMS-7829-X"
                    />

                    <InputField
                        label="Full Name"
                        placeholder="Alexander Mitchell"
                    />

                    <InputField
                        label="Department"
                        placeholder="Operations & Logistics"
                    />

                    <InputField
                        label="Manager ID"
                        placeholder="HRMS-7829990-X"
                    />

                    <InputField
                        label="Manager Name"
                        placeholder="Senthil Kumar"
                    />

                    <SelectField
                        label="Correction Type"
                        options={[
                            "Missed Check-In",
                            "Missed Check-Out",
                            "Wrong Check-In",
                            "Wrong Check-Out",
                        ]}
                    />
                </div>

                {/* Correction Details */}

                <div className="flex items-center gap-4 mt-10 mb-8">
                    <h2 className="text-xs tracking-[3px] text-gray-500 whitespace-nowrap">
                        CORRECTION DETAILS
                    </h2>
                    <div className="flex-1 h-px bg-gray-400" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                    <InputField
                        label="Select Date"
                        type="date"
                    />

                    <InputField
                        label="Correct Check-In"
                        type="time"
                    />

                    <SelectField
                        label="Work Mode"
                        options={[
                            "In Office",
                            "Remote",
                            "Hybrid",
                        ]}
                    />

                    <InputField
                        label="Correct Check-Out"
                        type="time"
                    />
                </div>

                {/* Reason */}

                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold text-[#0c315e]">
                            Reason for Correction
                        </label>

                        <span className="text-xs text-gray-500">
                            {reason.length}/500
                        </span>
                    </div>

                    <textarea
                        rows={5}
                        maxLength={500}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please explain the reason for this regularization request..."
                        className="w-full rounded-xl border border-gray-300 bg-white p-4 outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                </div>

                {/* Upload */}

                <div className="mt-6">
                    <label className="font-semibold text-[#0c315e] block mb-3">
                        Supporting Documents
                    </label>

                    <motion.label
                        whileHover={{ scale: 1.01 }}
                        className="border-2 border-dashed border-gray-300 rounded-2xl bg-white h-44 flex flex-col items-center justify-center cursor-pointer"
                    >
                        <Upload
                            size={48}
                            className="text-gray-400 mb-3"
                        />

                        <p className="text-lg">
                            Drag & Drop or{" "}
                            <span className="text-green-700 underline font-medium">
                                Choose File
                            </span>
                        </p>

                        <p className="text-xs text-gray-400 mt-2">
                            Supported: JPG, PNG, PDF (Max 5MB)
                        </p>

                        <input
                            type="file"
                            className="hidden"
                        />
                    </motion.label>
                </div>

                {/* Buttons */}

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                        className="sm:w-40 h-14 rounded-2xl border border-gray-400 bg-white text-gray-600 font-medium"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 h-14 rounded-2xl bg-[#1f5fa8] text-white font-semibold"
                    >
                        Submit Request
                    </motion.button>
                </div>

            </div>
        </motion.div>
    );
};

const InputField = ({
    label,
    placeholder,
    type = "text",
}) => (
    <div>
        <label className="block mb-2 font-semibold text-[#0c315e]">
            {label}
        </label>

        <input
            type={type}
            placeholder={placeholder}
            className="w-full h-14 rounded-xl border border-gray-300 bg-white px-4 outline-none focus:ring-2 focus:ring-blue-400"
        />
    </div>
);

const SelectField = ({
    label,
    options,
}) => (
    <div>
        <label className="block mb-2 font-semibold text-[#0c315e]">
            {label}
        </label>

        <div className="relative">
            <select className="w-full h-14 rounded-xl border border-gray-300 bg-white px-4 appearance-none outline-none focus:ring-2 focus:ring-blue-400">
                {options.map((item) => (
                    <option key={item}>{item}</option>
                ))}
            </select>

            <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
        </div>
    </div>
);

export default AttendanceCorrection;