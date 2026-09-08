import React, { useState } from "react";
import { X } from "lucide-react";
import useNotification from "../../../Hooks/useNotification";
import useEmployees from "../../../Hooks/useEmployees";

export default function NotificationForm({ onClose, fetchNotifications }) {
  const { createNotification } = useNotification();
  const { employees } = useEmployees();

  const [form, setForm] = useState({
    title: "",
    sub: "HR Manager",
    notificationType: "General",
    employeeId: "",
    isImportant: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await createNotification(form);

    if (result) {
      alert("Notification created successfully");
      fetchNotifications()

      setForm({
        title: "",
        sub: "HR Manager",
        notificationType: "General",
        employeeId: "",
        isImportant: true,
      });

      onClose();
    }
  };

  return (
    <div className="bg-white w-[500px] rounded-2xl shadow-xl p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#0B2B57]">
          Create Notification
        </h2>

        <X
          size={20}
          className="cursor-pointer"
          onClick={onClose}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Notification Title
          </label>

          <textarea
            name="title"
            rows={3}
            value={form.title}
            onChange={handleChange}
            placeholder="Enter notification message..."
            className="w-full border rounded-lg p-3"
            required
          />
        </div>

        {/* Sender */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Sender
          </label>

          <input
            type="text"
            name="sub"
            value={form.sub}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />
        </div>

        {/* Notification Type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Notification Type
          </label>

          <select
            name="notificationType"
            value={form.notificationType}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option value="Leave">Leave</option>
            <option value="Payroll">Payroll</option>
            <option value="Tax">Tax</option>
            <option value="Reimbursement">Reimbursement</option>
            <option value="Meeting">Meeting</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Employee ID */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Employee Name
          </label>
          <select
            name="employeeId"
            value={form.employeeId}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option value="">Select Employee</option>

            {employees?.map((employee) => (
              <option key={employee.uid} value={employee.uid}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        {/* Important */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isImportant"
            name="isImportant"
            checked={form.isImportant}
            onChange={handleChange}
          />

          <label htmlFor="isImportant">
            Mark as Important
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-[#0B2B57] text-white rounded-lg"
          >
            Create
          </button>
        </div>

      </form>
    </div>
  );
}