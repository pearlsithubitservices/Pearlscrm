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

export default function LeadDetails({ lead }) {

  const contactInfo = [
    {
      title: "EMAIL",
      value: lead?.email || "Not Available",
      icon: Mail,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    {
      title: "PHONE",
      value: lead?.phone || "Not Available",
      icon: Phone,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      title: "LEAD SOURCE",
      value: lead?.source || "Website",
      icon: MessageCircle,
      color: "text-purple-500",
      bg: "bg-purple-100",
    },
    {
      title: "ASSIGNED TO",
      value: lead?.assignedTo || "Ragavi M",
      icon: User,
      color: "text-orange-500",
      bg: "bg-orange-100",
    },
    {
      title: "FOLLOW-UP",
      value: lead?.followUp || "Today",
      icon: CalendarDays,
      color: "text-pink-500",
      bg: "bg-pink-100",
    },
    {
      title: "STATUS",
      value: lead?.status || "In Progress",
      icon: Briefcase,
      color: "text-cyan-500",
      bg: "bg-cyan-100",
    },
  ];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="min-h-screen bg-[#efede8] p-5"
    >

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        

        {/* DEAL VALUE */}

        <div className="mt-8">

          <h3
            className="
            font-bold
            text-gray-400
            mb-4
            "
          >
            DEAL VALUE
          </h3>

          <motion.div
            whileHover={{
              scale: 1.01,
            }}
            className="
            bg-white
            rounded-3xl
            p-6
            shadow-sm
            "
          >

            <div className="flex justify-between items-center">

              <div>

                <h1
                  className="
                  text-4xl
                  font-bold
                  text-[#082f57]
                  "
                >
                  ₹{lead?.dealValue || "120,000"}
                </h1>

                <p className="text-gray-400 mt-3">
                  Pipeline probability — 72% likely to close
                </p>

              </div>

              <div
                className="
                hidden
                md:flex
                w-20
                h-20
                rounded-full
                bg-blue-100
                items-center
                justify-center
                "
              >
                <span
                  className="
                  text-blue-600
                  font-bold
                  text-xl
                  "
                >
                  72%
                </span>
              </div>

            </div>

            {/* PROGRESS */}

            <div
              className="
              w-full
              bg-gray-200
              h-3
              rounded-full
              mt-6
              overflow-hidden
              "
            >

              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: "72%",
                }}
                transition={{
                  duration: 1,
                }}
                className="
                h-full
                bg-blue-500
                rounded-full
                "
              />

            </div>

          </motion.div>

        </div>

        {/* CONTACT INFO */}

        <div className="mt-10">

          <h3
            className="
            font-bold
            text-gray-400
            mb-5
            "
          >
            CONTACT INFORMATION
          </h3>

          <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
            "
          >

            {contactInfo.map((item, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.1,
                }}
                whileHover={{
                  scale: 1.03,
                }}
                className="
                bg-white
                rounded-2xl
                p-6
                shadow-sm
                "
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`
                    w-14
                    h-14
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    ${item.bg}
                    `}
                  >

                    <item.icon
                      className={item.color}
                      size={24}
                    />

                  </div>

                  <div>

                    <p
                      className="
                      text-gray-400
                      text-sm
                      font-semibold
                      "
                    >
                      {item.title}
                    </p>

                    <h2
                      className="
                      text-[#082f57]
                      font-bold
                      text-lg
                      mt-1
                      "
                    >
                      {item.value}
                    </h2>

                  </div>

                </div>

              </motion.div>
            ))}

          </div>

        </div>

      </div>

    </motion.div>
  );
}