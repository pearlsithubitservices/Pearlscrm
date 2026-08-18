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
  Users,
  Activity,
  Calendar,
  X
} from 'lucide-react';

export default function CreateTask({ onClose }) {

  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);

  const [task, setTask] = useState({
    title: '',
    notes: '',
    assignedTo: '',
    assignedBy: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

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

  const handleChange = (e) => {
    setTask({
      ...task,
      [e.target.name]: e.target.value,
    });
  };

  const addTask = async () => {
    try {
      await addDoc(
        collection(db, 'tasks'),
        {
          ...task,
          createdAt: new Date(),
        }
      );

      alert('Task Added');
      onClose();
      navigate('/tasks');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#e9e7e2] rounded-2xl sm:rounded-[30px] p-4 sm:p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto page-scroll">
      <button
        onClick={onClose}
        className='absolute top-4 right-4 text-red-600 font-bold p-1.5 hover:bg-white rounded-full transition-colors'
        aria-label="Close"
      >
        <X size={22} strokeWidth={2.5} />
      </button>

      <h2 className="text-xl sm:text-2xl font-bold text-[#0b2b57] mb-6 pr-8">
        Create New Task
      </h2>

      <InputField
        label="Task Title"
        name="title"
        value={task.title}
        onChange={handleChange}
        placeholder="Enter task title..."
      />

      <div className="mt-4">
        <label className="font-bold text-[#0b2b57] text-sm sm:text-base block mb-2">
          Task Description
        </label>
        <textarea
          name='notes'
          value={task.notes}
          onChange={handleChange}
          placeholder="Describe the task..."
          className="w-full h-32 p-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4">
        <InputField
          label="Assigned From"
          name="assignedBy"
          value={task.assignedBy}
          onChange={handleChange}
          placeholder="Select manager"
          Icon={Users}
          type='select'
          options={employees.map((emp) => ({
            label: emp.name,
            value: emp.id || emp.name
          }))}
        />

        <InputField
          label="Assigned To"
          name="assignedTo"
          value={task.assignedTo}
          onChange={handleChange}
          placeholder="Select employee"
          Icon={Users}
          type='select'
          options={employees.map((emp) => ({
            label: emp.name,
            value: emp.uid || emp.id
          }))}
        />

        <InputField
          label="Task Priority"
          name="priority"
          value={task.priority}
          onChange={handleChange}
          type="select"
          placeholder="Select priority"
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
          placeholder="Select date"
          Icon={Calendar}
          type='date'
        />
      </div>

      <div className="border-t border-gray-300 pt-6 mt-6 flex flex-col-reverse sm:flex-row gap-3">
        <button
          className="px-6 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 hover:bg-gray-100 font-semibold transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          onClick={addTask}
          className="flex-1 py-3 px-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          + Add Task
        </button>
      </div>
    </div>
  );
}
