import React, { useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";

import logo from "../assets/logo.png";

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
  NotebookPenIcon,
  Landmark,
  ChartNoAxesColumnIncreasingIcon,
  Megaphone,
  Radio,
  Activity,
  Key,
  Clock3,
  MessageSquare,
  Cpu,
  Zap,
  UserCheck,
  Link,
  Settings,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useIndustry } from "../context/IndustryContext";
import useEmployees from "../Hooks/useEmployees";
import useWhatsApp from "../Hooks/useWhatsApp";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { config } = useIndustry();
  const location = useLocation();

  // WhatsApp broadcast count
  const { broadcastCount, fetchBroadcasts } = useWhatsApp();

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  // ============================================================
  // MAIN CRM
  // ============================================================

  const mainItems = [
    {
      name: "Dashboard",
      icon: BarChart3,
      path: "/",
    },
    {
      name: config.labels.leads,
      icon: Users,
      path: "/leads",
    },
    {
      name: "Tasks",
      icon: CheckSquare,
      path: "/tasks",
    },
    {
      name: "Follow - ups",
      icon: CalendarDays,
      path: "/follow-ups",
    },
    {
      name: "Projects",
      icon: FolderOpen,
      path: "/projects",
    },
    {
      name: "Attendance Management",
      icon: Clock3,
      path: "/attendance-management",
    },
    {
      name: "Communication",
      icon: Speaker,
      path: "/communication",
    },
    {
      name: "Collaboration",
      icon: MessageSquare,
      path: "/collaboration",
    },
    {
      name: "LeaveManagement",
      icon: NotebookPenIcon,
      path: "/leave",
    },
    {
      name: "Payroll & Benefits",
      icon: Landmark,
      path: "/admin-payroll",
    },
    {
      name: "Performance & Growth",
      icon: ChartNoAxesColumnIncreasingIcon,
      path: "/admin-performance",
    },
  ];

  // ============================================================
  // WHATSAPP BUSINESS / CAMPAIGN
  // ============================================================

  const whatsappItems = [
    {
      name: "Campaign",
      icon: Megaphone,
      path: "/whatsapp/campaign",
    },
    {
      name: "Templates",
      icon: FileText,
      path: "/whatsapp/templates",
    },
    {
      name: "Broadcast",
      icon: Radio,
      path: "/whatsapp/broadcast",
      badge: true,
    },
    {
      name: "Live Queue",
      icon: Activity,
      path: "/whatsapp/queue",
    },
    {
      name: "Analytics",
      icon: ChartNoAxesColumnIncreasingIcon,
      path: "/whatsapp/analytics",
    },
    {
      name: "API Keys",
      icon: Key,
      path: "/whatsapp/api-keys",
    },
  ];

  // ============================================================
  // WHATSAPP AI AUTOMATION
  // ============================================================

  const whatsappAutomationItems = [
    {
      name: "Dashboard",
      icon: BarChart3,
      path: "/whatsapp-automation",
    },
    {
      name: "Conversations",
      icon: MessageSquare,
      path: "/whatsapp-automation/conversations",
    },
    {
      name: "Contacts",
      icon: Users,
      path: "/whatsapp-automation/contacts",
    },
    {
      name: "AI Assistant",
      icon: Cpu,
      path: "/whatsapp-automation/ai-assistant",
    },
    {
      name: "Automation Rules",
      icon: Zap,
      path: "/whatsapp-automation/automation",
    },
    {
      name: "Message Templates",
      icon: FileText,
      path: "/whatsapp-automation/templates",
    },
    {
      name: "AI Configuration",
      icon: Cpu,
      path: "/whatsapp-automation/ai",
    },
    {
      name: "Reports & Analytics",
      icon: ChartNoAxesColumnIncreasingIcon,
      path: "/whatsapp-automation/reports",
    },
    {
      name: "Human Handoff",
      icon: UserCheck,
      path: "/whatsapp-automation/handoff",
    },
    {
      name: "Integrations",
      icon: Link,
      path: "/whatsapp-automation/integrations",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/whatsapp-automation/settings",
    },
  ];

  // ============================================================
  // MANAGE
  // ============================================================

  const manageItems = [
    {
      name: "Client Management",
      icon: CircleUser,
      path: "/clientmanagement",
    },
    {
      name: "Employee Management",
      icon: Users,
      path: "/employees",
    },
    {
      name: "Payments",
      icon: CreditCard,
      path: "/payments",
    },
    {
      name: "Reports",
      icon: FileText,
      path: "/reports",
    },
  ];

  // ============================================================
  // EMPLOYEES
  // ============================================================

  const { employees } = useEmployees();

  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      map[employee.uid] = {
        name: employee.name || employee.employeeName,
        role: employee.role || employee.employeeRole,
      };

      return map;
    }, {});
  }, [employees]);

  // ============================================================
  // ACTIVE STATES
  // ============================================================

  const isWhatsAppActive =
    location.pathname.startsWith("/whatsapp");

  const isWhatsAppAutomationActive =
    location.pathname.startsWith("/whatsapp-automation");

  // ============================================================
  // NAVIGATION STYLES
  // ============================================================

  const navLinkClass = (isActive) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all duration-300 ${
      isActive
        ? "bg-[#2563a9] text-white font-semibold"
        : "text-white/90 hover:bg-white/5 hover:text-white"
    }`;

  const subNavLinkClass = (isActive) =>
    `flex items-center gap-3 pl-9 pr-3 py-2 rounded-xl text-[13px] transition-all duration-300 ${
      isActive
        ? "bg-[#2563a9] text-white font-medium"
        : "text-white/75 hover:bg-white/5 hover:text-white"
    }`;

  // ============================================================
  // SIDEBAR
  // ============================================================

  return (
    <aside className="w-[250px] h-screen sticky top-0 shrink-0 bg-[#0b2b57] text-white flex flex-col">

      {/* ======================================================
          SCROLLABLE CONTENT
      ====================================================== */}

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-8 min-h-0">

        {/* ====================================================
            LOGO
        ==================================================== */}

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
            <img
              src={logo}
              alt="logo"
              className="w-full h-full rounded-full"
            />
          </div>

          <h1 className="font-bold text-l tracking-wide">
            PEARLS IT HUB
          </h1>
        </div>

        {/* ====================================================
            MAIN
        ==================================================== */}

        <div className="mb-8">
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-4">
            Main
          </p>

          <div className="space-y-1">
            {mainItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  navLinkClass(isActive)
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* ====================================================
            WHATSAPP BUSINESS
        ==================================================== */}

        <div className="mb-8">
          <p
            className={`text-xs uppercase tracking-[0.2em] mb-4 ${
              isWhatsAppActive
                ? "text-blue-300"
                : "text-gray-500"
            }`}
          >
            WhatsApp Business
          </p>

          <div className="space-y-0.5">
            {whatsappItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  subNavLinkClass(isActive)
                }
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />

                <span className="flex-1">
                  {item.name}
                </span>

                {item.badge && broadcastCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {broadcastCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* ====================================================
            WHATSAPP AI AUTOMATION
        ==================================================== */}

        <div className="mb-8">
          <p
            className={`text-xs uppercase tracking-[0.2em] mb-4 ${
              isWhatsAppAutomationActive
                ? "text-blue-300"
                : "text-gray-500"
            }`}
          >
            WhatsApp AI Automation
          </p>

          <div className="space-y-0.5">
            {whatsappAutomationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  subNavLinkClass(isActive)
                }
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />

                <span className="flex-1">
                  {item.name}
                </span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* ====================================================
            MANAGE
        ==================================================== */}

        <div className="mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-4">
            Manage
          </p>

          <div className="space-y-1">
            {manageItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  navLinkClass(isActive)
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* ====================================================
            LOGOUT
        ==================================================== */}

        <button
          onClick={() => logout()}
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
      ====================================================== */}

      <div className="shrink-0 px-6 pb-6 pt-4 border-t border-white/10 bg-[#0b2b57]">
        <div className="bg-[#2563a9] rounded-lg px-3 py-3 flex items-center gap-3">

          <img
            src={
              user?.photoURL ||
              "https://i.pravatar.cc/100"
            }
            alt=""
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />

          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {employeeMap[user?.uid]?.name ||
                user?.displayName ||
                "User"}
            </h3>

            <p className="text-xs text-white/80 truncate">
              {employeeMap[user?.uid]?.role ||
                "Admin"}
            </p>
          </div>

        </div>
      </div>
    </aside>
  );
}