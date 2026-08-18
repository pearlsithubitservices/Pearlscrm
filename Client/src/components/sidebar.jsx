import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  MessageSquare,
  Bell,
  Mail,
  FolderOpen,
  Speaker,
  Network,
  Clock3,
  Menu,
  X,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useIndustry } from '../context/IndustryContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { config } = useIndustry();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    {
      name: 'Attendance Management',
      icon: Clock3,
      path: '/attendance-management',
    },
    {
      name: 'Communication',
      icon: Speaker,
      path: '/communication',
    },
    {
      name: 'Collaboration',
      icon: Network,
      path: '/collaboration',
    },
  ];

  const manageItems = [
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

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex min-h-full flex-col justify-between">
      {/* TOP */}
      <div>
        {/* LOGO HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shrink-0">
              <img src={logo} alt="logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-bold text-base tracking-wide text-white truncate">
              PEARLS IT HUB
            </h1>
          </div>
          {/* Mobile drawer close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-gray-300 hover:text-white p-1 rounded-lg focus:outline-none shrink-0"
            aria-label="Close navigation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* MAIN ITEMS */}
        <div className="mb-8">
          <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-4 font-semibold">
            Main
          </p>
          <div className="space-y-2">
            {mainItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2563a9] text-white font-semibold shadow-sm'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* MANAGE ITEMS */}
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-4 font-semibold">
            Manage
          </p>
          <div className="space-y-2">
            {manageItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2563a9] text-white font-semibold shadow-sm'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}

            {/* LOGOUT */}
            <button
              onClick={() => {
                handleNavClick();
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/90 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200 mt-2"
            >
              <LogOut className="w-4 h-4 shrink-0 text-red-400" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="pt-6 border-t border-white/10 mt-6">
        <div className="bg-[#2563a9] rounded-xl p-3 flex items-center gap-3 shadow-sm">
          <img
            src={user?.photoURL || 'https://i.pravatar.cc/100'}
            alt=""
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-white truncate">
              {user?.displayName || 'Ragavi M'}
            </h3>
            <p className="text-xs text-white/80 truncate">
              Admin Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE TOP BAR */}
      <header className="lg:hidden bg-[#0b2b57] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md w-full shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
            <img src={logo} alt="logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-sm tracking-wide truncate">PEARLS IT HUB</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors shrink-0"
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

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-[260px] shrink-0 h-screen max-h-dvh sticky top-0 bg-[#0b2b57] text-white flex-col px-5 py-6 overflow-y-auto sidebar-scroll border-r border-slate-800">
        {sidebarContent}
      </aside>
    </>
  );
}