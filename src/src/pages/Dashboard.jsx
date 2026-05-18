import React from 'react';
import 
{
  useEffect,
  useState
} from 'react';
import {
  Users,
  Phone,
  CheckCircle2,
  Calendar,
  Bell,
  Plus,
  MessageSquare,
  IndianRupee,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';


export default function Dashboard() {

  const { user } = useAuth();
  
const [dashboardData,
setDashboardData] = useState({
  totalLeads: 0,
  pendingTasks: 0,
  completedTasks: 0,
  followupsToday: 0,
  recentLeads: [],
  todayTasks: [],
});
useEffect(() => {

  fetchDashboard();

}, []);

const fetchDashboard =
async () => {

  try {

    const response =
      await fetch(
        "https://pearlscrm.onrender.com/api/dashboard"
      );

    const data =
      await response.json();

    setDashboardData(data);

  } catch (error) {

    console.log(error);

  }

};
  const stats = [
    {
      title: 'Total Leads',
     value: dashboardData.totalLeads,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
    },

    {
      title: 'Follow-ups Today',
      value: dashboardData.followupsToday,
      icon: Phone,
      color: 'from-blue-500 to-cyan-500',
    },

    {
      title: 'Converted Clients',
      value: dashboardData.completedTasks,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
    },

    {
      title: 'Monthly Revenue',
      value: '₹',
      icon: IndianRupee,
      color: 'from-orange-500 to-yellow-500',
    },
  ];

const recentLeads =
dashboardData?.recentLeads || [];
const tasks =
dashboardData?.todayTasks || [];
  return (

   <div className="text-white">

      {/* TOPBAR */}

      <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">

        <div>

          <h1 className="text-3xl font-bold">
            Welcome, {user?.displayName || 'Ragavi'}
          </h1>

          <p className="text-gray-400 mt-1">
            Pearls IT Hub CRM Dashboard
          </p>

        </div>

        <div className="flex items-center gap-4">

          <button className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </button>

          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">
            <Plus className="w-4 h-4" />
            Add Lead
          </button>

        </div>

      </div>

      <div className="p-8">

        {/* STATS */}

        <div className="grid grid-cols-4 gap-6 mb-8">

          {stats.map((item, i) => (

            <div
              key={i}
              className={`bg-gradient-to-r ${item.color} rounded-3xl p-6`}
            >

              <div className="flex justify-between items-center mb-6">

                <item.icon className="w-10 h-10" />

              </div>

              <p className="text-sm opacity-80 mb-2">
                {item.title}
              </p>

              <h2 className="text-4xl font-bold">
                {item.value}
              </h2>

            </div>

          ))}

        </div>

        {/* SECOND SECTION */}

        <div className="grid grid-cols-3 gap-8">

          {/* RECENT LEADS */}

          <div className="col-span-2 bg-white text-black rounded-3xl p-6">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold">
                Recent Leads
              </h2>

              <button className="text-purple-600 font-semibold">
                View All
              </button>

            </div>

            <div className="space-y-5">

              {recentLeads.map((lead, i) => (

                <div
                  key={i}
                  className="flex items-center justify-between border border-gray-200 rounded-2xl p-4"
                >

                  <div>

                    <h3 className="font-bold text-lg">
                      {lead.name}
                    </h3>

                    <p className="text-gray-500">
                      {lead.service}
                    </p>

                  </div>

                  <div>

                    <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                      {lead.status}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* TASKS */}

          <div className="bg-white text-black rounded-3xl p-6">

            <div className="flex items-center gap-3 mb-6">

              <Calendar className="w-6 h-6 text-purple-600" />

              <h2 className="text-2xl font-bold">
                Today's Tasks
              </h2>

            </div>

            <div className="space-y-4">

              {tasks.map((task, i) => (

                <div
                  key={i}
                  className="flex items-start gap-3 border border-gray-200 rounded-2xl p-4"
                >

                  <MessageSquare className="w-5 h-5 text-purple-600 mt-1" />

                  <p className="font-medium">
                   {task.title}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}