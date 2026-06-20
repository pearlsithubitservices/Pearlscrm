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
  const [loading, setLoading] = useState();
  const { employees } = useEmployees();

  const [formData, setFormData] = useState({
    clientName: "",
    companyName: "",
    phone: "",
    email: "",
    status: "",
    leadSchedule: "",
    type: "",
    assignedTo: "",
    followupCount: "",
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
      placeholder: "+1(555) 000-0000",
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
      options: ["New", "Pending", "Completed"],
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
      placeholder: "e.g. call, email, website",
      options: ["Call", "Email", "Website", "Meeting"],
    },
    {
      label: "Assigned To",
      Icon: Users,
      name: "assignedTo",
      type: "select",
      placeholder: "Select Employee",
      options: employees.map((emp) => ({
        label: emp.name, // Change to emp.employeeName if your employee object uses a different field
        value: emp.uid,
      })),
    },
    {
      label: "Follow-ups Count",
      Icon: Repeat2,
      name: "followupCount",
      placeholder: "0",
      type: "number",
    },
    {
      label: "Follow-ups Time",
      Icon: Clock2,
      name: "followupTime",
      placeholder: "5:56 pm",
      type: "time",
    },
  ];

  const SectionTitle = ({ title }) => (
    <div className="flex items-center gap-5 mb-10">
      <p className="text-[13px] tracking-[3px] text-[#8c8c8c] whitespace-nowrap">
        {title}
      </p>

      <div className="w-full h-[1px] bg-[#a8a29e]" />
    </div>
  );
  const handleSubmit = async () => {
    try {
      const res = await createFollowup({
        ...formData,
        followupCount: Number(formData.followupCount),
      });

      console.log(res);

      alert("Follow-up added successfully");

      setFormData({
        clientName: "",
        companyName: "",
        phone: "",
        email: "",
        status: "",
        leadSchedule: "",
        type: "",
        assignedTo: "",
        followupCount: "",
        followupTime: "",
      });
      fetchdata();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className=" relative w-full max-w-6xl bg-[#f3f0ea] rounded-[40px] p-10 shadow-sm"
    >
      <X size={18} className=" absolute top-4 right-7 w-6 h-6 bg-red-500 text-white hover:bg-white hover:text-red-700 hover:scale-110
      transition-transform duration-200" onClick={() => onClose()} />

      {/* CONTACT INFO */}

      <SectionTitle title="CONTACT INFO" />

      <div className="grid grid-cols-2 gap-8">

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

      <div className="mt-14">

        <SectionTitle title="LEAD DETAILS" />

        <div className="grid grid-cols-2 gap-8">

          {leadFields.map((field, i) => {
            if (field.name === "assignedTo") {
              return (
                <div key={i} className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">
                    {field.label}
                  </label>

                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">Select Employee</option>

                    {employees.map((employee) => (
                      <option key={employee.uid} value={employee.uid}>
                        {employee.name}
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

      <div className="flex items-center gap-5 mt-10">

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-[170px] h-[62px] rounded-2xl border border-[#8f8f8f] text-[#8f8f8f] text-[20px]"
        >
          Cancel
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 h-[62px] rounded-2xl bg-[#165da8] text-white text-[22px] font-semibold flex items-center justify-center gap-4"
          onClick={handleSubmit}
        >

          <Plus size={24} />

          {loading ? "Saving..." : "Add Follow-Ups"}

        </motion.button>

      </div>

    </motion.div>
  );
}