import React, {
  useState,
  useEffect
} from 'react';

import {
  Plus,
  Search,
  Phone,
  Calendar,
  CheckCircle2,
  User2,
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';


import { db } from '../lib/firebase';

export default function TaskManagement() {

  const navigate = useNavigate();

  const [tasks, setTasks] =
    useState([]);

  const [search, setSearch] =
    useState('');
    const [employees, setEmployees] =
  useState([]);

 useEffect(() => {

  // TASKS REALTIME

  const unsubscribe =
    onSnapshot(

      collection(db, 'tasks'),

      (snapshot) => {

        const taskList = [];

        snapshot.forEach((doc) => {

          taskList.push({
            id: doc.id,
            ...doc.data(),
          });

        });

        setTasks(taskList);

      }

    );

  // EMPLOYEES

  const fetchEmployees =
    async () => {

      try {

        const snapshot =
          await getDocs(
            collection(db, 'employees')
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

  fetchEmployees();

  return () => unsubscribe();

}, []);

 const getStatusStyle = (
  status
) => {

  switch (status) {

    case 'Completed':

      return 'bg-green-100 text-green-700';

    case 'In Progress':

      return 'bg-blue-100 text-blue-700';

    default:

      return 'bg-orange-100 text-orange-700';

  }

};

  const filteredTasks =
  tasks.filter((task) =>

    task.company
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||

    task.assignedEmployee
      ?.toLowerCase()
      .includes(search.toLowerCase())

  );

  return (

    <div className="p-8 bg-[#0b0b14] min-h-screen text-white">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-4xl font-bold mb-2">

            Task Management

          </h1>

          <p className="text-gray-400">

            Manage follow-ups,
            quotations and client tasks

          </p>

        </div>

        <button
          onClick={() =>
            navigate('/createTask')
          }
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold"
        >

          <Plus className="w-5 h-5" />

          Add Task

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-4 gap-6 mb-8">

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <p className="text-gray-400 mb-2">

            Total Tasks

          </p>

          <h2 className="text-4xl font-bold">

            {tasks.length}

          </h2>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <p className="text-gray-400 mb-2">

            Pending

          </p>

          <h2 className="text-4xl font-bold text-orange-400">

            {
              tasks.filter(
                (task) =>
                  task.status ===
                  'Pending'
              ).length
            }

          </h2>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <p className="text-gray-400 mb-2">

            Completed

          </p>

          <h2 className="text-4xl font-bold text-green-400">

            {
              tasks.filter(
                (task) =>
                  task.status ===
                  'Completed'
              ).length
            }

          </h2>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <p className="text-gray-400 mb-2">

            High Priority

          </p>

          <h2 className="text-4xl font-bold text-purple-400">

            {
              tasks.filter(
                (task) =>
                  task.priority ===
                  'High'
              ).length
            }

          </h2>

        </div>

      </div>

      {/* SEARCH */}

      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-6">

        <div className="relative">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-[#151521] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none"
          />

        </div>

      </div>

      {/* TASKS */}

      <div className="space-y-5">

        {
          filteredTasks.map((task) => (

            <div
              key={task.id}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between"
            >

              <div className="flex items-start gap-4">

                <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center">

                  {
                    task.status ===
                    'Completed'

                    ? (

                      <CheckCircle2 className="w-7 h-7 text-green-400" />

                    ) : (

                      <Phone className="w-7 h-7 text-purple-400" />

                    )
                  }

                </div>

                <div>

                  <h2 className="text-xl font-bold mb-1">

                    {task.company}

                  </h2>

                  <p className="text-gray-300 mb-3">

                    {task.title}

                  </p>

                  <div className="flex items-center gap-5 text-sm text-gray-400">

                    <span className="flex items-center gap-2">

                      <User2 className="w-4 h-4" />

                      {
                        task.assignedEmployee ||
                        'Unassigned'
                      }

                    </span>

                    <span className="flex items-center gap-2">

                      <Calendar className="w-4 h-4" />

                      {task.dueDate}

                    </span>

                  </div>

                </div>

              </div>

              <div className="flex items-center gap-4">

                <span
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStatusStyle(task.status)}`}
                >

                  {task.status}

                </span>

                <button
                  onClick={() =>
                    navigate(
                      `/edit-task/${task.id}`
                    )
                  }
                  className="px-5 py-3 rounded-2xl bg-white text-black font-semibold"
                >

                  View

                </button>

              </div>

            </div>

          ))
        }

      </div>

    </div>

  );

}