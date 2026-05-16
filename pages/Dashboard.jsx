import React from 'react';

import Hotleads from '../components/Dashboard/Hotleads.jsx'
import {
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
  Search,
  ChartNoAxesCombined
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Employeecomp from '../components/Dashboard/Employeecomp.jsx';


export default function Dashboard() {

  const { user } = useAuth();
  const navigate = useNavigate();
 


  const [dashboardData,
    setDashboardData] = useState({
      totalLeads: 0,
      pendingTasks: 0,
      completedTasks: 0,
      followupsToday: 0,
      recentLeads: [],
      todayTasks: [],
    });
  





 //FETCH DASHBOARD
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
      title: 'Hot Lead',
      value: dashboardData.completedTasks,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Follow-ups Today',
      value: dashboardData.followupsToday,
      icon: ChartNoAxesCombined,
      color: 'from-blue-500 to-cyan-500',
    },

    {
      title: 'Monthly Revenue',
      value: '₹',
      icon: IndianRupee,
      color: 'from-orange-500 to-yellow-500',
    },
  ];



  //current Date 

  const today = new Date();

  const fullDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const recentLeads =
    dashboardData?.recentLeads || [];
  const tasks =
    dashboardData?.todayTasks || [];
  return (

    <div className="text-white">

      {/* TOPBAR */}

      <div className="flex items-center justify-between border-b bg-white border-black/20 px-8 py-6">

        <div>

          <h1 className="text-2xl text-[#0b2b57] font-bold">
            Welcome, {user?.displayName || 'Ragavi'}
          </h1>

          <p className="text-gray-400 mt-1">
            {fullDate}
          </p>

        </div>

        <div className="flex items-center gap-4">

          {/* SEARCH */}

          <div className="relative">

            <Search
              className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
            />

            <input
              type="text"
              placeholder="Search Lead.."
              className="
                  
                  w-full
                  h-10
                  lg:w-[350px]
                  pl-12
                  pr-4
                  py-4
                  rounded
                  border
                  border-gray-200
                  outline-none
                "
            />

          </div>

          <button className="w-10 h-10 rounded-xl bg-[#2563a9] flex items-center justify-center hover:scale-110 transition-transform duration-300">
            <Bell size={24} className="w-15 h-15 " />
          </button>

          <button className="flex items-center gap-2 px-3 transition-transform duration-300 py-2 rounded bg-[#2563a9] font-semibold hover:scale-110"
            onClick={() =>
              navigate(
                '/create-lead'
              )}
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>

        </div>

      </div>

      <div className="p-8 bg-[#D9D9D9]">

        {/* STATS */}

        <div className="grid grid-cols-4 gap-6 ">

          {stats.map((item, i) => (

            <div
              key={i}
              className={"bg-white rounded p-1 h-30 border border-black/40"}
            >

              <div
                className="flex items-center justify-between w-full  p-2 mb-2"
              >

                <div className='bg-gray-200  rounded w-8 h-8'>
                  <item.icon className="w-8 h-8 text-black p-2" />
                </div>

                <div
                  className="
                   text-green-500  bg-green-100 px-3 py-1 rounded text-sm  font-semibold "
                >
                  ↑ 8.4%
                </div>

              </div>

              <p className="text-sm opacity-80  text-gray-500">
                {item.title}
              </p>

              <h2 className="text-5xl text-[#0b2b57] font-bold">
                {item.value}
              </h2>

            </div>

          ))}

        </div>
      </div>
{/**HOT LEADS AND VIEW ALL */}

      <Hotleads/>

      {/**Employee section */}

      <Employeecomp/>



      {/* EMPLOYEE SECTION */}

      

    </div>

  );
}