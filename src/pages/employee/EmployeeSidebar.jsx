import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import {
  BarChart3,
  Users,
  CheckSquare,
  LogOut,
  CalendarDays,
  CircleUser,
  Phone,
  CreditCardIcon,
  UserX,
  Calendar,
  Share2,
  Menu,
  X,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useIndustry } from '../../context/IndustryContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const { config } = useIndustry();
  const navigate = useNavigate();

  const mainItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      path: '/employee/dashboard',
    },
    {
      name: 'Leads Management',
      icon: Users,
      path: '/employee/leads',
    },
    {
      name: "Tasks & Activities",
      icon: CheckSquare,
      path: '/employee/tasks',
    },
    {
      name: "FollowUps",
      icon: Calendar,
      path: '/employee/follow-ups',
    },
    {
      name: 'Leave Management',
      icon: UserX,
      path: '/employee/leave',
    },
    {
      name: 'Attendance Management',
      icon: CalendarDays,
      path: '/employee/attendance',
    },
    {
      name: 'Communication',
      icon: Phone,
      path: '/employee/communication',
    },
    {
      name: 'Collaboration',
      icon: Share2,
      path: '/employee/collaboration',
    },
    {
      name: 'Payroll & Benefits',
      icon: CreditCardIcon,
      path: '/employee/payroll',
    },
  ];

  const manageItems = [
    {
      name: 'Performance & Growth',
      icon: CircleUser,
      path: '/employee/performance',
    },
    {
      name: 'Reports & Statements',
      path: '/employee/reports',
      icon: Users,
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between overflow-y-auto sidebar-scroll pr-1">
      {/* TOP */}
      <div>
        {/* LOGO */}
        <div className="flex items-center justify-between gap-3 mb-8 sticky top-0 bg-[#0b2b57] py-2 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
              <img src={logo} alt="logo" className="w-full h-full rounded-full object-cover" />
            </div>
            <h1 className="font-bold text-base tracking-wide text-white">
              PEARLS IT HUB
            </h1>
          </div>
          {/* CLOSE BUTTON FOR MOBILE */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-white/80 hover:text-white p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* MAIN */}
        <div className="mb-8">
          <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-4 font-semibold">
            My Workspace
          </p>

          <div className="space-y-2">
            {mainItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 font-medium
                  ${
                    isActive
                      ? 'bg-[#2563a9] text-white shadow-md'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }
                  `
                }
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* MANAGE */}
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-4 font-semibold">
            Manage
          </p>

          <div className="space-y-2">
            {manageItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 font-medium
                  ${
                    isActive
                      ? 'bg-[#2563a9] text-white shadow-md'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }
                  `
                }
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}

            {/* LOGOUT */}
            <button
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm"
            >
              <LogOut className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM PROFILE CARD */}
      <div className="pt-6 border-t border-white/10 mt-6 sticky bottom-0 bg-[#0b2b57] pb-2">
        <div
          onClick={() => {
            setMobileOpen(false);
            navigate('/employee/myprofile');
          }}
          className="bg-[#2563a9]/40 border border-white/10 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-[#2563a9]/60 transition"
        >
          <img
            src={
              user?.avatar ||
              'https://i.pravatar.cc/100'
            }
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-xs text-white truncate">
              {user?.name || user?.email?.split('@')[0] || 'Employee'}
            </h3>
            <p className="text-[11px] text-gray-300 truncate capitalize">
              {role || 'Employee'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE BAR (header toggle for small screens) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0b2b57] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
            <img src={logo} alt="logo" className="w-full h-full rounded-full object-cover" />
          </div>
          <h1 className="font-bold text-sm tracking-wide">PEARLS IT HUB</h1>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE OVERLAY BACKDROP */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* MOBILE SLIDE-OUT DRAWER */}
      <aside
        className={`
          lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0b2b57] text-white p-6 shadow-2xl transition-transform duration-300 ease-in-out h-full overflow-hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 h-screen bg-[#0b2b57] text-white flex-col justify-between px-6 py-8 flex-shrink-0 sticky top-0 overflow-hidden">
        {sidebarContent}
      </aside>
    </>
  );
}