import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MessageCircle,
  User,
  CalendarDays,
  Briefcase,
} from "lucide-react";
import useEmployees from "../../Hooks/useEmployees";

export default function Leadhome({
  lead,
  isEditing,
  editData,
  handleChange,
}) {
  const { employees } = useEmployees();

  const leadname = employees?.find(
    (item) => item.uid === (isEditing ? editData?.assignedTo : lead?.assignedTo)
  );

  const contactInfo = [
    {
      title: "EMAIL",
      key: "email",
      icon: Mail,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    {
      title: "PHONE",
      key: "phone",
      icon: Phone,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      title: "LEAD SOURCE",
      key: "source",
      icon: MessageCircle,
      color: "text-purple-500",
      bg: "bg-purple-100",
    },
    {
      title: "FOLLOW-UP",
      key: "followUpCount",
      icon: CalendarDays,
      color: "text-pink-500",
      bg: "bg-pink-100",
    },
    {
      title: "STATUS",
      key: "status",
      icon: Briefcase,
      color: "text-cyan-500",
      bg: "bg-cyan-100",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-h-screen bg-[#efede8] p-5"
    >
      <div className="max-w-7xl mx-auto">

        {/* DEAL VALUE */}
        <div className="mt-8">
          <h3 className="font-bold text-gray-400 mb-4">
            DEAL VALUE
          </h3>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-3xl p-6 shadow-sm"
          >
            <div className="flex justify-between items-center">

              <div>
                {isEditing ? (
                  <input
                    name="budget"
                    value={editData?.budget || ""}
                    onChange={handleChange}
                    className="text-2xl font-bold border p-2 rounded"
                  />
                ) : (
                  <h1 className="text-4xl font-bold text-[#082f57]">
                    ₹{lead?.budget || "120,000"}
                  </h1>
                )}

                <p className="text-gray-400 mt-3">
                  Pipeline probability — 72% likely to close
                </p>
              </div>

              <div className="hidden md:flex w-20 h-20 rounded-full bg-blue-100 items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">
                  72%
                </span>
              </div>

            </div>

            <div className="w-full bg-gray-200 h-3 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-[72%]" />
            </div>
          </motion.div>
        </div>

        {/* CONTACT INFO */}
        <div className="mt-10">
          <h3 className="font-bold text-gray-400 mb-5">
            CONTACT INFORMATION
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {contactInfo.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm"
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center gap-4">

                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.bg}`}>
                    <item.icon className={item.color} size={24} />
                  </div>

                  <div className="w-full">

                    <p className="text-gray-400 text-sm font-semibold">
                      {item.title}
                    </p>

                    {/* VALUE OR INPUT */}
                    {item.key === "status" ? (
                      isEditing ? (
                        <select
                          name="status"
                          value={editData?.status || ""}
                          onChange={handleChange}
                          className="border p-2 rounded w-full mt-1"
                        >
                          <option value="">Select Status</option>
                          <option value="New">New</option>
                          <option value="Interested">Interested</option>
                         
                          <option value="Converted">Converted</option>
                         
                        </select>
                      ) : (
                        <h2 className="text-[#082f57] font-bold text-lg mt-1">
                          {lead?.status || "Not Available"}
                        </h2>
                      )
                    ) : isEditing ? (
                      <input
                        name={item.key}
                        value={editData?.[item.key] || ""}
                        onChange={handleChange}
                        className="border p-2 rounded w-full mt-1"
                      />
                    ) : (
                      <h2 className="text-[#082f57] font-bold text-lg mt-1">
                        {lead?.[item.key] || "Not Available"}
                      </h2>
                    )}

                  </div>

                </div>
              </motion.div>
            ))}

            {/* ASSIGNED TO (special field) */}
            <motion.div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <User className="text-orange-500" size={24} />
                </div>

                <div className="w-full">

                  <p className="text-gray-400 text-sm font-semibold">
                    ASSIGNED TO
                  </p>

                  {isEditing ? (
                    <select
                      name="assignedTo"
                      value={editData?.assignedTo || ""}
                      onChange={handleChange}
                      className="border p-2 rounded w-full mt-1"
                    >
                      <option value="">Select Employee</option>
                      {employees?.map((emp) => (
                        <option key={emp.uid} value={emp.uid}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <h2 className="text-[#082f57] font-bold text-lg mt-1">
                      {leadname?.name || "Unassigned"}
                    </h2>
                  )}

                </div>

              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </motion.div>
  );
}