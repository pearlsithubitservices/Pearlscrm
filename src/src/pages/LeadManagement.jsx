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
  Upload
} from 'lucide-react';

import { useIndustry } from '../context/IndustryContext';

import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '../lib/utils';

import { useNavigate } from 'react-router-dom';

import * as XLSX from 'xlsx';

export default function LeadManagement() {

  const { config } =
    useIndustry();

  const navigate =
    useNavigate();

  const [searchQuery,
    setSearchQuery] =
    useState('');

  const [selectedLead,
    setSelectedLead] =
    useState(null);

  const [leads,
    setLeads] =
    useState([]);

  const [employees,
    setEmployees] =
    useState([]);

  // FETCH DATA

  useEffect(() => {

    fetchLeads();

    fetchEmployees();

  }, []);

  // FETCH LEADS

  const fetchLeads =
    async () => {

      try {

        const response =
          await fetch(
            'https://pearlscrm.onrender.com/api/leads'
          );

        const data =
          await response.json();

        setLeads(data);

      } catch (error) {

        console.log(error);

      }

    };

  // FETCH EMPLOYEES

  const fetchEmployees =
    async () => {

      try {

        const response =
          await fetch(
            'https://pearlscrm.onrender.com/api/employees'
          );

        const data =
          await response.json();

        setEmployees(data);

      } catch (error) {

        console.log(error);

      }

    };

  // SAVE LEAD

  const saveLead =
    async () => {

      try {

        await fetch(
          `https://pearlscrm.onrender.com/api/leads/${selectedLead._id}`,
          {

            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              selectedLead
            ),

          }
        );

        fetchLeads();

        alert(
          'Lead Updated Successfully'
        );

      } catch (error) {

        console.log(error);

      }

    };

  // EXCEL UPLOAD

  const handleExcelUpload =
    async (e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onload =
        async (evt) => {

          const data =
            new Uint8Array(
              evt.target.result
            );

          const workbook =
            XLSX.read(data, {
              type: 'array',
            });

          const sheet =
            workbook.Sheets[
              workbook.SheetNames[0]
            ];

          const jsonData =
            XLSX.utils.sheet_to_json(
              sheet
            );

          try {

            await fetch(
              'https://pearlscrm.onrender.com/api/leads/bulk',
              {

                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json',
                },

                body:
                  JSON.stringify(
                    jsonData
                  ),

              }
            );

            fetchLeads();

            alert(
              'Excel Imported Successfully'
            );

          } catch (error) {

            console.log(error);

          }

        };

      reader.readAsArrayBuffer(
        file
      );

    };

  // STATUS COLORS

  const getStatusColor =
    (status) => {

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

  // FILTER

  const filteredLeads =
    leads.filter((lead) =>

      lead.company
        ?.toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        ) ||

      lead.name
        ?.toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        )
    );

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

        <div className="flex gap-4">

          {/* EXCEL */}

          <label className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">

            <Upload className="w-5 h-5" />

            Upload Excel

            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={
                handleExcelUpload
              }
            />

          </label>

          {/* ADD LEAD */}

          <button
            onClick={() =>
              navigate(
                '/create-lead'
              )
            }
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 font-semibold hover:scale-105 transition-all"
          >

            <Plus className="w-5 h-5" />

            Add Lead

          </button>

        </div>

      </div>

      {/* SEARCH */}

      <div className="mb-8">

        <div className="relative max-w-lg">

          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
            className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500"
          />

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-white/10 text-left text-sm uppercase text-gray-500">

                <th className="px-8 py-6">

                  Lead

                </th>

                <th className="px-8 py-6">

                  Status

                </th>

                <th className="px-8 py-6">

                  Assigned

                </th>

                <th className="px-8 py-6">

                  Source

                </th>

                <th className="px-8 py-6">

                  Budget

                </th>

                <th className="px-8 py-6">

                  Platform

                </th>

                <th className="px-8 py-6">

                  Next Action

                </th>

                <th className="px-8 py-6"></th>

              </tr>

            </thead>

            <tbody>

              {filteredLeads.map(
                (lead) => (

                  <tr
                    key={lead._id}
                    onClick={() =>
                      setSelectedLead(
                        lead
                      )
                    }
                    className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer"
                  >

                    {/* LEAD */}

                    <td className="px-8 py-6">

                      <div className="flex items-center gap-4">

                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-bold">

                          {lead.company?.charAt(
                            0
                          )}

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
                          getStatusColor(
                            lead.status
                          )
                        )}
                      >

                        {lead.status}

                      </span>

                    </td>

                    {/* ASSIGNED */}

                    <td className="px-8 py-6">

                      {lead.assignedTo ||
                        'Unassigned'}

                    </td>

                    {/* SOURCE */}

                    <td className="px-8 py-6">

                      {lead.source}

                    </td>

                    {/* BUDGET */}

                    <td className="px-8 py-6 text-green-400 font-bold">

                      {lead.budget}

                    </td>

                    {/* PLATFORM */}

                    <td className="px-8 py-6">

                      {lead.platform}

                    </td>

                    {/* NEXT */}

                    <td className="px-8 py-6">

                      <div className="flex items-center gap-2">

                        <Calendar className="w-4 h-4 text-gray-500" />

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

                )
              )}

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
            className="fixed top-0 right-0 w-[560px] h-screen bg-[#12051f] border-l border-white/10 z-50 overflow-y-auto"
          >

            <div className="p-8">

              {/* HEADER */}

              <div className="flex justify-between items-start mb-10">

                <div className="w-full">

                  <input
                    type="text"
                    value={
                      selectedLead.company ||
                      ''
                    }
                    onChange={(e) =>
                      setSelectedLead({
                        ...selectedLead,
                        company:
                          e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-3xl font-black outline-none"
                  />

                  <input
                    type="text"
                    value={
                      selectedLead.name ||
                      ''
                    }
                    onChange={(e) =>
                      setSelectedLead({
                        ...selectedLead,
                        name:
                          e.target.value,
                      })
                    }
                    className="w-full mt-3 bg-white/5 border border-white/10 rounded-2xl p-3 outline-none"
                  />

                </div>

                <button
                  onClick={() =>
                    setSelectedLead(
                      null
                    )
                  }
                  className="w-12 h-12 ml-4 rounded-2xl bg-white/5 flex items-center justify-center"
                >

                  <X className="w-5 h-5" />

                </button>

              </div>

              {/* ASSIGN */}

              <div className="bg-white/5 rounded-3xl p-5 mb-8">

                <div className="flex items-center gap-3 mb-4">

                  <User2 className="w-5 h-5 text-pink-400" />

                  <p className="text-gray-400">

                    Assign Lead To

                  </p>

                </div>

                <select
                  value={
                    selectedLead.assignedTo ||
                    ''
                  }
                  onChange={(e) =>
                    setSelectedLead({
                      ...selectedLead,
                      assignedTo:
                        e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none"
                >

                  <option value="">

                    Select Employee

                  </option>

                  {employees.map(
                    (employee) => (

                      <option
                        key={
                          employee._id
                        }
                        value={
                          employee.name
                        }
                      >

                        {employee.name}

                      </option>

                    )
                  )}

                </select>

              </div>

              {/* INFO */}

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

                      Source

                    </p>

                  </div>

                  <h3 className="text-2xl font-bold">

                    {selectedLead.source}

                  </h3>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="grid grid-cols-2 gap-4 mb-10">

                <button className="bg-white/5 rounded-2xl p-5 flex items-center gap-4">

                  <Phone className="w-6 h-6 text-green-400" />

                  <div>

                    <p className="text-sm text-gray-400">

                      Call Client

                    </p>

                    <h3 className="font-semibold">

                      {selectedLead.phone}

                    </h3>

                  </div>

                </button>

                <button className="bg-white/5 rounded-2xl p-5 flex items-center gap-4">

                  <Mail className="w-6 h-6 text-blue-400" />

                  <div>

                    <p className="text-sm text-gray-400">

                      Email

                    </p>

                    <h3 className="font-semibold">

                      Contact

                    </h3>

                  </div>

                </button>

              </div>

              {/* SAVE */}

              <button
                onClick={saveLead}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-lg"
              >

                Save Changes

              </button>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  );

}