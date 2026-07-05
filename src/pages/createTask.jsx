import React, {
  useEffect,
  useMemo,
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
import { useAuth } from '../context/AuthContext';

export default function CreateTask({ onClose }) {

  const navigate =
    useNavigate();

  const [employees, setEmployees] =
    useState([]);
  const { user } = useAuth()
  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      map[employee.uid] = {
        name: employee.name,
        role: employee.role || employee.employeeRole
      }
      return map;
    }, {});
  }, [employees]);


  const [task, setTask] =
    useState({

      notes: '',

      title: '',

      assignedTo: ' ',

      assignedBy: ' ',

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
          console.log("Employee Doc ID:", doc.id);
          console.log("Employee Data:", doc.data());

        });

        setEmployees(employeeList);
        console.log("employees:", employeeList);

      } catch (error) {

        console.log(error);

      }

    };

  //ADD TASKS

  // const addtasks = async () => {
  //   try {
  //     const response = await fetch('http://localhost:5000/api/tasks', {
  //       method: 'POST',
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(task),
  //     });

  //     const data = await response.json();
  //     console.log(data);

  //     if (response.ok) {
  //       alert('Task added successfully');
  //       navigate('/tasks');
  //     } else {
  //       alert(data.message || 'Failed to add task');
  //     }

  //   } catch (error) {
  //     console.log(error);
  //     alert('Failed to add task. Please try again.');
  //   }
  // };

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
        onClose();
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
          name="assignedBy"
          value={task.assignedBy}
          onChange={handleChange}
          placeholder="Agent Name"
          Icon={Users}
          type='select'
          options={
            [
              {
                value: user?.uid,
                label: employeeMap[user?.uid]?.name
              }
            ]
          }
        />

        <InputField
          label="Assigned To"
          name="assignedTo"
          value={task.assignedTo}
          onChange={handleChange}
          placeholder="Agent Name"
          Icon={Users}
          type='select'
          options={employees.map((emp) => ({
            label: emp.name,
            value: emp.uid
          }))}
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
          type='date'
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