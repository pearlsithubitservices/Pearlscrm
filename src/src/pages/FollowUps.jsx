import React, {
  useEffect,
  useState
} from 'react';

import {
  Phone,
  Calendar,
  Clock3,
  User2,
  TrendingUp,
  BellRing,
  MessageSquare,
} from 'lucide-react';

export default function FollowUps() {

  const [followUps,
    setFollowUps] = useState([]);

  useEffect(() => {

    fetchFollowups();

  }, []);

  const fetchFollowups =
    async () => {

      try {

        const response =
          await fetch(
            "https://pearlscrm.onrender.com/api/followups"
          );

        const data =
          await response.json();

        setFollowUps(data);

      } catch (error) {

        console.log(error);

      }

    };

  return (

    <div className="min-h-screen bg-[#0b0b14] text-white p-8">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-4xl font-bold mb-2">
            Follow-Up Dashboard
          </h1>

          <p className="text-gray-400">
            Track client follow-ups and conversions
          </p>

        </div>

        <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">

          <Calendar className="w-5 h-5 text-purple-400" />

          <span className="font-medium">
            Today
          </span>

        </div>

      </div>

      {/* TOP STATS */}

      <div className="grid grid-cols-4 gap-6 mb-10">

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <p className="text-gray-400 mb-2">
            Total Follow-ups
          </p>

          <h2 className="text-4xl font-bold">
            {followUps.length}
          </h2>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <p className="text-gray-400 mb-2">
            Missed Today
          </p>

          <h2 className="text-4xl font-bold text-red-400">

            {
              followUps.filter(
                item =>
                  item.status === "Missed"
              ).length
            }

          </h2>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <p className="text-gray-400 mb-2">
            Completed
          </p>

          <h2 className="text-4xl font-bold text-green-400">

            {
              followUps.filter(
                item =>
                  item.status === "Completed"
              ).length
            }

          </h2>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <p className="text-gray-400 mb-2">
            Pending Meetings
          </p>

          <h2 className="text-4xl font-bold text-purple-400">

            {
              followUps.filter(
                item =>
                  item.status === "Pending"
              ).length
            }

          </h2>

        </div>

      </div>

      {/* MAIN SECTION */}

      <div className="grid grid-cols-3 gap-8 mb-10">

        {/* LEFT SECTION */}

        <div className="col-span-2 space-y-6">

          {followUps.slice(0, 3).map((item) => (

            <div
              key={item._id}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between"
            >

              <div className="flex items-center gap-5">

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  item.status === 'Missed'
                    ? 'bg-red-500/20'
                    : 'bg-purple-500/20'
                }`}>

                  {item.followupType === 'Call' && (
                    <Phone className="w-7 h-7 text-purple-400" />
                  )}

                  {item.followupType === 'Meeting' && (
                    <Calendar className="w-7 h-7 text-green-400" />
                  )}

                  {item.followupType === 'WhatsApp' && (
                    <MessageSquare className="w-7 h-7 text-green-400" />
                  )}

                </div>

                <div>

                  <h2 className="text-2xl font-bold mb-1">
                    {item.company}
                  </h2>

                  <div className="flex items-center gap-5 text-gray-400">

                    <span className="flex items-center gap-2">

                      <User2 className="w-4 h-4" />

                      {item.leadName}

                    </span>

                    <span className="flex items-center gap-2">

                      <Clock3 className="w-4 h-4" />

                      {item.time}

                    </span>

                  </div>

                </div>

              </div>

              <div className="flex items-center gap-4">

                <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                  item.status === 'Missed'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>

                  {item.status}

                </span>

                <button className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold">

                  Complete

                </button>

              </div>

            </div>

          ))}

        </div>

        {/* RIGHT PANEL */}

        <div className="space-y-6">

          {/* PERFORMANCE */}

          {/* <div className="bg-white/5 border border-white/10 rounded-3xl p-7">

            <div className="flex items-center gap-3 mb-6">

              <TrendingUp className="w-6 h-6 text-green-400" />

              <h2 className="text-2xl font-bold">
                Performance
              </h2>

            </div>

            <div className="mb-6">

              <div className="flex justify-between mb-2">

                <span className="text-gray-400">
                  Conversion Rate
                </span>

                <span className="font-bold">
                  88%
                </span>

              </div>

              <div className="h-3 bg-white/10 rounded-full overflow-hidden">

                <div className="h-full w-[88%] bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />

              </div>

            </div>

            <div className="bg-[#151521] rounded-2xl p-5">

              <p className="text-gray-400 mb-2">
                Today's Follow-ups
              </p>

              <h2 className="text-5xl font-bold text-green-400">
                {followUps.length}
              </h2>

            </div>

          </div> */}

          {/* REMINDER */}

          {/* <div className="bg-white/5 border border-white/10 rounded-3xl p-7">

            <div className="flex items-center gap-3 mb-4">

              <BellRing className="w-5 h-5 text-yellow-400" />

              <h3 className="text-xl font-bold">
                Reminder
              </h3>

            </div>

            <p className="text-gray-400 leading-7">

              Quick follow-ups increase conversion chances.
              Contact new leads within 5 minutes for better results.

            </p>

          </div> */}

        </div>

      </div>

      {/* FOLLOWUP TABLE */}

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">

        {/* TABLE HEADER */}

        <div className="grid grid-cols-7 gap-4 px-6 py-5 border-b border-white/10 text-gray-400 font-semibold">

          <p>Lead</p>
          <p>Company</p>
          <p>Type</p>
          <p>Assigned</p>
          <p>Time</p>
          <p>Status</p>
          <p>Action</p>

        </div>

        {/* TABLE BODY */}

        {followUps.map((item) => (

          <div
            key={item._id}
            className="grid grid-cols-7 gap-4 px-6 py-5 border-b border-white/5 items-center hover:bg-white/5 transition-all"
          >

            <p className="font-semibold">
              {item.leadName}
            </p>

            <p className="text-gray-300">
              {item.company}
            </p>

            <p className="text-purple-300">
              {item.followupType}
            </p>

            <p className="text-gray-300">
              {item.assignedTo}
            </p>

            <p className="text-gray-300">
              {item.time}
            </p>

            <span className={`px-3 py-1 rounded-xl text-sm w-fit ${
              item.status === "Completed"
                ? "bg-green-500/20 text-green-400"
                : item.status === "Missed"
                ? "bg-red-500/20 text-red-400"
                : "bg-yellow-500/20 text-yellow-300"
            }`}>

              {item.status}

            </span>

            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-semibold w-fit">

              View

            </button>

          </div>

        ))}

      </div>

    </div>

  );
}