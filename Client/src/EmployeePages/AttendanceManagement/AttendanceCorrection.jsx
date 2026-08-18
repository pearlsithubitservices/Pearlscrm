import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, ChevronDown, X } from "lucide-react";
import useAttendanceCorrection from "../../Hooks/useAttendanceCorrection";
import InputField from "../../components/InputField";

const AttendanceCorrection = ({ onClose }) => {
  const { submitCorrection, loading } = useAttendanceCorrection();

  const [form, setForm] = useState({
    employeeId: "",
    fullName: "",
    department: "",
    managerId: "",
    managerName: "",
    correctionType: "",
    date: "",
    correctCheckIn: "",
    correctCheckOut: "",
    workMode: "",
    reason: "",
  });

  // 🔥 handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 submit handler
  const handleSubmit = async () => {
    await submitCorrection(form);
    onClose?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-h-screen w-full max-w-2xl p-4 md:p-8"
    >
      <div className="max-w-6xl mx-auto bg-[#e9e7e2] rounded-[30px] p-6 md:p-10 shadow-sm">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xs tracking-[3px] text-gray-500">
            EMPLOYEE DETAILS
          </h2>
          <div className="flex-1 h-px bg-gray-400" />
          <X onClick={onClose} className="cursor-pointer" />
        </div>

        {/* EMPLOYEE FIELDS */}
        <div className="grid md:grid-cols-2 gap-6">

          <InputField
            label="Employee ID"
            name="employeeId"
            value={form.employeeId}
            onChange={handleChange}
            placeholder="HRMS-7829-X"
          />

          <InputField
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Alexander Mitchell"
          />

          <InputField
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="Operations & Logistics"
          />

          <InputField
            label="Manager ID"
            name="managerId"
            value={form.managerId}
            onChange={handleChange}
            placeholder="HRMS-7829990-X"
          />

          <InputField
            label="Manager Name"
            name="managerName"
            value={form.managerName}
            onChange={handleChange}
            placeholder="Senthil Kumar"
          />

          <InputField
            label="Correction Type"
            name="correctionType"
            type="select"
            value={form.correctionType}
            onChange={handleChange}
            options={[
              "Missed Check-In",
              "Missed Check-Out",
              "Wrong Check-In",
              "Wrong Check-Out",
            ]}
            placeholder="Select Type"
          />
        </div>

        {/* CORRECTION DETAILS */}
        <div className="flex items-center gap-4 mt-10 mb-8">
          <h2 className="text-xs tracking-[3px] text-gray-500">
            CORRECTION DETAILS
          </h2>
          <div className="flex-1 h-px bg-gray-400" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <InputField
            label="Select Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
          />

          <InputField
            label="Correct Check-In"
            name="correctCheckIn"
            type="time"
            value={form.correctCheckIn}
            onChange={handleChange}
          />

          <InputField
            label="Correct Check-Out"
            name="correctCheckOut"
            type="time"
            value={form.correctCheckOut}
            onChange={handleChange}
          />

          <InputField
            label="Work Mode"
            name="workMode"
            type="select"
            value={form.workMode}
            onChange={handleChange}
            options={["In Office", "Remote", "Hybrid"]}
            placeholder="Select Mode"
          />
        </div>

        {/* REASON */}
        <div className="mt-6">
          <label className="block font-semibold text-[#0c315e] mb-2">
            Reason for Correction
          </label>

          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            maxLength={500}
            rows={5}
            className="w-full rounded-xl border border-gray-300 bg-white p-4"
            placeholder="Explain reason..."
          />
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="w-40 h-14 border rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-14 bg-blue-600 text-white rounded-xl"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>

      </div>
    </motion.div>
  );
};

export default AttendanceCorrection;