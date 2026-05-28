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

import InputField from '../components/InputField';

import {
  User,
  Building2,
  CalendarDays,
  Flag,
  ClipboardList,
  PlusCircle,
  Users,
  Activity,
  Calendar,
  X
} from 'lucide-react';
import { title } from 'framer-motion/client';

export default function CreateTask({ onClose }) {

  const navigate =
    useNavigate();

  const [employees, setEmployees] =
    useState([]);

  const [task, setTask] =
    useState({

      notes: '',

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

    <div className="max-w-5xl mx-auto bg-[#e9e7e2] rounded-[40px] p-10 relative">
      <div className='absolute top-5 right-5 text-red-600 font-bold w-25 h-25 hover:bg-white rounded'>
        <X size={22} strokeWidth='3px' onClick={onClose} />
      </div>

      <InputField
        label="Task Title"
        name="title"
        value={task.title}
        onChange={handleChange}
        placeholder="Task title"
      />

      <div className="mt-5">

        <label className="font-bold text-[#0b2b57]">
          Task Description
        </label>

        <textarea
          name='notes'
          value={task.notes}
          onChange={handleChange}
          className="w-full h-40 p-4 rounded-xl mt-2"
        />

      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-5">

        <InputField
          label="Assigned From"
          name="assignedEmployee"
          value={task.assignedEmployee}
          onChange={handleChange}
          placeholder="Agent Name"
          Icon={Users}
        />

        <InputField
          label="Assigned To"
          name="assignedTo"
          value={task.assignedTo}
          onChange={handleChange}
          placeholder="Agent Name"
          Icon={Users}
        />

      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-5">

        <InputField
          label="Task Priority"
          name="priority"
          value={task.priority}
          onChange={handleChange}
          type="select"
          placeholder="Select temperature"
          options={[
            { label: "Hot", value: "Hot" },
            { label: "Warm", value: "Warm" },
            { label: "Cold", value: "Cold" },
          ]}
          Icon={Activity}
        />

        <InputField
          label="Due Date"
          value={task.dueDate}
          name="dueDate"
          onChange={handleChange}
          placeholder="May15"
          Icon={Calendar}
        />

      </div>
      <div className="border-t pt-8 flex gap-4">

        <button className="px-10 py-4 border rounded-xl bg-blue-700 text-white hover:bg-blue-600"
          onClick={onClose}>
          Cancel
        </button>

        <button
          onClick={addTask}
          className="flex-1 bg-blue-700 text-white rounded-xl hover:bg-blue-600">

          + Add Task

        </button>

      </div>

    </div>

  )

}