import React, { useState, useEffect } from 'react';

import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Phone,
  Mail,
  X,
  FileText,
  CheckSquare2,
  User2,
  BadgeDollarSign,
  MessageSquareMore,
  Globe,
} from 'lucide-react';

import { useIndustry } from '../context/IndustryContext';

import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom'



export default function LeadManagement() {

  const { config } = useIndustry();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
const navigate = useNavigate()
useEffect(() => {

  fetchLeads();

}, []);

const fetchLeads = async () => {

  try {

    const response = await fetch(
      'http://localhost:5000/api/leads'
    );

    const data = await response.json();

    console.log(data);

    setLeads(data);

  } catch (error) {

    console.log(error);

  }
};
 const [leads, setLeads] = useState([]);

  const getStatusColor = (status) => {

    switch (status) {

      case 'New':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';

      case 'Interested':
        return 'bg-orange-500/10 text-orange-300 border-orange-500/20';

      case 'Follow-up':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';

      case 'Closed':
        return 'bg-green-500/10 text-green-300 border-green-500/20';

      default:
        return 'bg-white/10 text-gray-300 border-white/10';
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#12051f] via-[#1a0933] to-black text-white p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-5xl font-black mb-3">
            {config.labels.leads}
          </h1>

          <p className="text-gray-400 text-lg">
            Modern operational CRM workflow management.
          </p>

        </div>

       <button
  onClick={() => navigate('/create-lead')}
  className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 font-semibold shadow-2xl shadow-purple-500/20 hover:scale-105 transition-all"
>

  <Plus className="w-5 h-5" />

  Add {config.labels.lead}

</button>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-4 gap-6 mb-10">

        <div className="bg-[#e8d8ff] rounded-3xl p-6 text-black">

          <p className="text-sm text-gray-600 mb-2">
            Total Leads
          </p>

          <h2 className="text-4xl font-black">
           
          </h2>

        </div>

        <div className="bg-[#ffe7b8] rounded-3xl p-6 text-black">

          <p className="text-sm text-gray-600 mb-2">
            Interested
          </p>

          <h2 className="text-4xl font-black">
           
          </h2>

        </div>

        <div className="bg-[#dfe8f8] rounded-3xl p-6 text-black">

          <p className="text-sm text-gray-600 mb-2">
            Follow-ups
          </p>

          <h2 className="text-4xl font-black">
            
          </h2>

        </div>

        <div className="bg-[#ffdede] rounded-3xl p-6 text-black">

          <p className="text-sm text-gray-600 mb-2">
            Closed Deals
          </p>

          <h2 className="text-4xl font-black">
            
          </h2>

        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[32px] overflow-hidden">

        {/* SEARCH */}
        <div className="p-6 border-b border-white/10 flex items-center gap-4">

          <div className="relative flex-1 max-w-lg">

            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 outline-none focus:border-purple-500 text-lg"
            />

          </div>

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-white/10 text-left text-sm uppercase tracking-wider text-gray-500">

                <th className="px-8 py-6">Lead</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Assigned</th>
                <th className="px-8 py-6">Source</th>
                <th className="px-8 py-6">Budget</th>
                <th className="px-8 py-6">Follow-ups</th>
                <th className="px-8 py-6">Platform</th>
                <th className="px-8 py-6">Next Action</th>
                <th className="px-8 py-6"></th>

              </tr>

            </thead>

            <tbody>

              {leads.map((lead) => (

                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer"
                >

                  {/* LEAD */}
                  <td className="px-8 py-6">

                    <div className="flex items-center gap-4">

                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-bold">
                        {lead.company?.charAt(0)}
                      </div>

                      <div>

                        <h3 className="text-lg font-semibold">
                          {lead.company}
                        </h3>

                        <p className="text-gray-400">
                          {lead.name}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* STATUS */}
                  <td className="px-8 py-6">

                    <span
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm border font-semibold',
                        getStatusColor(lead.status)
                      )}
                    >
                      {lead.status}
                    </span>

                  </td>

                  {/* ASSIGNED */}
                  <td className="px-8 py-6 text-lg">
                    {lead.assignedTo}
                  </td>

                  {/* SOURCE */}
                  <td className="px-8 py-6 text-purple-300 text-lg">
                    {lead.source}
                  </td>

                  {/* BUDGET */}
                  <td className="px-8 py-6 font-bold text-green-400 text-lg">
                    {lead.budget}
                  </td>

                  {/* FOLLOWUPS */}
                  <td className="px-8 py-6">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center font-bold text-purple-300">
                        {lead.nextAction
                        }
                      </div>

                      <span className="text-gray-300">
                        times
                      </span>

                    </div>

                  </td>

                  {/* PLATFORM */}
                  <td className="px-8 py-6">

                    <span className="px-4 py-2 rounded-xl bg-green-500/10 text-green-300 text-sm border border-green-500/20">
                      {lead.platform}
                    </span>

                  </td>

                  {/* NEXT ACTION */}
                  <td className="px-8 py-6">

                    <div className="flex items-center gap-3 text-gray-300">

                      <Calendar className="w-5 h-5 text-gray-500" />

                      {lead.nextAction}

                    </div>

                  </td>

                  {/* MENU */}
                  <td className="px-8 py-6">

                    <button className="p-3 rounded-xl hover:bg-white/10">

                      <MoreVertical className="w-5 h-5 text-gray-400" />

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* SIDE DRAWER */}
      <AnimatePresence>

        {selectedLead && (

          <motion.div
            initial={{ x: 500 }}
            animate={{ x: 0 }}
            exit={{ x: 500 }}
            transition={{ duration: 0.35 }}
            className="fixed top-0 right-0 w-[560px] h-screen bg-[#12051f] border-l border-white/10 backdrop-blur-2xl z-50 overflow-y-auto shadow-2xl"
          >

            <div className="p-8">

              {/* HEADER */}
              <div className="flex justify-between items-start mb-10">

                <div>

               <input
  type="text"
  value={selectedLead.company || ""}
  onChange={(e) =>
    setSelectedLead({
      ...selectedLead,
      company: e.target.value,
    })
  }
  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-3xl font-black outline-none"
/>
                 <input
  type="text"
  value={selectedLead.name || ""}
  onChange={(e) =>
    setSelectedLead({
      ...selectedLead,
      name: e.target.value,
    })
  }
  className="w-full mt-3 bg-white/5 border border-white/10 rounded-2xl p-3 text-lg outline-none"
/>

                </div>

                <button
                  onClick={() => setSelectedLead(null)}
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
                >

                  <X className="w-5 h-5" />

                </button>

              </div>

              {/* QUICK ACTIONS */}
              <div className="grid grid-cols-2 gap-4 mb-10">

                <button className="bg-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/10 transition-all">

                  <Phone className="w-6 h-6 text-green-400" />

                  <div className="text-left">

                    <p className="text-sm text-gray-400">
                      Call Client
                    </p>

                    <h3 className="font-semibold">
                      {selectedLead.phone}
                    </h3>

                  </div>

                </button>

                <button className="bg-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/10 transition-all">

                  <Mail className="w-6 h-6 text-blue-400" />

                  <div className="text-left">

                    <p className="text-sm text-gray-400">
                      Email
                    </p>

                    <h3 className="font-semibold">
                      Contact
                    </h3>

                  </div>

                </button>

              </div>

              {/* INFO GRID */}
              <div className="grid grid-cols-2 gap-5 mb-10">

                <div className="bg-white/5 rounded-3xl p-5">

                  <div className="flex items-center gap-3 mb-3">

                    <BadgeDollarSign className="w-5 h-5 text-green-400" />

                    <p className="text-gray-400">
                      Deal Value
                    </p>

                  </div>

                  <h3 className="text-3xl font-black text-green-400">
                    {selectedLead.dealValue}
                  </h3>

                </div>

                <div className="bg-white/5 rounded-3xl p-5">

                  <div className="flex items-center gap-3 mb-3">

                    <Globe className="w-5 h-5 text-purple-400" />

                    <p className="text-gray-400">
                      Lead Source
                    </p>

                  </div>

                  <h3 className="text-2xl font-bold">
                    {selectedLead.source}
                  </h3>

                </div>

                <div className="bg-white/5 rounded-3xl p-5">

                  <div className="flex items-center gap-3 mb-3">

                    <User2 className="w-5 h-5 text-pink-400" />

                    <p className="text-gray-400">
                      Assigned Employee
                    </p>

                  </div>

                  <h3 className="text-2xl font-bold">
                    {selectedLead.assignedTo}
                  </h3>

                </div>

                <div className="bg-white/5 rounded-3xl p-5">

                  <div className="flex items-center gap-3 mb-3">

                    <MessageSquareMore className="w-5 h-5 text-orange-400" />

                    <p className="text-gray-400">
                      Quotation
                    </p>

                  </div>

                  <h3 className="text-2xl font-bold text-orange-300">
                    {selectedLead.quotation}
                  </h3>

                </div>

              </div>

              {/* TIMELINE */}
              <div className="mb-10">

                <h3 className="text-2xl font-bold mb-6">
                  Timeline Activity
                </h3>

                <div className="space-y-5">

                {selectedLead.timeline?.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-4"
                    >

                      <div className="w-4 h-4 rounded-full bg-purple-500 mt-2"></div>

                      <div className="bg-white/5 rounded-2xl p-4 flex-1">
                        {item}
                      </div>

                    </div>

                  ))}

                </div>

              </div>

              {/* NOTES */}
              <div className="mb-10">

                <h3 className="text-2xl font-bold mb-6">
                  Notes
                </h3>

                <div className="space-y-4">

             {selectedLead.notes?.map((note, i) => (

                    <div
                      key={i}
                      className="bg-white/5 rounded-2xl p-5 text-gray-300"
                    >
                      {note}
                    </div>

                  ))}

                </div>

              </div>

              {/* TASKS & DOCS */}
              <div className="grid grid-cols-2 gap-5">

                <div className="bg-white/5 rounded-3xl p-5">

                  <div className="flex items-center gap-3 mb-4">

                    <CheckSquare2 className="w-5 h-5 text-blue-400" />

                    <h3 className="text-lg font-semibold">
                      Linked Tasks
                    </h3>

                  </div>

                  <h2 className="text-4xl font-black">
                  {selectedLead.tasks || 0}
                  </h2>

                </div>

                <div className="bg-white/5 rounded-3xl p-5">

                  <div className="flex items-center gap-3 mb-4">

                    <FileText className="w-5 h-5 text-pink-400" />

                    <h3 className="text-lg font-semibold">
                      Documents
                    </h3>

                  </div>

                  <h2 className="text-4xl font-black">
                  {selectedLead.documents || 0}
                  </h2>

                </div>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
}