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
  MessageSquare,
  CreditCardIcon,
  UserX,
  Calendar,
  Menu,
  X,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useIndustry } from '../../context/IndustryContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { config } = useIndustry();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/employee/dashboard' },
    { name: 'Tasks & Activities', icon: CheckSquare, path: '/employee/tasks' },
    { name: 'FollowUps', icon: Calendar, path: '/employee/follow-ups' },
    { name: 'Leave Management', icon: UserX, path: '/employee/leave' },
    { name: 'Attendance Management', icon: CalendarDays, path: '/employee/attendance' },
    { name: 'Communication', icon: Phone, path: '/employee/communication' },
    { name: 'Collaboration & Chat', icon: MessageSquare, path: '/employee/collaboration' },
    { name: 'Payroll & Benefits', icon: CreditCardIcon, path: '/employee/payroll' },
  ];

  const manageItems = [
    { name: 'Performance & Growth', icon: CircleUser, path: '/employee/performance' },
    { name: 'Reports & Statements', icon: Users, path: '/employee/reports' },
  ];

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex min-h-full flex-col justify-between">
      {/* TOP */}
      <div>
        {/* LOGO */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-bold text-base tracking-wide text-white">
              PEARLS IT HUB
            </h1>
          </div>
          {/* Close button on mobile drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-gray-300 hover:text-white p-1"
            aria-label="Close Sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* MAIN SECTION */}
        <div className="mb-8">
          <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-4">
            My Workspace
          </p>
          <div className="space-y-2">
            {mainItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2563a9] text-white font-semibold shadow-sm'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* MANAGE SECTION */}
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-4">
            Manage
          </p>
          <div className="space-y-2">
            {manageItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2563a9] text-white font-semibold shadow-sm'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}

            {/* LOGOUT BUTTON */}
            <button
              onClick={() => {
                handleNavClick();
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-200 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200 mt-2"
            >
              <LogOut className="w-4 h-4 shrink-0 text-red-400" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM PROFILE CARD */}
      <div className="pt-6 border-t border-white/10 mt-6">
        <div
          onClick={() => {
            handleNavClick();
            navigate('/employee/myprofile');
          }}
          className="bg-[#2563a9] cursor-pointer rounded-xl p-3 flex items-center gap-3 hover:bg-[#1d508b] transition-colors"
        >
          <img
            src={user?.photoURL || 'https://i.pravatar.cc/100'}
            alt="User avatar"
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-white truncate">
              {user?.displayName || 'Ragavi M'}
            </h3>
            <p className="text-xs text-white/80 truncate">
              Employee Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE TOP BAR */}
      <header className="lg:hidden bg-[#0b2b57] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <img src={logo} alt="logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-sm tracking-wide">PEARLS IT HUB</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* MOBILE OVERLAY & DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[270px] bg-[#0b2b57] text-white px-5 py-6 overflow-y-auto sidebar-scroll shadow-2xl lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden lg:flex w-[260px] shrink-0 h-screen max-h-dvh sticky top-0 bg-[#0b2b57] text-white flex-col px-5 py-6 overflow-y-auto sidebar-scroll border-r border-slate-800">
        {sidebarContent}
      </aside>
    </>
  );
}
