import React, {
  useEffect,
  useState
} from 'react';

import {
  collection,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';

import {
  db
} from '../../lib/firebase';

import {
  Search,
  Building2,
  UserRound,
  Phone,
  Mail,
  Globe,
  Save,
  Users,
  Clock3,
  CircleCheckBig
} from 'lucide-react';

export default function EmployeeLeads() {

  const [leads, setLeads] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchLeads();

  }, []);

  // FETCH LEADS

  const fetchLeads =
    async () => {

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              'leads'
            )
          );

        const leadList = [];

        snapshot.forEach((doc) => {

          leadList.push({
            id: doc.id,
            ...doc.data(),
          });

        });

        setLeads(leadList);

        setLoading(false);

      } catch (error) {

        console.log(error);

      }

    };

  // HANDLE CHANGE

  const handleChange = (
    id,
    field,
    value
  ) => {

    setLeads((prev) =>

      prev.map((lead) =>

        lead.id === id
          ? {
              ...lead,
              [field]: value,
            }
          : lead
      )
    );

  };

  // UPDATE LEAD

  const updateLead =
    async (lead) => {

      try {

        const leadRef =
          doc(
            db,
            'leads',
            lead.id
          );

        await updateDoc(
          leadRef,
          {

            clientName:
              lead.clientName,

            company:
              lead.company,

            phone:
              lead.phone,

            email:
              lead.email,

            website:
              lead.website,

            status:
              lead.status,

          }
        );

        alert(
          'Lead Updated Successfully'
        );

      } catch (error) {

        console.log(error);

      }

    };

  // FILTER LEADS

  const filteredLeads =
    leads.filter((lead) =>

      lead.company
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      lead.clientName
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

            <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center">

              <Users className="w-8 h-8 text-purple-400" />

            </div>

            <div>

              <h1 className="text-5xl font-black">

                Leads Center

              </h1>

              <p className="text-gray-500 mt-2">

                Manage all company leads

              </p>

            </div>

          </div>

        </div>

        {/* SEARCH */}

        <div className="relative w-full lg:w-[380px]">

          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />

          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full bg-[#111827] border border-purple-500/10 rounded-3xl py-5 pl-14 pr-5 outline-none focus:border-purple-500"
          />

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* TOTAL */}

        <div className="bg-[#111827] border border-purple-500/10 rounded-3xl p-7">

          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">

            <Users className="w-7 h-7 text-purple-400" />

          </div>

          <p className="text-gray-500 mb-2">

            Total Leads

          </p>

          <h2 className="text-5xl font-black">

            {leads.length}

          </h2>

        </div>

        {/* PENDING */}

        <div className="bg-[#111827] border border-orange-500/10 rounded-3xl p-7">

          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">

            <Clock3 className="w-7 h-7 text-orange-400" />

          </div>

          <p className="text-gray-500 mb-2">

            Pending Leads

          </p>

          <h2 className="text-5xl font-black">

            {
              leads.filter(
                (lead) =>
                  lead.status !==
                  'Closed'
              ).length
            }

          </h2>

        </div>

        {/* CLOSED */}

        <div className="bg-[#111827] border border-green-500/10 rounded-3xl p-7">

          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">

            <CircleCheckBig className="w-7 h-7 text-green-400" />

          </div>

          <p className="text-gray-500 mb-2">

            Closed Leads

          </p>

          <h2 className="text-5xl font-black">

            {
              leads.filter(
                (lead) =>
                  lead.status ===
                  'Closed'
              ).length
            }

          </h2>

        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto bg-[#111827] border border-white/10 rounded-3xl">

        <table className="w-full min-w-[1500px]">

          <thead>

            <tr className="border-b border-white/10 text-left">

              <th className="p-5">

                Client

              </th>

              <th className="p-5">

                Company

              </th>

              <th className="p-5">

                Phone

              </th>

              <th className="p-5">

                Email

              </th>

              <th className="p-5">

                Website

              </th>

              <th className="p-5">

                Status

              </th>

              <th className="p-5 text-center">

                Action

              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan="7"
                  className="text-center py-10 text-gray-500"
                >

                  Loading...

                </td>

              </tr>

            ) : filteredLeads.length === 0 ? (

              <tr>

                <td
                  colSpan="7"
                  className="text-center py-10 text-gray-500"
                >

                  No Leads Found

                </td>

              </tr>

            ) : (

              filteredLeads.map(
                (lead) => (

                  <tr
                    key={lead.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >

                    {/* CLIENT */}

                    <td className="p-5">

                      <div className="flex items-center gap-3">

                        <UserRound className="w-5 h-5 text-purple-400" />

                        <input
                          type="text"
                          value={
                            lead.clientName ||
                            ''
                          }
                          onChange={(e) =>
                            handleChange(
                              lead.id,
                              'clientName',
                              e.target.value
                            )
                          }
                          className="bg-transparent outline-none w-full"
                        />

                      </div>

                    </td>

                    {/* COMPANY */}

                    <td className="p-5">

                      <div className="flex items-center gap-3">

                        <Building2 className="w-5 h-5 text-cyan-400" />

                        <input
                          type="text"
                          value={
                            lead.company ||
                            ''
                          }
                          onChange={(e) =>
                            handleChange(
                              lead.id,
                              'company',
                              e.target.value
                            )
                          }
                          className="bg-transparent outline-none w-full"
                        />

                      </div>

                    </td>

                    {/* PHONE */}

                    <td className="p-5">

                      <div className="flex items-center gap-3">

                        <Phone className="w-5 h-5 text-orange-400" />

                        <input
                          type="text"
                          value={
                            lead.phone ||
                            ''
                          }
                          onChange={(e) =>
                            handleChange(
                              lead.id,
                              'phone',
                              e.target.value
                            )
                          }
                          className="bg-transparent outline-none w-full"
                        />

                      </div>

                    </td>

                    {/* EMAIL */}

                    <td className="p-5">

                      <div className="flex items-center gap-3">

                        <Mail className="w-5 h-5 text-pink-400" />

                        <input
                          type="email"
                          value={
                            lead.email ||
                            ''
                          }
                          onChange={(e) =>
                            handleChange(
                              lead.id,
                              'email',
                              e.target.value
                            )
                          }
                          className="bg-transparent outline-none w-full"
                        />

                      </div>

                    </td>

                    {/* WEBSITE */}

                    <td className="p-5">

                      <div className="flex items-center gap-3">

                        <Globe className="w-5 h-5 text-green-400" />

                        <input
                          type="text"
                          value={
                            lead.website ||
                            ''
                          }
                          onChange={(e) =>
                            handleChange(
                              lead.id,
                              'website',
                              e.target.value
                            )
                          }
                          className="bg-transparent outline-none w-full"
                        />

                      </div>

                    </td>

                    {/* STATUS */}

                    <td className="p-5">

                      <select
                        value={
                          lead.status ||
                          ''
                        }
                        onChange={(e) =>
                          handleChange(
                            lead.id,
                            'status',
                            e.target.value
                          )
                        }
                        className={`px-4 py-3 rounded-2xl outline-none ${
                          lead.status ===
                          'Closed'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-orange-500/10 text-orange-400'
                        }`}
                      >

                        <option>

                          Pending

                        </option>

                        <option>

                          Closed

                        </option>

                      </select>

                    </td>

                    {/* ACTION */}

                    <td className="p-5 text-center">

                      <button
                        onClick={() =>
                          updateLead(
                            lead
                          )
                        }
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition-all"
                      >

                        <Save className="w-4 h-4" />

                        Save

                      </button>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}