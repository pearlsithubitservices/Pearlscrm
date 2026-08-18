import React, {
  Activity,
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import { Phone, Users, IndianRupee, Globe, Calendar, RefreshCcwIcon, Repeat, Cross, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  collection,
  getDocs,
  addDoc,
} from 'firebase/firestore';

import { db } from '../lib/firebase';

import InputField from '../components/InputField';
import { apiUrl } from "../config/api.js";

export default function CreateLead({ onClose, fetchleads }) {

  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);

  const [lead, setLead] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    source: '',
    budget: '',
    platform: '',
    nextAction: 'call',
    assignedTo: '',
    assignedEmployee: '',
    status: 'New',
    priority: 'Warm',
    followUpCount: 0,
    notes: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  // FETCH EMPLOYEES
  const fetchEmployees = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'employees'));
      const employeeList = [];
      snapshot.forEach((doc) => {
        employeeList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setEmployees(employeeList);
    } catch (error) {
      console.log(error);
    }
  };

  // HANDLE CHANGE
  const handleChange = (e) => {
    setLead({
      ...lead,
      [e.target.name]: e.target.value,
    });
  };

  // ADD LEAD
  const addLead = async () => {
    try {
      const response = await fetch(
        apiUrl("/leads"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...lead,
          })
        }
      );

      const data = await response.json();
      if (response.ok) {
        fetchleads();
      }

      alert("Lead Added Successfully");
      onClose();
      navigate("/leads");

    } catch (error) {
      console.log(error);
      alert("Failed To Add Lead");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[30px] bg-[#e9e7e2] relative shadow-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar hide-scrollbar">

      <button
        onClick={onClose}
        className='absolute top-4 right-4 text-red-600 font-bold p-1.5 hover:bg-white/80 rounded-full transition-colors'
        aria-label="Close"
      >
        <X size={22} strokeWidth={2.5} />
      </button>

      <h2 className="text-xl sm:text-2xl font-bold text-[#0b2b57] mb-6 pr-8">
        Create New Lead
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

        <InputField
          label="Lead Name"
          name="name"
          value={lead.name}
          onChange={handleChange}
          placeholder="John Doe"
        />

        <InputField
          label="Company Name"
          name="company"
          value={lead.company}
          onChange={handleChange}
          placeholder="Innovatech"
        />

        <InputField
          label="Phone Number"
          name="phone"
          value={lead.phone}
          onChange={handleChange}
          placeholder="+1 555"
          Icon={Phone}
        />

        <InputField
          label="Assigned To"
          name="assignedTo"
          value={lead.assignedTo}
          onChange={handleChange}
          placeholder="Agent"
          Icon={Users}
          type='select'
          options={
            employees.map((employee) => ({
              label: employee.name,
              value: employee.uid,
            }))
          }
        />

        <InputField
          label="Status"
          name="status"
          value={lead.status}
          onChange={handleChange}
          placeholder="New"
          Icon={Activity}
        />

        <InputField
          label="Source"
          name="source"
          value={lead.source}
          onChange={handleChange}
          placeholder="Website"
          Icon={Globe}
        />

        <InputField
          label="Budget"
          name="budget"
          value={lead.budget}
          onChange={handleChange}
          placeholder="₹0.00"
          Icon={IndianRupee}
        />

        <InputField
          label="Priority"
          name="priority"
          value={lead.priority}
          onChange={handleChange}
          placeholder="Hot"
        />

        <InputField
          label="Follow-up Counts"
          name="followUpCount"
          value={lead.followUpCount}
          onChange={handleChange}
          placeholder="0"
          Icon={Repeat}
        />

        <InputField
          label="Next Action"
          name="nextAction"
          value={lead.nextAction}
          onChange={handleChange}
          placeholder="Follow-up call"
          Icon={Calendar}
        />

      </div>

      <div className='mt-4'>
        <label className="font-bold text-[#0b2b57] text-sm sm:text-base">
          Lead Description
        </label>

        <textarea
          name="notes"
          value={lead.notes}
          onChange={handleChange}
          className="w-full h-32 sm:h-40 p-4 rounded-xl mt-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <div className="border-t border-gray-300 pt-6 mt-6 flex flex-col-reverse sm:flex-row gap-3">
        <button
          className="px-6 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-semibold transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          onClick={addLead}
          className="flex-1 py-3 px-6 bg-[#2563a9] hover:bg-[#1d508b] text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          + Add Lead
        </button>
      </div>

    </div>
  );
}