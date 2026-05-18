import React, {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import { Phone,Users, IndianRupee } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  collection,
  getDocs,
  addDoc,
} from 'firebase/firestore';

import { db } from '../lib/firebase';

import InputField from '../components/InputField';

export default function CreateLead({onClose}) {

  const navigate =
    useNavigate();

  const [employees,
    setEmployees] =
    useState([]);

  const [lead,
    setLead] =
    useState({

      name: '',

      company: '',

      phone: '',

      email: '',

      website: '',

      source: '',

      budget: '',

      platform: '',

      nextAction: '',

      assignedTo: '',

      assignedEmployee: '',

      status: 'New',

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

  const addLead =
    async () => {

      try {

        await addDoc(
          collection(db, 'leads'),
          {

            ...lead,

            createdAt:
              new Date(),

          }
        );

        alert(
          'Lead Added Successfully'
        );

        navigate('/leads');

      } catch (error) {

        console.log(error);

        alert(
          'Failed To Add Lead'
        );

      }

    };

  return (

    <div className="max-w-5xl mx-auto p-10 rounded-[40px] bg-[#e9e7e2]">

      <div className="grid md:grid-cols-2 gap-5">

        <InputField
          label="Lead Name"
          placeholder="John Doe"
        />

        <InputField
          label="Company Name"
          placeholder="Innovatech"
        />

        <InputField
          label="Phone Number"
          placeholder="+1 555"
          Icon={Phone}
        />

        <InputField
          label="Assigned To"
          placeholder="Agent"
          Icon={Users}
        />

        <InputField
          label="Budget"
          placeholder="₹0.00"
          Icon={IndianRupee}
        />

        <InputField
          label="Lead Temp"
          placeholder="Hot"
        />

      </div>
      <div className="border-t pt-8 flex gap-4">

                    <button className="px-10 py-4 border rounded-xl bg-blue-700 hover:bg-blue-600 text-white" onClick={onClose}>
                        Cancel
                    </button>

                    <button className="flex-1 bg-blue-700 hover:bg-blue-600 text-white rounded-xl">

                        + Add Lead

                    </button>

                </div>

    </div>

  )

}