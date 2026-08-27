import React, {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';


import { apiUrl } from '../config/api';

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

import useEmployees from '../Hooks/useEmployees';
import { useAuth } from '../context/AuthContext';

export default function CreateTask({ onClose, onSuccess }) {
  const navigate = useNavigate();
  const { employees } = useEmployees();
  const { user } = useAuth();

  const adminName = user?.displayName || user?.name || user?.employeeName || (user?.email ? user.email.split('@')[0] : "Admin");
  const adminId = user?._id || user?.uid || user?.id || adminName;

  const [task, setTask] = useState({
    title: '',
    description: '',
    notes: '',
    assignedTo: '',
    assignedBy: adminId,
    priority: 'Medium',
    status: 'Pending',
    dueDate: '',
  });

  // Keep assignedBy updated if user changes or loads asynchronously
  useEffect(() => {
    if (adminId && !task.assignedBy) {
      setTask((prev) => ({ ...prev, assignedBy: adminId }));
    }
  }, [adminId]);

  // HANDLE CHANGE
  const handleChange = (e) => {
    setTask({
      ...task,
      [e.target.name]: e.target.value,
    });
  };

  // ADD TASK
  const addTask = async () => {
    if (!task.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      const payload = {
        ...task,
        assignedBy: task.assignedBy || adminId,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      };

      const response = await fetch(apiUrl('/tasks'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Task Added successfully to MongoDB!');
        if (onSuccess) {
          onSuccess();
        } else if (onClose) {
          onClose();
        }
        navigate('/tasks');
      } else {
        const errData = await response.json();
        alert(errData.message || 'Failed to add task');
      }
    } catch (error) {
      console.error('Add task error:', error);
      alert('Failed to add task. Please check server connection.');
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
          name='description'
          value={task.description}
          onChange={handleChange}
          placeholder="Enter task description..."
          className="w-full h-40 p-4 rounded-xl mt-2 outline-none border border-gray-300"
        />

      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-5">

        <InputField
          label="Assigned From"
          name="assignedBy"
          value={adminName}
          disabled={true}
          Icon={Users}
          placeholder="Admin Name"
        />

        <InputField
          label="Assigned To"
          name="assignedTo"
          value={task.assignedTo}
          onChange={handleChange}
          placeholder="Select Employee"
          Icon={Users}
          type='select'
          options={employees.map((emp) => ({
            label: emp.employeeName || emp.name || emp.displayName || (emp.email ? emp.email.split('@')[0] : "Employee"),
            value: emp._id || emp.id || emp.uid || emp.email
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