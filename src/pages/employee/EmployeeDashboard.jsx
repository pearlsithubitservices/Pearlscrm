import {
  useEffect,
  useState
} from 'react';

import {
  Search,
  BellRing,
  CheckCircle2,
  Clock3,
  Briefcase,
} from 'lucide-react';

import EmployeeSidebar
from './EmployeeSidebar';

import {
  auth,
  db
} from '../../lib/firebase';

import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

import {
  onAuthStateChanged
} from 'firebase/auth';

export default function EmployeeDashboard() {

  const [searchQuery, setSearchQuery] =
    useState('');

  const [currentUser, setCurrentUser] =
    useState(null);

  const [tasks, setTasks] =
    useState([]);

  const [followups, setFollowups] =
    useState([]);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          if (user) {

            // USER DETAILS

            const userQuery = query(
              collection(db, 'users'),
              where(
                'uid',
                '==',
                user.uid
              )
            );

            const userSnapshot =
              await getDocs(userQuery);

            userSnapshot.forEach((doc) => {

              setCurrentUser(
                doc.data()
              );

            });

            // TASKS

            const taskQuery = query(
              collection(db, 'tasks'),
              where(
                'assignedTo',
                '==',
                user.uid
              )
            );

            const taskSnapshot =
              await getDocs(taskQuery);

            const taskData = [];

            taskSnapshot.forEach((doc) => {

              taskData.push({
                id: doc.id,
                ...doc.data(),
              });

            });

            setTasks(taskData);

            // FOLLOWUPS

            const followupQuery = query(
              collection(
                db,
                'followups'
              ),
              where(
                'assignedTo',
                '==',
                user.uid
              )
            );

            const followupSnapshot =
              await getDocs(
                followupQuery
              );

            const followupData = [];

            followupSnapshot.forEach((doc) => {

              followupData.push({
                id: doc.id,
                ...doc.data(),
              });

            });

            setFollowups(
              followupData
            );

          }

        }
      );

    return () => unsubscribe();

  }, []);

  // STATS

  const stats = [

    {
      label: 'Total Tasks',
      value: tasks.length,
      icon: Briefcase,
      color:
        'from-purple-500 to-pink-500',
    },

    {
      label: 'Pending Tasks',
      value: tasks.filter(
        (task) =>
          task.status !==
          'Completed'
      ).length,
      icon: Clock3,
      color:
        'from-orange-500 to-red-500',
    },

    {
      label: 'Completed Tasks',
      value: tasks.filter(
        (task) =>
          task.status ===
          'Completed'
      ).length,
      icon: CheckCircle2,
      color:
        'from-green-500 to-emerald-500',
    },

    {
      label: 'Followups',
      value: followups.length,
      icon: BellRing,
      color:
        'from-blue-500 to-cyan-500',
    },

  ];

  return (

    <div className="min-h-screen bg-[#070b14] text-white flex">

      {/* SIDEBAR */}

      <EmployeeSidebar
        currentUser={currentUser}
      />

      {/* MAIN */}

      <div className="flex-1 p-8 overflow-auto">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-10">

          <div>

            <h1 className="text-5xl font-black mb-2">

              Employee Dashboard

            </h1>

            <p className="text-gray-500">

              Welcome back,
              {
                currentUser?.name ||
                'Employee'
              }

            </p>

          </div>

          {/* SEARCH */}

          <div className="relative w-[320px]">

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />

            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="w-full bg-[#111827] border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-purple-500"
            />

          </div>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          {stats.map((item, i) => (

            <div
              key={i}
              className={`bg-gradient-to-r ${item.color} rounded-3xl p-6`}
            >

              <div className="flex justify-between mb-6">

                <item.icon className="w-10 h-10" />

                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />

              </div>

              <p className="text-sm opacity-80 mb-2">

                {item.label}

              </p>

              <h2 className="text-5xl font-black">

                {item.value}

              </h2>

            </div>

          ))}

        </div>

        {/* OVERVIEW */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* RECENT TASKS */}

          <div className="bg-[#111827] border border-white/10 rounded-3xl p-6">

            <h2 className="text-2xl font-bold mb-6">

              Recent Tasks

            </h2>

            <div className="space-y-4">

              {tasks.slice(0, 5).map((task) => (

                <div
                  key={task.id}
                  className="bg-white/5 rounded-2xl p-4"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-bold text-lg">

                        {task.company}

                      </h3>

                      <p className="text-gray-400 text-sm mt-1">

                        {task.title}

                      </p>

                    </div>

                    <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 text-sm">

                      {task.status}

                    </span>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* RECENT FOLLOWUPS */}

          <div className="bg-[#111827] border border-white/10 rounded-3xl p-6">

            <h2 className="text-2xl font-bold mb-6">

              Recent Followups

            </h2>

            <div className="space-y-4">

              {followups
                .slice(0, 5)
                .map((item) => (

                  <div
                    key={item.id}
                    className="bg-white/5 rounded-2xl p-4"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <h3 className="font-bold text-lg">

                          {item.leadName}

                        </h3>

                        <p className="text-gray-400 text-sm mt-1">

                          {item.date}

                        </p>

                      </div>

                      <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-300 text-sm">

                        {item.status}

                      </span>

                    </div>

                  </div>

                ))}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}