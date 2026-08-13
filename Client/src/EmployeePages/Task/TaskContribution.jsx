import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Clock3, FileText } from "lucide-react";
import useTasks from "../../Hooks/useTaskid";
import { useAuth } from "../../context/AuthContext";
import useContribution from "../../Hooks/useContribution";

export default function TaskContribution() {
  const { createContribution } = useContribution();

  const [formData, setFormData] = useState({
    task: "",
    startTime: "",
    endTime: "",
    summary: "",
  });
  const { user } = useAuth();
  const userId = user.uid;
  const { tasks } = useTasks(userId);


  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreate = async () => {
    try {
      const payload = {
        ...formData,

      };
      if (!formData.task) {
        alert("Please select a task");
        return;
      }
      const res = await createContribution(payload);

      if (res.success) {
        alert("Contribution submitted successfully!");

        // Reset form
        setFormData({
          task: "",
          startTime: "",
          endTime: "",
          summary: "",
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className=" bg-[#F5F2EC] flex items-stretch justify-center p-4 h-full"
    >
      <div className="w-full h-full max-w-full bg-white border border-black/10 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col">
        <div className="flex-1">
          {/* Header */}
          <h1 className="text-[#0B2B57] text-2xl font-bold mb-8">
            Projects Contributions
          </h1>

          {/* Project Selection */}
          <div className="mb-8">
            {/* <label className="block text-gray-500 font-semibold mb-1">
              Select Task
            </label> */}

            <div className="relative">
              <select
                name="task"
                value={formData.task}
                onChange={handleChange}
                className="block text-gray-500 font-semibold mb-1 w-full "
                
              >
                <option value="">Select Task</option>

                {tasks.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>

              
            </div>
          </div>

          {/* Working Hours */}
          <div className="mb-8">
            <h2 className="text-gray-600 font-bold text-md mb-4">
              Task Working Hours
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="block text-[#0B2B57] font-semibold mb-2">
                  Start Time
                </label>

                <div className="relative">
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full h-5 bg-white border border-gray-200 rounded-2xl px-5 py-4 outline-none"
                  />

                </div>
              </div>

              <div>
                <label className="block text-[#0B2B57] font-semibold mb-2">
                  End Time
                </label>

                <div className="relative">
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full h-5 bg-white border border-gray-200 rounded-2xl px-5 py-4 outline-none"
                  />


                </div>
              </div>

            </div>
          </div>

          {/* Summary */}
          <div className="mb-8">
            <label className="block text-gray-600 font-bold text-md mb-2">
              Work Summary
            </label>

            <div className="relative">
              <textarea
                rows={4}
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="What have you achieved today?"
                className="w-full h-20 bg-[#F4F4F4] rounded-2xl p-5 outline-none resize-none"
              />

              <FileText
                size={18}
                className="absolute top-5 right-5 text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreate}
          className="mt-auto w-full h-14 bg-[#0B2B57] text-white font-semibold text-xl rounded-2xl"
        >
          Submit
        </motion.button>

      </div>
    </motion.div>
  );
}