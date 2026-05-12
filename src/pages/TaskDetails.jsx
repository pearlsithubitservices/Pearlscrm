import React, { useEffect, useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

export default function TaskDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [task, setTask] = useState({
    title: '',
    company: '',
    assignedTo: '',
    priority: '',
    status: '',
    dueDate: '',
  });

  useEffect(() => {

    fetchTask();

  }, []);

  const fetchTask = async () => {

    try {

      const response = await fetch(
        `http://localhost:5000/api/tasks/${id}`
      );

      const data = await response.json();

      setTask(data);

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

  const updateTask = async () => {

    try {

      await fetch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(task),
        }
      );

      alert('Task Updated');

      navigate('/tasks');

    } catch (error) {

      console.log(error);

    }
  };

  return (

    <div className="min-h-screen bg-[#0b0b14] text-white p-8">

      <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8">

        <h1 className="text-4xl font-bold mb-8">

          Edit Task

        </h1>

        <div className="space-y-5">

          <input
            type="text"
            name="company"
            value={task.company}
            onChange={handleChange}
            placeholder="Company"
            className="w-full bg-[#151521] border border-white/10 rounded-2xl p-4 outline-none"
          />

          <textarea
            name="title"
            value={task.title}
            onChange={handleChange}
            placeholder="Task"
            className="w-full bg-[#151521] border border-white/10 rounded-2xl p-4 outline-none min-h-[120px]"
          />

          <input
            type="text"
            name="assignedTo"
            value={task.assignedTo}
            onChange={handleChange}
            placeholder="Assigned To"
            className="w-full bg-[#151521] border border-white/10 rounded-2xl p-4 outline-none"
          />

          <select
            name="priority"
            value={task.priority}
            onChange={handleChange}
            className="w-full bg-[#151521] border border-white/10 rounded-2xl p-4 outline-none"
          >

            <option>Low</option>

            <option>Medium</option>

            <option>High</option>

            <option>Urgent</option>

          </select>

          <select
            name="status"
            value={task.status}
            onChange={handleChange}
            className="w-full bg-[#151521] border border-white/10 rounded-2xl p-4 outline-none"
          >

            <option>Pending</option>

            <option>In Progress</option>

            <option>Completed</option>

          </select>

          <input
            type="date"
            name="dueDate"
            value={task.dueDate}
            onChange={handleChange}
            className="w-full bg-[#151521] border border-white/10 rounded-2xl p-4 outline-none"
          />

          <button
            onClick={updateTask}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold"
          >

            Save Changes

          </button>

        </div>

      </div>

    </div>
  );
}