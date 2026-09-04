import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  BriefcaseBusiness,
  Phone,
  Users,
  Activity,
  CalendarDays,
  Repeat2,
  Plus,
  Clock2,
  X,
} from "lucide-react";

import InputField from "../components/InputField";
import useFollowups from "../Hooks/useFollowups";
import useEmployees from "../Hooks/useEmployees";

export default function CreateFollowups({ onClose, fetchdata }) {
  const { createFollowup } = useFollowups();
  const [loading, setLoading] = useState(false);
  const { employees } = useEmployees();

  const [formData, setFormData] = useState({
    clientName: "",
    companyName: "",
    phone: "",
    email: "",
    status: "Pending",
    leadSchedule: "",
    type: "Call",
    assignedTo: "",
    followupCount: "1",
    followupTime: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactFields = [
    {
      label: "Client Name",
      Icon: User,
      name: "clientName",
      placeholder: "e.g. John Doe",
    },
    {
      label: "Company Name",
      Icon: BriefcaseBusiness,
      name: "companyName",
      placeholder: "e.g. Innovatech Solutions",
    },
    {
      label: "Phone Number",
      Icon: Phone,
      name: "phone",
      placeholder: "+91 98765 43210",
    },
    {
      label: "Email",
      Icon: Users,
      name: "email",
      placeholder: "e.g. name@gmail.com",
      type: "email",
    },
  ];

  const leadFields = [
    {
      label: "Status",
      Icon: Activity,
      name: "status",
      type: "select",
      placeholder: "Select Status",
      options: [
        { label: "New", value: "New" },
        { label: "Pending", value: "Pending" },
        { label: "In Progress", value: "In Progress" },
        { label: "Completed", value: "Completed" },
      ],
    },
    {
      label: "Lead Schedule",
      Icon: CalendarDays,
      name: "leadSchedule",
      placeholder: "e.g. Follow-up meeting on Friday",
    },
    {
      label: "Type",
      Icon: Activity,
      name: "type",
      type: "select",
      placeholder: "Select Type",
      options: [
        { label: "Call", value: "Call" },
        { label: "Email", value: "Email" },
        { label: "Website", value: "Website" },
        { label: "Meeting", value: "Meeting" },
      ],
    },
    {
      label: "Assigned To",
      Icon: Users,
      name: "assignedTo",
      type: "select",
      placeholder: "Select Employee",
      options: employees.map((emp) => ({
        label: emp.name || emp.employeeName,
        value: emp.uid || emp._id || emp.name,
      })),
    },
    {
      label: "Follow-ups Count",
      Icon: Repeat2,
      name: "followupCount",
      placeholder: "1",
      type: "number",
    },
    {
      label: "Follow-ups Time",
      Icon: Clock2,
      name: "followupTime",
      placeholder: "e.g. 10:30 AM",
      type: "text",
    },
    {
      label: "Follow-ups Date",
      Icon: CalendarDays,
      name: "date",
      type: "date",
      placeholder: "Select Date",
    },
  ];

  const SectionTitle = ({ title }) => (
    <div className="flex items-center gap-4 mb-6 md:mb-8">
      <p className="text-[11px] md:text-[13px] font-bold tracking-[3px] text-[#8c8c8c] whitespace-nowrap uppercase">
        {title}
      </p>
      <div className="w-full h-[1px] bg-[#a8a29e]" />
    </div>
  );

  const handleSubmit = async () => {
    if (!formData.clientName.trim()) {
      alert("Client Name is required");
      return;
    }

    try {
      setLoading(true);
      await createFollowup({
        ...formData,
        followupCount: Number(formData.followupCount) || 1,
      });

      alert("Follow-up added successfully");

      setFormData({
        clientName: "",
        companyName: "",
        phone: "",
        email: "",
        status: "Pending",
        leadSchedule: "",
        type: "Call",
        assignedTo: "",
        followupCount: "1",
        followupTime: "",
      });

      if (fetchdata) await fetchdata();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create followup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-5xl bg-[#f3f0ea] rounded-[24px] md:rounded-[36px] p-6 md:p-10 shadow-2xl max-h-[90vh] overflow-y-auto modal-scrollbar border border-white/50"
    >
      <button
        onClick={() => onClose()}
        className="absolute top-4 right-5 md:top-6 md:right-8 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-transform hover:scale-110 cursor-pointer shadow-md"
      >
        <X size={18} />
      </button>

      {/* CONTACT INFO */}
      <SectionTitle title="CONTACT INFO" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {contactFields.map((field, i) => (
          <InputField
            key={i}
            {...field}
            value={formData[field.name]}
            onChange={handleChange}
            className="w-full"
          />
        ))}
      </div>

      {/* LEAD DETAILS */}
      <div className="mt-10">
        <SectionTitle title="LEAD DETAILS" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {leadFields.map((field, i) => {
            if (field.name === "assignedTo") {
              return (
                <div key={i} className="flex flex-col">
                  <label className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                    {field.label}
                  </label>

                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 text-sm font-medium text-gray-800"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                      <option
                        key={employee.uid || employee._id}
                        value={employee.uid || employee._id || employee.name}
                      >
                        {employee.name || employee.employeeName}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <InputField
                key={i}
                {...field}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full"
              />
            );
          })}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex flex-col-reverse sm:flex-row items-center gap-4 mt-10">
        <button
          onClick={onClose}
          className="w-full sm:w-44 h-14 rounded-2xl border border-gray-400 text-gray-700 text-base font-bold hover:bg-gray-200/50 transition cursor-pointer"
        >
          Cancel
        </button>

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full flex-1 h-14 rounded-2xl bg-[#165da8] hover:bg-[#124d8c] text-white text-lg font-semibold flex items-center justify-center gap-3 transition cursor-pointer shadow-md disabled:opacity-50"
        >
          <Plus size={20} />
          {loading ? "Saving..." : "Add Follow-Up"}
        </button>
      </div>
    </motion.div>
  );
}