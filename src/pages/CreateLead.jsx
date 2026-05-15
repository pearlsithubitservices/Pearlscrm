import React, {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  collection,
  getDocs,
  addDoc,
} from 'firebase/firestore';

import { db } from '../lib/firebase';

export default function CreateLead() {

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

    <div className="min-h-screen bg-[#070B1A] text-white p-6">

      <div className="max-w-6xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8">

        <h1 className="text-5xl font-bold mb-3">

          Create Lead

        </h1>

        <p className="text-gray-400 mb-10">

          Add and assign leads easily

        </p>

        <div className="grid grid-cols-2 gap-6">

          <input
            type="text"
            name="name"
            placeholder="Client Name"
            value={lead.name}
            onChange={handleChange}
            className="bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none"
          />

          <input
            type="text"
            name="company"
            placeholder="Company Name"
            value={lead.company}
            onChange={handleChange}
            className="bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={lead.phone}
            onChange={handleChange}
            className="bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={lead.email}
            onChange={handleChange}
            className="bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none"
          />

          <input
            type="text"
            name="website"
            placeholder="Website"
            value={lead.website}
            onChange={handleChange}
            className="bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none"
          />

          <input
            type="text"
            name="source"
            placeholder="Lead Source"
            value={lead.source}
            onChange={handleChange}
            className="bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none"
          />

          <input
            type="text"
            name="budget"
            placeholder="Budget"
            value={lead.budget}
            onChange={handleChange}
            className="bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none"
          />

          <input
            type="text"
            name="platform"
            placeholder="Platform"
            value={lead.platform}
            onChange={handleChange}
            className="bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none"
          />

          {/* ASSIGN EMPLOYEE */}

          <select
            name="assignedTo"
            value={lead.assignedTo}
            onChange={(e) => {

              const selectedEmployee =
                employees.find(
                  (emp) =>
                    emp.uid ===
                    e.target.value
                );

              if (selectedEmployee) {

                setLead({

                  ...lead,

                  assignedTo:
                    selectedEmployee.uid,

                  assignedEmployee:
                    selectedEmployee.name,

                });

              }

            }}
            className="bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none"
          >

            <option value="">

              Select Employee

            </option>

            {employees.map(
              (employee) => (

                <option
                  key={employee.id}
                  value={employee.uid}
                >

                  {employee.name}

                </option>

              )
            )}

          </select>

          {/* STATUS */}

          <select
            name="status"
            value={lead.status}
            onChange={handleChange}
            className="bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none"
          >

            <option>

              New

            </option>

            <option>

              Interested

            </option>

            <option>

              Follow-up

            </option>

            <option>

              Closed

            </option>

          </select>

          {/* NOTES */}

          <textarea
            name="notes"
            placeholder="Notes..."
            value={lead.notes}
            onChange={handleChange}
            className="col-span-2 bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none min-h-[150px]"
          />

          {/* BUTTON */}

          <button
            onClick={addLead}
            className="col-span-2 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-xl"
          >

            + Create Lead

          </button>

        </div>

      </div>

    </div>          

  );


}  