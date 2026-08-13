import { useEffect, useState } from 'react';

import {
  LayoutDashboard,
  ClipboardList,
  Users,
  PhoneCall,
  BellRing,
  Search,
  CheckCircle2,
  Clock3,
  Briefcase,
  Phone,
  MessageSquare,
  Star,
  User2,
  LogOut,
} from 'lucide-react';
import EmployeeSidebar
from './EmployeeSidebar';

import { auth, db } from '../lib/firebase';

import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

import { onAuthStateChanged } from 'firebase/auth';

export default function EmployeeDashboard() {

  const [activeTab, setActiveTab] =
    useState('tasks');

  const [searchQuery, setSearchQuery] =
    useState('');

  

 const [currentUser, setCurrentUser] =
  useState(null);

const [tasks, setTasks] =
  useState([]);

const [leads, setLeads] =
  useState([]);

const [followups, setFollowups] =
  useState([]);
  useEffect(() => {

  const unsubscribe =
    onAuthStateChanged(
      auth,
      async (user) => {

        if (user) {

          // CURRENT USER DETAILS

          const userQuery = query(
            collection(db, 'users'),
            where('uid', '==', user.uid)
          );

          const userSnapshot =
            await getDocs(userQuery);

          userSnapshot.forEach((doc) => {

            setCurrentUser(doc.data());

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

          // LEADS

          const leadsQuery = query(
            collection(db, 'leads'),
            where(
              'assignedTo',
              '==',
              user.uid
            )
          );

          const leadsSnapshot =
            await getDocs(leadsQuery);

          const leadsData = [];

          leadsSnapshot.forEach((doc) => {

            leadsData.push({
              id: doc.id,
              ...doc.data(),
            });

          });

          setLeads(leadsData);

          // FOLLOWUPS

          const followupQuery = query(
            collection(db, 'followups'),
            where(
              'assignedTo',
              '==',
              user.uid
            )
          );

          const followupSnapshot =
            await getDocs(followupQuery);

          const followupData = [];

          followupSnapshot.forEach((doc) => {

            followupData.push({
              id: doc.id,
              ...doc.data(),
            });

          });

          setFollowups(followupData);

        }

      }
    );

  return () => unsubscribe();

}, []);
  const stats = [

    {
      label: 'Tasks',
      value: tasks.length,
      icon: Briefcase,
      color: 'from-purple-500 to-pink-500',
    },

    {
      label: 'Pending',
      value: tasks.filter(
        (t) => t.status !== 'Completed'
      ).length,
      icon: Clock3,
      color: 'from-orange-500 to-red-500',
    },

    {
      label: 'Completed',
      value: tasks.filter(
        (t) => t.status === 'Completed'
      ).length,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
    },

    {
      label: 'Followups',
      value: followups.length,
      icon: BellRing,
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  return (

  <div className="min-h-screen bg-[#070b14] text-white flex">

  <EmployeeSidebar
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    currentUser={currentUser}
  />

      {/* SIDEBAR */}

     
      {/* MAIN CONTENT */}

      <div className="flex-1 p-8 overflow-auto">

        {/* TOP */}

        <div className="flex justify-between items-center mb-10">

          <div>

            <h1 className="text-5xl font-black mb-2">
              Dashboard
            </h1>

            <p className="text-gray-500">
              Welcome back, employee
            </p>

          </div>

          <div className="relative w-[320px]">

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />

            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full bg-[#111827] border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-purple-500"
            />

          </div>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-4 gap-6 mb-10">

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

        {/* TABLE */}

        <div className="bg-[#111827] border border-white/10 rounded-3xl overflow-hidden">

          <div className="p-6 border-b border-white/10">

            <h2 className="text-2xl font-bold">

              {activeTab === 'tasks' &&
                'Assigned Tasks'}

              {activeTab === 'leads' &&
                'Assigned Leads'}

              {activeTab === 'followups' &&
                'Today Followups'}

            </h2>

          </div>

          {/* TASKS */}

          {activeTab === 'tasks' && (

            <table className="w-full">

              <thead className="bg-white/5 text-gray-400 text-sm">

                <tr>

                  <th className="text-left p-5">
                    Company
                  </th>

                  <th className="text-left p-5">
                    Task
                  </th>

                  <th className="text-left p-5">
                    Priority
                  </th>

                  <th className="text-left p-5">
                    Status
                  </th>

                  <th className="text-left p-5">
                    Due Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {tasks.map((task) => (

                  <tr
                    key={task.id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >

                    <td className="p-5 font-semibold">
                      {task.company}
                    </td>

                    <td className="p-5">
                      {task.title}
                    </td>

                    <td className="p-5">

                      <span className="px-3 py-1 rounded-xl bg-red-500/10 text-red-400 text-sm">
                        {task.priority}
                      </span>

                    </td>

                    <td className="p-5">

                      <span className="px-3 py-1 rounded-xl bg-orange-500/10 text-orange-400 text-sm">
                        {task.status}
                      </span>

                    </td>

                    <td className="p-5">
                      {task.dueDate}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

          {/* LEADS */}

          {activeTab === 'leads' && (

            <table className="w-full">

              <thead className="bg-white/5 text-gray-400 text-sm">

                <tr>

                  <th className="text-left p-5">
                    Client
                  </th>

                  <th className="text-left p-5">
                    Company
                  </th>

                  <th className="text-left p-5">
                    Phone
                  </th>

                  <th className="text-left p-5">
                    Service
                  </th>

                  <th className="text-left p-5">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {leads.map((lead) => (

                  <tr
                    key={lead.id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >

                    <td className="p-5 font-semibold">
                      {lead.clientName}
                    </td>

                    <td className="p-5">
                      {lead.company}
                    </td>

                    <td className="p-5">
                      {lead.phone}
                    </td>

                    <td className="p-5">
                      {lead.service}
                    </td>

                    <td className="p-5">

                      <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-400 text-sm">
                        {lead.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

          {/* FOLLOWUPS */}

          {activeTab === 'followups' && (

            <table className="w-full">

              <thead className="bg-white/5 text-gray-400 text-sm">

                <tr>

                  <th className="text-left p-5">
                    Lead
                  </th>

                  <th className="text-left p-5">
                    Type
                  </th>

                  <th className="text-left p-5">
                    Date
                  </th>

                  <th className="text-left p-5">
                    Remarks
                  </th>

                  <th className="text-left p-5">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {followups.map((item) => (

                  <tr
                    key={item.id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >

                    <td className="p-5 font-semibold">
                      {item.leadName}
                    </td>

                    <td className="p-5">
                      {item.type}
                    </td>

                    <td className="p-5">
                      {item.date} - {item.time}
                    </td>

                    <td className="p-5">
                      {item.remarks}
                    </td>

                    <td className="p-5">

                      <span className="px-3 py-1 rounded-xl bg-yellow-500/10 text-yellow-400 text-sm">
                        {item.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>
  );
}