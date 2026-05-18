import React, {
  useEffect,
  useState
} from 'react';

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';

import {
  onAuthStateChanged
} from 'firebase/auth';

import {
  auth,
  db
} from '../../lib/firebase';

import {
  Search,
  PhoneCall,
  CalendarClock,
  Save,
  CircleCheckBig,
  Clock3,
  MessageSquareText,
  UserRound,
  Building2,
  BellRing,
  History
} from 'lucide-react';

export default function EmployeeFollowups() {

  const [followups, setFollowups] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          if (user) {

            const q = query(
              collection(db, 'followups'),
              where(
                'assignedTo',
                '==',
                user.uid
              )
            );

            const snapshot =
              await getDocs(q);

            const followupList = [];

            snapshot.forEach((doc) => {

              followupList.push({
                id: doc.id,
                ...doc.data(),
              });

            });

            setFollowups(
              followupList
            );

            setLoading(false);

          }

        }
      );

    return () => unsubscribe();

  }, []);

  // HANDLE CHANGE

  const handleChange = (
    id,
    field,
    value
  ) => {

    setFollowups((prev) =>

      prev.map((item) =>

        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );

  };

  // UPDATE FOLLOWUP

  const updateFollowup =
    async (item) => {

      try {

        const followupRef =
          doc(
            db,
            'followups',
            item.id
          );

        await updateDoc(
          followupRef,
          {

            leadName:
              item.leadName,

            company:
              item.company,

            type:
              item.type,

            status:
              item.status,

            date:
              item.date,

            note:
              item.note,

            followupCount:
              (item.followupCount || 1) + 1,

            history: [

              ...(item.history || []),

              {
                date:
                  new Date()
                    .toLocaleDateString(),

                note:
                  item.note ||
                  'Followup Updated',
              }

            ],

          }
        );

        alert(
          'Followup Updated'
        );

      } catch (error) {

        console.log(error);

      }

    };

  // FILTER

  const filteredFollowups =
    followups.filter((item) =>

      item.leadName
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

    <div className="min-h-screen bg-[#070b14] text-white p-8">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">

        <div>

          <div className="flex items-center gap-4 mb-3">

            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center">

              <PhoneCall className="w-8 h-8 text-cyan-400" />

            </div>

            <div>

              <h1 className="text-5xl font-black">

                Followup Center

              </h1>

              <p className="text-gray-500 mt-2">

                Client communication & reminders

              </p>

            </div>

          </div>

        </div>

        {/* SEARCH */}

        <div className="relative w-full lg:w-[380px]">

          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />

          <input
            type="text"
            placeholder="Search client..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full bg-[#111827] border border-cyan-500/10 rounded-3xl py-5 pl-14 pr-5 outline-none focus:border-cyan-500"
          />

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-[#111827] border border-cyan-500/10 rounded-3xl p-7">

          <div className="flex items-center justify-between mb-6">

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center">

              <BellRing className="w-7 h-7 text-cyan-400" />

            </div>

            <span className="text-cyan-400 text-sm">

              Active

            </span>

          </div>

          <p className="text-gray-500 mb-2">

            Total Followups

          </p>

          <h2 className="text-5xl font-black">

            {followups.length}

          </h2>

        </div>

        <div className="bg-[#111827] border border-orange-500/10 rounded-3xl p-7">

          <div className="flex items-center justify-between mb-6">

            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center">

              <Clock3 className="w-7 h-7 text-orange-400" />

            </div>

            <span className="text-orange-400 text-sm">

              Waiting

            </span>

          </div>

          <p className="text-gray-500 mb-2">

            Pending Calls

          </p>

          <h2 className="text-5xl font-black">

            {
              followups.filter(
                (item) =>
                  item.status !==
                  'Completed'
              ).length
            }

          </h2>

        </div>

        <div className="bg-[#111827] border border-green-500/10 rounded-3xl p-7">

          <div className="flex items-center justify-between mb-6">

            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">

              <CircleCheckBig className="w-7 h-7 text-green-400" />

            </div>

            <span className="text-green-400 text-sm">

              Closed

            </span>

          </div>

          <p className="text-gray-500 mb-2">

            Completed

          </p>

          <h2 className="text-5xl font-black">

            {
              followups.filter(
                (item) =>
                  item.status ===
                  'Completed'
              ).length
            }

          </h2>

        </div>

      </div>

      {/* FOLLOWUP CARDS */}

      {loading ? (

        <div className="text-center py-20 text-gray-500">

          Loading followups...

        </div>

      ) : filteredFollowups.length === 0 ? (

        <div className="bg-[#111827] border border-white/10 rounded-3xl p-14 text-center">

          <PhoneCall className="w-16 h-16 text-cyan-400 mx-auto mb-5" />

          <h2 className="text-3xl font-black mb-3">

            No Followups

          </h2>

          <p className="text-gray-500">

            No followup records available.

          </p>

        </div>

      ) : (

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-7">

          {filteredFollowups.map(
            (item) => (

              <div
                key={item.id}
                className="bg-[#111827] border border-white/10 rounded-[32px] p-7 hover:border-cyan-500/40 transition-all duration-300"
              >

                {/* TOP */}

                <div className="flex items-start justify-between mb-7">

                  <div>

                    <div className="flex items-center gap-3 mb-3">

                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">

                        <UserRound className="w-6 h-6 text-cyan-400" />

                      </div>

                      <div>

                        <input
                          type="text"
                          value={
                            item.leadName ||
                            ''
                          }
                          onChange={(e) =>
                            handleChange(
                              item.id,
                              'leadName',
                              e.target.value
                            )
                          }
                          className="bg-transparent outline-none text-2xl font-black"
                        />

                        <div className="flex items-center gap-2 mt-1">

                          <Building2 className="w-4 h-4 text-gray-500" />

                          <input
                            type="text"
                            value={
                              item.company ||
                              ''
                            }
                            onChange={(e) =>
                              handleChange(
                                item.id,
                                'company',
                                e.target.value
                              )
                            }
                            className="bg-transparent outline-none text-gray-400"
                          />

                        </div>

                      </div>

                    </div>

                  </div>

                  <select
                    value={
                      item.status ||
                      ''
                    }
                    onChange={(e) =>
                      handleChange(
                        item.id,
                        'status',
                        e.target.value
                      )
                    }
                    className={`px-4 py-3 rounded-2xl outline-none ${
                      item.status ===
                      'Completed'
                        ? 'bg-green-500/10 text-green-400'
                        : item.status ===
                          'In Progress'
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'bg-orange-500/10 text-orange-400'
                    }`}
                  >

                    <option>

                      Pending

                    </option>

                    <option>

                      In Progress

                    </option>

                    <option>

                      Completed

                    </option>

                  </select>

                </div>

                {/* FOLLOWUP COUNT */}

                <div className="bg-white/5 rounded-2xl p-5 mb-5">

                  <p className="text-gray-500 text-sm mb-3">

                    Followup Count

                  </p>

                  <h2 className="text-5xl font-black text-cyan-400">

                    {item.followupCount || 1}

                  </h2>

                </div>

                {/* BODY */}

                <div className="space-y-5">

                  {/* TYPE */}

                  <div className="bg-white/5 rounded-2xl p-5">

                    <p className="text-gray-500 text-sm mb-3">

                      Followup Type

                    </p>

                    <select
                      value={
                        item.type ||
                        ''
                      }
                      onChange={(e) =>
                        handleChange(
                          item.id,
                          'type',
                          e.target.value
                        )
                      }
                      className="bg-transparent outline-none text-lg font-semibold"
                    >

                      <option>

                        Call

                      </option>

                      <option>

                        Meeting

                      </option>

                      <option>

                        Demo

                      </option>

                      <option>

                        Email

                      </option>

                    </select>

                  </div>

                  {/* DATE */}

                  <div className="bg-white/5 rounded-2xl p-5">

                    <p className="text-gray-500 text-sm mb-3">

                      Scheduled Date

                    </p>

                    <div className="flex items-center gap-3">

                      <CalendarClock className="w-5 h-5 text-cyan-400" />

                      <input
                        type="date"
                        value={
                          item.date ||
                          ''
                        }
                        onChange={(e) =>
                          handleChange(
                            item.id,
                            'date',
                            e.target.value
                          )
                        }
                        className="bg-transparent outline-none"
                      />

                    </div>

                  </div>

                  {/* NOTE */}

                  <div className="bg-white/5 rounded-2xl p-5">

                    <div className="flex items-center gap-3 mb-4">

                      <MessageSquareText className="w-5 h-5 text-cyan-400" />

                      <p className="text-sm text-gray-500">

                        Notes

                      </p>

                    </div>

                    <textarea
                      value={
                        item.note || ''
                      }
                      onChange={(e) =>
                        handleChange(
                          item.id,
                          'note',
                          e.target.value
                        )
                      }
                      rows="4"
                      placeholder="Enter followup notes..."
                      className="w-full bg-transparent outline-none resize-none text-gray-300"
                    />

                  </div>

                  {/* HISTORY */}

                  <div className="bg-white/5 rounded-2xl p-5">

                    <div className="flex items-center gap-3 mb-5">

                      <History className="w-5 h-5 text-cyan-400" />

                      <p className="text-sm text-gray-500">

                        Followup History

                      </p>

                    </div>

                    <div className="space-y-4">

                      {item.history?.map(
                        (
                          history,
                          index
                        ) => (

                          <div
                            key={index}
                            className="border-l-2 border-cyan-500 pl-4"
                          >

                            <p className="text-sm text-cyan-400">

                              {history.date}

                            </p>

                            <p className="text-gray-300 mt-1">

                              {history.note}

                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                </div>

                {/* BUTTON */}

                <button
                  onClick={() =>
                    updateFollowup(
                      item
                    )
                  }
                  className="mt-7 w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 transition-all font-semibold"
                >

                  <Save className="w-5 h-5" />

                  Save Followup

                </button>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );

}