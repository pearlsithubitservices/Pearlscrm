import React from 'react';
import { 
  Users, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Briefcase, 
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useIndustry } from '../context/IndustryContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Mon', leads: 4, closures: 2 },
  { name: 'Tue', leads: 7, closures: 3 },
  { name: 'Wed', leads: 5, closures: 4 },
  { name: 'Thu', leads: 8, closures: 2 },
  { name: 'Fri', leads: 12, closures: 6 },
  { name: 'Sat', leads: 4, closures: 3 },
  { name: 'Sun', leads: 6, closures: 4 },
];

export default function Dashboard() {
  const { config, industry, setIndustry } = useIndustry();
  const { profile } = useAuth();

  const industries = ['IT', 'Clinic', 'Real Estate', 'Service', 'Retail', 'Education'];

  const stats = [
    { label: `Total ${config.labels.leads}`, value: '124', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Interested', value: '48', icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Follow-ups Today', value: '12', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Closed Deals', value: '24', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="p-8 pb-12">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Welcome back, {profile?.displayName}</h1>
          <p className="text-gray-500">Here's what's happening in your business today.</p>
        </div>

        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                industry === ind 
                  ? "bg-white text-black shadow-sm" 
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-black">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-black mb-6">Performance Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-black mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-black">
                    <span className="font-semibold">Alex Johnson</span> contacted <span className="font-semibold text-blue-600">Acme Corp</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
