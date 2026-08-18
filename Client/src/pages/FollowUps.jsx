import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Bell,
  Plus,
  Users2,
  Clock2,
  CheckCheck,
  PhoneMissed,
} from "lucide-react";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Pagination from "../components/Pagination";
import AnimateModals from "../components/Dashboard/AnimateModals";
import LoadingPage from "../components/Dashboard/Loading";
import CreateFollowups from "./CreateFollowups";
import useFollowups from "../Hooks/useFollowups";
import { staticFollowups } from "../Utils/staticData";

export default function FollowUps() {
  const { getFollowups } = useFollowups();
  const [followups, setFollowups] = useState(staticFollowups);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await getFollowups();
        if (Array.isArray(data) && data.length > 0) {
          setFollowups(data);
        } else {
          setFollowups(staticFollowups);
        }
      } catch (err) {
        console.log(err);
        setFollowups(staticFollowups);
      }
    };
    fetchdata();
  }, []);

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [loading] = useState(false);
  const [openFollowup, setOpenfollowup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const buttons = ["All", "Missed", "Pending", "Completed", "Scheduled"];

  
const pending= followups.filter((item)=>(
  item.status.toLowerCase() == "pending"
));
const completed= followups.filter((item)=>(
  item.status.toLowerCase() == "completed"
));
  const stats = [
    { icon: Users2, title: "Total FollowUps", value: followups.length },
    { icon: PhoneMissed, title: "Missed Today", value: "2" },
    { icon: Clock2, title: "Pending Meetings", value: pending.length  },
    { icon: CheckCheck, title: "Completed", value: completed.length },
  ];

  /* FILTER */

  const filteredData = useMemo(() => {

    return followups.filter((item) => {

      const matchesSearch =
        item.clientName.toLowerCase().includes(search.toLowerCase()) ||
        item.companyName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        active === 0 ||
        item.status.toLowerCase() === buttons[active].toLowerCase();

      return matchesSearch && matchesStatus;
    });

  }, [search, active,followups]);

  /* PAGINATION */

  const filesPerPage = 5;

  const lastIndex = currentPage * filesPerPage;
  const firstIndex = lastIndex - filesPerPage;

  const currentFiles = filteredData.slice(firstIndex, lastIndex);

  const totalPages = Math.ceil(filteredData.length / filesPerPage);

  return (
    <div className="flex max-h-screen bg-[#f3f0eb] overflow-x-hidden overflow-y-auto page-scroll">

      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}

        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>

            <h1 className="text-xl md:text-2xl font-bold text-[#023167]">
              FOLLOWUPS
            </h1>

            <p className="text-xs md:text-sm text-gray-500">
              Track client FollowUps and Conversion
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-3">

            <button
              onClick={() => setOpenfollowup(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563a9] text-white rounded-lg hover:scale-105 transition text-sm font-semibold"
            >
              <Plus size={16} />
              Add Followups
            </button>

            {[Filter, Bell].map((Icon, i) => (

              <button
                key={i}
                className="p-2 rounded-lg bg-[#2563a9] hover:scale-110 transition"
              >
                <Icon size={18} className="text-white" />
              </button>

            ))}

          </div>

        </div>

        {/* CONTENT */}

        <div className="p-4 md:p-6 lg:p-8">

          {/* STATS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {stats.map((s, i) => (

              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="bg-white p-6 rounded-xl border"
              >

                <div className="bg-gray-200 rounded w-8 h-8 mb-3">
                  <s.icon className="w-8 h-8 p-2" />
                </div>

                <p className="text-sm text-gray-500">
                  {s.title}
                </p>

                <h2 className="text-2xl font-bold text-[#0b2b57]">
                  {s.value}
                </h2>

              </motion.div>

            ))}

          </div>

          {/* FILTER BAR */}

          <div className="mt-6 bg-white p-4 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <h1 className="font-bold text-xl text-[#0b2b57]">
              FOLLOW-UP SCHEDULE
            </h1>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto max-w-xl">

              {buttons.map((btn, index) => (

                <button
                  key={index}
                  onClick={() => {
                    setActive(index);
                    setCurrentPage(1);
                  }}
                  className={`
                  px-4 py-2 tracking-tight rounded-xl text-sm transition
                  ${
                    active === index
                      ? "bg-[#2563a9] text-white"
                      : "text-gray-500 hover:bg-[#2563a9] hover:text-white"
                  }
                  `}
                >
                  {btn}
                </button>

              ))}

            </div>

            {/* SEARCH */}

            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-full lg:w-80">

              <Search size={16} />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Lead.."
                className="ml-2 bg-transparent outline-none w-full text-sm"
              />

            </div>

          </div>

          {/* TABLE */}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white rounded-xl overflow-x-auto border"
          >

            <table className="min-w-[900px] w-full text-sm">

              <thead className="bg-gray-50 text-gray-600">

                <tr>

                  {[
                    "LEAD",
                    "TYPE",
                    "ASSIGNED",
                    "TIME",
                    "STATUS",
                    "ACTION",
                  ].map((head, i) => (

                    <th key={i} className="p-4 text-left">
                      {head}
                    </th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td colSpan="6" className="py-10">
                      <LoadingPage />
                    </td>
                  </tr>

                ) : (

                  currentFiles?.map((item) => (

                    <tr
                      key={item._id}
                      onClick={() => navigate(`/followupDetails/${item._id}`)}
                      className="border-t hover:bg-gray-50 cursor-pointer transition"
                      
                    >

                      <td className="p-4">

                        <p className="font-medium">
                          {item.clientName}
                        </p>

                        <p className="text-xs text-gray-400">
                          {item.companyName}
                        </p>

                      </td>

                      <td>
                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded text-xs">
                          {item.type}
                        </span>
                      </td>

                      <td>
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-xs">
                          {item.assignedTo}
                        </span>
                      </td>

                      <td>{item.followupTime}</td>

                      <td>
                        <span className="bg-gray-100 px-3 py-1 rounded text-xs">
                          {item.status}
                        </span>
                      </td>

                      <td>Today</td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </motion.div>

          {/* PAGINATION */}

          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />

        </div>

      </div>

      {/* MODAL */}

      {openFollowup && (

        <AnimateModals>

          <CreateFollowups
            onClose={() => setOpenfollowup(false)}
            fetchdata={()=>getFollowups()}
          />

        </AnimateModals>

      )}

    </div>
  );
}