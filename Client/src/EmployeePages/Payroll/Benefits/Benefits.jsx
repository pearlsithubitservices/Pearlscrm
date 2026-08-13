import React from "react";
import { motion } from "framer-motion";
import {
  Bell,
  ShieldCheck,
  Landmark,
  HeartPulse,
  Award,
  Laptop,
  GraduationCap,
  ExternalLink,
} from "lucide-react";

export default function Benefits() {
  const benefits = [
    {
      title: "Group Health Insurance",
      subtitle: "Mediclaim cover for you + family",
      icon: ShieldCheck,

      details: [
        { label: "Provider", value: "Star Health" },
        { label: "Cover", value: "₹5,00,000" },
      ],

      extra: "Members: Self + Spouse + 2 kids",
      status: "Active",
      link: "View Policy",
    },

    {
      title: "Provident Fund (PF)",
      subtitle: "Employee + employer PF contributions",
      icon: Landmark,

      details: [
        { label: "UAN", value: "101234567890" },
        { label: "Employee contrib", value: "₹1,800-Month" },
      ],

      extra: "Members: Self",
      status: "₹64,800",
      link: "View Passbook",
    },

    {
      title: "ESIC",
      subtitle: "Employee State Insurance cover",
      icon: HeartPulse,

      details: [
        { label: "IP NO", value: "31-00-1234567" },
        { label: "Contribution", value: "₹131-Month" },
      ],

      extra: "Members: Covered (self + family)",
      status: "Active",
      link: "view Policy",
    },

    {
      title: "Gratuity",
      subtitle: "Long-service benefit",
      icon: Award,

      details: [
        { label: "Eligible after", value: "5 years" },
        { label: "Service", value: "1 year 2 month" },
      ],

      extra: "Projected (5 yr): ₹2,45,000",
      status: "Accruing",
      link: "Learn More",
    },

    {
      title: "Work From Home",
      subtitle: "WFH equipment & internet allowance",
      icon: Laptop,

      details: [
        { label: "Internet", value: "₹1,000-Month" },
        { label: "Equipment", value: "₹5,000-year" },
      ],

      extra: "Used this year: ₹3,200",
      status: "₹1,800",
      link: "Claim Now",
    },

    {
      title: "Learning & Development",
      subtitle: "Training, courses & certifications",
      icon: GraduationCap,

      details: [
        { label: "Annual budget", value: "₹10,000" },
        { label: "Used", value: "₹3,200" },
      ],

      extra: "Includes: Udemy, Coursera, books",
      status: "₹6,800",
      link: "Explore Courses",
    },
  ];

  return (
    <div className="bg-[#f3f0eb] ">
     <div className="p-2">
      
        <div className="bg-white rounded-2xl border p-6 mt-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold">
            Employee Benefits
          </h2>

          <span className="text-xl font-semibold text-gray-500">
            FY 2025–26
          </span>
        </div>

        {/* Benefits Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mt-8">
          {benefits.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{
                y: -5,
              }}
              className="bg-white rounded-2xl border p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#0b2b57]">
                    {item.title}
                  </h3>

                  <p className="text-gray-400 mt-1 text-sm">
                    {item.subtitle}
                  </p>
                </div>

                <item.icon
                  size={28}
                  className="text-[#2563eb]"
                />
              </div>

              <div className="mt-6 space-y-2">
                {item.details.map((detail, i) => (
                  <div
                    key={i}
                    className="text-lg"
                  >
                    <span className="font-bold text-[#0b2b57]">
                      {detail.label}:
                    </span>{" "}
                    <span>{detail.value}</span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-gray-500">
                {item.extra}
              </p>

              <div className="flex justify-between items-center mt-8">
                <div>
                  <span className="font-bold">
                    {item.title ===
                    "Provident Fund (PF)"
                      ? "Balance: "
                      : item.title ===
                          "Learning & Development" ||
                        item.title === "Work From Home"
                      ? "Remaining: "
                      : item.title === "Gratuity"
                      ? "Status: "
                      : "Card: "}
                  </span>

                  <span className="text-green-600 font-bold">
                    {item.status}
                  </span>
                </div>

                <button className="flex items-center gap-2 text-[#2563eb] hover:underline">
                  {item.link}
                  <ExternalLink size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}