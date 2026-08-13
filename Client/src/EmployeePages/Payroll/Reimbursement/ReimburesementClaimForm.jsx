import React, { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, CalendarDays, IndianRupee, X } from "lucide-react";
import InputField from "../../../components/InputField.jsx";
import useReimbursement from "../../../Hooks/useReimbursement.js";
import { useAuth } from "../../../context/AuthContext.jsx";

export default function ReimbursementClaimForm({ onClose, getclaims }) {
  const [formData, setFormData] = useState({
    claimType: "",
    amount: "",
    expenseDate: "",
    description: "",
    receipt: null,
  });
  const { submitClaim, loading } = useReimbursement();
  const { user }=useAuth();
  

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      receipt: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data={
      ...formData,
      employee_uid:user.uid,
       employee_name:user.displayname || "Deepan"
    }
    await submitClaim( data );
    await getclaims();
    onClose();

    
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="bg-[#efede8] rounded-[28px] p-10 "
    >
      {/* Header */}

      <div className="flex items-center gap-3 mb-8">
        <h3 className="uppercase text-sm tracking-[3px] text-gray-500 whitespace-nowrap">
          Reimbursement Claim
        </h3>

        <div className="h-px flex-1 bg-gray-400" />
        <X size={20} className="text-white bg-red-700 hover:scale-105 transition-transform duration-150 rounded"
          onClick={onClose}
        />
      </div>

      {/* Claim Type */}

      <InputField
        label="Claim type"
        name="claimType"
        value={formData.claimType}
        onChange={handleChange}
        placeholder="Travel (local)"
        type="select"
        options={[
          "Travel (local)",
          "Medical",
          "Training / Courses",
          "Equipment (WFH)",
        ]}
      />

      {/* Amount + Date */}

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <InputField
          label="Amount (₹)"
          Icon={IndianRupee}
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="09:00 AM"
        />

        <InputField
          label="Expense date"
          Icon={CalendarDays}
          type="date"
          name="expenseDate"
          value={formData.expenseDate}
          onChange={handleChange}
        />
      </div>

      {/* Description */}

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <label className="font-bold text-[#0b2b57]">
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
          placeholder="Please explain the reason for this reimbursement request..."
          className="w-full h-32 rounded-xl border border-gray-200 bg-white p-4 outline-none resize-none"
        />
      </div>

      {/* Upload */}

      <div className="mt-8">
        <label className="font-bold text-[#0b2b57] block mb-3">
          Upload receipts
        </label>

        <label className="block cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
          />

          <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl h-44 flex flex-col items-center justify-center">
            <UploadCloud
              size={50}
              className="text-gray-400 mb-4"
            />

            <p className="text-lg">
              Drag & Drop or{" "}
              <span className="text-green-700 underline font-medium">
                Choose File
              </span>
            </p>

            <p className="text-xs text-gray-400 mt-3">
              Supported: JPG, PNG, PDF (Max 5MB)
            </p>

            {formData.file && (
              <p className="mt-2 text-sm font-medium text-green-600">
                {formData.receipt.name}
              </p>
            )}
          </div>
        </label>
      </div>

      {/* Footer Buttons */}

      <div className="flex gap-4 mt-10">
        <button
          type="button"
          className="px-10 py-4 rounded-2xl border border-gray-400 bg-white text-gray-600 font-medium"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="flex-1 py-4 rounded-2xl bg-[#1f66b2] text-white font-semibold text-lg"
        >
          Submit Claim
        </button>
      </div>
    </motion.form>
  );
}