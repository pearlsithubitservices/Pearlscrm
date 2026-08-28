import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ChevronDown,
} from "lucide-react";


export default function Feedbackadmin() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Types");
  const [status, setStatus] = useState("All Status");

  const categories = [
    {
      title: "Work culture",
      value: 4.5,
      width: "82%",
      color: "bg-fuchsia-500",
    },
    {
      title: "HR policies",
      value: 4.1,
      width: "62%",
      color: "bg-green-500",
    },
    {
      title: "IT & tools",
      value: 2.8,
      width: "33%",
      color: "bg-pink-700",
    },
    {
      title: "Cafeteria",
      value: 3.8,
      width: "66%",
      color: "bg-orange-500",
    },
    {
      title: "Transport",
      value: 3.5,
      width: "52%",
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5EF] p-6">

      {/* Feedback Categories */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-lg p-7"
      >
        <h2 className="text-4xl font-bold text-slate-900 mb-8">
          Feedback Categories
        </h2>

        <div className="space-y-7">
          {categories.map((item) => (
            <div key={item.title}>
              <div className="flex justify-between text-2xl font-medium mb-3">
                <span>{item.title}</span>
                <span>{item.value}%</span>
              </div>

              <div className="h-5 rounded-full bg-blue-100 overflow-hidden">

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: item.width }}
                  transition={{ duration: 1 }}
                  className={`h-full rounded-full ${item.color}`}
                />

              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Employee Feedback Header */}

     

      

    </div>
  );
}