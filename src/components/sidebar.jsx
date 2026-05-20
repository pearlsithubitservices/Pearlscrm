import React from 'react';
import { NavLink } from 'react-router-dom';

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
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { Clock3 } from 'lucide-react';
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
    name: 'Employees',
    path: '/employees',
    icon: Users,
  },
{
  name: 'Attendance Management',
  icon: Clock3,
  path: '/attendance-management',
},
];

const manageItems = [
  {
    name: 'Courses',
    icon: BookOpen,
    path: '/courses',
  },

  {
    name: 'Students',
    icon: GraduationCap,
    path: '/students',
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

    <aside className="w-[250px] min-h-screen bg-[#13132b] text-white flex flex-col justify-between px-6 py-8">

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="flex items-center gap-3 mb-14">

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">

            <span className="font-bold text-lg">
              🌐
            </span>

          </div>

          <h1 className="font-bold text-2xl tracking-wide">
            PEARLS IT HUB
          </h1>

        </div>

        {/* MAIN */}
        <div className="mb-10">

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
                  flex items-center gap-3 px-5 py-3 rounded-2xl text-[15px] transition-all duration-300
                  ${
                    isActive
                      ? 'bg-[#d9d6de] text-[#3a3645] font-semibold'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
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
                  flex items-center gap-3 px-5 py-3 rounded-2xl text-[15px] transition-all duration-300
                  ${
                    isActive
                      ? 'bg-[#d9d6de] text-[#3a3645] font-semibold'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
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

      </div>

      {/* BOTTOM */}
      <div>

        {/* PROFILE CARD */}
        <div className="bg-gradient-to-r from-[#ff7b7b] to-[#ff3df5] rounded-2xl px-3 py-3 flex items-center gap-3 mb-5">

          <img
            src={
              user?.photoURL ||
              'https://i.pravatar.cc/100'
            }
            alt=""
            className="w-11 h-11 rounded-xl object-cover"
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

        {/* LOGOUT */}
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-all px-3"
        >

          <LogOut className="w-4 h-4" />

          <span className="text-sm">
            Log out
          </span>

        </button>

      </div>

    </aside>
  );
}