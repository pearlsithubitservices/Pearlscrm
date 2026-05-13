import React, {
  useEffect,
  useState
} from 'react';

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';

import {
  onAuthStateChanged
} from 'firebase/auth';

import {
  auth,
  db
} from '../../lib/firebase';

import {
  Search,
  Building2,
  CalendarDays,
  Save,
  ClipboardList
} from 'lucide-react';

import {
  useNavigate
} from 'react-router-dom';

export default function EmployeeTasks() {

  const [tasks, setTasks] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const navigate =
    useNavigate();

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          if (user) {

            const q = query(
              collection(db, 'tasks'),
              where(
                'assignedTo',
                '==',
                user.uid
              )
            );

            const snapshot =
              await getDocs(q);

            const taskList = [];

            snapshot.forEach((doc) => {

              taskList.push({
                id: doc.id,
                ...doc.data(),
              });

            });

            setTasks(taskList);

            setLoading(false);

          }

        }
      );

    return () => unsubscribe();

  }, []);

  // HANDLE CHANGE

  const handleChange = (
    id,
    field,
    value
  ) => {

    setTasks((prev) =>

      prev.map((task) =>

        task.id === id
          ? {
              ...task,
              [field]: value,
            }
          : task
      )
    );

  };

  // UPDATE TASK

  const updateTask =
    async (task) => {

      try {

        const taskRef =
          doc(
            db,
            'tasks',
            task.id
          );

        await updateDoc(
          taskRef,
          {

            company:
              task.company,

            title:
              task.title,

            priority:
              task.priority,

            status:
              task.status,

            dueDate:
              task.dueDate,

          }
        );

        alert(
          'Task Updated Successfully'
        );

      } catch (error) {

        console.log(error);

      }

    };

  // FILTER TASKS

  const filteredTasks =
    tasks.filter((task) =>

      task.company
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

    <div className="min-h-screen bg-[#070b14] text-white p-8">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-10">

        <div>

          <h1 className="text-5xl font-black mb-2">

            My Tasks

          </h1>

          <p className="text-gray-500">

            Manage and update your assigned tasks.

          </p>

        </div>

        {/* SEARCH */}

        <div className="relative w-full lg:w-[350px]">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />

          <input
            type="text"
            placeholder="Search task..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full bg-[#111827] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-purple-500"
          />

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6">

          <ClipboardList className="w-10 h-10 mb-4" />

          <p className="text-sm opacity-80">

            Total Tasks

          </p>

          <h2 className="text-5xl font-black mt-2">

            {tasks.length}

          </h2>

        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6">

          <ClipboardList className="w-10 h-10 mb-4" />

          <p className="text-sm opacity-80">

            Pending

          </p>

          <h2 className="text-5xl font-black mt-2">

            {
              tasks.filter(
                (task) =>
                  task.status !==
                  'Completed'
              ).length
            }

          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6">

          <ClipboardList className="w-10 h-10 mb-4" />

          <p className="text-sm opacity-80">

            Completed

          </p>

          <h2 className="text-5xl font-black mt-2">

            {
              tasks.filter(
                (task) =>
                  task.status ===
                  'Completed'
              ).length
            }

          </h2>

        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto bg-[#111827] border border-white/10 rounded-3xl">

        <table className="w-full min-w-[1400px]">

          <thead>

            <tr className="border-b border-white/10 text-left">

              <th className="p-5">

                Company

              </th>

              <th className="p-5">

                Task

              </th>

              <th className="p-5">

                Priority

              </th>

              <th className="p-5">

                Status

              </th>

              <th className="p-5">

                Due Date

              </th>

              <th className="p-5">

                Followup

              </th>

              <th className="p-5 text-center">

                Action

              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan="7"
                  className="text-center py-10 text-gray-500"
                >

                  Loading...

                </td>

              </tr>

            ) : filteredTasks.length === 0 ? (

              <tr>

                <td
                  colSpan="7"
                  className="text-center py-10 text-gray-500"
                >

                  No Tasks Found

                </td>

              </tr>

            ) : (

              filteredTasks.map(
                (task) => (

                  <tr
                    key={task.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >

                    {/* COMPANY */}

                    <td className="p-5">

                      <div className="flex items-center gap-3">

                        <Building2 className="w-5 h-5 text-purple-400" />

                        <input
                          type="text"
                          value={
                            task.company ||
                            ''
                          }
                          onChange={(e) =>
                            handleChange(
                              task.id,
                              'company',
                              e.target
                                .value
                            )
                          }
                          className="bg-transparent outline-none w-full"
                        />

                      </div>

                    </td>

                    {/* TASK */}

                    <td className="p-5">

                      <textarea
                        value={
                          task.title ||
                          ''
                        }
                        onChange={(e) =>
                          handleChange(
                            task.id,
                            'title',
                            e.target
                              .value
                          )
                        }
                        rows="2"
                        className="bg-[#1b2434] border border-white/10 rounded-xl p-3 outline-none w-full resize-none"
                      />

                    </td>

                    {/* PRIORITY */}

                    <td className="p-5">

                      <select
                        value={
                          task.priority ||
                          ''
                        }
                        onChange={(e) =>
                          handleChange(
                            task.id,
                            'priority',
                            e.target
                              .value
                          )
                        }
                        className="bg-[#1b2434] border border-white/10 rounded-xl px-3 py-2 outline-none"
                      >

                        <option>

                          Low

                        </option>

                        <option>

                          Medium

                        </option>

                        <option>

                          High

                        </option>

                        <option>

                          Urgent

                        </option>

                      </select>

                    </td>

                    {/* STATUS */}

                    <td className="p-5">

                      <select
                        value={
                          task.status ||
                          ''
                        }
                        onChange={(e) =>
                          handleChange(
                            task.id,
                            'status',
                            e.target
                              .value
                          )
                        }
                        className="bg-[#1b2434] border border-white/10 rounded-xl px-3 py-2 outline-none"
                      >

                        <option>

                          Pending

                        </option>

                        <option>

                          In Progress

                        </option>

                        <option>

                          Completed

                        </option>

                      </select>

                    </td>

                    {/* DATE */}

                    <td className="p-5">

                      <div className="flex items-center gap-2">

                        <CalendarDays className="w-4 h-4 text-cyan-400" />

                        <input
                          type="date"
                          value={
                            task.dueDate ||
                            ''
                          }
                          onChange={(e) =>
                            handleChange(
                              task.id,
                              'dueDate',
                              e.target
                                .value
                            )
                          }
                          className="bg-transparent outline-none"
                        />

                      </div>

                    </td>

                    {/* FOLLOWUP */}

                    <td className="p-5">

                      <button
                        onClick={() =>
                          navigate(
                            '/employee/followups'
                          )
                        }
                        className="px-5 py-3 rounded-2xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all"
                      >

                        Create Followup

                      </button>

                    </td>

                    {/* ACTION */}

                    <td className="p-5 text-center">

                      <button
                        onClick={() =>
                          updateTask(
                            task
                          )
                        }
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition-all"
                      >

                        <Save className="w-4 h-4" />

                        Save

                      </button>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}