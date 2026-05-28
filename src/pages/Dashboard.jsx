import React from 'react';
import { Dashboardskeleton } from "../components/Dashboard/Skeleton.jsx";

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
  ChartNoAxesCombined,
  Briefcase
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Employeecomp from '../components/Dashboard/Employeecomp.jsx';
import { AnimatePresence, motion, scale } from 'framer-motion';
import CreateLead from './CreateLead.jsx';


export default function Dashboard() {

  const [loading, setLoading] = useState(!sessionStorage.getItem("loaded"));

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
    

  console.log(dashboardData);

  //Skeleton

  useEffect(() => {

    if (!sessionStorage.getItem("loaded")) {

      const timer = setTimeout(() => {

        setLoading(false);

        sessionStorage.setItem(
          "loaded",
          "true"
        );

      }, 2500);

      return () => clearTimeout(timer);
    }

  }, []);


  useEffect(() => {
    fetchDashboard();
  }, []);

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
      icon: Briefcase,
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

  const [open, setOpen] = useState(false);



  return (
    <AnimatePresence mode='wait'>

      {loading ? (<motion.div>
        <Dashboardskeleton />
      </motion.div>) : (<div className="text-white">

        {/* TOPBAR */}

        <div className="flex items-center justify-between bg-white border-black/20 px-8 py-6">

          <div>

            <h1 className="text-2xl text-[#023167] font-bold">
              Welcome, {user?.displayName || 'Ragavi'}
            </h1>

            <p className="text-gray-400 mt-1">
              {fullDate}
            </p>

          </div>

          <div className="flex items-center gap-4">

            {/* SEARCH */}
            <div className="flex items-center border bg-gray-200 rounded px-3 py-2 w-full md:w-80">
              <Search size={16} className="text-black" />
              <input
                className="ml-2 w-full outline-none text-sm text-black bg-gray-200"
                placeholder="Search Lead.."
              />
            </div>



            <button className="flex items-center gap-2 px-3 transition-transform duration-300 py-2 rounded bg-[#2563a9] font-semibold hover:scale-110"
              onClick={() => setOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>

            <button className="w-10 h-10 rounded bg-[#2563a9] flex items-center justify-center hover:scale-110 transition-transform duration-300">
              <Bell size={28} className="w-15 h-15 p-1 " />
            </button>

          </div>

        </div>

        <div className="p-8 bg-[#f3f0eb]">

          {/* STATS */}

          <div className="grid grid-cols-4 gap-6 ">

            {stats.map((item, i) => (

              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className={"bg-white rounded-xl p-1 h-30 border border-gray-300"}
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

              </motion.div>

            ))}

          </div>
        </div>
        {/**HOT LEADS AND VIEW ALL */}

        <Hotleads />

        {/**Employee section */}

        <Employeecomp />
      </div>
      )
      }

      {/**ADD LEADS */}


      {open && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}

          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 "
        >

          {/* Modal */}

          <motion.div
            initial={{
              opacity: 0,
              y: 100,
              scale: 0.9
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: 100,
              scale: 0.9
            }}
            transition={{
              duration: .4
            }}

            className="w-full max-w-3xl max-h-screen overflow-y-auto no-scrollbar "
          >

            <CreateLead
              onClose={() => setOpen(false)}
            />

          </motion.div>

        </motion.div>

      )}



    </AnimatePresence>
  );
}