
import React, {
  useState,
  useEffect
} from 'react';

import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Phone,
  Mail,
  X,
  User2,
  BadgeDollarSign,
  Globe,
  Upload,
  Users,
  Briefcase,
  AlertCircle,
  Activity,
  Filter,
  Bell,
  TrendingUp,
  AlertTriangle,
  LoaderCircle,
  Paperclip,
  MessageSquareText
} from 'lucide-react';

import { useIndustry } from '../context/IndustryContext';

import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '../lib/utils';

import { useNavigate } from 'react-router-dom';

import * as XLSX from 'xlsx';


export default function ClientManagement() {

  const [active, setActive] = useState(0);

  const buttons = ["All", "on Track", "At Risk"];

  const stats = [
    {
      title: "Total projects",
      value: "50",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "onTrack",
      value: "48",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "At Risk",
      value: "12",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "Avg Progress",
      value: "24%",
      icon: LoaderCircle,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  const projects = [
    {
      name: "TechFlow CRM Implementation",
      company: "TechFlow Solutions",
      status: "Active",
      type: "onTrack",

    },
    {
      name: "TechFlow CRM Implementation",
      company: "TechFlow Solutions",
      status: "Active",
      type: "AtRisk",

    }
  ];




  return (
    <div className="text-black">

      {/* TOPBAR */}
      <div className="w-full bg-white border-b border-black/10 px-8 py-6 flex items-center justify-between">

        {/* LEFT */}
        <div>
          <h1 className="text-2xl text-[#023167] font-bold">
            Project Management
          </h1>

          <p className="text-gray-400 mt-1 text-sm">
            Track and manage your Projects
          </p>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate('/create-client')}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white rounded hover:scale-105 transition-transform duration-300"
          >
            <Plus size={16} />
            New Project
          </button>

          <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
            <Filter size={18} className='text-white' />
          </button>

          <button className="p-2  border border-gray-200 rounded-lg bg-[#2563a9] hover:scale-110 transition-transform duration-300">
            <Bell size={18} className='text-white' />
          </button>



        </div>

      </div>

      {/* BODY */}
      <div className="p-8 bg-[#f3f0eb] min-h-screen">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {stats.map((item, i) => (
            < motion.div
              key={i}
              whileHover={{scale:1.03}}
              className="bg-white border border-black/10 p-4 rounded-xl"
             >

              <div className="flex items-center justify-between mb-3">

                <div className="bg-gray-100 rounded w-10 h-10 flex items-center justify-center">
                  <item.icon  className="w-5 h-5 text-[#0b2b57]" />
                </div>

                <span className="text-green-500 bg-green-100 px-2 py-1 rounded text-xs font-semibold">
                  ↑ 8.4%
                </span>

              </div>

              <p className="text-sm text-gray-500">
                {item.title}
              </p>

              <h2 className="text-3xl font-bold text-[#0b2b57]">
                {item.value}
              </h2>

            </motion.div>
          ))}

        </div>

        {/* PROJECT SECTION HEADER */}
        <div className="flex items-center justify-between mt-8 mb-4 border bg-white p-2 rounded">
          <div>
            <h2 className="text-lg font-bold text-[#0b2b57]">
              Project List
            </h2>
          </div>
          <div className="flex gap-3">
            {buttons.map((btn, index) => (
              <button
                key={index}
                onClick={() => setActive(index)}
                className={`px-4  rounded-xl font-medium transition-all
                                  ${active === index
                    ? "bg-[#2563a9] text-white"
                    : "text-gray-400  hover:bg-[#2563a9] hover:text-white"
                  }`}
              >
                {btn}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-gray-200 border px-3 py-2 rounded w-[350px]">

            <Search size={16} className="text-black" />

            <input
              placeholder="Search project..."
              className="w-full outline-none text-sm bg-gray-200"
            />

          </div>

        </div>

        {/* PROJECT CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4">

          {projects.map((p, i) => (
            <div
              key={i}
              className="bg-white border border-black/10 p-5 rounded"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center">

                <div>
                  <h3 className="text-lg font-bold text-[#0b2b57]">
                    {p.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {p.company}
                  </p>
                </div>

                <div className='flex flex-col items-center'>
                  <div className="flex gap-2">
                    <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded">
                      {p.status}
                    </span>

                    <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded">
                      {p.type}
                    </span>
                  </div>
                  <div className='text-sm text-gray-400 '><p>Assigned by: Ragavi</p></div>
                </div>

              </div>

              {/* DETAILS */}
              <div className=" flex  gap-14 mt-4 text-sm">

                <div className="flex flex-col md:flex-row md:items-center gap-5">

                  <h1 className="text-xl text-yellow-600 min-w-fit">
                    Overall progress
                  </h1>

                  <div className="w-[500px] h-2 bg-gray-200 rounded-full overflow-hidden">

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: "60%",
                      }}
                      transition={{ duration: 1 }}
                      className="h-full bg-blue-500 rounded-full"
                    />

                  </div>

                </div>
                <div className='ml-40 flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                  <MessageSquareText size={18} className='text-gray-400'/><p>2</p>
                  </div>
                  <div className='flex items-center gap-2'>
                  <Paperclip size={18} className='text-gray-400'/><p>2</p>
                  </div>
                  </div>
              </div>

              {/** Bottom */}

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 ">

                <div className="flex items-center  flex-wrap">

                  <h1 className="text-xl font-bold text-[#2563a9]">
                    Project Members :
                  </h1>

                  <div className="flex -space-x-3">

                    {["RK", "VL", "LT"].map((item, index) => (

                      <div
                        key={index}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold border-4 border-white ${index === 0
                          ? "bg-purple-800"
                          : index === 1
                            ? "bg-green-500"
                            : "bg-purple-600"
                          }
                          `}
                      >
                        {item}
                      </div>

                    ))}

                  </div>

                </div>

                <h1 className="text-md lg:text-lg">

                  <div className='flex items-center font-bold text-[#2563a9]'><Calendar size={18} className='text-[#0b2b57]'/><p>May 12</p></div>

                </h1>

              </div>

            </div>
          ))}

        </motion.div>

      </div>
    </div>
  );


}
