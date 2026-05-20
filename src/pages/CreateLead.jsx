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

export default function CreateLead({ onClose }) {

  const navigate =
    useNavigate();

  const [employees,
    setEmployees] =
    useState([]);

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

  const fetchEmployees =
    async () => {

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              'employees'
            )
          );

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

  const handleChange =
    (e) => {

      setLead({

        ...lead,

        [e.target.name]:
          e.target.value,

      });

    };

  // ADD LEAD
  const addLead = async () => {
    try {
console.log(lead);
      const response = await fetch(
        "http://localhost:5000/api/leads",
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

      console.log(data);

      alert("Lead Added Successfully");
      onClose();

      navigate("/leads");

    } catch (error) {

      console.log(error);

      alert("Failed To Add Lead");

    }
  };

  return (

    <div className="max-w-5xl mx-auto p-10 rounded-[40px] bg-[#e9e7e2] relative">
  
  <div className='absolute top-5 right-5 text-red-600 font-bold w-25 h-25 hover:bg-white rounded'>
    <X size={22} strokeWidth='3px' onClick={onClose} />
  </div>

      <div className="grid md:grid-cols-2 gap-5">

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
      <div className='mt-2'>
        <label className="font-bold text-[#0b2b57] mt-2">
          Payment Description
        </label>

        <textarea
          name="notes"
          value={lead.notes}
          onChange={handleChange}
          className="w-full h-40 p-4 rounded-xl mt-2"
        />
      </div>
      <div className="border-t pt-8 flex gap-4">

        <button className="px-10 py-4 border rounded-xl bg-blue-700 hover:bg-blue-600 text-white" onClick={onClose}>
          Cancel
        </button>

        <button
          onClick={addLead}
          className="flex-1 bg-blue-700 hover:bg-blue-600 text-white rounded-xl">

          + Add Lead

        </button>

      </div>

    </div>

  )

}