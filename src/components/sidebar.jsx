import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  BarChart3,
  Users,
  CheckSquare,
  Briefcase,
  UserCircle,
  CreditCard,
  FileText,
  LogOut,
  CalendarDays,
  GraduationCap,
  BookOpen,
  CircleUser,
  FolderOpen,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useIndustry } from '../context/IndustryContext';
import { motion } from 'framer-motion';

export default function Sidebar() {

  const { user, logout } = useAuth();
  const { config } = useIndustry();

 

  const mainItems = [
  {
    name: 'Dashboard',
    icon: BarChart3,
    path: '/',
  },

  {
    name: config.labels.leads,
    icon: Users,
    path: '/leads',
  },

  {
    name: 'Tasks',
    icon: CheckSquare,
    path: '/tasks',
  },

  {
    name: 'Follow - ups',
    icon: CalendarDays,
    path: '/follow-ups',
  },
   {
    name: 'Projects',
    icon: FolderOpen,
    path: '/projects',
  },

  
];

const manageItems = [
  /*{
    name: 'Courses',
    icon: BookOpen,
    path: '/courses',
  },*/

  {
    name: 'Client Management',
    icon: CircleUser,
    path: '/clientmanagement',
  },
  {
    name: 'Employee Management',
    path: '/employees',
    icon: Users,
  },

  {
    name: 'Payments',
    icon: CreditCard,
    path: '/payments',
  },

  {
    name: 'Reports',
    icon: FileText,
    path: '/reports',
  },
];

  return (

    <aside className="w-[250px] min-h-screen bg-[#0b2b57] text-white flex flex-col justify-between px-6 py-8 ">

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="flex items-center gap-3 mb-8">

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">

           <img src={logo} alt='logo' className='w-full h-full rounded-full'/>

          </div>

          <h1 className="font-bold text-l tracking-wide">
            PEARLS IT HUB
          </h1>

        </div>

        {/* MAIN */}
        <div className="mb-10 " >

          <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-5">
            Main
          </p>

          <div className="space-y-3">

            {mainItems.map((item) => (

              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 px-1 py-3 rounded-xl text-[14px] transition-all duration-300
                  ${
                    isActive
                      ? 'bg-[#2563a9] text-white font-semibold'
                      : 'text-white hover:bg-white/5 hover:text-white'
                  }
                  `
                }
              >

                <item.icon className="w-4 h-4" />

                {item.name}

              </NavLink>

            ))}

          </div>

        </div>

        {/* MANAGE */}
        <div>

          <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-5">
            Manage
          </p>

          <div className="space-y-3">

            {manageItems.map((item) => (

              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 px-1 py-3 rounded-xl text-[15px] transition-all duration-300
                  ${
                    isActive
                      ? 'bg-[#2563a9] text-white '
                      : 'text-white hover:bg-white/5 '
                  }
                  `
                }
              >

                <item.icon className="w-4 h-4" />

                {item.name}

              </NavLink>

            ))}

            {/* LOGOUT */}
        <button
          onClick={() => logout()}
          className="flex items-center gap-3  text-white hover:text-red-400 transition-all  ml-1"
        >

          <LogOut className="w-4 h-4 mb-4" />

          <span className="text-sm mb-4 ">
            Log out
          </span>

        </button>

          </div>

        </div>

      </div>

      {/* BOTTOM */}
      <div>

        {/* PROFILE CARD */}
        <div className="bg-[#2563a9] rounded px-3 py-3 flex items-center h-12 w-50 gap-3 mb-5">

          <img
            src={
              user?.photoURL ||
              'https://i.pravatar.cc/100'
            }
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />

          <div className="min-w-0">

            <h3 className="font-semibold text-sm truncate">
              {user?.displayName || 'Ragavi M'}
            </h3>

            <p className="text-xs text-white/80 truncate">
              Admin - Education
            </p>

          </div>

        </div>

        

      </div>

    </aside>
  );
}