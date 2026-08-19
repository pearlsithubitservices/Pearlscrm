import React, { useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

import {
  BarChart3,
  Users,
  CheckSquare,
  CreditCard,
  FileText,
  LogOut,
  CalendarDays,
  CircleUser,
  FolderOpen,
  Speaker,
  Radio,
  Clock3,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useIndustry } from '../context/IndustryContext';
import useEmployees from '../Hooks/useEmployees';
import useWhatsApp from '../Hooks/useWhatsApp';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { config } = useIndustry();
  const location = useLocation();

  const { broadcastCount, fetchBroadcasts } = useWhatsApp();

  const { employees = [] } = useEmployees();

  // ============================================================
  // FETCH WHATSAPP BROADCASTS
  // ============================================================

  useEffect(() => {
    if (fetchBroadcasts) {
      fetchBroadcasts();
    }
  }, [fetchBroadcasts]);

  // ============================================================
  // EMPLOYEE MAP
  // ============================================================

  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      if (!employee) return map;

      map[employee.uid] = {
        name: employee.name || employee.employeeName,
        role: employee.role || employee.employeeRole,
      };

      return map;
    }, {});
  }, [employees]);

  // ============================================================
  // MAIN MENU
  // ============================================================

  const mainItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      path: '/',
    },
    {
      name: config?.labels?.leads || 'Leads',
      icon: Users,
      path: '/leads',
    },
    {
      name: 'Tasks',
      icon: CheckSquare,
      path: '/tasks',
    },
    {
      name: 'Follow-ups',
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
  ];

  // ============================================================
  // WHATSAPP MENU
  // ============================================================

  const whatsappItems = [
    {
      name: 'WhatsApp Dashboard',
      icon: BarChart3,
      path: '/whatsapp',
    },
    {
      name: 'Broadcasts',
      icon: Radio,
      path: '/whatsapp/broadcasts',
      badge: true,
    },
  ];

  // ============================================================
  // MANAGEMENT MENU
  // ============================================================

  const manageItems = [
    {
      name: 'Client Management',
      icon: CircleUser,
      path: '/clientmanagement',
    },
    {
      name: 'Employee Management',
      icon: Users,
      path: '/employees',
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

  // ============================================================
  // ACTIVE WHATSAPP SECTION
  // ============================================================

  const isWhatsAppActive =
    location.pathname.startsWith('/whatsapp');

  // ============================================================
  // NAVIGATION STYLES
  // ============================================================

  const navLinkClass = (isActive) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all duration-300 ${
      isActive
        ? 'bg-[#2563a9] text-white font-semibold shadow-sm'
        : 'text-white/90 hover:bg-white/5 hover:text-white'
    }`;

  const subNavLinkClass = (isActive) =>
    `flex items-center gap-3 pl-9 pr-3 py-2 rounded-xl text-[13px] transition-all duration-300 ${
      isActive
        ? 'bg-[#2563a9] text-white font-medium'
        : 'text-white/75 hover:bg-white/5 hover:text-white'
    }`;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <aside className="w-[250px] h-screen sticky top-0 shrink-0 bg-[#0b2b57] text-white flex flex-col">

      {/* ======================================================
          SCROLLABLE CONTENT
      ======================================================= */}

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-8 min-h-0">

        {/* ====================================================
            LOGO
        ===================================================== */}

        <div className="flex items-center gap-3 mb-8">

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 overflow-hidden">

            <img
              src={logo}
              alt="Pearls IT Hub"
              className="w-full h-full rounded-full object-cover"
            />

          </div>

          <h1 className="font-bold text-sm tracking-wide">
            PEARLS IT HUB
          </h1>

        </div>

        {/* ====================================================
            MAIN
        ===================================================== */}

        <div className="mb-8">

          <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-4">
            Main
          </p>

          <div className="space-y-1">

            {mainItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    navLinkClass(isActive)
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}

          </div>
        </div>

        {/* ====================================================
            WHATSAPP BUSINESS
        ===================================================== */}

        <div className="mb-8">

          <p
            className={`text-xs uppercase tracking-[0.2em] mb-4 ${
              isWhatsAppActive
                ? 'text-blue-300'
                : 'text-gray-400'
            }`}
          >
            WhatsApp Business
          </p>

          <div className="space-y-1">

            {whatsappItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    subNavLinkClass(isActive)
                  }
                >

                  <Icon className="w-3.5 h-3.5 shrink-0" />

                  <span className="flex-1">
                    {item.name}
                  </span>

                  {item.badge && broadcastCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {broadcastCount}
                    </span>
                  )}

                </NavLink>
              );
            })}

          </div>
        </div>

        {/* ====================================================
            MANAGE
        ===================================================== */}

        <div className="mb-6">

          <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-4">
            Manage
          </p>

          <div className="space-y-1">

            {manageItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    navLinkClass(isActive)
                  }
                >

                  <Icon className="w-4 h-4 shrink-0" />

                  <span>{item.name}</span>

                </NavLink>
              );
            })}

          </div>
        </div>

        {/* ====================================================
            LOGOUT
        ===================================================== */}

        <button
          onClick={logout}
          className="flex items-center gap-3 text-white/80 hover:text-red-400 transition-all px-3 py-2"
        >
          <LogOut className="w-4 h-4" />

          <span className="text-sm">
            Log out
          </span>
        </button>

      </div>

      {/* ======================================================
          PROFILE
      ======================================================= */}

      <div className="shrink-0 px-6 pb-6 pt-4 border-t border-white/10 bg-[#0b2b57]">

        <div className="bg-[#2563a9] rounded-lg px-3 py-3 flex items-center gap-3">

          <img
            src={
              user?.photoURL ||
              'https://i.pravatar.cc/100'
            }
            alt="User profile"
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />

          <div className="min-w-0">

            <h3 className="font-semibold text-sm truncate">
              {employeeMap[user?.uid]?.name ||
                user?.displayName ||
                'User'}
            </h3>

            <p className="text-xs text-white/80 truncate">
              {employeeMap[user?.uid]?.role ||
                'Admin'}
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}