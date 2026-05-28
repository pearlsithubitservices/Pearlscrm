import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Pencil,
} from "lucide-react";

export default function LeadDetails({lead}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#efede8] p-5"
    >
      <div className="bg-[#efede8] rounded-[30px] overflow-hidden">

        {/* HEADER */}
        

        {/* TABS */}

        

        {/* CONTENT */}

        <div className="p-6">

          {/* DEAL VALUE */}

          <h3 className="font-bold text-gray-400 mb-4">
            DEAL VALUE
          </h3>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-2xl p-3"
          >

            <h1 className="text-xl font-bold text-[#082f57]">
              ₹120,000
            </h1>

            <p className="text-gray-400 mt-2">
              pipeline probability - 72% likely to close
            </p>

            {/* PROGRESS */}

            <div className="w-full max-w-[500px] bg-gray-300 h-2 rounded-full mt-5  overflow-hidden">

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "72%" }}
                transition={{ duration: 1 }}
                className="h-full bg-blue-500 rounded-full"
              />

            </div>

          </motion.div>

          {/* CONTACT INFO */}

          <h3 className="font-bold text-gray-400 mt-10 mb-4">
            CONTACT INFORMATION
          </h3>

          <div className="grid md:grid-cols-2 gap-6">

            {/**{[
              {
                title: "EMAIL",
                value: "sarah.chen@gmail.com",
                blue: true,
              },
              {
                title: "PHONE",
                value: "+91 9876543210",
              },
              {
                title: "LEAD SOURCE",
                value: "Linkedin",
              },
              {
                title: "ASSIGNED TO",
                value: "Ragavi M",
              },
              {
                title: "FOLLOW-UP",
                value: "Today",
              },
              {
                title: "FOLLOW-UP COUNT",
                value: "2",
              },
            ]*/} 
           

              <motion.div
                
                whileHover={{
                  scale: 1.03,
                }}
                className="bg-white p-6 rounded-2xl"
              >

                <p className="font-bold text-gray-400">
                  Email
                </p>

                <h2
                  className=" text-black text-lg font-semibold mt-2"
                >
                  {lead.name}
                </h2>

              </motion.div>

          

          </div>

        </div>

      </div>
    </motion.div>
  );
}