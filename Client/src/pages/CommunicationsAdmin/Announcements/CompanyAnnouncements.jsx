import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DeleteIcon, Pin, Search } from "lucide-react";
import FullAnnouncements from "./FullAnnouncements";
import AnnouncementForm from "./AnnouncementForm";
import useAnnouncement from "../../../Hooks/useAnnouncement";


const CompanyAnnouncements = () => {
  const [showForm, setShowForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const { createAnnouncement, fetchAnnouncements, announcements, updateRead, togglePin, deleteAnnouncement } = useAnnouncement();

  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState();

  const handleRead = async (item) => {
    setShowForm(true)
    setSelectedAnnouncements(item);

    if (!item.isRead) {
      await updateRead(item._id);
      await fetchAnnouncements();
    }
  }

  function handleChange(e) {
    setSearch(e.target.value);
  }

  const deleteannouncement = async (id) => {
    await deleteAnnouncement(id);
    await fetchAnnouncements();
  }

  const filteredAnnouncements = announcements.filter((item) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.author?.toLowerCase().includes(searchLower) ||
      item.date?.toLowerCase().includes(searchLower)
    );
  });

  //pin function

  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    // Same pin status → newest first
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="w-full space-y-5">
      {/* Header */}

      <div className="bg-white rounded-2xl  border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0B2B57]">
          Company Announcements
        </h2>
         <span>
          <div className="relative flex gap-8">

            <input
              type="text"
              placeholder="search by Date, Title..."
              value={search}
              onChange={handleChange}
              className=" p-2 border rounded-xl w-full" />
            <Search size={20} className="absolute text-gray-500 right-3 top-3  " />
          </div>
        </span>
        <div className="flex gap-8 ">
         <button className="bg-blue-700 p-1 rounded-md text-white hover:scale-105 transition-transform duration-150" onClick={() => setShowAnnouncementForm(true)}>Announcement</button>
      
        <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-500">
          {announcements.filter((item) => (item.isRead == false)).length} unread
        </span>
        </div>
      </div>

      {/* Announcements */}

      <div className=" rounded-2xl   p-4  space-y-4">

        {sortedAnnouncements.slice(0, 5).map((item) => (

          <motion.div
            key={item._id}

            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 * 0.1 }}
            whileHover={{ y: -2 }}
            className={`border border-gray-100 border-l-4 ${item.priority?.toLowerCase() == "high" ? "border-l border-red-500" : item.priority?.toLowerCase() == "med" ? "border-yellow-300" : "border-green-600"} cursor-pointer bg-white rounded-2xl p-5 hover:shadow-md transition-all`}
            onClick={() => handleRead(item)}
          >
            <div className="flex justify-between items-start">
              <span
                className={`px-4 py-1 rounded-full text-xs font-semibold ${item.priority?.toLowerCase() == "high" ? " bg-red-300 text-red-700" : item.priority?.toLowerCase() == "med" ? "bg-yellow-200 text-yellow-700" : "bg-green-300 text-green-700"}`}
              >
                {item.priority}
              </span>
              <span className="flex gap-4">
                <Pin
                  size={16}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening FullAnnouncements
                    togglePin(item._id);
                  }}
                  className={`cursor-pointer transition-colors ${item.pinned
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-gray-500"
                    }`}
                />
                <DeleteIcon size={16}  className="" onClick={(e) => 
                  {
                    e.stopPropagation();
                    deleteannouncement(item._id)}} /></span>
            </div>

            <h3 className="mt-4 text-xl font-bold text-[#0B2B57]">
              {item.title}
            </h3>

            <p className="text-gray-500 mt-3 leading-relaxed">
              {item.description?.length > 100 ? `${item.description.slice(0, 100)}...` : item.description}
            </p>

            <div className="flex items-center justify-between mt-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0B2B57] text-white flex items-center justify-center font-semibold">
                  {item.author.charAt().toUpperCase()}
                </div>

                <div>
                  <p className="font-semibold text-sm">
                    {item.author.toUpperCase()}
                  </p>

                  <p className="text-xs text-gray-500">
                    {item.role}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-400">
                {item.date}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      {showForm &&
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <FullAnnouncements
            onClose={() => setShowForm(false)}
            selectedAnnouncements={selectedAnnouncements}
          />
        </div>

      }
      {showAnnouncementForm &&
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <AnnouncementForm
            onClose={() => setShowAnnouncementForm(false)
            }
            fetchAnnouncements={fetchAnnouncements}

          />
        </div>

      }
    </div>
  );
};

export default CompanyAnnouncements;