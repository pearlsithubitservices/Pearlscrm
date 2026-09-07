import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, ChevronDown, X } from "lucide-react";
import useAttendanceCorrection from "../../Hooks/useAttendanceCorrection";
import InputField from "../../components/InputField";
import { useAuth } from "../../context/AuthContext";

const AttendanceCorrection = ({ onClose, selectedRecord }) => {
  const { submitCorrection, loading } = useAttendanceCorrection();
  const { user } = useAuth();

  const getFormattedDate = (rec) => {
    if (!rec) return new Date().toISOString().split("T")[0];
    const rawDate = rec.clockIn || rec.date;
    if (!rawDate) return new Date().toISOString().split("T")[0];
    const d = new Date(rawDate);
    return isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
  };

  const getFormattedTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const hrs = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${hrs}:${mins}`;
  };

  const [form, setForm] = useState({
    employeeId: user?.employeeId || user?.employee_uid || user?.uid || user?._id || user?.id || "",
    fullName: user?.displayName || user?.fullName || user?.name || (user?.email ? user.email.split("@")[0] : ""),
    department: user?.department || user?.dept || "",
    managerId: "",
    managerName: "",
    correctionType: "Missed Check-In",
    date: getFormattedDate(selectedRecord),
    correctCheckIn: getFormattedTime(selectedRecord?.clockIn),
    correctCheckOut: getFormattedTime(selectedRecord?.clockOut),
    workMode: selectedRecord?.location || "In Office",
    reason: "",
  });

  useEffect(() => {
    if (user || selectedRecord) {
      setForm((prev) => ({
        ...prev,
        employeeId: prev.employeeId || user?.employeeId || user?.employee_uid || user?.uid || user?._id || user?.id || "",
        fullName: prev.fullName || user?.displayName || user?.fullName || user?.name || (user?.email ? user.email.split("@")[0] : ""),
        department: prev.department || user?.department || user?.dept || "",
        date: selectedRecord ? getFormattedDate(selectedRecord) : prev.date,
        correctCheckIn: selectedRecord?.clockIn ? getFormattedTime(selectedRecord.clockIn) : prev.correctCheckIn,
        correctCheckOut: selectedRecord?.clockOut ? getFormattedTime(selectedRecord.clockOut) : prev.correctCheckOut,
      }));
    }
  }, [user, selectedRecord]);

  // 🔥 handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 submit handler
  const handleSubmit = async () => {
    const empId = form.employeeId || user?.employeeId || user?.employee_uid || user?.uid || user?._id || user?.id;
    const empName = form.fullName || user?.displayName || user?.fullName || user?.name || (user?.email ? user.email.split("@")[0] : "");

    if (!empId || !empName) {
      alert("Please ensure Employee ID and Full Name are provided!");
      return;
    }

    if (!form.correctCheckIn) {
      alert("Please select the Correct Check-In time!");
      return;
    }

    const payload = {
      ...form,
      employeeId: empId,
      fullName: empName,
    };

    try {
      const res = await submitCorrection(payload);
      if (res && res.success) {
        alert("✅ Attendance correction request submitted successfully!");
        onClose?.();
      } else {
        alert("❌ Failed to submit request: " + (res?.message || "Server error"));
      }
    } catch (err) {
      alert("❌ Error: " + (err.message || "Failed to submit request"));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-h-screen w-[600px] p-4 md:p-8"
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