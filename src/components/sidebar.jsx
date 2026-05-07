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
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIndustry } from '../context/IndustryContext';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Sidebar() {
  const { profile, logout } = useAuth();
  const { config } = useIndustry();

  const navItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/' },
    { name: config.labels.leads, icon: Users, path: '/leads' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Follow-ups', icon: CalendarDays, path: '/follow-ups' },
    { name: config.labels.projects, icon: Briefcase, path: '/projects' },
    { name: config.labels.clients, icon: UserCircle, path: '/clients' },
    { name: 'Payments', icon: CreditCard, path: '/payments' },
    { name: 'Reports', icon: FileText, path: '/reports' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Pearls CRM</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-gray-50 text-black" 
                  : "text-gray-500 hover:text-black hover:bg-gray-50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full rounded-full" />
            ) : (
              <span className="text-gray-400 font-medium">
                {profile?.displayName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-black truncate">{profile?.displayName}</p>
            <p className="text-xs text-gray-400 truncate">{profile?.role}</p>
          </div>
        </div>

        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
