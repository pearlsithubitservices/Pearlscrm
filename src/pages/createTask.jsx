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

import {
  User,
  Building2,
  CalendarDays,
  Flag,
  ClipboardList,
  PlusCircle,
} from 'lucide-react';

export default function AddTask() {

  const navigate =
    useNavigate();

  const [employees, setEmployees] =
    useState([]);

  const [task, setTask] =
    useState({

      company: '',

      title: '',

      assignedTo: '',

      assignedEmployee: '',

      priority: 'Medium',

      status: 'Pending',

      dueDate: '',

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

  const handleChange = (e) => {

    setTask({

      ...task,

      [e.target.name]:
        e.target.value,

    });

  };

  // ADD TASK

  const addTask =
    async () => {

      try {

        await addDoc(
          collection(db, 'tasks'),
          {

            ...task,

            createdAt:
              new Date(),

          }
        );

        alert('Task Added');

        navigate('/tasks');

      } catch (error) {

        console.log(error);

      }

    };

  const priorities = [

    'Low',

    'Medium',

    'High',

    'Urgent',

  ];

  return (

    <div className="min-h-screen bg-[#070B1A] text-white p-6">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-bold">

              Create New Task

            </h1>

            <p className="text-gray-400 mt-2">

              Assign and manage
              employee tasks easily

            </p>

          </div>

          <div className="hidden md:flex items-center gap-3 bg-purple-600/20 border border-purple-500/20 px-5 py-3 rounded-2xl">

            <PlusCircle size={22} />

            <span className="font-medium">

              Task Panel

            </span>

          </div>

        </div>

        {/* MAIN */}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT */}

          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">

            {/* COMPANY */}

            <div>

              <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">

                <Building2 size={18} />

                Company Name

              </label>

              <input
                type="text"
                name="company"
                value={task.company}
                onChange={handleChange}
                placeholder="Enter company name"
                className="w-full bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none focus:border-purple-500"
              />

            </div>

            {/* TASK */}

            <div>

              <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">

                <ClipboardList size={18} />

                Task Description

              </label>

              <textarea
                name="title"
                value={task.title}
                onChange={handleChange}
                placeholder="Write task details..."
                className="w-full min-h-[180px] bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none focus:border-purple-500"
              />

            </div>

            {/* EMPLOYEE */}

            <div>

              <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">

                <User size={18} />

                Assign Employee

              </label>

              <select
                name="assignedTo"
                value={task.assignedTo}
                onChange={(e) => {

                  const selectedEmployee =
                    employees.find(
                      (emp) =>
                        emp.uid ===
                        e.target.value
                    );

                  if (selectedEmployee) {

                    setTask({

                      ...task,

                      assignedTo:
                        selectedEmployee.uid,

                      assignedEmployee:
                        selectedEmployee.name,

                    });

                  }

                }}
                className="w-full bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none focus:border-purple-500"
              >

                <option value="">

                  Select Employee

                </option>

                {employees.map(
                  (employee) => (

                    <option
                      key={
                        employee.id
                      }
                      value={
                        employee.uid
                      }
                    >

                      {employee.name}

                    </option>

                  )
                )}

              </select>

            </div>

          </div>

          {/* RIGHT */}

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">

            {/* EMPLOYEE CARD */}

            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 rounded-2xl p-5">

              <p className="text-sm text-gray-400">

                Assigned Employee

              </p>

              <h2 className="text-2xl font-bold mt-2">

                {task.assignedEmployee ||
                  'Select Employee'}

              </h2>

            </div>

            {/* PRIORITY */}

            <div>

              <label className="flex items-center gap-2 text-sm text-gray-400 mb-4">

                <Flag size={18} />

                Priority

              </label>

              <div className="grid grid-cols-2 gap-3">

                {priorities.map(
                  (item) => (

                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setTask({

                          ...task,

                          priority:
                            item,

                        })
                      }
                      className={`p-3 rounded-2xl border transition-all ${
                        task.priority ===
                        item
                          ? 'bg-purple-600 border-purple-500'
                          : 'bg-[#111827] border-white/10'
                      }`}
                    >

                      {item}

                    </button>

                  )
                )}

              </div>

            </div>

            {/* STATUS */}

            <div>

              <label className="text-sm text-gray-400 mb-3 block">

                Status

              </label>

              <select
                name="status"
                value={task.status}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none"
              >

                <option value="Pending">

                  Pending

                </option>

                <option value="In Progress">

                  In Progress

                </option>

                <option value="Completed">

                  Completed

                </option>

              </select>

            </div>

            {/* DATE */}

            <div>

              <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">

                <CalendarDays size={18} />

                Due Date

              </label>

              <input
                type="date"
                name="dueDate"
                value={task.dueDate}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-white/10 rounded-2xl p-4 outline-none"
              />

            </div>

            {/* BUTTON */}

            <button
              onClick={addTask}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg hover:scale-[1.02] transition-all"
            >

              + Add Task

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}